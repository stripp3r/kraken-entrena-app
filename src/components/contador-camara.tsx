"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ContadorUniversal, type EstadoContador } from "@/lib/pose/contador";
import { evaluarEncuadre, type Encuadre } from "@/lib/pose/encuadre";
import { PUNTO, type Punto } from "@/lib/pose/geometria";
import { delegadoDe, obtenerLandmarker, type Landmarker, type ModeloPose } from "@/lib/pose/landmarker-cache";
import { guardarSesionPose } from "@/app/entrenamiento/actions";
import { callar, guardarPreferencia, hablar, leerPreferencia, PREF, vozDisponible } from "@/lib/voz";
import { interpretarDictado, type DatosDictados } from "@/lib/voz-comandos";
import type { ModalidadCarga } from "@/lib/carga";

// PROTOTIPO: cuenta las repeticiones de CUALQUIER ejercicio con la cámara, sin calibrar
// (lib/pose/contador.ts). Se abre desde la ficha del ejercicio y devuelve datos para llenarla.
// - Sin botón de empezar: se arma solo cuando la persona está bien encuadrada.
// - Guía de encuadre en pantalla y por voz; canta las repeticiones y avisa el fin de serie.
// - Al terminar sugiere el RIR (estimado por cuánto se enlentecen las últimas repeticiones) y
//   permite dictar peso y RIR en voz alta.
// - Se acuerda de la cámara, de la voz y de en qué ejercicios la usaste.
// NADA se graba ni se envía como video: los fotogramas se procesan en el teléfono y se descartan.

const ESQUELETO: [number, number][] = [
  [PUNTO.hombroIzq, PUNTO.hombroDer],
  [PUNTO.hombroIzq, PUNTO.codoIzq],
  [PUNTO.codoIzq, PUNTO.munecaIzq],
  [PUNTO.hombroDer, PUNTO.codoDer],
  [PUNTO.codoDer, PUNTO.munecaDer],
  [PUNTO.hombroIzq, PUNTO.caderaIzq],
  [PUNTO.hombroDer, PUNTO.caderaDer],
  [PUNTO.caderaIzq, PUNTO.caderaDer],
  [PUNTO.caderaIzq, PUNTO.rodillaIzq],
  [PUNTO.rodillaIzq, PUNTO.tobilloIzq],
  [PUNTO.caderaDer, PUNTO.rodillaDer],
  [PUNTO.rodillaDer, PUNTO.tobilloDer],
];

type Ui = "cargando" | "activo" | "error";
type Lado = "user" | "environment";
type Hud = { estado: EstadoContador; encuadre: Encuadre; armado: boolean };

export type ResultadoCamara = { rir?: number; rirEstimado?: boolean; peso?: number; lastre?: number };

const MS_ENCUADRE_PARA_ARMAR = 1000;
const MS_AVISO_ENCUADRE = 4000;
const MS_MANUAL_VISIBLE = 4000; // pasado este tiempo sin armarse, aparece el botón "Contar igual"
const MS_INACTIVIDAD = 3 * 60 * 1000; // la cámara se apaga sola si no pasa nada (cuida la batería)

// Reconocimiento de voz del navegador (Chrome/Android). Se usa solo si la persona toca el micrófono.
type Reconocedor = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function crearReconocedor(): Reconocedor | null {
  const w = window as unknown as { SpeechRecognition?: new () => Reconocedor; webkitSpeechRecognition?: new () => Reconocedor };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

function dibujar(ctx: CanvasRenderingContext2D, ancho: number, alto: number, puntos: Punto[] | undefined, color: string) {
  ctx.clearRect(0, 0, ancho, alto);
  if (!puntos) return;
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(4, ancho / 120);
  ctx.strokeStyle = color;
  for (const [a, b] of ESQUELETO) {
    if ((puntos[a]?.visibility ?? 0) < 0.4 || (puntos[b]?.visibility ?? 0) < 0.4) continue;
    ctx.beginPath();
    ctx.moveTo(puntos[a].x * ancho, puntos[a].y * alto);
    ctx.lineTo(puntos[b].x * ancho, puntos[b].y * alto);
    ctx.stroke();
  }
}

const claveAuto = (id: number) => `kraken_cam_auto_${id}`;

export function ContadorCamara({
  nombre,
  exerciseId,
  modalidad,
  avanzado,
  onUsar,
  onCerrar,
}: {
  nombre: string;
  exerciseId: number;
  modalidad: ModalidadCarga;
  // Dictado por voz y guardado de series: solo cuentas de prototipos (el audio del dictado lo procesa el navegador).
  avanzado: boolean;
  onUsar: (reps: number, extra: ResultadoCamara) => void;
  onCerrar: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<Landmarker | null>(null);
  const rafRef = useRef<number | null>(null);
  const wakeLockRef = useRef<{ release: () => Promise<void> } | null>(null);
  const contadorRef = useRef(new ContadorUniversal());
  const activoRef = useRef(false);
  const fpsRef = useRef<number | null>(null);
  const vozRef = useRef(true);
  const reconocedorRef = useRef<Reconocedor | null>(null);
  // Estado de la guía y del conteo que se maneja dentro del bucle de video (sin re-render).
  const armadoRef = useRef(false);
  const okDesdeRef = useRef<number | null>(null);
  const repsDichasRef = useRef(0);
  const terminadaAvisadaRef = useRef(false);
  const ultimaVozEncuadreRef = useRef(0);
  const ultimaActividadRef = useRef(0);
  // Diagnóstico del intento (solo números): se guarda aunque no haya contado nada, para entender por qué falló.
  const diagRef = useRef<{ inicio: number; frames: Record<string, number>; armadoEnS: number | null; manual: boolean; resolucion: string; delegado: string; modelo: string }>({ inicio: 0, frames: {}, armadoEnS: null, manual: false, resolucion: "", delegado: "", modelo: "lite" });
  const modeloRef = useRef<ModeloPose>("lite");

  const [ui, setUi] = useState<Ui>("cargando");
  const [error, setError] = useState<string | null>(null);
  const [lado, setLado] = useState<Lado>(() => (typeof window === "undefined" ? "environment" : leerPreferencia<Lado>(PREF.lado, ["user", "environment"], "environment")));
  const [voz, setVoz] = useState<boolean>(() => (typeof window === "undefined" ? true : leerPreferencia(PREF.voz, ["si", "no"], "si") === "si"));
  const [autoAbrir, setAutoAbrir] = useState<boolean>(() => (typeof window === "undefined" ? true : leerPreferencia(claveAuto(exerciseId), ["1", "0"], "1") === "1"));
  const [aspecto, setAspecto] = useState(3 / 4);
  const [hud, setHud] = useState<Hud | null>(null);
  const [ajuste, setAjuste] = useState(0); // correcciones manuales (+1 / -1)
  const [modelo, setModelo] = useState<ModeloPose>(() => (typeof window === "undefined" ? "lite" : leerPreferencia<ModeloPose>("kraken_camara_modelo", ["lite", "full"], "lite")));
  const [mostrarManual, setMostrarManual] = useState(false);
  const [escuchando, setEscuchando] = useState(false);
  const [dictado, setDictado] = useState<{ texto: string; datos: DatosDictados } | null>(null);
  const [avisoVoz, setAvisoVoz] = useState<string | null>(null);

  useEffect(() => {
    vozRef.current = voz;
    if (!voz) callar();
  }, [voz]);

  const detener = useCallback(() => {
    activoRef.current = false;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    // El modelo NO se cierra: queda cargado para que la próxima serie abra al instante.
    landmarkerRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    wakeLockRef.current?.release().catch(() => {});
    wakeLockRef.current = null;
    try {
      reconocedorRef.current?.stop();
    } catch {
      /* ya estaba parado */
    }
    callar();
  }, []);

  const decir = useCallback((texto: string, espera = 0) => {
    if (vozRef.current) hablar(texto, { espera });
  }, []);

  const reiniciarConteo = useCallback(() => {
    contadorRef.current.reset();
    armadoRef.current = false;
    okDesdeRef.current = null;
    repsDichasRef.current = 0;
    terminadaAvisadaRef.current = false;
    ultimaActividadRef.current = performance.now();
    setAjuste(0);
    setHud(null);
    setDictado(null);
    setMostrarManual(false);
    diagRef.current = { ...diagRef.current, inicio: performance.now(), frames: {}, armadoEnS: null, manual: false };
  }, []);

  const iniciar = useCallback(
    async (queLado: Lado) => {
      detener();
      setError(null);
      setUi("cargando");
      reiniciarConteo();
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("Este navegador no permite usar la cámara.");
        const pantallaVertical = window.innerHeight >= window.innerWidth;
        const pedidos: [number, number][] = pantallaVertical ? [[720, 1280], [1280, 720], [480, 640]] : [[1280, 720], [720, 1280], [640, 480]];
        let stream: MediaStream | null = null;
        const video = videoRef.current!;
        // Cámara y modelo se preparan en paralelo (el modelo suele estar ya precargado).
        const modeloPromesa = obtenerLandmarker(modeloRef.current);
        for (const [ancho, alto] of pedidos) {
          stream?.getTracks().forEach((t) => t.stop());
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: queLado }, width: { ideal: ancho }, height: { ideal: alto }, frameRate: { ideal: 30 } },
            audio: false,
          });
          video.srcObject = stream;
          await video.play();
          if (video.videoHeight >= video.videoWidth === pantallaVertical) break;
        }
        streamRef.current = stream;
        setAspecto(video.videoWidth / video.videoHeight);
        landmarkerRef.current = await modeloPromesa;
        diagRef.current.resolucion = `${video.videoWidth}x${video.videoHeight}`;
        diagRef.current.delegado = delegadoDe(modeloRef.current);
        diagRef.current.modelo = modeloRef.current;
        diagRef.current.inicio = performance.now();

        try {
          const nav = navigator as Navigator & { wakeLock?: { request: (t: "screen") => Promise<{ release: () => Promise<void> }> } };
          wakeLockRef.current = (await nav.wakeLock?.request("screen")) ?? null;
        } catch {
          wakeLockRef.current = null;
        }

        const canvas = canvasRef.current!;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d")!;
        activoRef.current = true;
        ultimaActividadRef.current = performance.now();
        setUi("activo");

        let ultimoVideoTime = -1;
        let ultimoHud = 0;
        let ultimoFrame = performance.now();
        let dtPrevio = 0;
        let saltar = false;
        const vibrar = (patron: number | number[]) => {
          try {
            navigator.vibrate?.(patron);
          } catch {
            /* sin vibración */
          }
        };
        const tick = () => {
          if (!activoRef.current) return;
          rafRef.current = requestAnimationFrame(tick);
          if (video.readyState < 2 || video.currentTime === ultimoVideoTime) return;
          ultimoVideoTime = video.currentTime;
          const ahora = performance.now();
          // Ahorro de batería: mientras todavía no empezó la serie se analiza un cuadro de cada dos.
          if (!armadoRef.current) {
            saltar = !saltar;
            if (saltar) return;
          }
          if (dtPrevio > 0) fpsRef.current = fpsRef.current === null ? 1000 / dtPrevio : fpsRef.current * 0.95 + (1000 / dtPrevio) * 0.05;
          dtPrevio = ahora - ultimoFrame;
          ultimoFrame = ahora;

          // Se apaga sola si pasan 3 minutos sin actividad (ni armarse ni repeticiones).
          if (ahora - ultimaActividadRef.current > MS_INACTIVIDAD) {
            activoRef.current = false;
            decir("Cámara apagada por inactividad");
            detener();
            setUi("error");
            setError("La cámara se apagó sola después de 3 minutos sin actividad. Cerrá y volvé a abrirla.");
            return;
          }

          const landmarker = landmarkerRef.current;
          if (!landmarker) return;
          const r = landmarker.detectForVideo(video, ahora);
          const puntos = r.landmarks?.[0];
          const encuadre = evaluarEncuadre(puntos);
          diagRef.current.frames[encuadre.codigo] = (diagRef.current.frames[encuadre.codigo] ?? 0) + 1;
          if (!armadoRef.current && ahora - diagRef.current.inicio > MS_MANUAL_VISIBLE) setMostrarManual(true);

          // Armado automático: encuadre bien durante 1 s seguido -> empieza a contar.
          if (!armadoRef.current) {
            if (encuadre.ok) {
              okDesdeRef.current ??= ahora;
              if (ahora - okDesdeRef.current >= MS_ENCUADRE_PARA_ARMAR) {
                armadoRef.current = true;
                ultimaActividadRef.current = ahora;
                diagRef.current.armadoEnS = Math.round((ahora - diagRef.current.inicio) / 100) / 10;
                contadorRef.current.empezar();
                decir("Listo, empezá");
                vibrar(120);
              }
            } else {
              okDesdeRef.current = null;
              if (encuadre.voz && ahora - ultimaVozEncuadreRef.current > MS_AVISO_ENCUADRE) {
                ultimaVozEncuadreRef.current = ahora;
                decir(encuadre.voz, MS_AVISO_ENCUADRE);
              }
            }
          } else if (!encuadre.ok && encuadre.codigo !== "sin-cuerpo" && encuadre.voz && ahora - ultimaVozEncuadreRef.current > MS_AVISO_ENCUADRE * 2) {
            ultimaVozEncuadreRef.current = ahora; // ya contando: aviso suave si se corta o se aleja
            decir(encuadre.voz, MS_AVISO_ENCUADRE);
          }

          const estado = contadorRef.current.procesar(r.worldLandmarks?.[0], puntos, ahora);

          // Cantar las repeticiones: dice el número nuevo (si hubo un salto por validación, solo el último).
          if (armadoRef.current && estado.repeticiones > repsDichasRef.current) {
            repsDichasRef.current = estado.repeticiones;
            ultimaActividadRef.current = ahora;
            decir(String(estado.repeticiones));
            vibrar(25);
            terminadaAvisadaRef.current = false;
          }
          // Fin de serie: ya contó y pasó un rato sin repeticiones nuevas.
          if (armadoRef.current && estado.terminada && !terminadaAvisadaRef.current) {
            terminadaAvisadaRef.current = true;
            ultimaActividadRef.current = ahora;
            const rir = estado.calidad?.rirEstimado;
            decir(`Serie terminada, ${estado.repeticiones} repeticiones${rir !== null && rir !== undefined ? `. RIR estimado ${rir}` : ""}`);
            vibrar([80, 60, 80]);
          }

          dibujar(ctx, canvas.width, canvas.height, puntos, encuadre.ok ? "rgba(34,197,94,0.85)" : "rgba(250,204,21,0.85)");
          if (ahora - ultimoHud > 100) {
            ultimoHud = ahora;
            setHud({ estado, encuadre, armado: armadoRef.current });
          }
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch (e) {
        detener();
        const msg = e instanceof Error ? e.message : "No se pudo iniciar la cámara.";
        setError(/Permission|NotAllowed|denied/i.test(msg) ? "No diste permiso para usar la cámara. Activalo en los permisos del navegador y probá de nuevo." : msg);
        setUi("error");
      }
    },
    [detener, decir, reiniciarConteo]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void iniciar(lado);
    return detener;
    // Solo al abrir: cambiar de cámara llama a iniciar() a mano.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // "Contar igual": si la guía de encuadre no se pone verde (posición rara, ejercicio acostado, poca luz), se
  // empieza a contar a mano y el contador hace su mejor esfuerzo con lo que ve.
  function contarIgual() {
    armadoRef.current = true;
    ultimaActividadRef.current = performance.now();
    diagRef.current.manual = true;
    diagRef.current.armadoEnS = Math.round((performance.now() - diagRef.current.inicio) / 100) / 10;
    contadorRef.current.empezar();
    setMostrarManual(false);
    decir("Contando");
    setHud((h) => (h ? { ...h, armado: true } : h));
  }

  function cambiarModelo() {
    const nuevo: ModeloPose = modelo === "lite" ? "full" : "lite";
    setModelo(nuevo);
    modeloRef.current = nuevo;
    guardarPreferencia("kraken_camara_modelo", nuevo);
    void iniciar(lado);
  }

  function cambiarCamara() {
    const nuevo: Lado = lado === "user" ? "environment" : "user";
    setLado(nuevo);
    guardarPreferencia(PREF.lado, nuevo);
    void iniciar(nuevo);
  }

  function alternarVoz() {
    const nueva = !voz;
    setVoz(nueva);
    guardarPreferencia(PREF.voz, nueva ? "si" : "no");
    if (nueva && vozDisponible()) hablar("Voz activada");
  }

  function alternarAuto() {
    const nuevo = !autoAbrir;
    setAutoAbrir(nuevo);
    guardarPreferencia(claveAuto(exerciseId), nuevo ? "1" : "0");
  }

  // Dictado de peso / lastre / RIR en voz alta (reconocimiento de voz del navegador).
  function dictar() {
    if (escuchando) {
      try {
        reconocedorRef.current?.stop();
      } catch {
        /* ya estaba parado */
      }
      return;
    }
    const rec = crearReconocedor();
    if (!rec) {
      setAvisoVoz("Este teléfono no permite dictar. Cargalos a mano.");
      return;
    }
    callar();
    rec.lang = "es-AR";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      const texto = e.results[0]?.[0]?.transcript ?? "";
      const datos = interpretarDictado(texto, modalidad);
      setDictado({ texto, datos });
      setAvisoVoz(Object.keys(datos).length === 0 ? "No entendí. Probá: «setenta kilos, RIR dos»." : null);
    };
    rec.onerror = (e) => {
      setAvisoVoz(e.error === "not-allowed" ? "No diste permiso para el micrófono." : "No pude escucharte. Probá de nuevo.");
      setEscuchando(false);
    };
    rec.onend = () => setEscuchando(false);
    reconocedorRef.current = rec;
    setAvisoVoz(null);
    setDictado(null);
    setEscuchando(true);
    try {
      rec.start();
    } catch {
      setEscuchando(false);
    }
  }

  const reps = Math.max(0, (hud?.estado.repeticiones ?? 0) + ajuste);
  const sinConteo = !hud?.armado;

  // Guarda los números de la serie (sin video) para ajustar el conteo con datos reales.
  function guardarTraza() {
    const senales = contadorRef.current.exportarTraza();
    if (!avanzado) return;
    const d = diagRef.current;
    const total = Object.values(d.frames).reduce((a, b) => a + b, 0);
    if (total < 15) return; // casi no hubo cámara: no vale la pena registrar
    void guardarSesionPose({
      diagnostico: { ...d, frames: d.frames, duracionS: Math.round((performance.now() - d.inicio) / 100) / 10, cuadros: total, contado: hud?.estado.repeticiones ?? 0, final: Math.max(0, (hud?.estado.repeticiones ?? 0) + ajuste), confianza: hud?.estado.confianza ?? null },
      exerciseId,
      camara: lado,
      fps: fpsRef.current === null ? null : Math.round(fpsRef.current * 10) / 10,
      contado: hud?.estado.repeticiones ?? 0,
      final: reps,
      senal: hud?.estado.senal ?? null,
      senales: senales as Record<string, number[]>,
    });
  }

  function usar() {
    guardarTraza();
    const n = reps;
    const rirCam = hud?.estado.calidad?.rirEstimado ?? null;
    const extra: ResultadoCamara = { ...dictado?.datos };
    // RIR: lo que dictó manda; si no, la estimación de la cámara (se marca como estimada).
    if (extra.rir === undefined && rirCam !== null) {
      extra.rir = rirCam;
      extra.rirEstimado = true;
    }
    if (n > 0) guardarPreferencia(claveAuto(exerciseId), autoAbrir ? "1" : "0");
    detener();
    onUsar(n, extra);
  }

  function cerrar() {
    guardarTraza();
    detener();
    onCerrar();
  }

  const estado = hud?.estado;
  const enc = hud?.encuadre;
  const cal = estado?.calidad;
  const borde = ui === "activo" && enc ? (enc.ok ? "border-emerald-500/70" : "border-yellow-400") : "border-transparent";

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="flex items-center justify-between gap-2 px-4 py-2 text-white">
        <p className="truncate text-sm font-medium">{nombre}</p>
        <div className="flex flex-none items-center gap-2">
          {vozDisponible() && (
            <button type="button" onClick={alternarVoz} aria-label={voz ? "Silenciar la voz" : "Activar la voz"} className="rounded-full border border-border-strong px-3 py-1.5 text-sm">
              {voz ? "🔊" : "🔇"}
            </button>
          )}
          <button type="button" onClick={cerrar} className="rounded-full border border-border-strong px-4 py-1.5 text-sm">
            Cerrar
          </button>
        </div>
      </div>

      <div className={`relative mx-auto min-h-0 w-full flex-1 overflow-hidden border-4 ${borde}`} style={{ maxWidth: `${(100 * aspecto).toFixed(1)}dvh` }}>
        <div className="absolute inset-0" style={{ transform: lado === "user" ? "scaleX(-1)" : undefined }}>
          <video ref={videoRef} playsInline muted autoPlay className="h-full w-full object-fill" />
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        </div>

        {ui !== "activo" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 px-6 text-center text-sm text-gray-300">
            {ui === "cargando" ? "Cargando la cámara…" : error}
          </div>
        )}

        {ui === "activo" && (
          <>
            {hud?.armado && (
              <div className="absolute left-3 top-3 rounded-xl bg-black/60 px-4 py-2 text-white">
                <p className="text-[10px] uppercase tracking-wide text-gray-400">Repeticiones</p>
                <p className="text-6xl font-semibold leading-none">{reps}</p>
                {estado?.confianza === "baja" && reps > 0 && <p className="mt-1 text-[11px] font-medium text-yellow-300">Revisá el conteo</p>}
              </div>
            )}
            {estado?.terminada && (
              <div className="absolute right-3 top-3 rounded-xl bg-emerald-600 px-3 py-2 text-center text-xs font-semibold text-black">Serie terminada</div>
            )}
            <div className="absolute inset-x-2 bottom-2 rounded-lg bg-black/70 px-3 py-2 text-center">
              {estado?.terminada && cal ? (
                <div className="text-left text-[13px] leading-snug text-gray-100">
                  <p className="font-semibold text-emerald-300">
                    Contamos {estado.repeticiones}. ¿Está bien? Corregilo con +1 / −1.
                  </p>
                  {cal.rirEstimado !== null && <p>RIR estimado (prueba): {cal.rirEstimado}</p>}
                  {cal.rangoIncompleto && <p className="text-yellow-300">Las últimas repeticiones recorrieron {Math.round(cal.caidaRango * 100)} % menos.</p>}
                  {cal.tempoRapido >= 3 && <p className="text-yellow-300">{cal.tempoRapido} repeticiones muy rápidas (menos de 1 s).</p>}
                </div>
              ) : (
                <p className={`text-base font-semibold leading-snug ${enc && !enc.ok ? "text-yellow-300" : "text-gray-100"}`}>
                  {!hud
                    ? "Ponete frente a la cámara."
                    : !hud.armado
                      ? enc?.ok
                        ? "Te veo bien. Quedate un segundo así…"
                        : enc?.mensaje
                      : estado?.caminando
                        ? "Quedate en el lugar para que cuente."
                        : enc && !enc.ok
                          ? enc.mensaje
                          : estado?.repeticiones
                            ? "Contando…"
                            : "Listo. Empezá cuando quieras."}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col gap-2 px-4 pb-3 pt-2">
        {!hud?.armado && ui === "activo" && (
          <p className="text-center text-[11px] text-gray-400">
            Celular parado a la altura de la cintura. Para ejercicios de brazos alcanza con 1 metro; para piernas, que se vean enteras.
          </p>
        )}
        <div className="flex items-center justify-center gap-3">
          <button type="button" onClick={() => setAjuste((a) => a - 1)} disabled={!hud?.armado} aria-label="Restar una repetición" className="h-10 w-14 rounded-full border border-border-strong text-lg text-gray-200 disabled:opacity-40">
            −1
          </button>
          <span className="min-w-24 text-center text-xs text-gray-400">Corregir el conteo</span>
          <button type="button" onClick={() => setAjuste((a) => a + 1)} disabled={!hud?.armado} aria-label="Sumar una repetición" className="h-10 w-14 rounded-full border border-border-strong text-lg text-gray-200 disabled:opacity-40">
            +1
          </button>
        </div>

        {avanzado && modalidad !== "tiempo" && (
          <div className="flex items-center gap-2">
            <button type="button" onClick={dictar} disabled={!hud?.armado} className={`flex-none rounded-full border px-4 py-2 text-sm disabled:opacity-40 ${escuchando ? "border-red-400 text-red-300" : "border-border-strong text-gray-200"}`}>
              {escuchando ? "🎤 Escuchando…" : "🎤 Decir peso y RIR"}
            </button>
            <p className="min-w-0 flex-1 truncate text-[11px] text-gray-400">
              {avisoVoz ?? (dictado ? `Entendí: ${Object.entries(dictado.datos).map(([k, v]) => `${k} ${v}`).join(", ") || "nada"}` : "Ej.: «setenta kilos, RIR dos»")}
            </p>
          </div>
        )}

        {mostrarManual && !hud?.armado && ui === "activo" && (
          <button type="button" onClick={contarIgual} className="rounded-full border border-emerald-500 bg-emerald-500/10 px-5 py-3 text-sm font-semibold text-emerald-300">
            Contar igual (empezar ahora)
          </button>
        )}
        {avanzado && (
          <button type="button" onClick={cambiarModelo} disabled={ui === "cargando"} className="text-[11px] text-gray-400 underline disabled:opacity-40">
            Precisión: {modelo === "full" ? "alta (más lenta)" : "normal"} · tocá para cambiar
          </button>
        )}
        <button type="button" onClick={usar} disabled={ui !== "activo"} className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-black disabled:opacity-50">
          {reps > 0 ? `Usar ${reps} ${reps === 1 ? "repetición" : "repeticiones"}` : "Terminar sin contar"}
        </button>
        <div className="flex gap-2">
          {estado?.terminada && (
            <button type="button" onClick={() => { contadorRef.current.reanudar(); terminadaAvisadaRef.current = false; }} className="flex-1 rounded-full border border-emerald-500/60 px-4 py-2 text-sm text-emerald-300">
              Seguir contando
            </button>
          )}
          <button type="button" onClick={reiniciarConteo} disabled={!hud?.armado} className="flex-1 rounded-full border border-border-strong px-4 py-2 text-sm text-gray-200 disabled:opacity-40">
            Reiniciar
          </button>
          <button type="button" onClick={cambiarCamara} disabled={ui === "cargando"} className="flex-1 rounded-full border border-border-strong px-4 py-2 text-sm text-gray-200 disabled:opacity-50">
            Cambiar cámara
          </button>
        </div>
        <label className="flex items-center justify-center gap-2 text-[11px] text-gray-400">
          <input type="checkbox" checked={autoAbrir} onChange={alternarAuto} className="h-3.5 w-3.5" />
          Abrir la cámara sola en este ejercicio
        </label>
        <p className="text-center text-[10px] text-gray-600">Prototipo · No se graba ni se envía video: todo se procesa en tu teléfono.</p>
      </div>
    </div>
  );
}

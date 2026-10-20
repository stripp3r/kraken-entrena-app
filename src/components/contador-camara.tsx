"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ContadorUniversal, type EstadoContador } from "@/lib/pose/contador";
import { evaluarEncuadre, type Encuadre } from "@/lib/pose/encuadre";
import { PUNTO, type Punto } from "@/lib/pose/geometria";
import { guardarSesionPose } from "@/app/entrenamiento/actions";
import { callar, guardarPreferencia, hablar, leerPreferencia, PREF, vozDisponible } from "@/lib/voz";

// PROTOTIPO: cuenta las repeticiones de CUALQUIER ejercicio con la cámara, sin calibrar
// (lib/pose/contador.ts). Se abre desde la ficha del ejercicio y devuelve el número para
// llenar el campo "Reps".
// - Sin botón de empezar: se arma solo cuando la persona está bien encuadrada, y cuenta
//   desde ese momento (las primeras repeticiones se suman al validarse la serie).
// - Guía de encuadre en pantalla y por voz (acercate / alejate / se corta el cuerpo).
// - Canta las repeticiones en voz alta y avisa cuando termina la serie.
// - Se acuerda de la cámara (frontal / trasera) y de si la voz está activa.
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
type Landmarker = { detectForVideo: (v: HTMLVideoElement, t: number) => { landmarks?: Punto[][]; worldLandmarks?: Punto[][] }; close: () => void };
type Hud = { estado: EstadoContador; encuadre: Encuadre; armado: boolean };

const MS_ENCUADRE_PARA_ARMAR = 1000;
const MS_AVISO_ENCUADRE = 4000; // no repetir el mismo aviso de voz antes de esto

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

export function ContadorCamara({ nombre, exerciseId, onUsar, onCerrar }: { nombre: string; exerciseId: number; onUsar: (reps: number) => void; onCerrar: () => void }) {
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
  // Estado de la guía y del conteo que se maneja dentro del bucle de video (sin re-render).
  const armadoRef = useRef(false);
  const okDesdeRef = useRef<number | null>(null);
  const repsDichasRef = useRef(0);
  const terminadaAvisadaRef = useRef(false);
  const ultimaVozEncuadreRef = useRef(0);

  const [ui, setUi] = useState<Ui>("cargando");
  const [error, setError] = useState<string | null>(null);
  const [lado, setLado] = useState<Lado>(() => (typeof window === "undefined" ? "environment" : leerPreferencia<Lado>(PREF.lado, ["user", "environment"], "environment")));
  const [voz, setVoz] = useState<boolean>(() => (typeof window === "undefined" ? true : leerPreferencia(PREF.voz, ["si", "no"], "si") === "si"));
  const [aspecto, setAspecto] = useState(3 / 4);
  const [hud, setHud] = useState<Hud | null>(null);
  const [ajuste, setAjuste] = useState(0); // correcciones manuales (+1 / -1)

  useEffect(() => {
    vozRef.current = voz;
    if (!voz) callar();
  }, [voz]);

  const detener = useCallback(() => {
    activoRef.current = false;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    landmarkerRef.current?.close();
    landmarkerRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    wakeLockRef.current?.release().catch(() => {});
    wakeLockRef.current = null;
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
    setAjuste(0);
    setHud(null);
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

        const { FilesetResolver, PoseLandmarker } = await import("@mediapipe/tasks-vision");
        const fileset = await FilesetResolver.forVisionTasks("/mediapipe/wasm");
        let landmarker: Awaited<ReturnType<typeof PoseLandmarker.createFromOptions>> | null = null;
        for (const delegate of ["GPU", "CPU"] as const) {
          try {
            landmarker = await PoseLandmarker.createFromOptions(fileset, {
              baseOptions: { modelAssetPath: "/mediapipe/pose_landmarker_lite.task", delegate },
              runningMode: "VIDEO",
              numPoses: 1,
            });
            break;
          } catch {
            landmarker = null;
          }
        }
        if (!landmarker) throw new Error("No se pudo iniciar el análisis de movimiento en este teléfono.");
        landmarkerRef.current = landmarker as unknown as Landmarker;

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
        setUi("activo");

        let ultimoVideoTime = -1;
        let ultimoHud = 0;
        let ultimoFrame = performance.now();
        let dtPrevio = 0;
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
          if (dtPrevio > 0) fpsRef.current = fpsRef.current === null ? 1000 / dtPrevio : fpsRef.current * 0.95 + (1000 / dtPrevio) * 0.05;
          dtPrevio = ahora - ultimoFrame;
          ultimoFrame = ahora;

          const r = landmarkerRef.current!.detectForVideo(video, ahora);
          const puntos = r.landmarks?.[0];
          const encuadre = evaluarEncuadre(puntos);

          // Armado automático: encuadre bien durante 1 s seguido -> empieza a contar.
          if (!armadoRef.current) {
            if (encuadre.ok) {
              okDesdeRef.current ??= ahora;
              if (ahora - okDesdeRef.current >= MS_ENCUADRE_PARA_ARMAR) {
                armadoRef.current = true;
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
            decir(String(estado.repeticiones));
            vibrar(25);
            terminadaAvisadaRef.current = false;
          }
          // Fin de serie: ya contó y pasó un rato sin repeticiones nuevas.
          if (armadoRef.current && estado.terminada && !terminadaAvisadaRef.current) {
            terminadaAvisadaRef.current = true;
            decir(`Serie terminada, ${estado.repeticiones} repeticiones`);
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

  const reps = Math.max(0, (hud?.estado.repeticiones ?? 0) + ajuste);

  // Guarda los números de la serie (sin video) para ajustar el conteo con datos reales.
  function guardarTraza() {
    const senales = contadorRef.current.exportarTraza();
    if (Object.keys(senales).length === 0 || (hud?.estado.repeticiones ?? 0) + ajuste === 0) return;
    void guardarSesionPose({
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
    detener();
    onUsar(n);
  }

  function cerrar() {
    guardarTraza();
    detener();
    onCerrar();
  }

  const estado = hud?.estado;
  const enc = hud?.encuadre;
  const borde = ui === "activo" && enc ? (enc.ok ? "border-emerald-500/70" : "border-yellow-400") : "border-transparent";

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="flex items-center justify-between gap-2 px-4 py-3 text-white">
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
                <p className="mt-1 text-[10px] text-gray-400">siguiendo: {estado?.senal ?? "buscando"}</p>
              </div>
            )}
            {estado?.terminada && (
              <div className="absolute right-3 top-3 rounded-xl bg-emerald-600 px-3 py-2 text-center text-xs font-semibold text-black">Serie terminada</div>
            )}
            <div className="absolute inset-x-2 bottom-2 rounded-lg bg-black/70 px-3 py-2 text-center">
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
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col gap-2 px-4 pb-4 pt-3">
        <div className="flex items-center justify-center gap-3">
          <button type="button" onClick={() => setAjuste((a) => a - 1)} disabled={!hud?.armado} aria-label="Restar una repetición" className="h-11 w-14 rounded-full border border-border-strong text-lg text-gray-200 disabled:opacity-40">
            −1
          </button>
          <span className="min-w-24 text-center text-xs text-gray-400">Corregir el conteo</span>
          <button type="button" onClick={() => setAjuste((a) => a + 1)} disabled={!hud?.armado} aria-label="Sumar una repetición" className="h-11 w-14 rounded-full border border-border-strong text-lg text-gray-200 disabled:opacity-40">
            +1
          </button>
        </div>
        <button type="button" onClick={usar} disabled={ui !== "activo" || !hud?.armado} className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-black disabled:opacity-50">
          {reps > 0 ? `Usar ${reps} ${reps === 1 ? "repetición" : "repeticiones"}` : "Terminar sin contar"}
        </button>
        <div className="flex gap-2">
          <button type="button" onClick={reiniciarConteo} disabled={!hud?.armado} className="flex-1 rounded-full border border-border-strong px-4 py-2.5 text-sm text-gray-200 disabled:opacity-40">
            Reiniciar
          </button>
          <button type="button" onClick={cambiarCamara} disabled={ui === "cargando"} className="flex-1 rounded-full border border-border-strong px-4 py-2.5 text-sm text-gray-200 disabled:opacity-50">
            Cambiar cámara
          </button>
        </div>
        <p className="text-center text-[11px] text-gray-500">Prototipo · No se graba ni se envía video: todo se procesa en tu teléfono.</p>
      </div>
    </div>
  );
}

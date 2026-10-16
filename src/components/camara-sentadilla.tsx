"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnalizadorSentadilla, type Color, type EstadoSentadilla, type ResumenSerie } from "@/lib/pose/sentadilla";
import { PUNTO, type Punto } from "@/lib/pose/geometria";

// PROTOTIPO de análisis de movimiento con la cámara, en tiempo real.
// - La cámara se ve en vivo y se dibuja el esqueleto encima: cada segmento evaluado
//   va en verde (bien), amarillo (corregir) o rojo (no se puede permitir).
// - Cuando algo está en rojo/amarillo hay una alerta notoria: borde que parpadea,
//   mensaje grande y vibración.
// - NADA se graba ni se envía: los fotogramas se procesan en el teléfono
//   (MediaPipe Pose por WebAssembly, modelo y wasm servidos desde /mediapipe) y
//   se descartan al instante. No hay MediaRecorder ni se exporta el canvas.

const COLOR_LINEA: Record<Color, string> = {
  verde: "#22c55e",
  amarillo: "#facc15",
  rojo: "#ef4444",
  neutro: "rgba(255,255,255,0.85)",
};
const CLASE_TEXTO: Record<Color, string> = {
  verde: "text-emerald-400",
  amarillo: "text-yellow-300",
  rojo: "text-red-400",
  neutro: "text-gray-200",
};
const CLASE_BORDE: Record<Color, string> = {
  verde: "",
  amarillo: "border-yellow-400",
  rojo: "border-red-500",
  neutro: "",
};

// Pares de puntos del esqueleto de fondo (tenue).
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

type Ui = "inactivo" | "cargando" | "activo" | "error";
type Lado = "user" | "environment";

type Hud = {
  estado: EstadoSentadilla;
  fps: number;
};

const boton =
  "rounded-full px-5 py-3 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50";

function dibujar(ctx: CanvasRenderingContext2D, ancho: number, alto: number, landmarks: Punto[] | undefined, estado: EstadoSentadilla) {
  ctx.clearRect(0, 0, ancho, alto);
  if (!landmarks) return;
  const px = (i: number) => ({ x: landmarks[i].x * ancho, y: landmarks[i].y * alto });
  const grosor = Math.max(4, ancho / 90);

  ctx.lineCap = "round";
  ctx.lineWidth = grosor * 0.6;
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  for (const [a, b] of ESQUELETO) {
    if ((landmarks[a].visibility ?? 0) < 0.4 || (landmarks[b].visibility ?? 0) < 0.4) continue;
    const pa = px(a);
    const pb = px(b);
    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    ctx.stroke();
  }

  // Segmentos evaluados: SIEMPRE con color (verde / amarillo / rojo), más gruesos.
  ctx.lineWidth = grosor * 1.7;
  const puntosUsados = new Set<number>();
  for (const seg of estado.segmentos) {
    const pa = px(seg.desde);
    const pb = px(seg.hasta);
    ctx.strokeStyle = COLOR_LINEA[seg.color];
    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    ctx.stroke();
    puntosUsados.add(seg.desde);
    puntosUsados.add(seg.hasta);
  }
  ctx.fillStyle = "#ffffff";
  for (const i of puntosUsados) {
    const p = px(i);
    ctx.beginPath();
    ctx.arc(p.x, p.y, grosor * 1.1, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function CamaraSentadilla() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<{ detectForVideo: (v: HTMLVideoElement, t: number) => { landmarks?: Punto[][]; worldLandmarks?: Punto[][] }; close: () => void } | null>(null);
  const rafRef = useRef<number | null>(null);
  const wakeLockRef = useRef<{ release: () => Promise<void> } | null>(null);
  const analizadorRef = useRef(new AnalizadorSentadilla());
  const activoRef = useRef(false);
  const ultimaAlertaRef = useRef<Color>("neutro");
  const ultimaVibracionRef = useRef(0);

  const [ui, setUi] = useState<Ui>("inactivo");
  const [error, setError] = useState<string | null>(null);
  const [lado, setLado] = useState<Lado>("user");
  const [aspecto, setAspecto] = useState(3 / 4);
  const [hud, setHud] = useState<Hud | null>(null);
  const [resolucion, setResolucion] = useState("");
  const [delegado, setDelegado] = useState("");
  const [resumen, setResumen] = useState<ResumenSerie | null>(null);

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
    const c = canvasRef.current;
    c?.getContext("2d")?.clearRect(0, 0, c.width, c.height);
  }, []);

  useEffect(() => detener, [detener]);

  const iniciar = useCallback(
    async (queLado: Lado) => {
      detener();
      setError(null);
      setResumen(null);
      setUi("cargando");
      analizadorRef.current.reset();
      ultimaAlertaRef.current = "neutro";
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("Este navegador no permite usar la cámara.");

        // Android entrega a veces el video recortado en horizontal (un cuadro 4:3 que
        // pierde arriba y abajo) según cómo se pidan ancho y alto. Se prueba pedir
        // vertical y, si llega horizontal con el teléfono parado, se vuelve a pedir
        // con las medidas invertidas; se queda con la que dé más alto que ancho.
        const pantallaVertical = window.innerHeight >= window.innerWidth;
        const pedidos: [number, number][] = pantallaVertical
          ? [[720, 1280], [1280, 720], [480, 640]]
          : [[1280, 720], [720, 1280], [640, 480]];
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
          const vertical = video.videoHeight >= video.videoWidth;
          if (vertical === pantallaVertical) break;
        }
        streamRef.current = stream;
        setAspecto(video.videoWidth / video.videoHeight);
        setResolucion(`${video.videoWidth}x${video.videoHeight}`);

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
            setDelegado(delegate);
            break;
          } catch {
            landmarker = null;
          }
        }
        if (!landmarker) throw new Error("No se pudo iniciar el análisis de movimiento en este teléfono.");
        landmarkerRef.current = landmarker as unknown as typeof landmarkerRef.current;

        // Mantiene la pantalla encendida mientras se entrena (si el navegador lo permite).
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
        const aspectoVideo = video.videoWidth / video.videoHeight;

        activoRef.current = true;
        setUi("activo");

        let ultimoVideoTime = -1;
        let ultimoHud = 0;
        let ultimoFrame = performance.now();
        let fps = 0;

        const tick = () => {
          if (!activoRef.current) return;
          rafRef.current = requestAnimationFrame(tick);
          if (video.readyState < 2 || video.currentTime === ultimoVideoTime) return;
          ultimoVideoTime = video.currentTime;

          const ahora = performance.now();
          const resultado = landmarkerRef.current!.detectForVideo(video, ahora);
          const puntos = resultado.landmarks?.[0];
          const mundo = resultado.worldLandmarks?.[0];
          const estado = analizadorRef.current.procesar(puntos, ahora, mundo, aspectoVideo);
          dibujar(ctx, canvas.width, canvas.height, puntos, estado);

          // Vibración cuando aparece una alerta ROJA (como mucho una cada 1,5 s).
          if (estado.alerta === "rojo" && ultimaAlertaRef.current !== "rojo" && ahora - ultimaVibracionRef.current > 1500) {
            ultimaVibracionRef.current = ahora;
            try {
              navigator.vibrate?.([120, 60, 120]);
            } catch {
              /* sin vibración disponible */
            }
          }
          ultimaAlertaRef.current = estado.alerta;

          const dt = ahora - ultimoFrame;
          ultimoFrame = ahora;
          if (dt > 0) fps = fps === 0 ? 1000 / dt : fps * 0.9 + (1000 / dt) * 0.1;

          if (ahora - ultimoHud > 100) {
            ultimoHud = ahora;
            setHud({ estado, fps });
          }
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch (e) {
        detener();
        const msg = e instanceof Error ? e.message : "No se pudo iniciar la cámara.";
        setError(
          /Permission|NotAllowed|denied/i.test(msg)
            ? "No diste permiso para usar la cámara. Activalo en los permisos del navegador y probá de nuevo."
            : msg
        );
        setUi("error");
      }
    },
    [detener]
  );

  function parar() {
    const r = analizadorRef.current.resumen();
    detener();
    setUi("inactivo");
    if (r.repeticiones > 0) setResumen(r);
  }

  function terminarSerie() {
    setResumen(analizadorRef.current.resumen());
  }

  function nuevaSerie() {
    analizadorRef.current.reset();
    ultimaAlertaRef.current = "neutro";
    setResumen(null);
    setHud(null);
  }

  function cambiarCamara() {
    const nuevo: Lado = lado === "user" ? "environment" : "user";
    setLado(nuevo);
    void iniciar(nuevo);
  }

  const est = hud?.estado;
  const alerta: Color = est?.visible ? est.alerta : "neutro";
  const colorMensaje: Color = !est?.visible ? "amarillo" : alerta !== "neutro" && alerta !== "verde" ? alerta : (est.ultimaRep?.veredicto ?? "neutro");

  return (
    <div className="flex flex-col gap-3">
      {ui !== "activo" && !resumen && (
        <ol className="list-decimal space-y-1 pl-5 text-sm text-gray-300">
          <li>Apoyá el teléfono a unos 2 metros, en vertical, a la altura de la cadera.</li>
          <li>Ponete de costado o de frente, con el cuerpo entero en cuadro.</li>
          <li>Tocá &quot;Activar cámara&quot; y hacé sentadillas sin peso o con poco.</li>
        </ol>
      )}

      <div
        className="relative mx-auto overflow-hidden rounded-xl border border-border bg-black"
        style={{ aspectRatio: aspecto, width: `min(100%, ${(82 * aspecto).toFixed(1)}dvh)` }}
      >
        <div className="absolute inset-0" style={{ transform: lado === "user" ? "scaleX(-1)" : undefined }}>
          <video ref={videoRef} playsInline muted autoPlay className="h-full w-full object-fill" />
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        </div>

        {/* Alerta notoria: borde que parpadea cuando algo está en rojo o amarillo. */}
        {ui === "activo" && (alerta === "rojo" || alerta === "amarillo") && (
          <div
            className={`pointer-events-none absolute inset-0 rounded-xl border-[7px] ${CLASE_BORDE[alerta]} ${alerta === "rojo" ? "animate-pulse" : ""}`}
          />
        )}

        {ui !== "activo" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 px-6 text-center text-sm text-gray-300">
            {ui === "cargando" ? "Cargando el análisis de movimiento…" : ui === "error" ? error : "La cámara está apagada."}
          </div>
        )}

        {ui === "activo" && (
          <div className="absolute left-3 top-3 rounded-lg bg-black/60 px-3 py-1.5 text-white">
            <p className="text-[10px] uppercase tracking-wide text-gray-400">Repeticiones</p>
            <p className="text-3xl font-semibold leading-none">
              {est?.repeticiones ?? 0}
              <span className="ml-2 text-sm font-normal text-emerald-400">{est?.repeticionesBuenas ?? 0} buenas</span>
            </p>
          </div>
        )}

        {ui === "activo" && est && (
          <div className="absolute inset-x-2 bottom-2 rounded-lg bg-black/70 px-3 py-2 text-center">
            <p className={`text-lg font-semibold leading-snug ${CLASE_TEXTO[colorMensaje]}`}>{est.mensaje}</p>
          </div>
        )}
      </div>

      {ui === "activo" && est && (
        <div>
          <p className="text-[11px] text-gray-500">
            <span className="text-emerald-400">Verde</span>: bien · <span className="text-yellow-300">Amarillo</span>: corregir ·{" "}
            <span className="text-red-400">Rojo</span>: no se puede permitir
          </p>
          <p className="mt-1 text-[11px] text-gray-600">
            Prototipo · vista {est.vista === "frente" ? "de frente" : est.vista === "lado" ? "de lado" : "-"} · rodilla{" "}
            {est.anguloRodilla !== null ? `${Math.round(est.anguloRodilla)}°` : "-"} · torso{" "}
            {est.inclinacionTorso !== null ? `${Math.round(est.inclinacionTorso)}°` : "-"} · cabeza{" "}
            {est.metricas.cabeza !== null ? `${Math.round(est.metricas.cabeza)}°` : "-"} · rodillas{" "}
            {est.metricas.valgo !== null ? `${Math.round(est.metricas.valgo * 100)}%` : "-"} · pies{" "}
            {est.metricas.pies !== null ? `${est.metricas.pies.toFixed(1)}x` : "-"} · {Math.round(hud?.fps ?? 0)} fps · {resolucion} ·{" "}
            {delegado}
          </p>
        </div>
      )}

      {resumen && (
        <div className="rounded-xl border border-border bg-bg-card p-4">
          <h2 className={`text-lg font-semibold ${CLASE_TEXTO[resumen.calificacion]}`}>{resumen.titulo}</h2>
          {resumen.repeticiones > 0 && (
            <p className="mt-1 text-sm text-gray-300">
              {resumen.buenas} de {resumen.repeticiones} repeticiones bien hechas ({resumen.porcentajeBuenas}%).
            </p>
          )}
          {resumen.problemas.length > 0 && (
            <ul className="mt-3 flex flex-col gap-3">
              {resumen.problemas.map((p) => (
                <li key={p.clave} className="text-sm">
                  <p className={p.rojas > 0 ? "font-medium text-red-400" : "font-medium text-yellow-300"}>
                    {p.texto}: en {p.reps} de {resumen.repeticiones} repeticiones{p.rojas > 0 ? ` (${p.rojas} graves)` : ""}
                  </p>
                  <p className="mt-0.5 text-gray-400">{p.consejo}</p>
                </li>
              ))}
            </ul>
          )}
          <button type="button" onClick={nuevaSerie} className={`${boton} mt-4 bg-white text-black`}>
            Nueva serie
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {ui === "activo" || ui === "cargando" ? (
          <button type="button" onClick={parar} className={`${boton} border border-border-strong text-white`}>
            Detener
          </button>
        ) : (
          <button type="button" onClick={() => void iniciar(lado)} className={`${boton} bg-white text-black`}>
            Activar cámara
          </button>
        )}
        {ui === "activo" && !resumen && (
          <button type="button" onClick={terminarSerie} className={`${boton} bg-white text-black`}>
            Terminar serie
          </button>
        )}
        <button
          type="button"
          onClick={cambiarCamara}
          disabled={ui === "cargando"}
          className={`${boton} border border-border-strong text-gray-300`}
        >
          Cambiar cámara
        </button>
      </div>

      <p className="text-xs text-gray-500">
        No se graba ni se envía video: todo se procesa en tu teléfono y se descarta al instante.
      </p>
    </div>
  );
}

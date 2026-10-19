"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ContadorUniversal, type EstadoContador } from "@/lib/pose/contador";
import { PUNTO, type Punto } from "@/lib/pose/geometria";

// PROTOTIPO: cuenta las repeticiones de CUALQUIER ejercicio con la cámara, sin calibrar
// (lib/pose/contador.ts). Se abre desde la ficha del ejercicio, cuenta en pantalla
// completa y devuelve el número para llenar el campo "Reps".
// NADA se graba ni se envía: los fotogramas se procesan en el teléfono y se descartan.

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

function dibujar(ctx: CanvasRenderingContext2D, ancho: number, alto: number, puntos: Punto[] | undefined) {
  ctx.clearRect(0, 0, ancho, alto);
  if (!puntos) return;
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(4, ancho / 120);
  ctx.strokeStyle = "rgba(34,197,94,0.8)";
  for (const [a, b] of ESQUELETO) {
    if ((puntos[a]?.visibility ?? 0) < 0.4 || (puntos[b]?.visibility ?? 0) < 0.4) continue;
    ctx.beginPath();
    ctx.moveTo(puntos[a].x * ancho, puntos[a].y * alto);
    ctx.lineTo(puntos[b].x * ancho, puntos[b].y * alto);
    ctx.stroke();
  }
}

export function ContadorCamara({ nombre, onUsar, onCerrar }: { nombre: string; onUsar: (reps: number) => void; onCerrar: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<Landmarker | null>(null);
  const rafRef = useRef<number | null>(null);
  const wakeLockRef = useRef<{ release: () => Promise<void> } | null>(null);
  const contadorRef = useRef(new ContadorUniversal());
  const activoRef = useRef(false);

  const [ui, setUi] = useState<Ui>("cargando");
  const [error, setError] = useState<string | null>(null);
  const [lado, setLado] = useState<Lado>("environment");
  const [aspecto, setAspecto] = useState(3 / 4);
  const [estado, setEstado] = useState<EstadoContador | null>(null);

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
  }, []);

  const iniciar = useCallback(
    async (queLado: Lado) => {
      detener();
      setError(null);
      setUi("cargando");
      contadorRef.current.reset();
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
        const tick = () => {
          if (!activoRef.current) return;
          rafRef.current = requestAnimationFrame(tick);
          if (video.readyState < 2 || video.currentTime === ultimoVideoTime) return;
          ultimoVideoTime = video.currentTime;
          const ahora = performance.now();
          const r = landmarkerRef.current!.detectForVideo(video, ahora);
          const puntos = r.landmarks?.[0];
          const est = contadorRef.current.procesar(r.worldLandmarks?.[0], puntos, ahora);
          dibujar(ctx, canvas.width, canvas.height, puntos);
          if (ahora - ultimoHud > 100) {
            ultimoHud = ahora;
            setEstado(est);
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
    [detener]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void iniciar("environment");
    return detener;
  }, [iniciar, detener]);

  function cambiarCamara() {
    const nuevo: Lado = lado === "user" ? "environment" : "user";
    setLado(nuevo);
    void iniciar(nuevo);
  }

  function reiniciar() {
    contadorRef.current.reset();
    setEstado(null);
  }

  function usar() {
    const n = estado?.repeticiones ?? 0;
    detener();
    onUsar(n);
  }

  function cerrar() {
    detener();
    onCerrar();
  }

  const reps = estado?.repeticiones ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <p className="truncate pr-3 text-sm font-medium">{nombre}</p>
        <button type="button" onClick={cerrar} className="rounded-full border border-border-strong px-4 py-1.5 text-sm">
          Cerrar
        </button>
      </div>

      <div className="relative mx-auto min-h-0 w-full flex-1 overflow-hidden" style={{ maxWidth: `${(100 * aspecto).toFixed(1)}dvh` }}>
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
            <div className="absolute left-3 top-3 rounded-xl bg-black/60 px-4 py-2 text-white">
              <p className="text-[10px] uppercase tracking-wide text-gray-400">Repeticiones</p>
              <p className="text-6xl font-semibold leading-none">{reps}</p>
            </div>
            <div className="absolute inset-x-2 bottom-2 rounded-lg bg-black/70 px-3 py-2 text-center">
              <p className={`text-base font-semibold leading-snug ${estado && !estado.visible ? "text-yellow-300" : "text-gray-100"}`}>
                {estado?.mensaje ?? "Ponete con el cuerpo entero en cuadro y empezá."}
              </p>
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col gap-2 px-4 pb-4 pt-3">
        <button
          type="button"
          onClick={usar}
          disabled={ui !== "activo"}
          className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-black disabled:opacity-50"
        >
          {reps > 0 ? `Usar ${reps} ${reps === 1 ? "repetición" : "repeticiones"}` : "Terminar sin contar"}
        </button>
        <div className="flex gap-2">
          <button type="button" onClick={reiniciar} disabled={ui !== "activo"} className="flex-1 rounded-full border border-border-strong px-4 py-2.5 text-sm text-gray-200 disabled:opacity-50">
            Reiniciar conteo
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

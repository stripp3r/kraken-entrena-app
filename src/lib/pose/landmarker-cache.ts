// El modelo de postura (MediaPipe, ~6 a 9 MB + wasm) tarda varios segundos en cargarse. Se
// carga UNA vez (al entrar al día de entrenamiento) y se reutiliza entre series y
// ejercicios, así la cámara abre al instante. Solo corre en el teléfono.
// Hay dos modelos: "lite" (rápido, el de siempre) y "full" (más preciso con el cuerpo medio tapado o
// en posiciones raras, como acostado en un banco; más lento).

export type Landmarker = {
  detectForVideo: (v: HTMLVideoElement, t: number) => { landmarks?: Punto[][]; worldLandmarks?: Punto[][] };
  close: () => void;
};
type Punto = { x: number; y: number; z?: number; visibility?: number };
export type ModeloPose = "lite" | "full";

const ARCHIVO: Record<ModeloPose, string> = {
  lite: "/mediapipe/pose_landmarker_lite.task",
  full: "/mediapipe/pose_landmarker_full.task",
};

const promesas: Partial<Record<ModeloPose, Promise<Landmarker>>> = {};
const listos: Partial<Record<ModeloPose, Landmarker>> = {};
const delegados: Partial<Record<ModeloPose, string>> = {};

async function crear(modelo: ModeloPose): Promise<Landmarker> {
  const { FilesetResolver, PoseLandmarker } = await import("@mediapipe/tasks-vision");
  const fileset = await FilesetResolver.forVisionTasks("/mediapipe/wasm");
  let lm: Awaited<ReturnType<typeof PoseLandmarker.createFromOptions>> | null = null;
  for (const delegate of ["GPU", "CPU"] as const) {
    try {
      lm = await PoseLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: ARCHIVO[modelo], delegate },
        runningMode: "VIDEO",
        numPoses: 1,
      });
      delegados[modelo] = delegate;
      break;
    } catch {
      lm = null;
    }
  }
  if (!lm) throw new Error("No se pudo iniciar el análisis de movimiento en este teléfono.");
  listos[modelo] = lm as unknown as Landmarker;
  return listos[modelo] as Landmarker;
}

function cargar(modelo: ModeloPose): Promise<Landmarker> {
  const previa = promesas[modelo];
  if (previa) return previa;
  const p = crear(modelo).catch((e) => {
    delete promesas[modelo]; // se reintenta la próxima vez
    throw e;
  });
  promesas[modelo] = p;
  return p;
}

/** Empieza a cargar el modelo liviano en segundo plano (no hace nada si ya está cargado o cargando). */
export function precargarLandmarker(): void {
  cargar("lite").catch(() => {});
}

/** El modelo ya cargado (o lo carga y espera). */
export function obtenerLandmarker(modelo: ModeloPose = "lite"): Promise<Landmarker> {
  const listo = listos[modelo];
  return listo ? Promise.resolve(listo) : cargar(modelo);
}

/** "GPU" o "CPU": con qué se está analizando (para diagnóstico). */
export function delegadoDe(modelo: ModeloPose): string {
  return delegados[modelo] ?? "";
}

/** Libera la memoria de los modelos (al salir del entrenamiento). */
export function liberarLandmarker(): void {
  for (const m of ["lite", "full"] as const) {
    listos[m]?.close();
    delete listos[m];
    delete promesas[m];
  }
}

// El modelo de postura (MediaPipe, ~10 MB + wasm) tarda varios segundos en cargarse. Se
// carga UNA vez (al entrar al día de entrenamiento) y se reutiliza entre series y
// ejercicios, así la cámara abre al instante. Solo corre en el teléfono.

export type Landmarker = {
  detectForVideo: (v: HTMLVideoElement, t: number) => { landmarks?: Punto[][]; worldLandmarks?: Punto[][] };
  close: () => void;
};
type Punto = { x: number; y: number; z?: number; visibility?: number };

let promesa: Promise<Landmarker> | null = null;
let listo: Landmarker | null = null;

async function crear(): Promise<Landmarker> {
  const { FilesetResolver, PoseLandmarker } = await import("@mediapipe/tasks-vision");
  const fileset = await FilesetResolver.forVisionTasks("/mediapipe/wasm");
  let lm: Awaited<ReturnType<typeof PoseLandmarker.createFromOptions>> | null = null;
  for (const delegate of ["GPU", "CPU"] as const) {
    try {
      lm = await PoseLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: "/mediapipe/pose_landmarker_lite.task", delegate },
        runningMode: "VIDEO",
        numPoses: 1,
      });
      break;
    } catch {
      lm = null;
    }
  }
  if (!lm) throw new Error("No se pudo iniciar el análisis de movimiento en este teléfono.");
  listo = lm as unknown as Landmarker;
  return listo;
}

/** Empieza a cargar el modelo en segundo plano (no hace nada si ya está cargado o cargando). */
export function precargarLandmarker(): void {
  if (promesa) return;
  promesa = crear().catch((e) => {
    promesa = null; // se reintenta la próxima vez
    throw e;
  });
  promesa.catch(() => {});
}

/** El modelo ya cargado (o lo carga y espera). */
export function obtenerLandmarker(): Promise<Landmarker> {
  if (listo) return Promise.resolve(listo);
  if (!promesa) {
    promesa = crear().catch((e) => {
      promesa = null;
      throw e;
    });
  }
  return promesa;
}

/** Libera la memoria del modelo (al salir del entrenamiento). */
export function liberarLandmarker(): void {
  listo?.close();
  listo = null;
  promesa = null;
}

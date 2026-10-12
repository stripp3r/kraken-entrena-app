// Drop sets (migración 096): una serie "con drop set" es una serie principal al
// fallo seguida, SIN descanso, de N "bajadas" (se baja el peso y se sigue al
// fallo). En `workout_logs` es una fila principal (tipo_serie = 'dropset') más
// una fila por bajada (tipo_serie = 'drop', drop_de = id de la principal).
// Todo lo que cuenta "series" (objetivo, series completas, top set y
// sugerencias de peso) mira SOLO las filas que no son 'drop': una bajada es
// trabajo extra de esa misma serie, no una serie más, y su peso (a propósito
// más liviano y fatigado) no debe contaminar el 1RM estimado.

export type TipoSerie = "normal" | "dropset" | "drop";

export type LogSerie = {
  id: number;
  peso: number | null;
  reps: number | null;
  tipo_serie: TipoSerie;
  drop_de: number | null;
  created_at: string;
};

export type PlanSeries = {
  normales: number;
  dropsetsMin: number;
  dropsetsMax: number;
  bajadas: number;
};

const BAJADAS_POR_DEFECTO = 2;
// Pasado este tiempo desde la última fila de un drop set, ya no se asume que
// la persona sigue en medio de la secuencia (volvió a la app mucho después).
const MINUTOS_MAX_ENTRE_BAJADAS = 10;

// Lee la prescripción de series_reps de un ejercicio con drop sets, p. ej.
// "2 x al fallo (RIR 0) + 1-2 x drop set (2 bajadas)" -> 2 series normales,
// 1 a 2 series con drop set, 2 bajadas por drop set. Cualquier texto sin
// "+ N x drop" es un ejercicio común (dropsetsMax = 0).
export function planDeSeries(seriesReps: string | null | undefined): PlanSeries {
  const texto = seriesReps ?? "";
  const principal = texto.match(/^\s*(\d+)/);
  const drop = texto.match(/\+\s*(\d+)(?:\s*-\s*(\d+))?\s*[x×X]\s*drop/i);
  const bajadas = texto.match(/(\d+)\s*bajadas?/i);

  const dropsetsMin = drop ? Number(drop[1]) : 0;
  return {
    normales: principal ? Number(principal[1]) : 0,
    dropsetsMin,
    dropsetsMax: drop ? Number(drop[2] ?? drop[1]) : 0,
    bajadas: bajadas ? Number(bajadas[1]) : BAJADAS_POR_DEFECTO,
  };
}

export function tieneDropset(plan: PlanSeries): boolean {
  return plan.dropsetsMax > 0;
}

// Series que hay que completar para dar el ejercicio por hecho.
export function seriesObjetivoDelPlan(plan: PlanSeries): number {
  return plan.normales + plan.dropsetsMin;
}

export function contarSeriesPrincipales(logs: { tipo_serie?: TipoSerie | null }[]): number {
  return logs.filter((l) => l.tipo_serie !== "drop").length;
}

export type PendienteDrop = {
  padreId: number;
  numero: number;
  pesos: number[];
};

export type EstadoDropset = {
  normalesHechas: number;
  dropsetsHechos: number;
  modoSugerido: "normal" | "dropset";
  pendiente: PendienteDrop | null;
};

// Qué toca hacer ahora con este ejercicio, a partir de lo ya registrado hoy.
// Se deriva de la base (no de un estado local) para que sobreviva a una
// recarga o a que la app se vaya a segundo plano. `cerradoId` es la última fila
// que el usuario cerró a mano con "Terminar drop set" (menos bajadas que las
// previstas).
export function estadoDropset(
  logs: LogSerie[],
  plan: PlanSeries,
  ahoraMs: number,
  cerradoId: number | null
): EstadoDropset {
  const normalesHechas = logs.filter((l) => l.tipo_serie === "normal").length;
  const dropsetsHechos = logs.filter((l) => l.tipo_serie === "dropset").length;

  const modoSugerido =
    tieneDropset(plan) && normalesHechas >= plan.normales && dropsetsHechos < plan.dropsetsMax
      ? "dropset"
      : "normal";

  let pendiente: PendienteDrop | null = null;
  const ultima = logs[logs.length - 1];
  if (ultima && ultima.tipo_serie !== "normal" && ultima.id !== cerradoId) {
    const padre = ultima.tipo_serie === "dropset" ? ultima : logs.find((l) => l.id === ultima.drop_de);
    const reciente = ahoraMs - new Date(ultima.created_at).getTime() < MINUTOS_MAX_ENTRE_BAJADAS * 60_000;
    if (padre && reciente) {
      const bajadas = logs.filter((l) => l.drop_de === padre.id);
      if (bajadas.length < plan.bajadas) {
        pendiente = {
          padreId: padre.id,
          numero: bajadas.length + 1,
          pesos: [padre.peso, ...bajadas.map((b) => b.peso)].filter((p): p is number => p !== null && p > 0),
        };
      }
    }
  }

  return { normalesHechas, dropsetsHechos, modoSugerido, pendiente };
}

// Peso orientativo para la próxima bajada: repite el mismo salto que la
// bajada anterior (30 -> 25 sugiere 20), o un 20% menos si es la primera.
// Redondeado a 0.5 kg. null si no se puede calcular algo menor y positivo.
export function pesoSugeridoBajada(pesos: number[]): number | null {
  if (pesos.length === 0) return null;
  const ultimo = pesos[pesos.length - 1];
  const salto = pesos.length >= 2 ? pesos[pesos.length - 2] - ultimo : ultimo * 0.2;
  const siguiente = Math.round((ultimo - salto) * 2) / 2;
  return siguiente > 0 && siguiente < ultimo ? siguiente : null;
}

// Un ejercicio puede estar agendado en más de un día de una misma rutina
// (ej. Anti-Flakardo Fullbody repite el mismo template en A/B/C). Mientras
// la prescripción (series/reps + RIR objetivo) sea IDÉNTICA en todos esos
// días, mezclar su historial de sets es correcto -- es el mismo estímulo
// entrenado varias veces por semana. Pero si algún día se carga una rutina
// donde el mismo ejercicio se repite con una prescripción DISTINTA según
// el día (ej. Día A fuerza 5x5, Día B hipertrofia 3x15), la sugerencia de
// peso y el historial de progreso no deben mezclar esas dos sesiones.
//
// `workout_logs.dia` (migración 063) guarda de qué día vino cada set desde
// que existe esta columna -- esta función decide, por ejercicio, si hace
// falta usarla para separar el historial, o si el caso común (misma
// prescripción en todos los días) sigue mezclando todo como siempre.
export type InstanciaEjercicio = {
  exercise_definition_id: number | null;
  series_reps: string | null;
  rir_objetivo: number | null;
};

export function ejerciciosQueDivergenPorDia(instancias: InstanciaEjercicio[]): Set<number> {
  const firmasPorEjercicio = new Map<number, Set<string>>();
  for (const i of instancias) {
    if (i.exercise_definition_id === null) continue;
    const firma = `${i.series_reps ?? ""}|${i.rir_objetivo ?? ""}`;
    const firmas = firmasPorEjercicio.get(i.exercise_definition_id) ?? new Set<string>();
    firmas.add(firma);
    firmasPorEjercicio.set(i.exercise_definition_id, firmas);
  }
  const divergen = new Set<number>();
  for (const [id, firmas] of firmasPorEjercicio) {
    if (firmas.size > 1) divergen.add(id);
  }
  return divergen;
}

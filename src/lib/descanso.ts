export type TipoEsfuerzo = "compuesto" | "aislado";
export type Lado = "derecho" | "izquierdo";

// entreLados (descanso entre el lado derecho y el izquierdo de una misma
// serie) NO es una fracción de entreSeries -- son dos preguntas distintas.
// entreSeries pregunta "¿cuánto tarda en recuperarse el músculo para dar
// otra serie completa?"; entreLados pregunta "¿cuánto necesito para pasar
// la pierna/brazo de trabajo al lado que todavía no hizo nada?" -- ese
// lado arranca fresco, así que el descanso real que hace falta es mucho
// más corto que entre series, y varía según qué tan demandante es el
// movimiento en sí (una sentadilla búlgara exige más que una patada de
// glúteo), no según el tiempo de recuperación entre series de ese mismo
// ejercicio. 90s/60s (la mitad de entreSeries) generaba descansos
// excesivos entre lados -- confirmado por el usuario 2026-09-23.
const REGLAS: Record<TipoEsfuerzo, { entreSeries: number; entreLados: number }> = {
  compuesto: { entreSeries: 180, entreLados: 60 },
  aislado: { entreSeries: 120, entreLados: 30 },
};

/** Descanso para retomar la próxima serie (o serie completa, si es unilateral). */
export function segundosEntreSeries(tipo: TipoEsfuerzo): number {
  return REGLAS[tipo].entreSeries;
}

/** Descanso entre un lado y el otro de una misma serie, solo unilaterales. */
export function segundosEntreLados(tipo: TipoEsfuerzo): number {
  return REGLAS[tipo].entreLados;
}

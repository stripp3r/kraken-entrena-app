export type TipoEsfuerzo = "compuesto" | "aislado";
export type Lado = "derecho" | "izquierdo";

const REGLAS: Record<TipoEsfuerzo, { entreSeries: number; entreLados: number }> = {
  compuesto: { entreSeries: 180, entreLados: 90 },
  aislado: { entreSeries: 120, entreLados: 60 },
};

/** Descanso para retomar la próxima serie (o serie completa, si es unilateral). */
export function segundosEntreSeries(tipo: TipoEsfuerzo): number {
  return REGLAS[tipo].entreSeries;
}

/** Descanso entre un lado y el otro de una misma serie, solo unilaterales. */
export function segundosEntreLados(tipo: TipoEsfuerzo): number {
  return REGLAS[tipo].entreLados;
}

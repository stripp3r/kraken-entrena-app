// Modalidad de carga de cada ejercicio (columna exercise_definitions.modalidad_carga,
// migración 103) y cálculo de la "carga efectiva" de una serie, que es lo que usa el
// análisis para comparar entrenos.
//
//   con_peso       peso + reps                       carga = peso
//   peso_corporal  reps + lastre opcional (kg extra) carga = factor × peso corporal + lastre
//   banda          reps                              sin carga medible (se compara por reps)
//   tiempo         segundos                          sin carga medible (se compara por segundos)

export type ModalidadCarga = "con_peso" | "peso_corporal" | "banda" | "tiempo";

export function modalidadValida(valor: unknown): ModalidadCarga {
  return valor === "peso_corporal" || valor === "banda" || valor === "tiempo" ? valor : "con_peso";
}

// Fracción del peso corporal que se mueve en cada ejercicio de peso corporal.
// Fuentes y criterio:
//  - Flexiones: medición con plataforma de fuerza (Ebben et al., 2011): común 0,64,
//    con rodillas apoyadas 0,49, pies elevados 30 cm 0,70.
//  - Dominadas, chin-ups, fondos en paralelas y ejercicios a una pierna: se mueve
//    prácticamente todo el cuerpo -> 1,0 (estimación; no hay mediciones publicadas
//    tan claras como las de flexiones).
//  - Abdominales, hiperextensiones, elevaciones de piernas, puentes, etc.: la fracción
//    depende de la técnica y no hay un valor confiable. Sin factor: se compara por
//    repeticiones y lastre, sin inventar un porcentaje.
export const FACTOR_PESO_CORPORAL: Record<number, number> = {
  26: 0.64, // Flexiones de brazos
  62: 0.55, // Flexiones inclinadas (manos elevadas)
  153: 0.49, // Flexiones con rodillas apoyadas
  264: 0.64, // Flexión con agarres (parallettes)
  265: 0.64, // Flexión abierta
  266: 0.7, // Flexión declinada (pies elevados)
  268: 0.64, // Flexión cerrada (diamante)
  67: 1, // Chin up agarre abierto
  68: 1, // Dominadas lastradas
  138: 1, // Chin up agarre cerrado
  140: 1, // Dominada agarre invertido
  141: 1, // Dominadas (pull ups)
  287: 1, // Dominadas cerradas agarre neutro
  28: 1, // Fondos en paralelas
  12: 1, // Elevación de talón a una pierna
  187: 1, // Sentadilla pistol
};

export function factorPesoCorporal(exerciseId: number): number | null {
  return FACTOR_PESO_CORPORAL[exerciseId] ?? null;
}

type SerieCarga = {
  peso: number | null;
  lastre?: number | null;
  peso_corporal_ref?: number | null;
};

/** Carga en kg de una serie, o null si el ejercicio no tiene una carga medible. */
export function cargaEfectiva(modalidad: ModalidadCarga, exerciseId: number, serie: SerieCarga): number | null {
  if (modalidad === "con_peso") return serie.peso != null && serie.peso > 0 ? serie.peso : null;
  if (modalidad === "peso_corporal") {
    const factor = factorPesoCorporal(exerciseId);
    const lastre = serie.lastre != null && serie.lastre > 0 ? serie.lastre : 0;
    const base = factor != null && serie.peso_corporal_ref ? factor * serie.peso_corporal_ref : 0;
    const total = base + lastre;
    return total > 0 ? Math.round(total * 10) / 10 : null;
  }
  return null;
}

/** Texto corto de una serie para listados (historial, registros del día). */
export function textoSerie(
  modalidad: ModalidadCarga,
  s: { peso: number | null; reps: number | null; lastre?: number | null; segundos?: number | null }
): string {
  const reps = s.reps ?? "-";
  if (modalidad === "peso_corporal") return `${reps} reps${s.lastre ? ` + ${s.lastre} kg de lastre` : ""}`;
  if (modalidad === "banda") return `${reps} reps con banda`;
  if (modalidad === "tiempo") return `${s.segundos ?? "-"} s`;
  return `${s.peso ?? "-"}kg × ${reps}`;
}

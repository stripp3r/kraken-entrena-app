// Réplica exacta de la fórmula que ya usa la calculadora del sitio web
// (Mifflin-St Jeor + factor de actividad + factor de objetivo + reparto de
// macros), para que los números coincidan en los dos lugares.

export type ActividadNutricional = "poca_o_nula" | "ligera" | "moderada" | "muy_activo" | "extremo";
export type ObjetivoNutricional = "superavit" | "mantenimiento" | "definicion";

const MULTIPLICADOR_ACTIVIDAD: Record<ActividadNutricional, number> = {
  poca_o_nula: 1.2,
  ligera: 1.375,
  moderada: 1.55,
  muy_activo: 1.725,
  extremo: 1.9,
};

// "definicion" resta un déficit fijo de 300 kcal sobre el mantenimiento (no un porcentaje),
// criterio del plan Grasa Sub-Cero: déficit moderado para proteger el músculo.
const FACTOR_OBJETIVO: Record<ObjetivoNutricional, { factor: number; ajusteKcal: number; etiqueta: string }> = {
  superavit: { factor: 1.1, ajusteKcal: 0, etiqueta: "para ganar masa muscular limpia" },
  mantenimiento: { factor: 1, ajusteKcal: 0, etiqueta: "para mantener tu peso" },
  definicion: { factor: 1, ajusteKcal: -300, etiqueta: "para bajar grasa de forma sostenida" },
};

export type EstimacionNutricional = {
  kcal: number;
  etiqueta: string;
  proteina: number;
  carbos: number;
  grasa: number;
};

export function calcularEstimacionNutricional(params: {
  sexo: "masculino" | "femenino";
  pesoKg: number;
  alturaCm: number;
  edad: number;
  actividad: ActividadNutricional;
  objetivo: ObjetivoNutricional;
}): EstimacionNutricional {
  const { sexo, pesoKg, alturaCm, edad, actividad, objetivo } = params;

  const tmb =
    sexo === "masculino"
      ? 10 * pesoKg + 6.25 * alturaCm - 5 * edad + 5
      : 10 * pesoKg + 6.25 * alturaCm - 5 * edad - 161;

  const tdee = tmb * MULTIPLICADOR_ACTIVIDAD[actividad];
  const { factor, ajusteKcal, etiqueta } = FACTOR_OBJETIVO[objetivo];
  const metaCalorias = tdee * factor + ajusteKcal;

  const proteinaG = Math.round(pesoKg * 2);
  const proteinaKcal = proteinaG * 4;
  const grasaKcal = metaCalorias * 0.25;
  const grasaG = Math.round(grasaKcal / 9);
  const carbosKcal = Math.max(metaCalorias - proteinaKcal - grasaKcal, 0);
  const carbosG = Math.round(carbosKcal / 4);

  return {
    kcal: Math.round(metaCalorias),
    etiqueta,
    proteina: proteinaG,
    carbos: carbosG,
    grasa: grasaG,
  };
}

// Estimación aproximada de calorías de una sesión de cardio.
// Fórmula estándar MET: kcal = MET x peso(kg) x duración(horas).
// Los valores MET son promedios del Compendium of Physical Activities;
// el resultado es orientativo, no una medición.

export type ActividadCardio = {
  valor: string;
  label: string;
  met: number;
};

export const ACTIVIDADES_CARDIO: ActividadCardio[] = [
  { valor: "caminar", label: "Caminar", met: 3.5 },
  { valor: "caminar_rapido", label: "Caminar rápido", met: 5.0 },
  { valor: "trotar", label: "Trotar", met: 7.0 },
  { valor: "correr", label: "Correr", met: 9.8 },
  { valor: "cinta", label: "Cinta / caminadora", met: 7.0 },
  { valor: "bici", label: "Bicicleta", met: 7.5 },
  { valor: "bici_fija", label: "Bicicleta fija", met: 7.0 },
  { valor: "eliptico", label: "Elíptico", met: 5.0 },
  { valor: "escalador", label: "Escalador", met: 9.0 },
  { valor: "remo", label: "Remo (máquina)", met: 7.0 },
  { valor: "natacion", label: "Natación", met: 7.0 },
  { valor: "soga", label: "Saltar la soga", met: 11.0 },
  { valor: "otro", label: "Otro", met: 6.0 },
];

export function labelActividad(valor: string): string {
  return ACTIVIDADES_CARDIO.find((a) => a.valor === valor)?.label ?? valor;
}

export function estimarCalorias(
  actividad: string,
  pesoKg: number | null,
  duracionMin: number
): number | null {
  const met = ACTIVIDADES_CARDIO.find((a) => a.valor === actividad)?.met;
  if (!met || !pesoKg || pesoKg <= 0 || duracionMin <= 0) return null;
  return Math.round(met * pesoKg * (duracionMin / 60));
}

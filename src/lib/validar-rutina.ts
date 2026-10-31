// Validación de una rutina armada en "Crea tu rutina". Se usa en el cliente (mensajes claros antes de enviar) y
// en el servidor (la protección real: un POST directo a la acción se saltea la pantalla). Devuelve la rutina ya
// normalizada: grupos sin repetir, nombre limpio. Que los ejercicios existan lo comprueba la acción contra la base.
import { GRUPOS_MUSCULARES } from "./grupos-musculares";

export const LIMITES_RUTINA = {
  diasMax: 7,
  ejerciciosPorDiaMax: 20,
  nombreMax: 60,
  series: { min: 1, max: 10 },
  reps: { min: 1, max: 100 },
  rir: { min: 0, max: 5 },
} as const;

export type EjercicioRutina = {
  exerciseDefinitionId: number;
  series: number;
  repsMin: number;
  repsMax: number;
  rirObjetivo: number;
};

export type DiaRutina = {
  gruposMusculares: string[];
  ejercicios: EjercicioRutina[];
};

export type ResultadoValidacion = { ok: true; nombre: string; dias: DiaRutina[] } | { ok: false; error: string };

const GRUPOS = new Set<string>(GRUPOS_MUSCULARES);

const esEntero = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v);
// El RIR admite medios (0,5 / 1,5): ya hay rutinas del coach cargadas con 0,5.
const esMedio = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v) && Number.isInteger(v * 2);
const entre = (v: number, { min, max }: { min: number; max: number }) => v >= min && v <= max;

const falla = (error: string): ResultadoValidacion => ({ ok: false, error });

/**
 * `nombresPorId` es opcional y solo sirve para que el mensaje diga qué ejercicio está mal.
 * Los datos pueden venir de un POST cualquiera: se revisa el tipo de todo, no solo los rangos.
 */
export function validarRutina(nombre: unknown, dias: unknown, nombresPorId: Readonly<Record<number, string>> = {}): ResultadoValidacion {
  const nombreLimpio = typeof nombre === "string" ? nombre.trim().replace(/\s+/g, " ") : "";
  if (!nombreLimpio) return falla("Ponele un nombre a tu rutina.");
  if (nombreLimpio.length > LIMITES_RUTINA.nombreMax) {
    return falla(`El nombre es muy largo (máximo ${LIMITES_RUTINA.nombreMax} letras).`);
  }
  if (!Array.isArray(dias) || dias.length < 1 || dias.length > LIMITES_RUTINA.diasMax) {
    return falla(`Tiene que tener entre 1 y ${LIMITES_RUTINA.diasMax} días.`);
  }

  const resultado: DiaRutina[] = [];
  for (let i = 0; i < dias.length; i++) {
    const letra = String.fromCharCode(65 + i);
    const dia = (dias[i] ?? {}) as { gruposMusculares?: unknown; ejercicios?: unknown };

    const gruposCrudos = Array.isArray(dia.gruposMusculares) ? dia.gruposMusculares : [];
    if (gruposCrudos.length === 0) return falla(`Marcá al menos un grupo muscular en el día ${letra}.`);
    if (gruposCrudos.some((g) => typeof g !== "string" || !GRUPOS.has(g))) {
      return falla(`Hay un grupo muscular que no existe en el día ${letra}.`);
    }
    const grupos = [...new Set(gruposCrudos as string[])];

    const ejerciciosCrudos = Array.isArray(dia.ejercicios) ? dia.ejercicios : [];
    if (ejerciciosCrudos.length === 0) return falla(`Agregá al menos un ejercicio en el día ${letra}.`);
    if (ejerciciosCrudos.length > LIMITES_RUTINA.ejerciciosPorDiaMax) {
      return falla(`Un día puede tener hasta ${LIMITES_RUTINA.ejerciciosPorDiaMax} ejercicios (día ${letra}).`);
    }

    const vistos = new Set<number>();
    const ejercicios: EjercicioRutina[] = [];
    for (const crudo of ejerciciosCrudos) {
      const e = (crudo ?? {}) as Partial<Record<keyof EjercicioRutina, unknown>>;
      if (!esEntero(e.exerciseDefinitionId) || e.exerciseDefinitionId <= 0) {
        return falla(`Hay un ejercicio inválido en el día ${letra}.`);
      }
      const id = e.exerciseDefinitionId;
      const nombreEj = nombresPorId[id];
      const donde = nombreEj ? `Día ${letra}, «${nombreEj}»` : `Día ${letra}`;

      // El historial se indexa por ejercicio y día (lib/clave-ejercicio-dia.ts): repetirlo en el mismo día
      // mezclaría los registros de las dos tarjetas.
      if (vistos.has(id)) return falla(`${donde}: está repetido. Dejalo una sola vez por día y subí las series si querés más volumen.`);
      vistos.add(id);

      if (!esEntero(e.series) || !entre(e.series, LIMITES_RUTINA.series)) {
        return falla(`${donde}: las series tienen que ser entre ${LIMITES_RUTINA.series.min} y ${LIMITES_RUTINA.series.max}.`);
      }
      if (!esEntero(e.repsMin) || !esEntero(e.repsMax) || !entre(e.repsMin, LIMITES_RUTINA.reps) || !entre(e.repsMax, LIMITES_RUTINA.reps)) {
        return falla(`${donde}: las repeticiones tienen que ser entre ${LIMITES_RUTINA.reps.min} y ${LIMITES_RUTINA.reps.max}.`);
      }
      if (e.repsMin > e.repsMax) return falla(`${donde}: las repeticiones mínimas no pueden ser más que las máximas.`);
      if (!esMedio(e.rirObjetivo) || !entre(e.rirObjetivo, LIMITES_RUTINA.rir)) {
        return falla(`${donde}: el RIR tiene que estar entre ${LIMITES_RUTINA.rir.min} y ${LIMITES_RUTINA.rir.max}.`);
      }
      ejercicios.push({ exerciseDefinitionId: id, series: e.series, repsMin: e.repsMin, repsMax: e.repsMax, rirObjetivo: e.rirObjetivo });
    }
    resultado.push({ gruposMusculares: grupos, ejercicios });
  }
  return { ok: true, nombre: nombreLimpio, dias: resultado };
}

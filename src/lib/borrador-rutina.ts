// Borrador de "Crea tu rutina" guardado en el teléfono (localStorage). Lo que se lee de ahí puede ser de una versión
// anterior de la app: con ejercicios fusionados o que ya no existen, números fuera de rango o formas viejas. Antes de
// usarlo se sanea contra el catálogo de hoy, así nunca llega al servidor un id que la base rechazaría.
import { GRUPOS_MUSCULARES, type GrupoMuscular } from "./grupos-musculares";
import { idVigente } from "./ejercicios-fusionados";
import { LIMITES_RUTINA } from "./validar-rutina";
import type { TipoEsfuerzo } from "./descanso";

export type EjercicioCatalogo = {
  id: number;
  nombre: string;
  imagen_url: string | null;
  tipo_esfuerzo: TipoEsfuerzo;
  grupos_musculares: string[] | null;
};

export type EjercicioDia = {
  exerciseDefinitionId: number;
  nombre: string;
  tipoEsfuerzo: TipoEsfuerzo;
  series: number;
  repsMin: number;
  repsMax: number;
  rirObjetivo: number;
  gruposMusculares: string[];
};

export type DiaWizard = {
  gruposMusculares: GrupoMuscular[];
  ejercicios: EjercicioDia[];
};

export type Borrador = {
  paso: "dias" | "resumen";
  dias: DiaWizard[];
  diaActivo: number;
  nombreRutina: string;
};

export const VALORES_INICIALES = { series: 3, repsMin: 8, repsMax: 12, rirObjetivo: 2 } as const;

const GRUPOS = new Set<string>(GRUPOS_MUSCULARES);

function entero(v: unknown, { min, max }: { min: number; max: number }, porDefecto: number): number {
  return typeof v === "number" && Number.isInteger(v) && v >= min && v <= max ? v : porDefecto;
}

function rir(v: unknown): number {
  const { min, max } = LIMITES_RUTINA.rir;
  return typeof v === "number" && Number.isFinite(v) && Number.isInteger(v * 2) && v >= min && v <= max ? v : VALORES_INICIALES.rirObjetivo;
}

export function ejercicioNuevo(ex: EjercicioCatalogo): EjercicioDia {
  return {
    exerciseDefinitionId: ex.id,
    nombre: ex.nombre,
    tipoEsfuerzo: ex.tipo_esfuerzo,
    series: VALORES_INICIALES.series,
    repsMin: VALORES_INICIALES.repsMin,
    repsMax: VALORES_INICIALES.repsMax,
    rirObjetivo: VALORES_INICIALES.rirObjetivo,
    gruposMusculares: ex.grupos_musculares ?? [],
  };
}

const diaCompleto = (d: DiaWizard) => d.gruposMusculares.length > 0 && d.ejercicios.length > 0;

/** Devuelve el borrador limpio o null si no hay nada rescatable. Nombre, tipo y grupos salen del catálogo actual. */
export function sanearBorrador(crudo: unknown, catalogo: readonly EjercicioCatalogo[]): Borrador | null {
  const datos = crudo as { paso?: unknown; dias?: unknown; diaActivo?: unknown; nombreRutina?: unknown } | null;
  if (!datos || !Array.isArray(datos.dias) || datos.dias.length < 1 || datos.dias.length > LIMITES_RUTINA.diasMax) return null;

  const porId = new Map(catalogo.map((ex) => [ex.id, ex]));

  const dias: DiaWizard[] = datos.dias.map((d: unknown) => {
    const dia = (d ?? {}) as { gruposMusculares?: unknown; ejercicios?: unknown };
    const grupos = Array.isArray(dia.gruposMusculares)
      ? ([...new Set(dia.gruposMusculares.filter((g): g is string => typeof g === "string" && GRUPOS.has(g)))] as GrupoMuscular[])
      : [];
    const vistos = new Set<number>();
    const ejercicios: EjercicioDia[] = [];
    for (const crudoEj of Array.isArray(dia.ejercicios) ? dia.ejercicios : []) {
      const e = (crudoEj ?? {}) as Partial<Record<keyof EjercicioDia, unknown>>;
      if (typeof e.exerciseDefinitionId !== "number" || !Number.isInteger(e.exerciseDefinitionId)) continue;
      // El id tal cual si todavía existe; si no (ejercicio fusionado), el vigente.
      const ex = porId.get(e.exerciseDefinitionId) ?? porId.get(idVigente(e.exerciseDefinitionId));
      if (!ex || vistos.has(ex.id)) continue;
      vistos.add(ex.id);
      const repsMin = entero(e.repsMin, LIMITES_RUTINA.reps, VALORES_INICIALES.repsMin);
      const repsMax = entero(e.repsMax, LIMITES_RUTINA.reps, VALORES_INICIALES.repsMax);
      ejercicios.push({
        ...ejercicioNuevo(ex),
        series: entero(e.series, LIMITES_RUTINA.series, VALORES_INICIALES.series),
        repsMin,
        repsMax: Math.max(repsMin, repsMax),
        rirObjetivo: rir(e.rirObjetivo),
      });
    }
    return { gruposMusculares: grupos, ejercicios: ejercicios.slice(0, LIMITES_RUTINA.ejerciciosPorDiaMax) };
  });

  const diaActivo = typeof datos.diaActivo === "number" && Number.isInteger(datos.diaActivo) ? Math.min(Math.max(datos.diaActivo, 0), dias.length - 1) : 0;
  return {
    paso: datos.paso === "resumen" && dias.every(diaCompleto) ? "resumen" : "dias",
    dias,
    diaActivo,
    nombreRutina: typeof datos.nombreRutina === "string" ? datos.nombreRutina.slice(0, LIMITES_RUTINA.nombreMax) : "",
  };
}

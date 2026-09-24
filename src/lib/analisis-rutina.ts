import type { SupabaseClient } from "@supabase/supabase-js";
import {
  calcularPentagono,
  calcularVolumenPorGrupo,
  calcularFrecuenciaPorGrupo,
  calcularRecuperacionPorGrupo,
  calcularIntensidadPorDia,
  calcularSostenibilidadPorDia,
  type DiaBorrador,
  type PentagonoScores,
} from "@/lib/pentagono";
import { parsearSeriesReps } from "@/lib/parsear-series-reps";
import type { TipoEsfuerzo } from "@/lib/descanso";

type FilaRutina = {
  dia: string;
  series_reps: string | null;
  exercise_definitions:
    | { grupos_musculares: string[] | null; tipo_esfuerzo: TipoEsfuerzo }
    | { grupos_musculares: string[] | null; tipo_esfuerzo: TipoEsfuerzo }[]
    | null;
};

export type AnalisisRutina = {
  pentagono: PentagonoScores;
  volumenPorGrupo: { grupo: string; series: number; mev: number; mav: number; mrv: number; nucleo: boolean }[];
  frecuenciaPorGrupo: { grupo: string; vecesPorSemana: number }[];
  recuperacionPorGrupo: { grupo: string; diasDescanso: number }[];
  intensidadPorDia: { dia: string; rirPromedio: number }[];
  sostenibilidadPorDia: { dia: string; minutos: number }[];
};

// Las rutinas del coach guardan series/reps/RIR como texto libre, no como
// columnas numéricas -- se parsean acá con mejor esfuerzo (ver
// parsearSeriesReps). El grupo muscular de cada ejercicio sale siempre del
// catálogo real, nunca del texto, así que ese dato es exacto sin importar
// qué tan prolijo esté cargado el series_reps.
export async function calcularAnalisisRutina(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  routineId: number
): Promise<AnalisisRutina> {
  const { data: filas } = await supabase
    .from("routine_exercises")
    .select("dia, series_reps, exercise_definitions(grupos_musculares, tipo_esfuerzo)")
    .eq("routine_id", routineId);

  const porDia = new Map<string, DiaBorrador>();
  for (const fila of (filas ?? []) as FilaRutina[]) {
    const def = Array.isArray(fila.exercise_definitions)
      ? fila.exercise_definitions[0]
      : fila.exercise_definitions;
    if (!def) continue;

    const parseado = parsearSeriesReps(fila.series_reps);
    const dia = porDia.get(fila.dia) ?? { dia: fila.dia, gruposMusculares: [], ejercicios: [] };
    dia.ejercicios.push({
      exerciseDefinitionId: 0,
      tipoEsfuerzo: def.tipo_esfuerzo,
      series: parseado.series,
      repsMin: parseado.repsMin,
      repsMax: parseado.repsMax,
      rirObjetivo: parseado.rirObjetivo,
      gruposMusculares: def.grupos_musculares ?? [],
    });
    porDia.set(fila.dia, dia);
  }

  const dias = [...porDia.values()];
  return {
    pentagono: calcularPentagono(dias),
    volumenPorGrupo: calcularVolumenPorGrupo(dias),
    frecuenciaPorGrupo: calcularFrecuenciaPorGrupo(dias),
    recuperacionPorGrupo: calcularRecuperacionPorGrupo(dias),
    intensidadPorDia: calcularIntensidadPorDia(dias),
    sostenibilidadPorDia: calcularSostenibilidadPorDia(dias),
  };
}

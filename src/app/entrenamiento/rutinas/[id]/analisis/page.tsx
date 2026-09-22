import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/back-link";
import { PentagonoChart } from "@/components/pentagono-chart";
import { calcularPentagono, calcularVolumenPorGrupo, type DiaBorrador } from "@/lib/pentagono";
import { parsearSeriesReps } from "@/lib/parsear-series-reps";
import { esPremium } from "@/lib/premium";
import type { TipoEsfuerzo } from "@/lib/descanso";

type FilaRutina = {
  dia: string;
  series_reps: string | null;
  exercise_definitions: { grupos_musculares: string[] | null; tipo_esfuerzo: TipoEsfuerzo } | { grupos_musculares: string[] | null; tipo_esfuerzo: TipoEsfuerzo }[] | null;
};

export default async function AnalisisRutinaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const routineId = Number(id);

  if (!Number.isInteger(routineId)) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: routine }, { data: acceso }, { data: filas }] = await Promise.all([
    supabase.from("profiles").select("premium_hasta, golden_perpetuo").eq("id", user.id).single(),
    supabase.from("routines").select("id, nombre").eq("id", routineId).maybeSingle(),
    supabase
      .from("profile_routine_access")
      .select("routine_id")
      .eq("user_id", user.id)
      .eq("routine_id", routineId)
      .maybeSingle(),
    supabase
      .from("routine_exercises")
      .select("dia, series_reps, exercise_definitions(grupos_musculares, tipo_esfuerzo)")
      .eq("routine_id", routineId),
  ]);

  if (!routine) {
    notFound();
  }

  const desbloqueada = esPremium(profile) || Boolean(acceso);
  if (!desbloqueada) {
    redirect("/entrenamiento/rutinas");
  }

  // Esta rutina no vino de "Crea tu rutina" -- series/reps/RIR están
  // guardados como texto libre ("3 x 10-12 (RIR 0-1)"), no como columnas
  // numéricas, así que se parsean acá mismo (mejor esfuerzo, con
  // defaults razonables si el texto no se puede leer -- ver
  // src/lib/parsear-series-reps.ts). El grupo muscular de cada ejercicio
  // sale del catálogo real, no de texto, así que ese dato siempre es exacto.
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
  const pentagono = calcularPentagono(dias);
  const volumenPorGrupo = calcularVolumenPorGrupo(dias);

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="relative mb-2 flex items-center justify-center">
          <BackLink href={`/entrenamiento/rutinas/${routine.id}`} />
          <h1 className="text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
            ANÁLISIS
          </h1>
        </div>
        <p className="mb-6 text-center text-sm text-gray-500">{routine.nombre}</p>

        <p className="mb-4 text-center text-xs text-gray-500">
          Series, reps y RIR de esta rutina son estimados a partir de cómo está cargada -- puede no
          ser 100% exacto. El grupo muscular de cada ejercicio sí es siempre el real.
        </p>

        <div>
          <p className="mb-2 text-center text-sm text-gray-400">Cómo se compara esta rutina</p>
          <div className="rounded-md border border-border bg-bg-card p-3">
            <PentagonoChart scores={pentagono} />
          </div>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-sm text-gray-400">Series por semana, por grupo muscular</p>
          <div className="flex flex-col gap-1 rounded-md border border-border bg-bg-card p-3">
            {volumenPorGrupo.map(({ grupo, series }) => (
              <div key={grupo} className="flex justify-between text-sm">
                <span className="text-gray-300">{grupo}</span>
                <span className="text-white">{Number.isInteger(series) ? series : series.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

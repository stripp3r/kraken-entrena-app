import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EntrenamientoDiaCliente } from "@/components/entrenamiento-dia-cliente";
import { BackLink } from "@/components/back-link";
import { hoyISO, inicioDelDiaArgentinaUTC } from "@/lib/fecha";

const DIAS_VALIDOS = ["A", "B", "C", "D", "E", "F", "G"];

export default async function DiaEntrenamientoPage({
  params,
}: {
  params: Promise<{ dia: string }>;
}) {
  const { dia: diaParam } = await params;
  const dia = diaParam.toUpperCase();

  if (!DIAS_VALIDOS.includes(dia)) {
    notFound();
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("routine_id, sexo")
    .eq("id", user.id)
    .single();

  if (!profile?.routine_id) {
    redirect("/entrenamiento");
  }

  const hoyInicio = inicioDelDiaArgentinaUTC();

  const [{ data: routineExercises }, { data: finalizacion }] = await Promise.all([
    supabase
      .from("routine_exercises")
      .select(
        "orden, exercise_definition_id, series_reps, exercise_definitions(nombre, video_url, video_url_fem, imagen_url, como_hacerlo, alternativa_id, unilateral, tipo_esfuerzo)"
      )
      .eq("dia", dia)
      .eq("routine_id", profile.routine_id)
      .order("orden", { ascending: true }),
    supabase
      .from("entrenamientos_finalizados")
      .select("id")
      .eq("user_id", user.id)
      .eq("dia", dia)
      .eq("fecha", hoyISO())
      .maybeSingle(),
  ]);

  // "id" de acá en más es el exercise_definition_id (canónico) -- es lo que
  // identifica al ejercicio en workout_logs, no la fila de scheduling.
  const exercises = (routineExercises ?? [])
    .filter((re) => re.exercise_definition_id !== null)
    .map((re) => {
      const def = Array.isArray(re.exercise_definitions)
        ? re.exercise_definitions[0]
        : re.exercise_definitions;
      const videoUrl =
        profile.sexo === "femenino" ? def?.video_url_fem ?? def?.video_url ?? null : def?.video_url ?? null;
      return {
        id: re.exercise_definition_id as number,
        nombre: def?.nombre ?? "",
        video_url: videoUrl,
        imagen_url: def?.imagen_url ?? null,
        como_hacerlo: def?.como_hacerlo ?? null,
        series_reps: re.series_reps ?? null,
        alternativa_id: def?.alternativa_id ?? null,
        unilateral: def?.unilateral ?? false,
        tipo_esfuerzo: def?.tipo_esfuerzo ?? "compuesto",
      };
    });

  const exerciseIds = exercises.map((e) => e.id);

  const alternativaIds = [
    ...new Set(exercises.map((e) => e.alternativa_id).filter((id): id is number => id !== null)),
  ];

  const [{ data: alternativas }, { data: logsHoy }] = await Promise.all([
    alternativaIds.length
      ? supabase
          .from("exercise_definitions")
          .select("id, nombre, imagen_url, como_hacerlo")
          .in("id", alternativaIds)
      : Promise.resolve({
          data: [] as { id: number; nombre: string; imagen_url: string | null; como_hacerlo: string | null }[],
        }),
    exerciseIds.length
      ? supabase
          .from("workout_logs")
          .select("id, exercise_definition_id, peso, reps, rir, lado, created_at")
          .eq("user_id", user.id)
          .in("exercise_definition_id", exerciseIds)
          .gte("created_at", hoyInicio.toISOString())
          .order("created_at", { ascending: true })
      : Promise.resolve({
          data: [] as {
            id: number;
            exercise_definition_id: number;
            peso: number | null;
            reps: number | null;
            rir: number | null;
            lado: "derecho" | "izquierdo" | null;
            created_at: string;
          }[],
        }),
  ]);

  const alternativaPorId = new Map((alternativas ?? []).map((a) => [a.id, a]));

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="relative mb-8">
          <BackLink href="/entrenamiento/dias" />
          <h1 className="text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
            DÍA {dia}
          </h1>
        </div>

        {!exercises || exercises.length === 0 ? (
          <p className="text-center text-sm text-gray-500">
            Todavía no hay ejercicios cargados para este día.
          </p>
        ) : (
          <EntrenamientoDiaCliente
            dia={dia}
            routineId={profile.routine_id}
            finalizadoHoy={Boolean(finalizacion)}
            exercises={exercises.map((ex) => ({
              id: ex.id,
              nombre: ex.nombre,
              imagen_url: ex.imagen_url,
              video_url: ex.video_url,
              como_hacerlo: ex.como_hacerlo,
              series_reps: ex.series_reps,
              alternativa: ex.alternativa_id ? alternativaPorId.get(ex.alternativa_id) ?? null : null,
              unilateral: ex.unilateral,
              tipoEsfuerzo: ex.tipo_esfuerzo as "compuesto" | "aislado",
            }))}
            logsPorEjercicio={Object.fromEntries(
              exercises.map((ex) => [
                ex.id,
                (logsHoy ?? []).filter((l) => l.exercise_definition_id === ex.id),
              ])
            )}
          />
        )}
      </div>
    </main>
  );
}

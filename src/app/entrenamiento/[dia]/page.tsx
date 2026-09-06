import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ExerciseCard } from "@/components/exercise-card";

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
    .select("routine_id")
    .eq("id", user.id)
    .single();

  if (!profile?.routine_id) {
    redirect("/perfil?error=" + encodeURIComponent("Elegí tu rutina para poder entrenar."));
  }

  const { data: exercises } = await supabase
    .from("exercises")
    .select(
      "id, nombre, video_url, imagen_url, como_hacerlo, orden, alternativa:exercises!alternativa_id(id, nombre, imagen_url, como_hacerlo)"
    )
    .eq("dia", dia)
    .eq("routine_id", profile.routine_id)
    .order("orden", { ascending: true });

  const exerciseIds = exercises?.map((e) => e.id) ?? [];

  const hoyInicio = new Date();
  hoyInicio.setHours(0, 0, 0, 0);

  const { data: logsHoy } = exerciseIds.length
    ? await supabase
        .from("workout_logs")
        .select("id, exercise_id, peso, reps, rir, created_at")
        .eq("user_id", user.id)
        .in("exercise_id", exerciseIds)
        .gte("created_at", hoyInicio.toISOString())
        .order("created_at", { ascending: true })
    : { data: [] as { id: number; exercise_id: number; peso: number | null; reps: number | null; rir: number | null; created_at: string }[] };

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
          DÍA {dia}
        </h1>
        <Link
          href="/entrenamiento"
          className="mb-8 block text-center text-sm text-gray-500 underline"
        >
          Cambiar de día
        </Link>

        {!exercises || exercises.length === 0 ? (
          <p className="text-center text-sm text-gray-500">
            Todavía no hay ejercicios cargados para este día.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {exercises.map((ex) => {
              const logsDeHoy = (logsHoy ?? []).filter((l) => l.exercise_id === ex.id);
              const alternativa = Array.isArray(ex.alternativa)
                ? ex.alternativa[0]
                : ex.alternativa;

              return (
                <ExerciseCard
                  key={ex.id}
                  exercise={{
                    id: ex.id,
                    nombre: ex.nombre,
                    imagen_url: ex.imagen_url,
                    video_url: ex.video_url,
                    como_hacerlo: ex.como_hacerlo,
                    alternativa: alternativa ?? null,
                  }}
                  logsDeHoy={logsDeHoy}
                />
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

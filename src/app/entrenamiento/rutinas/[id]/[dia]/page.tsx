import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/back-link";
import { ExerciseCard } from "@/components/exercise-card";
import { CambiarAEstaRutinaBoton } from "@/components/cambiar-a-esta-rutina-boton";
import { esPremium } from "@/lib/premium";

const DIAS_VALIDOS = ["A", "B", "C", "D", "E", "F", "G"];

export default async function RutinaPreviewDiaPage({
  params,
}: {
  params: Promise<{ id: string; dia: string }>;
}) {
  const { id, dia: diaParam } = await params;
  const routineId = Number(id);
  const dia = diaParam.toUpperCase();

  if (!Number.isInteger(routineId) || !DIAS_VALIDOS.includes(dia)) {
    notFound();
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: routine }, { data: acceso }] = await Promise.all([
    supabase
      .from("profiles")
      .select("routine_id, sexo, premium_hasta, golden_perpetuo")
      .eq("id", user.id)
      .single(),
    supabase.from("routines").select("id, nombre").eq("id", routineId).maybeSingle(),
    supabase
      .from("profile_routine_access")
      .select("routine_id")
      .eq("user_id", user.id)
      .eq("routine_id", routineId)
      .maybeSingle(),
  ]);

  if (!routine) {
    notFound();
  }

  const desbloqueada = esPremium(profile) || Boolean(acceso);
  if (!desbloqueada) {
    redirect("/entrenamiento/rutinas");
  }

  const { data: routineExercises } = await supabase
    .from("routine_exercises")
    .select(
      "orden, series_reps, exercise_definitions(nombre, video_url, video_url_fem, imagen_url, como_hacerlo)"
    )
    .eq("dia", dia)
    .eq("routine_id", routineId)
    .order("orden", { ascending: true });

  const exercises = (routineExercises ?? []).map((re, i) => {
    const def = Array.isArray(re.exercise_definitions)
      ? re.exercise_definitions[0]
      : re.exercise_definitions;
    const videoUrl =
      profile?.sexo === "femenino" ? def?.video_url_fem ?? def?.video_url ?? null : def?.video_url ?? null;
    return {
      id: i,
      nombre: def?.nombre ?? "",
      imagen_url: def?.imagen_url ?? null,
      video_url: videoUrl,
      como_hacerlo: def?.como_hacerlo ?? null,
      series_reps: re.series_reps ?? null,
      alternativa: null,
    };
  });

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="relative mb-6 flex items-center justify-center">
          <BackLink href={`/entrenamiento/rutinas/${routineId}`} />
          <h1 className="text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
            DÍA {dia}
          </h1>
        </div>

        {exercises.length === 0 ? (
          <p className="text-center text-sm text-gray-500">
            Todavía no hay ejercicios cargados para este día.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {exercises.map((ex) => (
              <ExerciseCard key={ex.id} exercise={ex} dia={dia} logsDeHoy={[]} compacto />
            ))}
          </div>
        )}

        <div className="mt-6">
          <CambiarAEstaRutinaBoton
            routineId={routineId}
            nombre={routine.nombre}
            esActiva={routineId === profile?.routine_id}
          />
        </div>
      </div>
    </main>
  );
}

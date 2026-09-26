import { notFound } from "next/navigation";
import { BackLink } from "@/components/back-link";
import { ExerciseCard } from "@/components/exercise-card";
import { requireCoach } from "@/lib/auth/coach";

const DIAS_VALIDOS = ["A", "B", "C", "D", "E", "F", "G"];

export default async function CoachDiaPage({
  params,
}: {
  params: Promise<{ clientId: string; dia: string }>;
}) {
  const { supabase } = await requireCoach();
  const { clientId, dia: diaParam } = await params;
  const dia = diaParam.toUpperCase();

  if (!DIAS_VALIDOS.includes(dia)) {
    notFound();
  }

  const { data: cliente } = await supabase
    .from("profiles")
    .select("nombre, sexo, routine_id")
    .eq("id", clientId)
    .eq("role", "client")
    .maybeSingle();

  if (!cliente || !cliente.routine_id) {
    notFound();
  }

  const { data: routineExercises } = await supabase
    .from("routine_exercises")
    .select(
      "orden, series_reps, exercise_definitions(nombre, video_url, video_url_fem, imagen_url, como_hacerlo)"
    )
    .eq("dia", dia)
    .eq("routine_id", cliente.routine_id)
    .order("orden", { ascending: true });

  const exercises = (routineExercises ?? []).map((re, i) => {
    const def = Array.isArray(re.exercise_definitions)
      ? re.exercise_definitions[0]
      : re.exercise_definitions;
    const videoUrl =
      cliente.sexo === "femenino"
        ? def?.video_url_fem ?? def?.video_url ?? null
        : def?.video_url ?? null;
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
        <div className="relative mb-2 flex items-center justify-center">
          <BackLink href={`/coach/${clientId}`} />
          <h1 className="text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
            DÍA {dia}
          </h1>
        </div>
        <p className="mb-6 text-center text-sm text-gray-500">
          Vista de coach — {cliente.nombre} (solo lectura)
        </p>

        {exercises.length === 0 ? (
          <p className="text-center text-sm text-gray-500">
            Todavía no hay ejercicios cargados para este día.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {exercises.map((ex) => (
              <ExerciseCard key={ex.id} exercise={ex} dia={dia} logsDeHoy={[]} compacto forzarInfo />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

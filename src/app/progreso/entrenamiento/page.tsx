import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProgresoAnalitica } from "@/components/progreso-analitica";
import type { SetLog } from "@/lib/analytics";

const LETRAS_DIA = ["A", "B", "C", "D", "E", "F", "G"];

export default async function ProgresoPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("routine_id, routines(dias)")
    .eq("id", user.id)
    .single();

  const routine = Array.isArray(profile?.routines) ? profile.routines[0] : profile?.routines;

  if (!profile?.routine_id || !routine) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        <h1 className="mb-3 font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
          ENTRENAMIENTO
        </h1>
        <p className="max-w-xs text-sm text-gray-500">
          Elegí tu rutina en Perfil → Datos personales para ver tu progreso.
        </p>
      </main>
    );
  }

  const dias = LETRAS_DIA.slice(0, routine.dias);

  const { data: routineExercises } = await supabase
    .from("routine_exercises")
    .select("dia, orden, exercise_definition_id, exercise_definitions(nombre)")
    .eq("routine_id", profile.routine_id)
    .order("orden", { ascending: true });

  // "id" es el exercise_definition_id (canónico): si el mismo ejercicio
  // sigue estando en la rutina activa, su historial de otras rutinas
  // anteriores se suma acá también, en vez de cortarse.
  const exercises = (routineExercises ?? [])
    .filter((re) => re.exercise_definition_id !== null)
    .map((re) => {
      const def = Array.isArray(re.exercise_definitions)
        ? re.exercise_definitions[0]
        : re.exercise_definitions;
      return { id: re.exercise_definition_id as number, nombre: def?.nombre ?? "", dia: re.dia };
    });

  const exerciseIds = exercises.map((e) => e.id);

  const { data: logs } = exerciseIds.length
    ? await supabase
        .from("workout_logs")
        .select("exercise_definition_id, peso, reps, created_at")
        .eq("user_id", user.id)
        .in("exercise_definition_id", exerciseIds)
        .order("created_at", { ascending: true })
    : {
        data: [] as {
          exercise_definition_id: number | null;
          peso: number | null;
          reps: number | null;
          created_at: string;
        }[],
      };

  const logsByExercise: Record<number, SetLog[]> = {};
  for (const ex of exercises) {
    logsByExercise[ex.id] = (logs ?? [])
      .filter((l) => l.exercise_definition_id === ex.id)
      .map((l) => ({ peso: l.peso, reps: l.reps, created_at: l.created_at }));
  }

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
          ENTRENAMIENTO
        </h1>
        <p className="mb-6 text-center text-sm text-gray-500">
          Fuerza y volumen a partir de lo que vas registrando en Entrenamiento.
        </p>

        <ProgresoAnalitica
          dias={dias}
          exercises={exercises}
          logsByExercise={logsByExercise}
        />

        <Link
          href="/progreso"
          className="mt-8 block text-center text-sm text-gray-500 underline"
        >
          Volver a Progreso
        </Link>
      </div>
    </main>
  );
}

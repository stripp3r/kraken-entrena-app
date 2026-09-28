import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProgresoAnalitica } from "@/components/progreso-analitica";
import { BackLink } from "@/components/back-link";
import type { SetLog } from "@/lib/analytics";
import { claveEjercicioDia } from "@/lib/clave-ejercicio-dia";
import { dentroDeVentanas, inicioMasAntiguo, ventanasDeRutina } from "@/lib/periodos-rutina";

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
        <div className="relative mb-3 w-full max-w-sm">
          <BackLink href="/progreso" />
          <h1 className="text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
            ENTRENAMIENTO
          </h1>
        </div>
        <p className="max-w-xs text-sm text-gray-500">
          Todavía no tenés una rutina activa. Elegila en Entrenar para ver tu progreso acá.
        </p>
      </main>
    );
  }

  const dias = LETRAS_DIA.slice(0, routine.dias);

  const { data: routineExercises } = await supabase
    .from("routine_exercises")
    .select("dia, orden, exercise_definition_id, series_reps, rir_objetivo, exercise_definitions(nombre)")
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

  // El análisis es sobre ESTA rutina activa, no sobre toda la vida del
  // ejercicio -- si el mismo ejercicio ya se usó en una rutina anterior
  // (de prueba o real), ese historial viejo no tiene que mezclarse acá.
  // "Esta rutina activa" son TODOS los períodos en los que
  // `profile.routine_id` estuvo activo, no solo el más reciente -- ver
  // src/lib/periodos-rutina.ts.
  const ventanas = await ventanasDeRutina(supabase, user.id, profile.routine_id);
  const desdeMasAntiguo = inicioMasAntiguo(ventanas);

  const { data: logsCrudos } = exerciseIds.length
    ? await (() => {
        let query = supabase
          .from("workout_logs")
          .select("exercise_definition_id, peso, reps, created_at, dia")
          .eq("user_id", user.id)
          .in("exercise_definition_id", exerciseIds)
          .order("created_at", { ascending: true });
        if (desdeMasAntiguo !== null) query = query.gte("created_at", new Date(desdeMasAntiguo).toISOString());
        return query;
      })()
    : {
        data: [] as {
          exercise_definition_id: number | null;
          peso: number | null;
          reps: number | null;
          created_at: string;
          dia: string | null;
        }[],
      };

  const logs = (logsCrudos ?? []).filter((l) => dentroDeVentanas(l.created_at, ventanas));

  // Cada día se analiza solo con sus propios sets, aunque el mismo
  // ejercicio se repita en otro día con la prescripción idéntica --
  // descansar distinto antes de cada sesión (ej. Día A con 2 días de
  // descanso previo vs. Día C con menos) hace que el rendimiento no sea
  // comparable, así que mezclar el historial taparía esa señal en vez de
  // mostrarla. Ver la nota "Independencia estricta por día" en CLAUDE.md.
  const logsByExercise: Record<string, SetLog[]> = {};
  for (const ex of exercises) {
    logsByExercise[claveEjercicioDia(ex.id, ex.dia)] = (logs ?? [])
      .filter((l) => l.exercise_definition_id === ex.id && l.dia === ex.dia)
      .map((l) => ({ peso: l.peso, reps: l.reps, created_at: l.created_at }));
  }

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="relative mb-2">
          <BackLink href="/progreso" />
          <h1 className="text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
            ENTRENAMIENTO
          </h1>
        </div>
        <p className="mb-6 text-center text-sm text-gray-500">
          Fuerza y volumen a partir de lo que vas registrando en Entrenamiento.
        </p>

        <ProgresoAnalitica
          dias={dias}
          exercises={exercises}
          logsByExercise={logsByExercise}
        />
      </div>
    </main>
  );
}

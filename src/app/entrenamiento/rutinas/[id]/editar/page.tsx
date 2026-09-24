import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/back-link";
import { CrearRutinaCliente } from "@/components/crear-rutina-cliente";
import { parsearSeriesReps } from "@/lib/parsear-series-reps";
import type { TipoEsfuerzo } from "@/lib/descanso";
import type { GrupoMuscular } from "@/lib/grupos-musculares";

const LETRAS_DIA = ["A", "B", "C", "D", "E", "F", "G"];

// Solo se pueden editar rutinas armadas por el propio usuario en "Crea tu
// rutina" -- mismo criterio (creada_por_usuario + profile_routine_access)
// que ya usan BorrarRutinaBoton y actualizarRutinaCreada. Se revalida acá
// server-side antes de mostrar nada.
export default async function EditarRutinaPage({ params }: { params: Promise<{ id: string }> }) {
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

  const [{ data: routine }, { data: acceso }] = await Promise.all([
    supabase
      .from("routines")
      .select("id, nombre, dias, creada_por_usuario")
      .eq("id", routineId)
      .maybeSingle(),
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
  if (!routine.creada_por_usuario || !acceso) {
    redirect("/entrenamiento/rutinas");
  }

  const [{ data: routineDias }, { data: routineExercises }, { data: catalogo }] = await Promise.all([
    supabase.from("routine_dias").select("dia, grupos_musculares").eq("routine_id", routineId),
    supabase
      .from("routine_exercises")
      .select(
        "dia, orden, series_reps, rir_objetivo, exercise_definitions(id, nombre, tipo_esfuerzo, grupos_musculares)"
      )
      .eq("routine_id", routineId)
      .order("orden", { ascending: true }),
    supabase
      .from("exercise_definitions")
      .select("id, nombre, imagen_url, tipo_esfuerzo, grupos_musculares")
      .order("nombre", { ascending: true }),
  ]);

  const letras = LETRAS_DIA.slice(0, routine.dias);
  const dias = letras.map((letra) => {
    const gruposMusculares = (
      (routineDias ?? []).find((d) => d.dia === letra)?.grupos_musculares ?? []
    ) as GrupoMuscular[];

    const ejercicios = (routineExercises ?? [])
      .filter((re) => re.dia === letra)
      .map((re) => {
        const def = Array.isArray(re.exercise_definitions)
          ? re.exercise_definitions[0]
          : re.exercise_definitions;
        const { series, repsMin, repsMax } = parsearSeriesReps(re.series_reps);
        return {
          exerciseDefinitionId: def?.id ?? 0,
          nombre: def?.nombre ?? "",
          tipoEsfuerzo: (def?.tipo_esfuerzo ?? "compuesto") as TipoEsfuerzo,
          series,
          repsMin,
          repsMax,
          rirObjetivo: re.rir_objetivo ?? 2,
          gruposMusculares: def?.grupos_musculares ?? [],
        };
      })
      .filter((ej) => ej.exerciseDefinitionId !== 0);

    return { gruposMusculares, ejercicios };
  });

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="relative mb-6 flex items-center justify-center">
          <BackLink href={`/entrenamiento/rutinas/${routineId}`} />
          <h1 className="text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
            EDITAR RUTINA
          </h1>
        </div>
        <CrearRutinaCliente
          catalogo={catalogo ?? []}
          rutinaExistente={{ id: routine.id, nombre: routine.nombre, dias }}
        />
      </div>
    </main>
  );
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cambiarRutinaActiva } from "@/app/entrenamiento/actions";
import type { GrupoMuscular } from "@/lib/grupos-musculares";

const LETRAS_DIA = ["A", "B", "C", "D", "E", "F", "G"];

export type EjercicioGuardar = {
  exerciseDefinitionId: number;
  series: number;
  repsMin: number;
  repsMax: number;
  rirObjetivo: number;
};

export type DiaGuardar = {
  gruposMusculares: GrupoMuscular[];
  ejercicios: EjercicioGuardar[];
};

// El usuario nunca escribe estas tablas directo (no hay policy de
// insert/update para "authenticated" en routines/routine_exercises/
// routine_dias/profile_routine_access, mismo patrón que el desbloqueo
// manual de rutinas -- ver migración 021) -- todo pasa por acá, que valida
// y arma la rutina completa con el cliente admin (service role).
export async function guardarRutinaCreada(nombre: string, dias: DiaGuardar[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tenés que iniciar sesión de nuevo." };
  }

  const nombreLimpio = nombre.trim();
  if (!nombreLimpio) {
    return { error: "Ponele un nombre a tu rutina." };
  }
  if (dias.length < 1 || dias.length > 7) {
    return { error: "Tiene que tener entre 1 y 7 días." };
  }
  if (dias.some((d) => d.gruposMusculares.length === 0)) {
    return { error: "Marcá al menos un grupo muscular en cada día." };
  }
  if (dias.some((d) => d.ejercicios.length === 0)) {
    return { error: "Agregá al menos un ejercicio en cada día." };
  }

  const admin = createAdminClient();

  const { data: routine, error: errorRoutine } = await admin
    .from("routines")
    .insert({
      nombre: nombreLimpio,
      descripcion: "Rutina armada por el usuario en \"Crea tu rutina\".",
      dias: dias.length,
      es_privada: true,
      creada_por_usuario: true,
    })
    .select("id")
    .single();

  if (errorRoutine || !routine) {
    return { error: errorRoutine?.message ?? "No se pudo crear la rutina." };
  }

  const routineId = routine.id as number;

  const filasEjercicios = dias.flatMap((dia, indiceDia) =>
    dia.ejercicios.map((ej, indiceEjercicio) => ({
      routine_id: routineId,
      dia: LETRAS_DIA[indiceDia],
      orden: indiceEjercicio + 1,
      exercise_definition_id: ej.exerciseDefinitionId,
      series_reps: `${ej.series} x ${ej.repsMin}-${ej.repsMax}`,
      rir_objetivo: ej.rirObjetivo,
    }))
  );

  const filasDias = dias.map((dia, indiceDia) => ({
    routine_id: routineId,
    dia: LETRAS_DIA[indiceDia],
    grupos_musculares: dia.gruposMusculares,
  }));

  const [{ error: errorEjercicios }, { error: errorDias }] = await Promise.all([
    admin.from("routine_exercises").insert(filasEjercicios),
    admin.from("routine_dias").insert(filasDias),
  ]);

  if (errorEjercicios || errorDias) {
    // Deja la rutina a medio armar en vez de dejar un cascade a mano acá --
    // se puede limpiar con "delete from routines where id = ..." si hace
    // falta (el on delete cascade de routine_exercises/routine_dias se
    // encarga del resto).
    return { error: errorEjercicios?.message ?? errorDias?.message ?? "No se pudo guardar." };
  }

  const { error: errorAcceso } = await admin
    .from("profile_routine_access")
    .insert({ user_id: user.id, routine_id: routineId });

  if (errorAcceso) {
    return { error: errorAcceso.message };
  }

  // Reutiliza el mismo flujo que "Cambiar rutina activa" (cierra el stint
  // vigente en profile_routine_history y abre uno nuevo) en vez de tocar
  // profiles.routine_id directo -- así Progreso > Historial también refleja
  // esta rutina como cualquier otra.
  const resultadoActivar = await cambiarRutinaActiva(routineId);
  if (resultadoActivar.error) {
    return { error: resultadoActivar.error };
  }

  return { ok: true, routineId };
}

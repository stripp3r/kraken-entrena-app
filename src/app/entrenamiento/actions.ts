"use server";

import { createClient } from "@/lib/supabase/server";
import { hoyISO } from "@/lib/fecha";

export type SetInput = {
  peso: number | null;
  reps: number | null;
  rir: number | null;
  lado?: "derecho" | "izquierdo" | null;
};

export async function registrarSets(exerciseId: number, sets: SetInput[]) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tenés que iniciar sesión de nuevo." };
  }

  const filas = sets
    .filter((s) => s.peso !== null || s.reps !== null || s.rir !== null)
    .map((s) => ({
      user_id: user.id,
      exercise_id: exerciseId,
      peso: s.peso,
      reps: s.reps,
      rir: s.rir,
      lado: s.lado ?? null,
    }));

  if (filas.length === 0) {
    return { error: "Cargá al menos un dato en algún set." };
  }

  const { error } = await supabase.from("workout_logs").insert(filas);

  if (error) {
    return { error: error.message };
  }

  return { ok: true };
}

export async function editarSet(logId: number, set: SetInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tenés que iniciar sesión de nuevo." };
  }

  const { error } = await supabase
    .from("workout_logs")
    .update({ peso: set.peso, reps: set.reps, rir: set.rir })
    .eq("id", logId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { ok: true };
}

export async function finalizarEntrenamientoDia(dia: string, routineId: number | null) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tenés que iniciar sesión de nuevo." };
  }

  const { error } = await supabase.from("entrenamientos_finalizados").upsert(
    {
      user_id: user.id,
      routine_id: routineId,
      dia,
      fecha: hoyISO(),
    },
    { onConflict: "user_id,dia,fecha" }
  );

  if (error) {
    return { error: error.message };
  }

  return { ok: true };
}

export async function borrarSet(logId: number) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tenés que iniciar sesión de nuevo." };
  }

  const { error } = await supabase
    .from("workout_logs")
    .delete()
    .eq("id", logId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { ok: true };
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { hoyISO } from "@/lib/fecha";
import { esPremium } from "@/lib/premium";

export type SetInput = {
  peso: number | null;
  reps: number | null;
  rir: number | null;
  lado?: "derecho" | "izquierdo" | null;
};

export async function registrarSets(exerciseDefinitionId: number, sets: SetInput[]) {
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
      exercise_definition_id: exerciseDefinitionId,
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

// Separado de guardarPerfil (perfil/datos/actions.ts) a propósito: cambiar de
// rutina activa deja un registro en profile_routine_history (para el
// Historial en Progreso), algo que no debe pasar cada vez que el usuario
// solo edita nombre/edad/etc. Vive acá porque conceptualmente es una acción
// de Entrenamiento, no de Perfil.
export async function cambiarRutinaActiva(routineId: number) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tenés que iniciar sesión de nuevo." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("routine_id, premium_hasta, golden_perpetuo")
    .eq("id", user.id)
    .single();

  if (profile?.routine_id === routineId) {
    return { ok: true };
  }

  const { data: rutina } = await supabase
    .from("routines")
    .select("es_privada")
    .eq("id", routineId)
    .maybeSingle();

  if (!rutina) {
    return { error: "Esa rutina no existe." };
  }

  // Las rutinas privadas (armadas a medida para una sola cuenta) siempre
  // necesitan acceso explícito, sin importar si el usuario es premium --
  // si no, cualquier cuenta Golden podría "adivinar" el id y cambiarse a
  // una rutina que no le pertenece.
  if (rutina.es_privada || !esPremium(profile)) {
    const { data: acceso } = await supabase
      .from("profile_routine_access")
      .select("routine_id")
      .eq("user_id", user.id)
      .eq("routine_id", routineId)
      .maybeSingle();

    if (!acceso) {
      return { error: "Todavía no tenés esa rutina desbloqueada." };
    }
  }

  const hoy = hoyISO();

  const { error: cierreError } = await supabase
    .from("profile_routine_history")
    .update({ fecha_fin: hoy })
    .eq("user_id", user.id)
    .is("fecha_fin", null);

  if (cierreError) {
    return { error: cierreError.message };
  }

  const { error: aperturaError } = await supabase
    .from("profile_routine_history")
    .insert({ user_id: user.id, routine_id: routineId, fecha_inicio: hoy });

  if (aperturaError) {
    return { error: aperturaError.message };
  }

  const { error: perfilError } = await supabase
    .from("profiles")
    .update({ routine_id: routineId, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (perfilError) {
    return { error: perfilError.message };
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

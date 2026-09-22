"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Solo se pueden borrar rutinas armadas por el propio usuario en "Crea tu
// rutina" (routines.creada_por_usuario) -- las públicas (Full Body, Kraken
// Split, Torso-Pierna, etc.) y las de un plan comprado quedan fijas, sin
// botón de borrar en la UI. Acá se revalida el mismo criterio server-side
// (nunca confiar solo en que la UI no muestre el botón).
export async function borrarRutinaCreada(routineId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tenés que iniciar sesión de nuevo." };
  }

  const [{ data: rutina }, { data: acceso }, { data: profile }] = await Promise.all([
    supabase.from("routines").select("id, creada_por_usuario").eq("id", routineId).maybeSingle(),
    supabase
      .from("profile_routine_access")
      .select("routine_id")
      .eq("user_id", user.id)
      .eq("routine_id", routineId)
      .maybeSingle(),
    supabase.from("profiles").select("routine_id").eq("id", user.id).single(),
  ]);

  if (!rutina || !rutina.creada_por_usuario) {
    return { error: "Esta rutina no se puede borrar." };
  }
  if (!acceso) {
    return { error: "Esta rutina no te pertenece." };
  }
  if (profile?.routine_id === routineId) {
    return { error: "No podés borrar tu rutina activa -- cambiate a otra primero." };
  }

  // El usuario nunca borra la tabla routines directo (no hay policy de
  // delete para "authenticated", mismo patrón que el resto de las
  // escrituras privilegiadas de esta app) -- el admin client ya validó
  // arriba que es dueño de una rutina propia y borrable.
  const admin = createAdminClient();
  const { error } = await admin.from("routines").delete().eq("id", routineId);

  if (error) {
    return { error: error.message };
  }

  return { ok: true };
}

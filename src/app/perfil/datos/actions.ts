"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hoyISO } from "@/lib/fecha";

export async function guardarPerfil(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const edadRaw = formData.get("edad") as string;

  const { error } = await supabase
    .from("profiles")
    .update({
      nombre: formData.get("nombre") as string,
      apellido: formData.get("apellido") as string,
      sexo: formData.get("sexo") as string,
      edad: edadRaw ? Number(edadRaw) : null,
      objetivo: formData.get("objetivo") as string,
      actividad_fisica: formData.get("actividad_fisica") as string,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    redirect(`/perfil/datos?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  redirect("/");
}

// Separado de guardarPerfil a propósito: cambiar de rutina activa deja un
// registro en profile_routine_history (para el Historial en Progreso), algo
// que no debe pasar cada vez que el usuario solo edita nombre/edad/etc.
export async function cambiarRutinaActiva(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const routineId = Number(formData.get("routine_id"));

  if (!routineId) {
    redirect(`/perfil/datos?error=${encodeURIComponent("Elegí una rutina.")}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("routine_id")
    .eq("id", user.id)
    .single();

  if (profile?.routine_id === routineId) {
    redirect("/perfil/datos");
  }

  const hoy = hoyISO();

  const { error: cierreError } = await supabase
    .from("profile_routine_history")
    .update({ fecha_fin: hoy })
    .eq("user_id", user.id)
    .is("fecha_fin", null);

  if (cierreError) {
    redirect(`/perfil/datos?error=${encodeURIComponent(cierreError.message)}`);
  }

  const { error: aperturaError } = await supabase
    .from("profile_routine_history")
    .insert({ user_id: user.id, routine_id: routineId, fecha_inicio: hoy });

  if (aperturaError) {
    redirect(`/perfil/datos?error=${encodeURIComponent(aperturaError.message)}`);
  }

  const { error: perfilError } = await supabase
    .from("profiles")
    .update({ routine_id: routineId, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (perfilError) {
    redirect(`/perfil/datos?error=${encodeURIComponent(perfilError.message)}`);
  }

  revalidatePath("/");
  revalidatePath("/perfil/datos");
  redirect("/perfil/datos");
}

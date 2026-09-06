"use server";

import { createClient } from "@/lib/supabase/server";

export type MedicionInput = {
  fecha: string;
  peso: number | null;
  altura: number | null;
  cuello: number | null;
  hombros: number | null;
  pecho: number | null;
  brazo: number | null;
  cintura: number | null;
  caderas: number | null;
  muslos: number | null;
};

export async function guardarMedicion(medicion: MedicionInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tenés que iniciar sesión de nuevo." };
  }

  const { error } = await supabase
    .from("body_measurements")
    .insert({ user_id: user.id, ...medicion });

  if (error) {
    return { error: error.message };
  }

  return { ok: true };
}

export async function editarMedicion(id: number, medicion: MedicionInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tenés que iniciar sesión de nuevo." };
  }

  const { error } = await supabase
    .from("body_measurements")
    .update(medicion)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { ok: true };
}

export async function borrarMedicion(id: number) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tenés que iniciar sesión de nuevo." };
  }

  const { error } = await supabase
    .from("body_measurements")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { ok: true };
}

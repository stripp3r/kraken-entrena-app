"use server";

import { createClient } from "@/lib/supabase/server";
import { estimarCalorias } from "@/lib/cardio";

async function pesoActual(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase
    .from("body_measurements")
    .select("peso")
    .eq("user_id", userId)
    .not("peso", "is", null)
    .order("fecha", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data?.peso as number | null) ?? null;
}

export async function registrarCardio(input: {
  fecha: string;
  actividad: string;
  duracionMin: number;
  distanciaKm: number | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tenés que iniciar sesión de nuevo." };
  }

  if (!input.actividad || !(input.duracionMin > 0)) {
    return { error: "Elegí una actividad y cargá los minutos." };
  }

  const peso = await pesoActual(supabase, user.id);
  const calorias = estimarCalorias(input.actividad, peso, input.duracionMin);

  const { error } = await supabase.from("cardio_logs").insert({
    user_id: user.id,
    fecha: input.fecha,
    actividad: input.actividad,
    duracion_min: input.duracionMin,
    distancia_km: input.distanciaKm,
    calorias_estimadas: calorias,
  });

  if (error) {
    return { error: error.message };
  }

  return { ok: true };
}

export async function borrarCardio(id: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tenés que iniciar sesión de nuevo." };
  }

  const { error } = await supabase
    .from("cardio_logs")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { ok: true };
}

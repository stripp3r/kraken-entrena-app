"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const COLUMNAS = {
  calculadora: "disclaimer_calculadora_aceptado_at",
  guia: "disclaimer_guia_aceptado_at",
} as const;

export async function aceptarDisclaimerAlimentacion(campo: keyof typeof COLUMNAS) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await supabase
    .from("profiles")
    .update({ [COLUMNAS[campo]]: new Date().toISOString() })
    .eq("id", user.id);

  revalidatePath(`/alimentacion/${campo}`);
}

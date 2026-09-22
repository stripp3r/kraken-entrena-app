"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

// La guía es un PDF cargado a mano por el coach para esta cuenta puntual
// (tabla `guias_alimenticias`, ver migración 050) -- no hay entitlement por
// compra acá, es directamente 1 fila por usuario si el coach ya se la cargó.
export async function obtenerLinkDescargaGuia() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado" };
  }

  const admin = createAdminClient();

  const { data: guia } = await admin
    .from("guias_alimenticias")
    .select("pdf_storage_path")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!guia?.pdf_storage_path) {
    return { error: "Todavía no tenés una guía alimenticia asignada" };
  }

  const { data: signed } = await admin.storage
    .from("guias-alimenticias")
    .createSignedUrl(guia.pdf_storage_path, 60 * 5);

  if (!signed?.signedUrl) {
    return { error: "No se pudo generar el link de descarga" };
  }

  return { url: signed.signedUrl };
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { tieneConsentimientoSalud } from "@/lib/consentimiento-salud";
import { VERSION_SALUD } from "@/lib/aceptacion-legal-version";
import { avisarCoach } from "@/lib/email";
import { hoyISO } from "@/lib/fecha";

const texto = (fd: FormData, k: string, max = 1000) => {
  const v = fd.get(k);
  return typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;
};
const entero = (fd: FormData, k: string) => {
  const v = Number(fd.get(k));
  return Number.isInteger(v) && v > 0 ? v : null;
};

// Guarda (o actualiza) el formulario de ingreso de la mentoría del propio
// usuario. Obligatorios solo lo estrictamente necesario para armar el plan:
// objetivo, días por semana y lugar. Restricciones y hábitos son datos de salud
// y OPCIONALES -- exigen el consentimiento específico (VERSION_SALUD).
export async function guardarFormularioIngreso(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tenés que iniciar sesión de nuevo." };

  const consiente = await tieneConsentimientoSalud(supabase, user.id);
  if (!consiente) return { error: "Antes de completar el formulario tenés que dar tu consentimiento de datos de salud." };

  const objetivo = texto(formData, "objetivo");
  const dias = entero(formData, "dias_por_semana");
  const lugar = texto(formData, "lugar", 20);
  if (!objetivo || !dias || dias > 7 || !lugar || !["gimnasio", "casa", "ambos"].includes(lugar)) {
    return { error: "Completá tu objetivo, cuántos días por semana podés entrenar y dónde entrenás." };
  }
  const minutos = entero(formData, "minutos_por_sesion");

  const { error } = await supabase.from("formularios_ingreso").upsert(
    {
      user_id: user.id,
      objetivo,
      experiencia: texto(formData, "experiencia"),
      dias_por_semana: dias,
      minutos_por_sesion: minutos && minutos >= 15 && minutos <= 240 ? minutos : null,
      lugar,
      equipamiento: texto(formData, "equipamiento"),
      disponibilidad: texto(formData, "disponibilidad"),
      restricciones: texto(formData, "restricciones"),
      habitos: texto(formData, "habitos"),
      comentarios: texto(formData, "comentarios", 2000),
      consentimiento_salud_version: VERSION_SALUD,
      completado_at: new Date().toISOString(),
      actualizado_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
  if (error) return { error: "No pudimos guardar el formulario. Probá de nuevo." };

  await avisarCoach({
    tipo: "formulario_ingreso",
    ref: `${user.id}:${hoyISO()}`,
    asunto: "Formulario de ingreso completado",
    lineas: [`Cliente: ${user.email ?? user.id}`, `Objetivo: ${objetivo}`, "Está en la app: Vista de coach."],
  });

  revalidatePath("/perfil/ingreso");
  return { ok: true };
}

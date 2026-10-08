"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { registrarAceptacion } from "@/lib/aceptacion-legal";
import { rutaSiguienteSegura } from "@/lib/next-redirect";

export async function aceptarTerminos(formData: FormData) {
  const next = rutaSiguienteSegura(formData.get("next"));
  const sufijoNext = next ? `&next=${encodeURIComponent(next)}` : "";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Validación del lado servidor: el `required` del checkbox solo es una
  // ayuda de UI, acá se vuelve a exigir.
  if (formData.get("acepto") !== "on") {
    redirect(
      `/aceptar-terminos?error=${encodeURIComponent("Tenés que aceptar los Términos y la Política de Privacidad para continuar.")}${sufijoNext}`
    );
  }

  const ok = await registrarAceptacion(user.id);
  if (!ok) {
    redirect(
      `/aceptar-terminos?error=${encodeURIComponent("No pudimos guardar tu aceptación. Probá de nuevo.")}${sufijoNext}`
    );
  }

  redirect(next ?? "/");
}

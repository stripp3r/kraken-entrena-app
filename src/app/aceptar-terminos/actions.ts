"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { registrarAceptaciones } from "@/lib/aceptacion-legal";
import { aceptacionesFaltantes, TIPO_ACEPTACION, TIPO_MAYOR_18, TIPO_TRANSFERENCIA } from "@/lib/aceptacion-legal-version";
import { createAdminClient } from "@/lib/supabase/admin";
import { rutaSiguienteSegura } from "@/lib/next-redirect";

export async function aceptarTerminos(formData: FormData) {
  const next = rutaSiguienteSegura(formData.get("next"));
  const sufijoNext = next ? `&next=${encodeURIComponent(next)}` : "";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Solo se piden (y se exigen) las aceptaciones que le faltan a esta persona.
  const { data: previas } = await createAdminClient()
    .from("aceptaciones_legales")
    .select("tipo, version")
    .eq("user_id", user.id);
  const faltantes = aceptacionesFaltantes(previas ?? []);

  // Validación del lado servidor: el `required` de los checkbox solo es una
  // ayuda de UI, acá se vuelve a exigir cada una.
  const campo: Record<string, string> = {
    [TIPO_ACEPTACION]: "acepto",
    [TIPO_MAYOR_18]: "mayor18",
    [TIPO_TRANSFERENCIA]: "transferencia",
  };
  const sinTildar = faltantes.filter((f) => formData.get(campo[f.tipo]) !== "on");
  if (sinTildar.length > 0) {
    redirect(
      `/aceptar-terminos?error=${encodeURIComponent("Para continuar tenés que tildar todas las casillas.")}${sufijoNext}`
    );
  }

  const ok = await registrarAceptaciones(user.id, faltantes);
  if (!ok) {
    redirect(
      `/aceptar-terminos?error=${encodeURIComponent("No pudimos guardar tu aceptación. Probá de nuevo.")}${sufijoNext}`
    );
  }

  redirect(next ?? "/");
}

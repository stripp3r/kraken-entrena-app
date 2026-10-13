"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { registrarAceptaciones } from "@/lib/aceptacion-legal";
import { TIPO_SALUD, VERSION_SALUD } from "@/lib/aceptacion-legal-version";

export async function consentirDatosDeSalud() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tenés que iniciar sesión de nuevo." };

  const ok = await registrarAceptaciones(user.id, [{ tipo: TIPO_SALUD, version: VERSION_SALUD }]);
  if (!ok) return { error: "No pudimos guardar tu consentimiento. Probá de nuevo." };

  revalidatePath("/", "layout");
  return { ok: true };
}

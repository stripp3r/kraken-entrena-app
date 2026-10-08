import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { VERSION_LEGAL, TIPO_ACEPTACION } from "@/lib/aceptacion-legal-version";

export { VERSION_LEGAL, TIPO_ACEPTACION };

// Guarda la aceptación vigente del usuario (idempotente por el unique
// user_id+tipo+version). Server-only: usa la service role para que el
// user_agent y la IP los ponga el servidor, no el cliente. Devuelve false si
// no pudo guardar (el llamador decide si eso corta el flujo).
export async function registrarAceptacion(userId: string): Promise<boolean> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || null;
  const userAgent = h.get("user-agent");

  const { error } = await createAdminClient()
    .from("aceptaciones_legales")
    .upsert(
      {
        user_id: userId,
        tipo: TIPO_ACEPTACION,
        version: VERSION_LEGAL,
        user_agent: userAgent?.slice(0, 500) ?? null,
        ip: ip?.slice(0, 64) ?? null,
      },
      { onConflict: "user_id,tipo,version", ignoreDuplicates: true }
    );

  if (error) {
    console.error("No se pudo registrar la aceptación legal:", error.message);
    return false;
  }
  return true;
}

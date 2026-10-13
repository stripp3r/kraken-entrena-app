import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  ACEPTACIONES_REQUERIDAS,
  VERSION_LEGAL,
  TIPO_ACEPTACION,
  type ClaveAceptacion,
} from "@/lib/aceptacion-legal-version";

export { VERSION_LEGAL, TIPO_ACEPTACION };

async function huella() {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || null;
  return { ip: ip?.slice(0, 64) ?? null, userAgent: h.get("user-agent")?.slice(0, 500) ?? null };
}

// Guarda aceptaciones del usuario (idempotente por el unique
// user_id+tipo+version). Server-only: usa la service role para que el
// user_agent y la IP los ponga el servidor, no el cliente. Devuelve false si
// no pudo guardar (el llamador decide si eso corta el flujo).
export async function registrarAceptaciones(
  userId: string,
  items: readonly { tipo: string; version: string }[]
): Promise<boolean> {
  const { ip, userAgent } = await huella();
  const { error } = await createAdminClient()
    .from("aceptaciones_legales")
    .upsert(
      items.map((i) => ({ user_id: userId, tipo: i.tipo, version: i.version, user_agent: userAgent, ip })),
      { onConflict: "user_id,tipo,version", ignoreDuplicates: true }
    );

  if (error) {
    console.error("No se pudo registrar la aceptación legal:", error.message);
    return false;
  }
  return true;
}

// Compatibilidad: acepta TODO lo requerido para ingresar (términos + mayor de
// 18 + transferencia). Se usa en el registro por email, donde las tres
// casillas son obligatorias.
export async function registrarAceptacion(userId: string): Promise<boolean> {
  return registrarAceptaciones(userId, ACEPTACIONES_REQUERIDAS);
}

export type { ClaveAceptacion };

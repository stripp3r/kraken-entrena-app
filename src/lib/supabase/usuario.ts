import type { SupabaseClient } from "@supabase/supabase-js";

// Usuario de la sesión SIN ir a la red: el token de Supabase se firma con claves asimétricas (ES256), así que
// getClaims() verifica la firma y el vencimiento localmente con las claves públicas (se cachean). En cambio
// auth.getUser() consulta al servidor de Supabase en cada llamada (medido: 2 a 11 s desde una PC en Argentina,
// decenas de ms desde Vercel, y se repetía en el proxy, el layout y cada página).
// Se usa SOLO para leer/mostrar (páginas, layout, proxy). Las acciones que modifican datos, las rutas de API
// y los webhooks siguen usando auth.getUser(), que además confirma que la cuenta existe y no está bloqueada
// (con getClaims una cuenta eliminada o bloqueada conserva acceso de lectura hasta que vence el token, ~1 h).
export type UsuarioLigero = { id: string; email: string | undefined };

export async function obtenerUsuario(supabase: Pick<SupabaseClient, "auth">): Promise<{ data: { user: UsuarioLigero | null } }> {
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return { data: { user: null } };
  return { data: { user: { id: claims.sub, email: typeof claims.email === "string" ? claims.email : undefined } } };
}

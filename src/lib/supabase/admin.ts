import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Server-only. Usa SUPABASE_SERVICE_ROLE_KEY (nunca NEXT_PUBLIC_) -- bypassea
// RLS por completo. Reservado para código que no corre en el contexto de un
// usuario logueado (webhooks de pago, checkout): ahí no hay cookies de
// sesión, así que el cliente normal (@/lib/supabase/server) no sirve.
// Nunca importar este archivo desde un componente cliente ni desde código
// que también corra en el browser.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

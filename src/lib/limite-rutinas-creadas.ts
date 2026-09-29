import type { SupabaseClient } from "@supabase/supabase-js";

// Cuántas rutinas armó el usuario mismo en "Crea tu rutina" (creada_por_usuario
// = true). El Free Trial limita esto a 1 -- se valida acá tanto al mostrar la
// pantalla (page.tsx) como al guardar (actions.ts), mismo criterio en los dos
// lugares.
export async function contarRutinasCreadasPorUsuario(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const { data: accesoRows } = await supabase
    .from("profile_routine_access")
    .select("routine_id")
    .eq("user_id", userId);

  const ids = (accesoRows ?? []).map((a) => a.routine_id);
  if (ids.length === 0) return 0;

  const { count } = await supabase
    .from("routines")
    .select("id", { count: "exact", head: true })
    .in("id", ids)
    .eq("creada_por_usuario", true);

  return count ?? 0;
}

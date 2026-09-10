"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// La entitlement a un PDF se deduce de la misma tabla que ya desbloquea
// rutinas (profile_routine_access) -- si el usuario tiene acceso a alguna
// rutina que ese producto desbloquea, tiene acceso a su PDF. Evita necesitar
// RLS nueva sobre productos/producto_rutinas/compras: la identidad viene de
// la sesión (createClient), y el admin client solo se usa ya confirmado quién
// es el usuario, para leer datos scopeados a su propio user.id.
export async function obtenerLinkDescargaPdf(productoId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado" };
  }

  const admin = createAdminClient();

  const { data: accesos } = await admin
    .from("profile_routine_access")
    .select("routine_id")
    .eq("user_id", user.id);

  const routineIds = accesos?.map((a) => a.routine_id) ?? [];

  if (!routineIds.length) {
    return { error: "No tenés acceso a este PDF" };
  }

  const { data: relacion } = await admin
    .from("producto_rutinas")
    .select("producto_id")
    .eq("producto_id", productoId)
    .in("routine_id", routineIds)
    .limit(1)
    .maybeSingle();

  if (!relacion) {
    return { error: "No tenés acceso a este PDF" };
  }

  const { data: producto } = await admin
    .from("productos")
    .select("pdf_storage_path")
    .eq("id", productoId)
    .single();

  if (!producto?.pdf_storage_path) {
    return { error: "Este producto todavía no tiene un PDF cargado" };
  }

  const { data: signed } = await admin.storage
    .from("productos")
    .createSignedUrl(producto.pdf_storage_path, 60 * 5);

  if (!signed?.signedUrl) {
    return { error: "No se pudo generar el link de descarga" };
  }

  return { url: signed.signedUrl };
}

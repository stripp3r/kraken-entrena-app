"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// La entitlement a un PDF se chequea directo contra `compras` -- tenés el
// PDF si vos (este user_id) tenés una compra aprobada de ese producto,
// punto. A propósito NO se infiere desde profile_routine_access: el acceso a
// una rutina puede venir de otro lado (asignación manual del coach, cuentas
// de prueba) sin que eso signifique haber pagado ese producto puntual.
export async function obtenerLinkDescargaPdf(productoId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado" };
  }

  const admin = createAdminClient();

  const { data: compra } = await admin
    .from("compras")
    .select("id")
    .eq("user_id", user.id)
    .eq("producto_id", productoId)
    .eq("estado", "aprobado")
    .limit(1)
    .maybeSingle();

  if (!compra) {
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

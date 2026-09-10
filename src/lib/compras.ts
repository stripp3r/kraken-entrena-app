import { createAdminClient } from "@/lib/supabase/admin";

// Punto único al que llegan los webhooks de pago (Mercado Pago, PayPal)
// una vez que confirmaron -- contra la API del proveedor, no solo confiando
// en el payload -- que un pago está aprobado. Idempotente: un mismo
// (proveedor, proveedorPaymentId) nunca se procesa dos veces, aunque el
// proveedor reintente el webhook.
//
// La entrega del producto (PDF + rutinas) es 100% dentro de la app: el
// comprador baja la app y se registra con el mismo email del pago -> el
// trigger handle_new_user reclama esta compra y le da el acceso; el PDF lo
// descarga desde Perfil -> Mis PDFs. No se manda ningún mail.
export async function procesarCompraAprobada({
  proveedor,
  proveedorPaymentId,
  productoSlug,
  email,
  monto,
  moneda,
}: {
  proveedor: "mercadopago" | "payhip" | "paypal";
  proveedorPaymentId: string;
  productoSlug: string;
  email: string;
  monto: number | null;
  moneda: string | null;
}) {
  const supabase = createAdminClient();

  const { data: producto } = await supabase
    .from("productos")
    .select("id")
    .eq("slug", productoSlug)
    .eq("activo", true)
    .single();

  if (!producto) {
    return { error: `Producto desconocido o inactivo: ${productoSlug}` };
  }

  const { data: existente } = await supabase
    .from("compras")
    .select("id")
    .eq("proveedor", proveedor)
    .eq("proveedor_payment_id", proveedorPaymentId)
    .maybeSingle();

  if (existente) {
    return { ok: true, yaProcesada: true };
  }

  const { data: userId } = await supabase.rpc("buscar_usuario_por_email", {
    p_email: email,
  });

  const { data: compra, error: compraError } = await supabase
    .from("compras")
    .insert({
      proveedor,
      proveedor_payment_id: proveedorPaymentId,
      producto_id: producto.id,
      email_comprador: email,
      monto,
      moneda,
      estado: "aprobado",
      user_id: userId ?? null,
    })
    .select("id")
    .single();

  if (compraError) {
    return { error: compraError.message };
  }

  if (userId) {
    const { data: rutinas } = await supabase
      .from("producto_rutinas")
      .select("routine_id")
      .eq("producto_id", producto.id);

    if (rutinas?.length) {
      await supabase.from("profile_routine_access").upsert(
        rutinas.map((r) => ({ user_id: userId, routine_id: r.routine_id })),
        { onConflict: "user_id,routine_id", ignoreDuplicates: true }
      );
    }
  }

  return { ok: true, compraId: compra.id, desbloqueado: Boolean(userId) };
}

import { createAdminClient } from "@/lib/supabase/admin";
import { enviarEntregaProducto } from "@/lib/email";

// Punto único al que llegan tanto el webhook de Mercado Pago como el de
// PayHip una vez que confirmaron (contra la API del proveedor, no solo
// confiando en el payload) que un pago está aprobado. Idempotente: un mismo
// (proveedor, proveedorPaymentId) nunca se procesa dos veces, aunque el
// proveedor reintente el webhook.
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
    .select("id, nombre, pdf_storage_path")
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

  let pdfUrl: string | null = null;
  if (producto.pdf_storage_path) {
    const { data: signed } = await supabase.storage
      .from("productos")
      .createSignedUrl(producto.pdf_storage_path, 60 * 60 * 24 * 7);
    pdfUrl = signed?.signedUrl ?? null;
  }

  // La compra y el desbloqueo ya están confirmados en este punto -- un mail
  // que falla (ej. Resend sin configurar todavía) no debe hacer parecer que
  // la venta entera falló.
  let emailEnviado = true;
  try {
    await enviarEntregaProducto({
      email,
      nombreProducto: producto.nombre,
      pdfUrl,
      cuentaExistente: Boolean(userId),
    });
  } catch (e) {
    emailEnviado = false;
    console.error("No se pudo enviar el mail de entrega:", e);
  }

  return { ok: true, compraId: compra.id, desbloqueado: Boolean(userId), emailEnviado };
}

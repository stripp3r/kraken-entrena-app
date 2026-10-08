import { createAdminClient } from "@/lib/supabase/admin";
import { hoyISO } from "@/lib/fecha";

// Meses de acceso completo a la app que da comprar un plan suelto. Ese acceso
// incluye ver el PDF dentro de la app (solo lectura, sin descarga): cuando
// premium_hasta vence, permisos().misPdfs se corta y el PDF deja de verse
// (las filas de `compras` y las rutinas en profile_routine_access quedan, pero
// la app las bloquea hasta que vuelva a haber acceso vigente).
const MESES_ACCESO_POR_COMPRA = 3;

// Punto único al que llegan los webhooks de pago (Mercado Pago, PayPal)
// una vez que confirmaron -- contra la API del proveedor, no solo confiando
// en el payload -- que un pago está aprobado. Idempotente: un mismo
// (proveedor, proveedorPaymentId) nunca se procesa dos veces, aunque el
// proveedor reintente el webhook.
//
// La entrega del producto (PDF + rutinas) es 100% dentro de la app: el
// comprador baja la app y se registra con el mismo email del pago -> el
// trigger handle_new_user reclama esta compra y le da el acceso; el PDF lo
// lee dentro de la app desde Perfil -> Mis PDFs (visor de solo lectura, no se
// descarga). No se manda ningún mail.
export async function procesarCompraAprobada({
  proveedor,
  proveedorPaymentId,
  productoSlug,
  email,
  monto,
  moneda,
}: {
  proveedor: "mercadopago" | "paypal";
  proveedorPaymentId: string;
  productoSlug: string;
  email: string;
  monto: number | null;
  moneda: string | null;
}) {
  const supabase = createAdminClient();

  const { data: producto } = await supabase
    .from("productos")
    .select("id, pdf_storage_path")
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
      .eq("producto_id", producto.id)
      .order("routine_id", { ascending: true });

    if (rutinas?.length) {
      await supabase.from("profile_routine_access").upsert(
        rutinas.map((r) => ({ user_id: userId, routine_id: r.routine_id })),
        { onConflict: "user_id,routine_id", ignoreDuplicates: true }
      );
    }

    // Distintivo de "hay novedades" en Rutinas adquiridas y Mis PDFs --
    // definido con el coach 2026-09-30 para que un cliente que ya tenía
    // cuenta y compra otro plan se entere de que se le sumó algo nuevo, en
    // vez de tener que notarlo solo. Se apaga desde la propia pantalla la
    // primera vez que el usuario entra ahí (ver entrenamiento/rutinas y
    // perfil/recursos).
    const distintivos = {
      ...(rutinas?.length ? { tiene_rutinas_nuevas: true } : {}),
      ...(producto.pdf_storage_path ? { tiene_pdfs_nuevos: true } : {}),
    };
    if (Object.keys(distintivos).length > 0) {
      await supabase.from("profiles").update(distintivos).eq("id", userId);
    }

    // Acceso completo a la app por N meses (salvo que ya sea Golden).
    const { data: perfil } = await supabase
      .from("profiles")
      .select("premium_hasta, premium_origen, golden_perpetuo")
      .eq("id", userId)
      .single();

    if (!perfil?.golden_perpetuo && perfil?.premium_origen !== "golden") {
      const hoy = hoyISO();
      const base =
        perfil?.premium_hasta && perfil.premium_hasta > hoy ? perfil.premium_hasta : hoy;
      const d = new Date(`${base}T00:00:00-03:00`);
      d.setMonth(d.getMonth() + MESES_ACCESO_POR_COMPRA);
      await supabase
        .from("profiles")
        .update({ premium_hasta: d.toISOString().slice(0, 10), premium_origen: "compra" })
        .eq("id", userId);
    }

    // A propósito NO se activa ninguna rutina automáticamente acá -- el
    // usuario siempre elige la suya en "Rutinas adquiridas", sea su primera
    // compra o ya tenga otra activa (confirmado 2026-09-30: "quiero que él
    // la elija", tanto para quien nunca tuvo rutina como para quien ya
    // tenía una y compra otro plan). No confundir con `alta-cliente.js`,
    // que sí activa sola la rutina en altas de mentoría armadas a mano por
    // el coach -- es un flujo distinto, con otro criterio.
  }

  return { ok: true, compraId: compra.id, desbloqueado: Boolean(userId) };
}

import { createAdminClient } from "@/lib/supabase/admin";
import { hoyISO } from "@/lib/fecha";
import { VERSION_LEGAL } from "@/lib/aceptacion-legal-version";
import { notificarCompraUnica } from "@/lib/notificaciones";

// Meses de acceso completo a la app que da comprar un plan suelto (decisión del
// coach, 2026-10-13): la compra da N meses de uso de la app con las
// restricciones del plan. El PDF comprado NO depende de esto: se puede leer
// siempre que la compra esté aprobada, aunque premium_hasta venza (visor de
// solo lectura, nunca se descarga; ver lib/pdf-acceso.ts). Lo que sí vence a los
// N meses son las funciones de la app (rutinas, análisis, etc.).
export const MESES_ACCESO_POR_COMPRA = 3;

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
  // La base también normaliza (migración 099), pero se normaliza acá para que
  // la búsqueda del usuario y lo guardado coincidan sin depender de eso.
  const emailNorm = email.trim().toLowerCase();

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
    p_email: emailNorm,
  });

  const { data: compra, error: compraError } = await supabase
    .from("compras")
    .insert({
      proveedor,
      proveedor_payment_id: proveedorPaymentId,
      producto_id: producto.id,
      email_comprador: emailNorm,
      monto,
      moneda,
      estado: "aprobado",
      user_id: userId ?? null,
      // Evidencia de qué versión de los Términos regía al comprar.
      terminos_version: VERSION_LEGAL,
    })
    .select("id")
    .single();

  if (compraError) {
    return { error: compraError.message };
  }

  if (userId) {
    await aplicarAccesoDeCompra(supabase, {
      userId,
      compraId: compra.id,
      productoId: producto.id,
      pdfStoragePath: producto.pdf_storage_path,
    });
  }

  // Comprobante al comprador + aviso al coach. Idempotente y sin lanzar: un
  // problema de email no rompe la compra (ver lib/notificaciones.ts).
  await notificarCompraUnica({
    compraId: compra.id,
    productoSlug,
    proveedor,
    pagoId: proveedorPaymentId,
    email: emailNorm,
    monto,
    moneda,
    tieneCuenta: Boolean(userId),
  });

  return { ok: true, compraId: compra.id, desbloqueado: Boolean(userId) };
}

type Admin = ReturnType<typeof createAdminClient>;

// Efecto de una compra aprobada sobre una cuenta que YA existe: acceso a las
// rutinas del producto, distintivos de novedades y N meses de acceso a la app
// (salvo Golden), guardando cómo estaba el perfil para poder revocar. Lo usan
// el webhook (procesarCompraAprobada) y el reclamo de una compra hecha con otro
// email (reclamarCompraParaUsuario).
async function aplicarAccesoDeCompra(
  supabase: Admin,
  { userId, compraId, productoId, pdfStoragePath }: { userId: string; compraId: number; productoId: number; pdfStoragePath: string | null }
) {
  const producto = { id: productoId, pdf_storage_path: pdfStoragePath };
  const compra = { id: compraId };
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

    // Guarda cómo estaba el perfil ANTES de esta compra, para poder
    // deshacer el acceso si se revoca (revocarCompra, src/lib/solicitudes.ts).
    // Si la migración 093 todavía no corrió este update falla sin romper la
    // compra (el error de supabase-js se devuelve, no se lanza).
    await supabase
      .from("compras")
      .update({
        premium_aplicado: true,
        premium_previo_hasta: perfil?.premium_hasta ?? null,
        premium_previo_origen: perfil?.premium_origen ?? null,
      })
      .eq("id", compra.id);
  }

  // A propósito NO se activa ninguna rutina automáticamente acá -- el
  // usuario siempre elige la suya en "Rutinas adquiridas", sea su primera
  // compra o ya tenga otra activa (confirmado 2026-09-30: "quiero que él
  // la elija", tanto para quien nunca tuvo rutina como para quien ya
  // tenía una y compra otro plan). No confundir con `alta-cliente.js`,
  // que sí activa sola la rutina en altas de mentoría armadas a mano por
  // el coach -- es un flujo distinto, con otro criterio.

}

// Enlaza una compra aprobada SIN cuenta a un usuario concreto y le da el mismo
// acceso que si hubiera pagado con el email de su cuenta. Idempotente: si la
// compra ya es de ese usuario no repite nada. Solo para uso del servidor, tras
// verificar la identidad (código por email o admin).
export async function reclamarCompraParaUsuario(compraId: number, userId: string) {
  const supabase = createAdminClient();
  const { data: compra } = await supabase
    .from("compras")
    .select("id, user_id, estado, producto_id, productos(pdf_storage_path)")
    .eq("id", compraId)
    .maybeSingle();
  if (!compra) return { error: `No existe la compra ${compraId}` };
  if (compra.estado !== "aprobado") return { error: `La compra ${compraId} no está aprobada (${compra.estado}).` };
  if (compra.user_id === userId) return { ok: true, yaEnlazada: true };
  if (compra.user_id) return { error: `La compra ${compraId} ya pertenece a otra cuenta.` };

  const { error } = await supabase.from("compras").update({ user_id: userId }).eq("id", compraId).is("user_id", null);
  if (error) return { error: error.message };

  const pr = (Array.isArray(compra.productos) ? compra.productos[0] : compra.productos) as { pdf_storage_path: string | null } | null;
  await aplicarAccesoDeCompra(supabase, {
    userId,
    compraId,
    productoId: compra.producto_id as number,
    pdfStoragePath: pr?.pdf_storage_path ?? null,
  });
  return { ok: true };
}

import { createAdminClient } from "@/lib/supabase/admin";
import { avisarCoach, enviarEmail } from "@/lib/email";
import { avisoPagoRechazado, comprobanteCompra, importeLegible } from "@/lib/emails-plantillas";
import { VERSION_LEGAL } from "@/lib/aceptacion-legal-version";

// Emails y avisos al coach de los eventos de pago. Todo es idempotente (la
// bandeja emails_salientes deduplica por tipo+ref) y NUNCA lanza: un problema
// de email no puede romper el procesamiento de un webhook de pago.

const NOMBRE_MEDIO: Record<string, string> = { mercadopago: "Mercado Pago", paypal: "PayPal" };

async function emailDeUsuario(userId: string): Promise<string | null> {
  try {
    const { data } = await createAdminClient().auth.admin.getUserById(userId);
    return data.user?.email ?? null;
  } catch {
    return null;
  }
}

async function nombreProducto(slug: string): Promise<string> {
  const { data } = await createAdminClient().from("productos").select("nombre").eq("slug", slug).maybeSingle();
  return (data?.nombre as string | undefined) ?? slug;
}

// Compra de un plan suelto (pago único): comprobante al comprador + aviso al coach.
export async function notificarCompraUnica(d: {
  compraId: number;
  productoSlug: string;
  proveedor: "mercadopago" | "paypal";
  pagoId: string;
  email: string;
  monto: number | null;
  moneda: string | null;
  tieneCuenta: boolean;
}) {
  try {
    const producto = await nombreProducto(d.productoSlug);
    const { data: compra } = await createAdminClient()
      .from("compras")
      .select("created_at, plazo_legal_vence, plazo_comercial_vence")
      .eq("id", d.compraId)
      .maybeSingle();

    const plantilla = comprobanteCompra({
      producto,
      monto: d.monto,
      moneda: d.moneda,
      fechaISO: (compra?.created_at as string | undefined) ?? new Date().toISOString(),
      medioPago: NOMBRE_MEDIO[d.proveedor],
      operacionId: d.pagoId,
      suscripcion: null,
      terminosVersion: VERSION_LEGAL,
      plazoLegalVence: (compra?.plazo_legal_vence as string | null | undefined) ?? null,
      plazoComercialVence: (compra?.plazo_comercial_vence as string | null | undefined) ?? null,
    });
    await enviarEmail({ tipo: "comprobante", ref: `compra:${d.compraId}`, para: d.email, ...plantilla });

    await avisarCoach({
      tipo: "compra",
      ref: `compra:${d.compraId}`,
      asunto: `Nueva compra: ${producto}`,
      lineas: [
        `Producto: ${producto}`,
        `Monto: ${importeLegible(d.monto, d.moneda)}`,
        `Medio de pago: ${NOMBRE_MEDIO[d.proveedor]} (operación ${d.pagoId})`,
        `Email del comprador: ${d.email}`,
        d.tieneCuenta ? "Ya tiene cuenta en la app: acceso desbloqueado." : "Todavía no tiene cuenta: se desbloquea al registrarse con ese email.",
      ],
    });
  } catch (e) {
    console.error("notificarCompraUnica:", e instanceof Error ? e.message : e);
  }
}

// Cobro de una suscripción (alta o renovación): comprobante + aviso al coach.
// Además detecta el caso "se cobró una renovación DESPUÉS de una baja recibida a
// tiempo" y crea la tarea de devolución proactiva (adenda legal, regla 3).
export async function notificarCobroSuscripcion(d: {
  userId: string;
  proveedor: "mercadopago" | "paypal";
  proveedorSubId: string;
  cobroId: string;
  productoSlug: string;
  frecuencia: "mensual" | "anual" | null;
  monto: number | null;
  moneda: string | null;
  esAlta: boolean;
  estadoPrevio: string | null;
}) {
  try {
    const admin = createAdminClient();
    const email = await emailDeUsuario(d.userId);
    const producto = await nombreProducto(d.productoSlug);
    const medio = NOMBRE_MEDIO[d.proveedor];

    if (email) {
      const plantilla = comprobanteCompra({
        producto,
        monto: d.monto,
        moneda: d.moneda,
        fechaISO: new Date().toISOString(),
        medioPago: medio,
        operacionId: d.cobroId,
        suscripcion: { frecuencia: d.frecuencia },
        terminosVersion: VERSION_LEGAL,
        plazoLegalVence: null,
        plazoComercialVence: null,
      });
      await enviarEmail({ tipo: "comprobante", ref: `cobro:${d.proveedor}:${d.cobroId}`, para: email, ...plantilla });
    }

    await avisarCoach({
      tipo: d.esAlta ? "suscripcion_nueva" : "renovacion",
      ref: `cobro:${d.proveedor}:${d.cobroId}`,
      asunto: d.esAlta ? `Nueva suscripción: ${producto}` : `Renovación cobrada: ${producto}`,
      lineas: [
        `Producto: ${producto}`,
        `Monto: ${importeLegible(d.monto, d.moneda)}`,
        `Medio de pago: ${medio} (cobro ${d.cobroId})`,
        `Email: ${email ?? "(sin email)"}`,
      ],
    });

    // ¿Hay una baja recibida a tiempo (últimos 35 días) o la suscripción ya estaba cancelada?
    let motivo: string | null = d.estadoPrevio === "cancelada" ? "La suscripción figuraba cancelada y se cobró igual." : null;
    if (!motivo && email) {
      const desde = new Date(Date.now() - 35 * 86400000).toISOString();
      const { data: bajas } = await admin
        .from("solicitudes_baja_arrepentimiento")
        .select("codigo")
        .eq("tipo", "baja")
        .eq("email_cuenta", email.toLowerCase())
        .neq("estado", "rechazada")
        .gte("recibida_at", desde)
        .limit(1);
      if (bajas?.length) motivo = `Se cobró una renovación después de la baja ${bajas[0].codigo}.`;
    }
    if (motivo && !d.esAlta) {
      const { error } = await admin.from("tareas_reembolso").insert({
        origen_ref: `cobro:${d.proveedor}:${d.cobroId}`,
        motivo,
        proveedor: d.proveedor,
        proveedor_payment_id: d.cobroId,
        user_id: d.userId,
        email,
        monto: d.monto,
        moneda: d.moneda,
      });
      if (!error) {
        await avisarCoach({
          tipo: "reembolso_renovacion",
          ref: `cobro:${d.proveedor}:${d.cobroId}`,
          asunto: `DEVOLVER cobro de ${email ?? d.userId}`,
          lineas: [motivo, `Devolver ${importeLegible(d.monto, d.moneda)} por ${medio} (cobro ${d.cobroId}).`, "Es una devolución proactiva: la persona no tiene que iniciar ningún trámite."],
        });
      }
    }
  } catch (e) {
    console.error("notificarCobroSuscripcion:", e instanceof Error ? e.message : e);
  }
}

// Cobro de renovación rechazado: email a la persona con la fecha exacta de
// suspensión + aviso al coach. `fechaCorte` es el nuevo premium_hasta (con la
// gracia de 48 h ya sumada).
export async function notificarPagoRechazado(d: { userId: string; proveedor: string; proveedorSubId: string; fechaCorte: string | null }) {
  try {
    const admin = createAdminClient();
    const email = await emailDeUsuario(d.userId);
    const { data: sub } = await admin
      .from("suscripciones")
      .select("producto_slug, frecuencia")
      .eq("proveedor", d.proveedor)
      .eq("proveedor_sub_id", d.proveedorSubId)
      .maybeSingle();
    const slug = (sub?.producto_slug as string | null) ?? (sub?.frecuencia === "mensual" ? "golden-mensual" : "golden-anual");
    const producto = await nombreProducto(slug);
    const ref = `rechazo:${d.proveedor}:${d.proveedorSubId}:${d.fechaCorte ?? "s/f"}`;

    if (email && d.fechaCorte) {
      await enviarEmail({ tipo: "pago_rechazado", ref, para: email, ...avisoPagoRechazado({ producto, fechaCorte: d.fechaCorte }) });
    }
    await avisarCoach({
      tipo: "pago_rechazado",
      ref,
      asunto: `Pago rechazado: ${producto}`,
      lineas: [`Producto: ${producto}`, `Email: ${email ?? "(sin email)"}`, `Medio: ${NOMBRE_MEDIO[d.proveedor] ?? d.proveedor}`, d.fechaCorte ? `Acceso suspendido después del ${d.fechaCorte} (48 h de gracia).` : "Sin gracia aplicable."],
    });
  } catch (e) {
    console.error("notificarPagoRechazado:", e instanceof Error ? e.message : e);
  }
}

// Baja de una suscripción (la canceló la persona en el proveedor o desde el botón).
export async function notificarBajaSuscripcion(d: { userId: string | null; proveedor: string; proveedorSubId: string; accesoHasta: string | null }) {
  try {
    const email = d.userId ? await emailDeUsuario(d.userId) : null;
    await avisarCoach({
      tipo: "baja_suscripcion",
      ref: `baja:${d.proveedor}:${d.proveedorSubId}`,
      asunto: "Baja de suscripción",
      lineas: [`Email: ${email ?? "(desconocido)"}`, `Medio: ${NOMBRE_MEDIO[d.proveedor] ?? d.proveedor} (suscripción ${d.proveedorSubId})`, d.accesoHasta ? `Conserva el acceso hasta el ${d.accesoHasta}.` : "Sin fecha de fin de período."],
    });
  } catch (e) {
    console.error("notificarBajaSuscripcion:", e instanceof Error ? e.message : e);
  }
}

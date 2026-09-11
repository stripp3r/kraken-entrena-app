import { NextRequest, NextResponse } from "next/server";
import { InvalidWebhookSignatureError } from "mercadopago";
import {
  validarFirmaWebhook,
  obtenerPago,
  obtenerPreApproval,
  obtenerAuthorizedPayment,
} from "@/lib/mercadopago";
import { procesarCompraAprobada } from "@/lib/compras";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  marcarSuscripcionActiva,
  acreditarCobroGolden,
  pausarGolden,
  cancelarGolden,
  decodificarReferencia,
} from "@/lib/suscripciones";

const soloFecha = (iso?: string | null) => (iso ? iso.slice(0, 10) : null);

// Mercado Pago llama acá para pagos únicos (Anti-Flakardo) y para las
// suscripciones Golden. Nunca se confía en el payload: solo trae un id, y hay
// que volver a consultar el recurso contra la API de MP para confirmar el
// estado real (así lo recomienda MP).
export async function POST(request: NextRequest) {
  const dataId = request.nextUrl.searchParams.get("data.id");
  const tipoQuery = request.nextUrl.searchParams.get("type");

  try {
    validarFirmaWebhook({
      xSignature: request.headers.get("x-signature"),
      xRequestId: request.headers.get("x-request-id"),
      dataId,
    });
  } catch (error) {
    if (error instanceof InvalidWebhookSignatureError) {
      return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
    }
    throw error;
  }

  const body = await request.json().catch(() => null);
  const id = dataId ?? body?.data?.id;
  const tipo = tipoQuery ?? body?.type;

  if (!id) {
    return NextResponse.json({ error: "Sin id" }, { status: 400 });
  }

  // ---------- Suscripción Golden: autorización / cancelación / pausa ----------
  if (tipo === "subscription_preapproval") {
    const pre = await obtenerPreApproval(String(id));
    if (!pre.external_reference || !pre.id) {
      return NextResponse.json({ error: "Preapproval sin external_reference" }, { status: 400 });
    }
    const { userId, frecuencia } = decodificarReferencia(pre.external_reference);
    if (pre.status === "authorized") {
      await marcarSuscripcionActiva({
        userId,
        proveedor: "mercadopago",
        proveedorSubId: pre.id,
        frecuencia,
        precio: pre.auto_recurring?.transaction_amount ?? null,
        moneda: pre.auto_recurring?.currency_id ?? "ARS",
        proximoCobro: soloFecha(pre.next_payment_date),
      });
    } else if (pre.status === "cancelled") {
      await cancelarGolden("mercadopago", pre.id);
    } else if (pre.status === "paused") {
      await pausarGolden("mercadopago", pre.id);
    }
    return NextResponse.json({ ok: true, status: pre.status });
  }

  // ---------- Suscripción Golden: cada cobro (mensual o anual) ----------
  if (tipo === "subscription_authorized_payment") {
    const ap = await obtenerAuthorizedPayment(String(id));
    const admin = createAdminClient();
    const { data: sub } = await admin
      .from("suscripciones")
      .select("user_id, frecuencia")
      .eq("proveedor", "mercadopago")
      .eq("proveedor_sub_id", ap.preapproval_id)
      .maybeSingle();

    let userId = sub?.user_id ?? null;
    let frecuencia = sub?.frecuencia as "mensual" | "anual" | undefined;
    if (!userId || !frecuencia) {
      const pre = await obtenerPreApproval(ap.preapproval_id);
      if (pre.external_reference) {
        const decodificado = decodificarReferencia(pre.external_reference);
        userId = userId ?? decodificado.userId;
        frecuencia = frecuencia ?? decodificado.frecuencia;
      }
    }
    if (!userId || !frecuencia) {
      return NextResponse.json({ error: "No se pudo resolver el usuario" }, { status: 400 });
    }

    if (ap.status === "processed") {
      await acreditarCobroGolden({
        userId,
        proveedor: "mercadopago",
        proveedorSubId: ap.preapproval_id,
        frecuencia,
        cobroId: String(ap.id),
        precio: ap.transaction_amount ?? null,
        moneda: ap.currency_id ?? "ARS",
        proximoCobro: soloFecha(ap.next_payment_date),
      });
    } else if (ap.status === "rejected") {
      await pausarGolden("mercadopago", ap.preapproval_id);
    }
    return NextResponse.json({ ok: true, status: ap.status });
  }

  // ---------- Pago único (Anti-Flakardo y planes sueltos) ----------
  const pago = await obtenerPago(String(id));

  if (pago.status !== "approved") {
    return NextResponse.json({ ok: true, ignorado: pago.status });
  }

  // Un cobro de suscripción también puede llegar como evento "payment"
  // (operation_type = recurring_payment): eso lo maneja el flujo de
  // suscripción, acá se ignora para no tratarlo como compra de producto.
  const pagoConTipo = pago as typeof pago & { operation_type?: string };
  if (pagoConTipo.operation_type === "recurring_payment") {
    return NextResponse.json({ ok: true, ignorado: "recurring_payment" });
  }

  if (!pago.external_reference || !pago.payer?.email) {
    return NextResponse.json(
      { error: "Pago aprobado sin external_reference o email" },
      { status: 400 }
    );
  }

  const resultado = await procesarCompraAprobada({
    proveedor: "mercadopago",
    proveedorPaymentId: String(pago.id),
    productoSlug: pago.external_reference,
    email: pago.payer.email,
    monto: pago.transaction_amount ?? null,
    moneda: pago.currency_id ?? null,
  });

  if (resultado.error) {
    // Producto desconocido -> no es una compra nuestra (p.ej. un pago de
    // suscripción sin operation_type): se ignora, no se responde 500 para
    // que MP no reintente eternamente.
    const status = resultado.error.startsWith("Producto desconocido") ? 200 : 500;
    return NextResponse.json(
      status === 200 ? { ok: true, ignorado: resultado.error } : { error: resultado.error },
      { status }
    );
  }

  return NextResponse.json({ ok: true });
}

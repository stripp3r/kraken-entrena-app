import { NextRequest, NextResponse } from "next/server";
import { verificarFirmaWebhookPaypal, obtenerOrdenPaypal } from "@/lib/paypal";
import { procesarCompraAprobada } from "@/lib/compras";

// Red de seguridad además de /api/checkout/paypal/retorno: ese endpoint ya
// captura y desbloquea en el momento, pero si el comprador cierra el
// navegador antes de volver (o si esa request falla por cualquier motivo)
// el dinero ya se movió y nadie se entera. Este webhook reprocesa el mismo
// evento -- es idempotente por (proveedor, proveedor_payment_id), así que no
// duplica nada si el retorno ya lo había procesado.
export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);

  if (!payload) {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  const firmaOk = await verificarFirmaWebhookPaypal({
    authAlgo: request.headers.get("paypal-auth-algo"),
    certUrl: request.headers.get("paypal-cert-url"),
    transmissionId: request.headers.get("paypal-transmission-id"),
    transmissionSig: request.headers.get("paypal-transmission-sig"),
    transmissionTime: request.headers.get("paypal-transmission-time"),
    webhookEvent: payload,
  });

  if (!firmaOk) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  if (payload.event_type !== "PAYMENT.CAPTURE.COMPLETED") {
    return NextResponse.json({ ok: true, ignorado: payload.event_type });
  }

  const captura = payload.resource;
  const orderId = captura?.supplementary_data?.related_ids?.order_id ?? null;
  const productoSlug = captura?.custom_id ?? null;

  if (!captura?.id || !orderId || !productoSlug) {
    return NextResponse.json({ error: "Evento incompleto" }, { status: 400 });
  }

  const orden = await obtenerOrdenPaypal(orderId);
  const email = orden.paymentSource?.paypal?.emailAddress ?? orden.payer?.emailAddress;

  if (!email) {
    return NextResponse.json({ error: "No se encontró el email del comprador" }, { status: 400 });
  }

  const resultado = await procesarCompraAprobada({
    proveedor: "paypal",
    proveedorPaymentId: captura.id,
    productoSlug,
    email,
    monto: captura.amount?.value ? Number(captura.amount.value) : null,
    moneda: captura.amount?.currency_code ?? null,
  });

  if (resultado.error) {
    return NextResponse.json({ error: resultado.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

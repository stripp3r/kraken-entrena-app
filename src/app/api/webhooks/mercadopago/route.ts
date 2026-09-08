import { NextRequest, NextResponse } from "next/server";
import { InvalidWebhookSignatureError } from "mercadopago";
import { validarFirmaWebhook, obtenerPago } from "@/lib/mercadopago";
import { procesarCompraAprobada } from "@/lib/compras";

// Mercado Pago llama acá cuando cambia el estado de un pago. Nunca hay que
// confiar en el contenido del webhook en sí -- solo trae un id, y hay que
// volver a consultar ese pago contra la API de Mercado Pago para confirmar
// que de verdad está aprobado (así lo recomienda MP en su documentación).
export async function POST(request: NextRequest) {
  const dataId = request.nextUrl.searchParams.get("data.id");
  const xSignature = request.headers.get("x-signature");
  const xRequestId = request.headers.get("x-request-id");

  try {
    validarFirmaWebhook({ xSignature, xRequestId, dataId });
  } catch (error) {
    if (error instanceof InvalidWebhookSignatureError) {
      return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
    }
    throw error;
  }

  const body = await request.json().catch(() => null);
  const paymentId = dataId ?? body?.data?.id;

  if (!paymentId) {
    return NextResponse.json({ error: "Sin id de pago" }, { status: 400 });
  }

  const pago = await obtenerPago(paymentId);

  if (pago.status !== "approved") {
    return NextResponse.json({ ok: true, ignorado: pago.status });
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
    return NextResponse.json({ error: resultado.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

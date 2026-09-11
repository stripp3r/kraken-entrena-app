import { NextRequest, NextResponse } from "next/server";
import { obtenerSuscripcionPaypal } from "@/lib/paypal";
import { marcarSuscripcionActiva, decodificarReferencia } from "@/lib/suscripciones";

// PayPal redirige acá tras aprobar la suscripción (?subscription_id=...).
// Se marca activa; el período de acceso lo suma el webhook PAYMENT.SALE.COMPLETED.
export async function GET(request: NextRequest) {
  const subId = request.nextUrl.searchParams.get("subscription_id");
  if (!subId) {
    return NextResponse.redirect(new URL("/golden", request.url));
  }

  const sub = await obtenerSuscripcionPaypal(subId);

  if (!["ACTIVE", "APPROVAL_PENDING", "APPROVED"].includes(sub.status) || !sub.custom_id) {
    return NextResponse.redirect(new URL("/compra/pendiente", request.url));
  }

  const { userId, frecuencia } = decodificarReferencia(sub.custom_id);

  await marcarSuscripcionActiva({
    userId,
    proveedor: "paypal",
    proveedorSubId: sub.id,
    frecuencia,
    precio: sub.billing_info?.last_payment?.amount?.value
      ? Number(sub.billing_info.last_payment.amount.value)
      : null,
    moneda: sub.billing_info?.last_payment?.amount?.currency_code ?? "USD",
    proximoCobro: sub.billing_info?.next_billing_time?.slice(0, 10) ?? null,
  });

  return NextResponse.redirect(new URL("/compra/gracias", request.url));
}

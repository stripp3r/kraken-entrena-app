import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "@paypal/paypal-server-sdk";
import { capturarOrdenPaypal, obtenerOrdenPaypal } from "@/lib/paypal";
import { procesarCompraAprobada } from "@/lib/compras";

// PayPal redirige acá después de que el comprador aprueba el pago (return_url
// del checkout). Capturamos la orden en el momento -- esto es lo que de
// verdad mueve el dinero, aprobar solo no cobra nada.
export async function POST(request: NextRequest) {
  return manejarRetorno(request);
}

export async function GET(request: NextRequest) {
  return manejarRetorno(request);
}

async function manejarRetorno(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get("token");

  if (!orderId) {
    return NextResponse.redirect(new URL("/compra/error", request.url));
  }

  let orden;
  try {
    orden = await capturarOrdenPaypal(orderId);
  } catch (error) {
    // Si el comprador recarga esta página, la orden ya fue capturada antes --
    // en vez de fallar, leemos el resultado que ya quedó guardado en PayPal.
    if (error instanceof ApiError) {
      orden = await obtenerOrdenPaypal(orderId);
    } else {
      throw error;
    }
  }

  if (orden.status !== "COMPLETED") {
    return NextResponse.redirect(new URL("/compra/pendiente", request.url));
  }

  const purchaseUnit = orden.purchaseUnits?.[0];
  const captura = purchaseUnit?.payments?.captures?.[0];
  const productoSlug = captura?.customId ?? purchaseUnit?.customId ?? purchaseUnit?.referenceId;
  const email = orden.paymentSource?.paypal?.emailAddress ?? orden.payer?.emailAddress;

  if (!productoSlug || !email || !captura?.id) {
    return NextResponse.redirect(new URL("/compra/error", request.url));
  }

  const resultado = await procesarCompraAprobada({
    proveedor: "paypal",
    proveedorPaymentId: captura.id,
    productoSlug,
    email,
    monto: captura.amount?.value ? Number(captura.amount.value) : null,
    moneda: captura.amount?.currencyCode ?? null,
  });

  if (resultado.error) {
    return NextResponse.redirect(new URL("/compra/error", request.url));
  }

  return NextResponse.redirect(new URL("/compra/gracias", request.url));
}

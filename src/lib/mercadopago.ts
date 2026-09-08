import { MercadoPagoConfig, Preference, Payment, WebhookSignatureValidator } from "mercadopago";

function config() {
  return new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! });
}

export async function crearPreferencia({
  productoSlug,
  nombre,
  precioArs,
  successUrl,
  pendingUrl,
  failureUrl,
}: {
  productoSlug: string;
  nombre: string;
  precioArs: number;
  successUrl: string;
  pendingUrl: string;
  failureUrl: string;
}) {
  const preference = new Preference(config());

  const result = await preference.create({
    body: {
      items: [
        {
          id: productoSlug,
          title: nombre,
          quantity: 1,
          unit_price: precioArs,
          currency_id: "ARS",
        },
      ],
      external_reference: productoSlug,
      back_urls: { success: successUrl, pending: pendingUrl, failure: failureUrl },
      auto_return: "approved",
    },
  });

  return result.init_point;
}

export async function obtenerPago(paymentId: string) {
  const payment = new Payment(config());
  return payment.get({ id: paymentId });
}

export function validarFirmaWebhook(params: {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string | null;
}) {
  WebhookSignatureValidator.validate({
    xSignature: params.xSignature,
    xRequestId: params.xRequestId,
    dataId: params.dataId,
    secret: process.env.MERCADOPAGO_WEBHOOK_SECRET!,
    toleranceSeconds: 300,
  });
}

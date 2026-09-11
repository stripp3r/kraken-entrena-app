import {
  MercadoPagoConfig,
  Preference,
  Payment,
  PreApproval,
  WebhookSignatureValidator,
} from "mercadopago";

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

// ---------- Suscripción Golden (preapproval anual con débito automático) ----------

export async function crearSuscripcionGolden({
  userId,
  email,
  precioArs,
  reason,
  backUrl,
}: {
  userId: string;
  email: string;
  precioArs: number;
  reason: string;
  backUrl: string;
}) {
  const preapproval = new PreApproval(config());
  const result = await preapproval.create({
    body: {
      reason,
      external_reference: userId,
      payer_email: email,
      back_url: backUrl,
      status: "pending",
      auto_recurring: {
        frequency: 12,
        frequency_type: "months",
        transaction_amount: precioArs,
        currency_id: "ARS",
      },
    },
  });
  return { id: result.id ?? null, initPoint: result.init_point ?? null };
}

export async function obtenerPreApproval(id: string) {
  const preapproval = new PreApproval(config());
  return preapproval.get({ id });
}

// El SDK no tiene cliente para authorized_payments -> fetch directo.
export async function obtenerAuthorizedPayment(id: string) {
  const res = await fetch(`https://api.mercadopago.com/authorized_payments/${id}`, {
    headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
  });
  if (!res.ok) throw new Error(`authorized_payment ${id}: ${res.status}`);
  return res.json() as Promise<{
    id: number;
    preapproval_id: string;
    status: string;
    transaction_amount: number;
    currency_id: string;
    payment?: { id: number; status: string };
    next_payment_date?: string;
  }>;
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

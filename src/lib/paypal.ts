import {
  Client,
  Environment,
  OrdersController,
  CheckoutPaymentIntent,
  PaypalExperienceUserAction,
  PaypalWalletContextShippingPreference,
} from "@paypal/paypal-server-sdk";

function ambiente() {
  return process.env.PAYPAL_ENVIRONMENT === "production"
    ? Environment.Production
    : Environment.Sandbox;
}

function apiBase() {
  return process.env.PAYPAL_ENVIRONMENT === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

function ordersController() {
  const client = new Client({
    clientCredentialsAuthCredentials: {
      oAuthClientId: process.env.PAYPAL_CLIENT_ID!,
      oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET!,
    },
    environment: ambiente(),
  });
  return new OrdersController(client);
}

// Equivalente al Checkout Pro de Mercado Pago: crea la orden y devuelve el
// link "approve" al que hay que redirigir al comprador. customId/referenceId
// llevan directamente nuestro slug de producto -- a diferencia de PayHip, acá
// no hace falta ninguna tabla de mapeo, el checkout es propio de punta a punta.
export async function crearOrdenPaypal({
  productoSlug,
  nombre,
  precioUsd,
  returnUrl,
  cancelUrl,
}: {
  productoSlug: string;
  nombre: string;
  precioUsd: number;
  returnUrl: string;
  cancelUrl: string;
}) {
  const { result } = await ordersController().createOrder({
    body: {
      intent: CheckoutPaymentIntent.Capture,
      purchaseUnits: [
        {
          referenceId: productoSlug,
          customId: productoSlug,
          description: nombre,
          amount: { currencyCode: "USD", value: precioUsd.toFixed(2) },
        },
      ],
      paymentSource: {
        paypal: {
          experienceContext: {
            brandName: "KRAKEN Fitness",
            returnUrl,
            cancelUrl,
            userAction: PaypalExperienceUserAction.PayNow,
            shippingPreference: PaypalWalletContextShippingPreference.NoShipping,
          },
        },
      },
    },
    prefer: "return=representation",
  });

  // Cuando la request incluye payment_source (como acá, para poder mandar
  // returnUrl/cancelUrl propios), PayPal nombra el link de redirección
  // "payer-action" en vez de "approve" -- buscamos ambos por las dudas.
  const aprobarUrl =
    result.links?.find((l) => l.rel === "payer-action" || l.rel === "approve")?.href ?? null;
  return { orderId: result.id ?? null, aprobarUrl };
}

// Se llama desde la página de retorno una vez que el comprador aprobó el pago
// en PayPal. Si la orden ya fue capturada antes (ej. el comprador recargó la
// página de retorno), PayPal responde con un error -- en ese caso se usa
// obtenerOrdenPaypal para leer el resultado ya existente en vez de fallar.
export async function capturarOrdenPaypal(orderId: string) {
  const { result } = await ordersController().captureOrder({
    id: orderId,
    prefer: "return=representation",
  });
  return result;
}

export async function obtenerOrdenPaypal(orderId: string) {
  const { result } = await ordersController().getOrder({ id: orderId });
  return result;
}

async function obtenerAccessToken() {
  const credenciales = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(`${apiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credenciales}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    throw new Error(`No se pudo obtener el token de PayPal: ${res.status}`);
  }

  const data = await res.json();
  return data.access_token as string;
}

// ---------- Suscripción Golden (billing subscriptions, vía REST) ----------
// El SDK envuelve create/getSubscription pero no la Catalog Products API,
// así que se hace todo por REST para mantenerlo consistente.

async function paypalFetch(path: string, init: RequestInit) {
  const token = await obtenerAccessToken();
  const res = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`PayPal ${path}: ${res.status} ${JSON.stringify(data)}`);
  }
  return data;
}

// Crea (una sola vez) el producto + plan de facturación anual de Golden y
// devuelve el plan_id. Si ya existe uno guardado, lo devuelve tal cual.
export async function crearPlanGoldenPaypal(precioUsd: number): Promise<string> {
  const producto = await paypalFetch("/v1/catalogs/products", {
    method: "POST",
    body: JSON.stringify({
      name: "KRAKEN Golden",
      description: "Acceso completo a KRAKEN Entrena",
      type: "SERVICE",
      category: "SOFTWARE",
    }),
  });

  const plan = await paypalFetch("/v1/billing/plans", {
    method: "POST",
    body: JSON.stringify({
      product_id: producto.id,
      name: "KRAKEN Golden (anual)",
      description: "Suscripción anual con renovación automática",
      billing_cycles: [
        {
          frequency: { interval_unit: "YEAR", interval_count: 1 },
          tenure_type: "REGULAR",
          sequence: 1,
          total_cycles: 0,
          pricing_scheme: {
            fixed_price: { value: precioUsd.toFixed(2), currency_code: "USD" },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee_failure_action: "CANCEL",
        payment_failure_threshold: 1,
      },
    }),
  });

  return plan.id as string;
}

export async function crearSuscripcionGoldenPaypal({
  planId,
  userId,
  returnUrl,
  cancelUrl,
}: {
  planId: string;
  userId: string;
  returnUrl: string;
  cancelUrl: string;
}) {
  const sub = await paypalFetch("/v1/billing/subscriptions", {
    method: "POST",
    body: JSON.stringify({
      plan_id: planId,
      custom_id: userId,
      application_context: {
        brand_name: "KRAKEN Fitness",
        user_action: "SUBSCRIBE_NOW",
        shipping_preference: "NO_SHIPPING",
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
    }),
  });

  const aprobarUrl =
    (sub.links as { rel: string; href: string }[] | undefined)?.find((l) => l.rel === "approve")
      ?.href ?? null;
  return { id: sub.id as string | undefined, aprobarUrl };
}

export async function obtenerSuscripcionPaypal(id: string): Promise<{
  id: string;
  status: string;
  custom_id?: string;
  billing_info?: {
    next_billing_time?: string;
    last_payment?: { amount?: { value?: string; currency_code?: string } };
  };
}> {
  return paypalFetch(`/v1/billing/subscriptions/${id}`, { method: "GET" });
}

// El SDK oficial no trae un validador de firma de webhooks (a diferencia del
// de Mercado Pago) -- PayPal solo expone esto como un endpoint REST propio,
// así que hay que llamarlo a mano con un token obtenido por client credentials.
export async function verificarFirmaWebhookPaypal(params: {
  authAlgo: string | null;
  certUrl: string | null;
  transmissionId: string | null;
  transmissionSig: string | null;
  transmissionTime: string | null;
  webhookEvent: unknown;
}) {
  const { authAlgo, certUrl, transmissionId, transmissionSig, transmissionTime, webhookEvent } =
    params;

  if (!authAlgo || !certUrl || !transmissionId || !transmissionSig || !transmissionTime) {
    return false;
  }

  const accessToken = await obtenerAccessToken();

  const res = await fetch(`${apiBase()}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      auth_algo: authAlgo,
      cert_url: certUrl,
      transmission_id: transmissionId,
      transmission_sig: transmissionSig,
      transmission_time: transmissionTime,
      webhook_id: process.env.PAYPAL_WEBHOOK_ID,
      webhook_event: webhookEvent,
    }),
  });

  if (!res.ok) return false;

  const data = await res.json();
  return data.verification_status === "SUCCESS";
}

import { NextRequest, NextResponse } from "next/server";
import {
  verificarFirmaWebhookPaypal,
  obtenerOrdenPaypal,
  obtenerSuscripcionPaypal,
} from "@/lib/paypal";
import { procesarCompraAprobada } from "@/lib/compras";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  marcarSuscripcionActiva,
  acreditarCobroGolden,
  acreditarCobroMentoriaOnline,
  pausarGolden,
  cancelarGolden,
  decodificarReferencia,
  decodificarReferenciaMentoriaOnline,
} from "@/lib/suscripciones";

// Un solo webhook para PayPal: pagos únicos (PAYMENT.CAPTURE.COMPLETED) y
// suscripciones recurrentes -- Golden Y Mentoría Online (ambas pasan por
// BILLING.SUBSCRIPTION.* / PAYMENT.SALE.COMPLETED, distinguidas por el
// formato del custom_id -- ver decodificarReferenciaMentoriaOnline, que
// devuelve null si no es una referencia de mentoría, y en ese caso se sigue
// tratando como Golden, exactamente el comportamiento de antes de agregar
// esto).
export async function POST(request: NextRequest) {
  // Se guarda el cuerpo crudo y se verifica la firma ANTES de parsearlo --
  // ver el comentario en verificarFirmaWebhookPaypal para el por qué.
  const rawBody = await request.text();

  const firmaOk = await verificarFirmaWebhookPaypal({
    authAlgo: request.headers.get("paypal-auth-algo"),
    certUrl: request.headers.get("paypal-cert-url"),
    transmissionId: request.headers.get("paypal-transmission-id"),
    transmissionSig: request.headers.get("paypal-transmission-sig"),
    transmissionTime: request.headers.get("paypal-transmission-time"),
    webhookEventRaw: rawBody,
  });

  if (!firmaOk) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  const tipo = payload.event_type as string;
  const recurso = payload.resource ?? {};

  // ---------- Suscripción Golden o Mentoría Online ----------
  if (tipo === "BILLING.SUBSCRIPTION.ACTIVATED" || tipo === "BILLING.SUBSCRIPTION.RE-ACTIVATED") {
    if (!recurso.id || !recurso.custom_id) {
      return NextResponse.json({ error: "Suscripción sin custom_id" }, { status: 400 });
    }
    const mentoria = decodificarReferenciaMentoriaOnline(recurso.custom_id);
    const { userId, frecuencia } = mentoria
      ? { userId: mentoria.userId, frecuencia: "mensual" as const }
      : decodificarReferencia(recurso.custom_id);
    await marcarSuscripcionActiva({
      userId,
      proveedor: "paypal",
      proveedorSubId: recurso.id,
      frecuencia,
      precio: recurso.billing_info?.last_payment?.amount?.value
        ? Number(recurso.billing_info.last_payment.amount.value)
        : null,
      moneda: recurso.billing_info?.last_payment?.amount?.currency_code ?? "USD",
      proximoCobro: recurso.billing_info?.next_billing_time?.slice(0, 10) ?? null,
    });
    return NextResponse.json({ ok: true });
  }

  if (tipo === "PAYMENT.SALE.COMPLETED" && recurso.billing_agreement_id) {
    const subId = recurso.billing_agreement_id as string;
    const sub = await obtenerSuscripcionPaypal(subId);

    // El custom_id de la suscripción en sí (no el del pago individual) es
    // la única fuente confiable de "¿esto es Mentoría Online o Golden?" --
    // siempre se chequea contra la API en vivo, nunca se asume por lo que
    // ya haya guardado en `suscripciones`.
    const mentoria = sub.custom_id ? decodificarReferenciaMentoriaOnline(sub.custom_id) : null;

    if (mentoria) {
      await acreditarCobroMentoriaOnline({
        userId: mentoria.userId,
        proveedor: "paypal",
        proveedorSubId: subId,
        tier: mentoria.tier,
        cobroId: String(recurso.id),
        precio: recurso.amount?.total ? Number(recurso.amount.total) : null,
        moneda: recurso.amount?.currency ?? "USD",
        proximoCobro: sub.billing_info?.next_billing_time?.slice(0, 10) ?? null,
      });
      return NextResponse.json({ ok: true });
    }

    const admin = createAdminClient();
    const { data: fila } = await admin
      .from("suscripciones")
      .select("user_id, frecuencia")
      .eq("proveedor", "paypal")
      .eq("proveedor_sub_id", subId)
      .maybeSingle();

    let userId = fila?.user_id ?? null;
    let frecuencia = fila?.frecuencia as "mensual" | "anual" | undefined;
    if ((!userId || !frecuencia) && sub.custom_id) {
      const decodificado = decodificarReferencia(sub.custom_id);
      userId = userId ?? decodificado.userId;
      frecuencia = frecuencia ?? decodificado.frecuencia;
    }
    if (!userId || !frecuencia) {
      return NextResponse.json({ error: "No se pudo resolver el usuario" }, { status: 400 });
    }

    await acreditarCobroGolden({
      userId,
      proveedor: "paypal",
      proveedorSubId: subId,
      frecuencia,
      cobroId: String(recurso.id),
      precio: recurso.amount?.total ? Number(recurso.amount.total) : null,
      moneda: recurso.amount?.currency ?? "USD",
      proximoCobro: sub.billing_info?.next_billing_time?.slice(0, 10) ?? null,
    });
    return NextResponse.json({ ok: true });
  }

  if (
    (tipo === "BILLING.SUBSCRIPTION.CANCELLED" || tipo === "BILLING.SUBSCRIPTION.EXPIRED") &&
    recurso.id
  ) {
    await cancelarGolden("paypal", recurso.id);
    return NextResponse.json({ ok: true });
  }

  // Solo el cobro FALLIDO da las 48 h de gracia; una suspensión a secas
  // (ej. pausada a mano) no. PayPal manda PAYMENT.FAILED antes del SUSPENDED
  // que sigue a un fallo, así que la gracia se otorga con el primero.
  if (
    (tipo === "BILLING.SUBSCRIPTION.SUSPENDED" ||
      tipo === "BILLING.SUBSCRIPTION.PAYMENT.FAILED") &&
    recurso.id
  ) {
    await pausarGolden("paypal", recurso.id, {
      pagoRechazado: tipo === "BILLING.SUBSCRIPTION.PAYMENT.FAILED",
    });
    return NextResponse.json({ ok: true });
  }

  // ---------- Pago único (Anti-Flakardo y planes sueltos) ----------
  if (tipo !== "PAYMENT.CAPTURE.COMPLETED") {
    return NextResponse.json({ ok: true, ignorado: tipo });
  }

  const captura = recurso;
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

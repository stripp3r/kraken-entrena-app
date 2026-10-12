import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";

// Webhook de la WhatsApp Cloud API (Meta).
// GET  = handshake de verificación al registrar la URL en el panel de Meta.
// POST = mensajes entrantes y estados. Por ahora solo valida la firma y deja
//        el payload en los logs; el agente vendedor se conecta en la Fase 1.

export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const esperado = process.env.WHATSAPP_VERIFY_TOKEN;
  if (
    esperado &&
    p.get("hub.mode") === "subscribe" &&
    p.get("hub.verify_token") === esperado
  ) {
    return new NextResponse(p.get("hub.challenge") ?? "", { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

function firmaValida(rawBody: string, header: string | null): boolean {
  const secret = process.env.META_APP_SECRET;
  if (!secret || !header?.startsWith("sha256=")) return false;
  const esperada = createHmac("sha256", secret).update(rawBody).digest("hex");
  const recibida = header.slice("sha256=".length);
  const a = Buffer.from(esperada);
  const b = Buffer.from(recibida);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  if (!firmaValida(rawBody, request.headers.get("x-hub-signature-256"))) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }
  console.log("[whatsapp] evento recibido:", rawBody);
  // Meta reintenta si no recibe 200 rápido.
  return NextResponse.json({ ok: true });
}

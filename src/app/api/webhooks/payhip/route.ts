import { NextRequest, NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { procesarCompraAprobada } from "@/lib/compras";

// La "firma" de PayHip no es un HMAC del payload -- es simplemente
// sha256(tu API key), igual en todos los webhooks (ver help.payhip.com/
// article/115-webhooks). Sirve para confirmar que quien llama conoce la API
// key, no protege contra reenvíos -- por eso además está la idempotencia
// por (proveedor, proveedor_payment_id) en procesarCompraAprobada.
function firmaValida(recibida: unknown) {
  if (typeof recibida !== "string") return false;
  const esperada = createHash("sha256").update(process.env.PAYHIP_API_KEY!).digest("hex");
  const bufRecibida = Buffer.from(recibida);
  const bufEsperada = Buffer.from(esperada);
  return bufRecibida.length === bufEsperada.length && timingSafeEqual(bufRecibida, bufEsperada);
}

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);

  if (!payload || !firmaValida(payload.signature)) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  if (payload.type !== "paid") {
    return NextResponse.json({ ok: true, ignorado: payload.type });
  }

  // product_key es el código corto que aparece en el link de venta
  // (payhip.com/b/<product_key>) -- más fácil de encontrar a mano que el
  // product_id interno.
  const productKey = payload.items?.[0]?.product_key ?? null;

  if (!productKey || !payload.email || !payload.id) {
    return NextResponse.json({ error: "Payload incompleto" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: producto } = await supabase
    .from("productos")
    .select("slug")
    .eq("payhip_product_key", productKey)
    .single();

  if (!producto) {
    return NextResponse.json(
      { error: `Producto de PayHip sin mapear en productos.payhip_product_key: ${productKey}` },
      { status: 400 }
    );
  }

  // PayHip manda los precios en centavos.
  const monto = typeof payload.price === "number" ? payload.price / 100 : null;

  const resultado = await procesarCompraAprobada({
    proveedor: "payhip",
    proveedorPaymentId: String(payload.id),
    productoSlug: producto.slug,
    email: payload.email,
    monto,
    moneda: payload.currency ?? null,
  });

  if (resultado.error) {
    return NextResponse.json({ error: resultado.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

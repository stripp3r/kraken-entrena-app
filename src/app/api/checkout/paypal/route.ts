import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { crearOrdenPaypal } from "@/lib/paypal";

// Link de "Pagar con PayPal" del sitio web: llama acá con ?producto=<slug> y
// termina redirigiendo a la página de aprobación de PayPal. Mismo patrón que
// /api/checkout/mercadopago.
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("producto");

  if (!slug) {
    return NextResponse.json({ error: "Falta el parámetro 'producto'." }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: producto } = await supabase
    .from("productos")
    .select("nombre, precio_usd")
    .eq("slug", slug)
    .eq("activo", true)
    .single();

  if (!producto) {
    return NextResponse.json({ error: "Producto no encontrado." }, { status: 404 });
  }

  if (!producto.precio_usd) {
    return NextResponse.json(
      { error: "Este producto todavía no tiene precio en USD cargado." },
      { status: 500 }
    );
  }

  const origin = request.nextUrl.origin;

  const { aprobarUrl } = await crearOrdenPaypal({
    productoSlug: slug,
    nombre: producto.nombre,
    precioUsd: producto.precio_usd,
    returnUrl: `${origin}/api/checkout/paypal/retorno`,
    cancelUrl: `${origin}/compra/error`,
  });

  if (!aprobarUrl) {
    return NextResponse.json({ error: "No se pudo crear el link de pago." }, { status: 502 });
  }

  return NextResponse.redirect(aprobarUrl);
}

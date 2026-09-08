import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { crearPreferencia } from "@/lib/mercadopago";

// Link de "Pagar con Mercado Pago" del sitio web: llama acá con
// ?producto=<slug> y termina redirigiendo al Checkout Pro de Mercado Pago.
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("producto");

  if (!slug) {
    return NextResponse.json({ error: "Falta el parámetro 'producto'." }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: producto } = await supabase
    .from("productos")
    .select("nombre, precio_ars")
    .eq("slug", slug)
    .eq("activo", true)
    .single();

  if (!producto) {
    return NextResponse.json({ error: "Producto no encontrado." }, { status: 404 });
  }

  if (!producto.precio_ars) {
    return NextResponse.json(
      { error: "Este producto todavía no tiene precio en ARS cargado." },
      { status: 500 }
    );
  }

  const origin = request.nextUrl.origin;

  const initPoint = await crearPreferencia({
    productoSlug: slug,
    nombre: producto.nombre,
    precioArs: producto.precio_ars,
    successUrl: `${origin}/compra/gracias`,
    pendingUrl: `${origin}/compra/pendiente`,
    failureUrl: `${origin}/compra/error`,
  });

  if (!initPoint) {
    return NextResponse.json({ error: "No se pudo crear el link de pago." }, { status: 502 });
  }

  return NextResponse.redirect(initPoint);
}

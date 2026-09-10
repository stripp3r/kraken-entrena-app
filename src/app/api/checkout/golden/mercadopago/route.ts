import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { crearSuscripcionGolden } from "@/lib/mercadopago";

// Botón "Suscribirme con Mercado Pago" de /golden. Crea la suscripción anual
// con débito automático y redirige a la autorización de Mercado Pago.
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const admin = createAdminClient();
  const { data: golden } = await admin
    .from("productos")
    .select("precio_ars, activo")
    .eq("slug", "golden-anual")
    .maybeSingle();

  if (!golden?.activo || !golden.precio_ars) {
    return NextResponse.json(
      { error: "Golden todavía no tiene precio en ARS cargado." },
      { status: 503 }
    );
  }

  const origin = request.nextUrl.origin;

  try {
    const { initPoint } = await crearSuscripcionGolden({
      userId: user.id,
      precioArs: golden.precio_ars,
      reason: "KRAKEN Golden (suscripcion anual)",
      backUrl: `${origin}/compra/gracias`,
    });

    if (!initPoint) {
      return NextResponse.json({ error: "Mercado Pago no devolvió un link." }, { status: 502 });
    }

    return NextResponse.redirect(initPoint);
  } catch (e) {
    return NextResponse.json(
      { error: "Falló la creación de la suscripción", detalle: String(e) },
      { status: 500 }
    );
  }
}

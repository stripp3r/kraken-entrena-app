import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { crearSuscripcionMentoriaOnline } from "@/lib/mercadopago";
import type { TierMentoriaOnline } from "@/lib/suscripciones";
import { redirigirALogin } from "@/lib/next-redirect";

// Checkout de Mentoría Online vía Mercado Pago (?tier=basic|vip, basic por
// default). Mismo patrón que /api/checkout/golden/mercadopago, en un
// archivo separado -- ver el comentario en suscripciones.ts sobre por qué
// no se comparte código con el checkout de Golden.
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return redirigirALogin(request);
  }

  const tier: TierMentoriaOnline =
    request.nextUrl.searchParams.get("tier") === "vip" ? "vip" : "basic";
  const slug = tier === "vip" ? "mentoria-online-vip" : "mentoria-online-basic";

  const admin = createAdminClient();
  const { data: producto } = await admin
    .from("productos")
    .select("precio_ars, activo")
    .eq("slug", slug)
    .maybeSingle();

  if (!producto?.activo || !producto.precio_ars) {
    return NextResponse.json(
      { error: `Mentoría Online (${tier}) todavía no tiene precio en ARS cargado.` },
      { status: 503 }
    );
  }

  const origin = request.nextUrl.origin;

  try {
    const { initPoint } = await crearSuscripcionMentoriaOnline({
      userId: user.id,
      tier,
      email: user.email,
      precioArs: producto.precio_ars,
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

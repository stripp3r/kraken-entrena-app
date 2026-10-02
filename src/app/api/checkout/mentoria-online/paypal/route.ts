import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { crearPlanMentoriaOnlinePaypal, crearSuscripcionMentoriaOnlinePaypal } from "@/lib/paypal";
import type { TierMentoriaOnline } from "@/lib/suscripciones";
import { redirigirALogin } from "@/lib/next-redirect";

// Checkout de Mentoría Online (?tier=basic|vip, basic por default). Mismo
// patrón que /api/checkout/golden/paypal, en un archivo separado -- ver el
// comentario en suscripciones.ts sobre por qué no se comparte código con
// el checkout de Golden.
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirigirALogin(request);
  }

  const tier: TierMentoriaOnline =
    request.nextUrl.searchParams.get("tier") === "vip" ? "vip" : "basic";
  const slug = tier === "vip" ? "mentoria-online-vip" : "mentoria-online-basic";

  const admin = createAdminClient();
  const { data: producto } = await admin
    .from("productos")
    .select("precio_usd, activo, paypal_plan_id")
    .eq("slug", slug)
    .maybeSingle();

  if (!producto?.activo || !producto.precio_usd) {
    return NextResponse.json(
      { error: `Mentoría Online (${tier}) todavía no tiene precio en USD cargado.` },
      { status: 503 }
    );
  }

  try {
    let planId = producto.paypal_plan_id as string | null;
    if (!planId) {
      planId = await crearPlanMentoriaOnlinePaypal(producto.precio_usd, tier);
      await admin.from("productos").update({ paypal_plan_id: planId }).eq("slug", slug);
    }

    const origin = request.nextUrl.origin;
    const { aprobarUrl } = await crearSuscripcionMentoriaOnlinePaypal({
      planId,
      userId: user.id,
      tier,
      returnUrl: `${origin}/api/checkout/mentoria-online/paypal/retorno`,
      cancelUrl: `${origin}/`,
    });

    if (!aprobarUrl) {
      return NextResponse.json({ error: "No se pudo crear la suscripción." }, { status: 502 });
    }

    return NextResponse.redirect(aprobarUrl);
  } catch (e) {
    return NextResponse.json(
      { error: "Falló el checkout de PayPal Mentoría Online", detalle: String(e) },
      { status: 500 }
    );
  }
}

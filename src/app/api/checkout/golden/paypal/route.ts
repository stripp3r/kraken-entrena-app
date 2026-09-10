import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { crearPlanGoldenPaypal, crearSuscripcionGoldenPaypal } from "@/lib/paypal";

// Botón "Suscribirme con PayPal" de /golden. Crea (la primera vez) el plan de
// facturación anual, después la suscripción, y redirige a la aprobación.
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
    .select("precio_usd, activo, paypal_plan_id")
    .eq("slug", "golden-anual")
    .maybeSingle();

  if (!golden?.activo || !golden.precio_usd) {
    return NextResponse.json(
      { error: "Golden todavía no tiene precio en USD cargado." },
      { status: 503 }
    );
  }

  let planId = golden.paypal_plan_id as string | null;
  if (!planId) {
    planId = await crearPlanGoldenPaypal(golden.precio_usd);
    await admin
      .from("productos")
      .update({ paypal_plan_id: planId })
      .eq("slug", "golden-anual");
  }

  const origin = request.nextUrl.origin;
  const { aprobarUrl } = await crearSuscripcionGoldenPaypal({
    planId,
    userId: user.id,
    returnUrl: `${origin}/api/checkout/golden/paypal/retorno`,
    cancelUrl: `${origin}/golden`,
  });

  if (!aprobarUrl) {
    return NextResponse.json({ error: "No se pudo crear la suscripción." }, { status: 502 });
  }

  return NextResponse.redirect(aprobarUrl);
}

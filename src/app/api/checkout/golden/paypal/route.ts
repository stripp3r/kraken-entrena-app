import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { crearPlanGoldenPaypal, crearSuscripcionGoldenPaypal } from "@/lib/paypal";
import type { Frecuencia } from "@/lib/suscripciones";

// Botón "Suscribirme con PayPal" de /golden (?frecuencia=mensual|anual, anual
// por default). Crea (la primera vez, por frecuencia) el plan de facturación,
// después la suscripción, y redirige a la aprobación.
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const frecuencia: Frecuencia =
    request.nextUrl.searchParams.get("frecuencia") === "mensual" ? "mensual" : "anual";
  const slug = frecuencia === "mensual" ? "golden-mensual" : "golden-anual";

  const admin = createAdminClient();
  const { data: golden } = await admin
    .from("productos")
    .select("precio_usd, activo, paypal_plan_id")
    .eq("slug", slug)
    .maybeSingle();

  if (!golden?.activo || !golden.precio_usd) {
    return NextResponse.json(
      { error: `Golden (${frecuencia}) todavía no tiene precio en USD cargado.` },
      { status: 503 }
    );
  }

  try {
    let planId = golden.paypal_plan_id as string | null;
    if (!planId) {
      planId = await crearPlanGoldenPaypal(golden.precio_usd, frecuencia);
      await admin.from("productos").update({ paypal_plan_id: planId }).eq("slug", slug);
    }

    const origin = request.nextUrl.origin;
    const { aprobarUrl } = await crearSuscripcionGoldenPaypal({
      planId,
      userId: user.id,
      frecuencia,
      returnUrl: `${origin}/api/checkout/golden/paypal/retorno`,
      cancelUrl: `${origin}/golden`,
    });

    if (!aprobarUrl) {
      return NextResponse.json({ error: "No se pudo crear la suscripción." }, { status: 502 });
    }

    return NextResponse.redirect(aprobarUrl);
  } catch (e) {
    return NextResponse.json(
      { error: "Falló el checkout de PayPal Golden", detalle: String(e) },
      { status: 500 }
    );
  }
}

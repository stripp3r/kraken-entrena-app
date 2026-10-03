import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { esPremium } from "@/lib/premium";

// "/restablecer-password" entra acá por una razón no obvia: el link del
// mail de recuperación llega con los tokens en el FRAGMENTO de la URL
// (#access_token=...), que el navegador nunca envía al servidor -- así que
// en la primera carga de esa página, este middleware la ve como una
// request sin sesión. Si no estuviera en esta lista, redirigiría a /login
// antes de que el JS del cliente llegue a leer el fragmento y establecer
// la sesión de recuperación.
const PUBLIC_PATHS = [
  "/login",
  "/registro",
  "/compra",
  "/api/checkout",
  "/api/webhooks",
  "/olvide-password",
  "/restablecer-password",
];

// Rutas que un usuario logueado SIN prueba/Golden vigente todavía puede ver
// (para pagar, ver/editar sus datos, bajar un PDF que compró, o cerrar
// sesión). Todo lo demás lo manda a /golden cuando premium_hasta venció.
// "/restablecer-password" entra acá -- la sesión de recuperación de
// contraseña no implica tener plan vigente, no corresponde mandarlo a
// /golden antes de dejarlo elegir su contraseña nueva.
const PATHS_SIN_PREMIUM = [
  "/golden",
  "/perfil",
  "/login",
  "/registro",
  "/compra",
  "/api",
  "/coach",
  "/olvide-password",
  "/restablecer-password",
];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Muro de pago: usuario logueado pero sin prueba ni Golden vigente ->
  // solo puede estar en las rutas de arriba; el resto va a /golden.
  if (user) {
    const rutaLibre = PATHS_SIN_PREMIUM.some((path) => pathname.startsWith(path));
    if (!rutaLibre) {
      const { data: perfil } = await supabase
        .from("profiles")
        .select("premium_hasta, golden_perpetuo")
        .eq("id", user.id)
        .single();

      if (!esPremium(perfil)) {
        const url = request.nextUrl.clone();
        url.pathname = "/golden";
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}

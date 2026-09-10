import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { esPremium } from "@/lib/premium";

const PUBLIC_PATHS = ["/login", "/registro", "/compra", "/api/checkout", "/api/webhooks"];

// Rutas que un usuario logueado SIN prueba/Golden vigente todavía puede ver
// (para pagar, ver/editar sus datos, bajar un PDF que compró, o cerrar
// sesión). Todo lo demás lo manda a /golden cuando premium_hasta venció.
const PATHS_SIN_PREMIUM = ["/golden", "/perfil", "/login", "/registro", "/compra", "/api"];

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

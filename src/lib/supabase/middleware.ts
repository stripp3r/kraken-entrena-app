import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { esPremium } from "@/lib/premium";
import { VERSION_LEGAL, TIPO_ACEPTACION } from "@/lib/aceptacion-legal-version";

// "/restablecer-password" entra acá porque ahí se escribe el código de
// recuperación ANTES de tener sesión -- ver "Recuperar contraseña" en
// CLAUDE.md para la vuelta completa de por qué terminó siendo un código de
// 6 dígitos tipeado a mano en vez de un link clickeable.
const PUBLIC_PATHS = [
  "/login",
  "/registro",
  "/compra",
  "/api/checkout",
  "/api/webhooks",
  "/olvide-password",
  "/restablecer-password",
  "/auth/callback",
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
  "/auth/callback",
];

// Rutas que NO exigen tener aceptados los Términos vigentes: las públicas
// (sin sesión no hay nada que exigir), los webhooks y el login social, y la
// propia pantalla de aceptación. A propósito "/api/checkout" NO está acá:
// aunque sea pública para el proxy (se llega desde el sitio web y redirige a
// /login), una cuenta que todavía no aceptó no puede llegar a pagar.
const PATHS_SIN_ACEPTACION = [
  "/login",
  "/registro",
  "/compra",
  "/api/webhooks",
  "/api/admin",
  "/olvide-password",
  "/restablecer-password",
  "/auth/callback",
  "/aceptar-terminos",
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

  // Aceptación de Términos y Privacidad: todo usuario logueado (nuevo, de
  // Google/Facebook, o previo a que existiera esto) tiene que haber aceptado
  // la VERSION_LEGAL vigente. Falla ABIERTO si la consulta da error (ej. la
  // migración 092 todavía no corrió): un error de base no puede dejar a todos
  // los clientes afuera de la app.
  if (user && !PATHS_SIN_ACEPTACION.some((path) => pathname.startsWith(path))) {
    const { data: aceptacion, error } = await supabase
      .from("aceptaciones_legales")
      .select("id")
      .eq("user_id", user.id)
      .eq("tipo", TIPO_ACEPTACION)
      .eq("version", VERSION_LEGAL)
      .limit(1);

    if (error) {
      console.error("proxy: no se pudo leer aceptaciones_legales:", error.message);
    } else if (!aceptacion?.length) {
      const url = request.nextUrl.clone();
      url.pathname = "/aceptar-terminos";
      url.search = `?next=${encodeURIComponent(pathname + request.nextUrl.search)}`;
      return NextResponse.redirect(url);
    }
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

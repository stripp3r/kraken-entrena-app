import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { esPremium } from "@/lib/premium";
import { ACEPTACIONES_REQUERIDAS, aceptacionesFaltantes } from "@/lib/aceptacion-legal-version";
import { obtenerUsuario } from "@/lib/supabase/usuario";

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
  "/api/admin",
  "/api/publico",
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
  "/api/publico",
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

  // Sesión verificada localmente (firma ES256), sin viaje a la red: ver lib/supabase/usuario.ts. Antes era
  // auth.getUser(), una consulta al servidor de Supabase en CADA navegación.
  const {
    data: { user },
  } = await obtenerUsuario(supabase);

  const pathname = request.nextUrl.pathname;
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Las dos consultas del control de acceso (aceptaciones legales y perfil para el muro de pago) se hacen EN
  // PARALELO: antes eran dos viajes a la base uno detrás del otro en cada navegación.
  const necesitaAceptacion = Boolean(user) && !PATHS_SIN_ACEPTACION.some((path) => pathname.startsWith(path));
  const necesitaPerfil = Boolean(user) && !PATHS_SIN_PREMIUM.some((path) => pathname.startsWith(path));
  const [resAceptaciones, resPerfil] = await Promise.all([
    necesitaAceptacion && user
      ? supabase
          .from("aceptaciones_legales")
          .select("tipo, version")
          .eq("user_id", user.id)
          .in("tipo", ACEPTACIONES_REQUERIDAS.map((a) => a.tipo))
      : null,
    necesitaPerfil && user
      ? supabase.from("profiles").select("premium_hasta, golden_perpetuo").eq("id", user.id).single()
      : null,
  ]);

  // Aceptación de Términos y Privacidad: todo usuario logueado (nuevo, de Google/Facebook, o previo a que
  // existiera esto) tiene que haber aceptado la VERSION_LEGAL vigente (Términos y Privacidad + mayor de 18 +
  // consentimiento de transferencia internacional: las tres con su versión vigente, aceptacion-legal-version.ts).
  // Falla ABIERTO si la consulta da error (ej. la migración 092 todavía no corrió): un error de base no puede
  // dejar a todos los clientes afuera de la app.
  if (resAceptaciones) {
    const { data: aceptaciones, error } = resAceptaciones;
    if (error) {
      console.error("proxy: no se pudo leer aceptaciones_legales:", error.message);
    } else if (aceptacionesFaltantes(aceptaciones ?? []).length > 0) {
      const url = request.nextUrl.clone();
      url.pathname = "/aceptar-terminos";
      url.search = `?next=${encodeURIComponent(pathname + request.nextUrl.search)}`;
      return NextResponse.redirect(url);
    }
  }

  // Muro de pago: usuario logueado pero sin prueba ni Golden vigente -> solo puede estar en las rutas libres;
  // el resto va a /golden.
  if (resPerfil && !esPremium(resPerfil.data)) {
    const url = request.nextUrl.clone();
    url.pathname = "/golden";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

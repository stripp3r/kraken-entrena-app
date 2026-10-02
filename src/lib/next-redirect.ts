import { NextRequest, NextResponse } from "next/server";

// Usado por las rutas de checkout que exigen sesión: si no hay usuario,
// manda a /login preservando a dónde quería ir (?next=...) para que
// login()/signup() (src/app/login/actions.ts) puedan retomarlo solos al
// terminar, en vez de dejar al usuario varado en Inicio después de
// loguearse/registrarse.
export function redirigirALogin(request: NextRequest): NextResponse {
  const next = encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(new URL(`/login?next=${next}`, request.url));
}

// Valida que "next" sea una ruta relativa DENTRO de la app -- nunca se
// redirige a una URL absoluta, para no abrir un open-redirect. "//evil.com"
// se rechaza explícitamente además de cualquier cosa que no empiece con
// "/": el navegador lo resuelve como protocol-relative (va a "evil.com"),
// así que "empieza con una sola barra" no alcanza para considerarlo seguro.
export function rutaSiguienteSegura(next: FormDataEntryValue | null): string | null {
  if (typeof next !== "string" || !next) return null;
  if (!next.startsWith("/") || next.startsWith("//")) return null;
  return next;
}

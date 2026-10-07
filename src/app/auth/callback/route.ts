import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rutaSiguienteSegura } from "@/lib/next-redirect";

// Vuelta del login social (Google / Facebook): Supabase redirige acá con
// ?code=... (flujo PKCE). Es un Route Handler porque solo acá se pueden fijar
// las cookies de sesión al canjear el código -- un Server Component no puede.
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const next = rutaSiguienteSegura(searchParams.get("next"));
  const sufijoNext = next ? `&next=${encodeURIComponent(next)}` : "";

  // El usuario canceló en la pantalla de Google/Facebook (o el proveedor
  // devolvió un error): no es un fallo de la app, se vuelve al login con un
  // mensaje, sin dejar el parámetro técnico a la vista.
  if (!code) {
    const msg = searchParams.get("error") ? "Cancelaste el ingreso." : "No pudimos completar el ingreso.";
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(msg)}${sufijoNext}`, request.url)
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent("No pudimos completar el ingreso. Probá de nuevo.")}${sufijoNext}`,
        request.url
      )
    );
  }

  // Una cuenta recién creada por login social todavía no tiene datos
  // personales (nombre, objetivo, etc.) -- igual que con el registro por
  // email, pasan primero por /perfil/datos y recién ahí siguen a `next`.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: perfil } = await supabase.from("profiles").select("nombre").eq("id", user.id).maybeSingle();
    if (!perfil?.nombre) {
      return NextResponse.redirect(
        new URL(next ? `/perfil/datos?next=${encodeURIComponent(next)}` : "/perfil/datos", request.url)
      );
    }
  }

  return NextResponse.redirect(new URL(next ?? "/", request.url));
}

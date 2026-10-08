import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { permisos } from "@/lib/premium";
import { productoPdfConAcceso } from "@/lib/pdf-acceso";

// Entrega los bytes del PDF de un plan autoguiado SOLO al visor de la app
// (planes de pago único: se lee dentro de la app, no se descarga -- así el
// arrepentimiento de 14 días aplica sin excepciones, ver "Cumplimiento
// legal" en CLAUDE.md).
//
// Qué hace y qué NO hace, con honestidad: el archivo nunca se expone con una
// URL pública ni firmada, la ruta exige sesión + compra aprobada, responde
// `no-store` y rechaza las navegaciones directas del navegador (abrir la URL
// en una pestaña para "Guardar como"). NO puede impedir que alguien técnico
// reconstruya el archivo desde las peticiones del visor, ni una captura de
// pantalla: el objetivo es no ENTREGAR el archivo, no blindarlo.
const DESTINOS_NO_PERMITIDOS = new Set(["document", "iframe", "frame", "embed", "object"]);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ producto: string }> }
) {
  const destino = request.headers.get("sec-fetch-dest");
  const sitio = request.headers.get("sec-fetch-site");
  if ((destino && DESTINOS_NO_PERMITIDOS.has(destino)) || sitio === "cross-site") {
    return new NextResponse("No disponible", { status: 403, headers: { "Cache-Control": "no-store" } });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new NextResponse("No autenticado", { status: 401, headers: { "Cache-Control": "no-store" } });
  }

  // Mismo criterio que la pantalla Mis PDFs (permisos().misPdfs): un acceso
  // vencido no ve el PDF, igual que no lo ve en la lista.
  const { data: profile } = await supabase
    .from("profiles")
    .select("premium_hasta, golden_perpetuo, premium_origen")
    .eq("id", user.id)
    .single();
  if (!permisos(profile).misPdfs) {
    return new NextResponse("Sin acceso", { status: 403, headers: { "Cache-Control": "no-store" } });
  }

  const { producto: slug } = await params;
  const acceso = await productoPdfConAcceso(user.id, slug);
  if (!acceso) {
    return new NextResponse("Sin acceso", { status: 403, headers: { "Cache-Control": "no-store" } });
  }

  const { data: archivo, error } = await createAdminClient().storage.from("productos").download(acceso.path);
  if (error || !archivo) {
    return new NextResponse("No se pudo leer el archivo", { status: 500, headers: { "Cache-Control": "no-store" } });
  }

  return new NextResponse(await archivo.arrayBuffer(), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline",
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex",
    },
  });
}

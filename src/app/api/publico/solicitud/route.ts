import { NextRequest, NextResponse } from "next/server";
import { procesarSolicitudPublica } from "@/lib/solicitud-publica";

// Endpoint PÚBLICO (sin login) del formulario de arrepentimiento y baja del
// sitio. Contrato en CLAUDE.md. CORS: SOLO https://fit.krakenbrand.com.
//
//   POST /api/publico/solicitud
//   { "tipo": "arrepentimiento" | "baja", "email": "...", "producto"?: "...",
//     "numeroOperacion"?: "...", "website": "" }   <- "website" es el honeypot
//   200 { ok, codigo, recibidaAt, tipo, constanciaEnviadaPorEmail, verificada }
//   400/429/500 { ok:false, error }

const ORIGEN_PERMITIDO = "https://fit.krakenbrand.com";

function cabecerasCors(origin: string | null): Record<string, string> {
  return origin === ORIGEN_PERMITIDO
    ? {
        "Access-Control-Allow-Origin": ORIGEN_PERMITIDO,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
        Vary: "Origin",
      }
    : { Vary: "Origin" };
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: cabecerasCors(request.headers.get("origin")) });
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const cors = cabecerasCors(origin);

  // Solo se acepta desde el sitio. Para llamadas servidor a servidor (la
  // automatización del coach) existe /api/admin/solicitudes con secreto.
  if (origin !== ORIGEN_PERMITIDO) {
    return NextResponse.json({ ok: false, error: "Origen no permitido" }, { status: 403, headers: cors });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Cuerpo JSON inválido" }, { status: 400, headers: cors });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "desconocida";
  const r = await procesarSolicitudPublica(body, ip);

  if (!r.ok) return NextResponse.json({ ok: false, error: r.error }, { status: r.status, headers: cors });
  return NextResponse.json(r, { status: 200, headers: cors });
}

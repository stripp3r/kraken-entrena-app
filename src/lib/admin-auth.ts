import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

// Auth de las rutas /api/admin/*: secreto compartido en ADMIN_API_SECRET
// (env de Vercel y .env.local), enviado como `Authorization: Bearer <secreto>`.
// Estas rutas NO tienen sesión de usuario (las llama la automatización del
// coach), por eso están en PUBLIC_PATHS del proxy: el secreto es la única
// barrera. Si la variable no está definida las rutas quedan cerradas (503),
// nunca abiertas.
export function exigirSecretoAdmin(request: NextRequest): NextResponse | null {
  const esperado = process.env.ADMIN_API_SECRET;
  if (!esperado || esperado.length < 24) {
    return NextResponse.json({ error: "ADMIN_API_SECRET no configurado" }, { status: 503 });
  }

  const recibido = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const a = Buffer.from(recibido);
  const b = Buffer.from(esperado);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return null;
}

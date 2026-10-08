import { NextRequest, NextResponse } from "next/server";
import { exigirSecretoAdmin } from "@/lib/admin-auth";
import { borrarCuentaCompleta } from "@/lib/borrar-cuenta";

// Borrado de cuenta (derecho de supresión). IRREVERSIBLE. Protegido con
// ADMIN_API_SECRET. Cuerpo JSON:
//   { accion: "verificar", email }                       -> qué se borraría (no borra nada)
//   { accion: "borrar", email, confirmarEmail: <igual> } -> borra todo (ver src/lib/borrar-cuenta.ts)
// `confirmarEmail` tiene que repetir el email EXACTO: evita borrar una cuenta
// por un error de tipeo o un parámetro mal armado.
const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);

export async function POST(request: NextRequest) {
  const denegado = exigirSecretoAdmin(request);
  if (denegado) return denegado;

  const body = await request.json().catch(() => null);
  const email = str(body?.email);
  if (!email) return NextResponse.json({ error: "Falta email" }, { status: 400 });

  if (body.accion === "verificar") {
    const r = await borrarCuentaCompleta({ email, soloVerificar: true });
    return NextResponse.json(r, { status: r.error ? 422 : 200 });
  }

  if (body.accion === "borrar") {
    if (str(body.confirmarEmail)?.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: "confirmarEmail debe repetir el email exacto" }, { status: 400 });
    }
    const r = await borrarCuentaCompleta({ email });
    return NextResponse.json(r, { status: r.error ? 422 : 200 });
  }

  return NextResponse.json({ error: "accion desconocida" }, { status: 400 });
}

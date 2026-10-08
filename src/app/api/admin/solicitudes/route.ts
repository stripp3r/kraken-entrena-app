import { NextRequest, NextResponse } from "next/server";
import { exigirSecretoAdmin } from "@/lib/admin-auth";
import {
  registrarSolicitud,
  actualizarSolicitud,
  cancelarSuscripcion,
  revocarCompra,
  type TipoSolicitud,
  type MedioSolicitud,
  type EstadoSolicitud,
} from "@/lib/solicitudes";

// Puerta HTTP (protegida con ADMIN_API_SECRET) a las funciones de
// src/lib/solicitudes.ts, para la automatización de arrepentimiento y baja.
// Cuerpo JSON con { accion, ...parametros }. Documentado en CLAUDE.md
// ("Cumplimiento legal").
//
//   registrar            { tipo, medio, contacto, emailCuenta?, productoSlug?, notas? } -> { codigo }
//   actualizar           { codigo, estado, notas? }
//   cancelar_suscripcion { email } | { suscripcionId }
//   revocar_compra       { email, productoSlug, compraId? }
const TIPOS: TipoSolicitud[] = ["arrepentimiento", "baja"];
const MEDIOS: MedioSolicitud[] = ["whatsapp", "email", "app"];
const ESTADOS: EstadoSolicitud[] = ["recibida", "codigo_enviado", "procesada", "rechazada"];

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);

export async function POST(request: NextRequest) {
  const denegado = exigirSecretoAdmin(request);
  if (denegado) return denegado;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Cuerpo JSON inválido" }, { status: 400 });
  }

  let resultado: { error?: string } & Record<string, unknown>;

  switch (body.accion) {
    case "registrar": {
      if (!TIPOS.includes(body.tipo) || !MEDIOS.includes(body.medio) || !str(body.contacto)) {
        return NextResponse.json({ error: "Faltan o son inválidos: tipo, medio, contacto" }, { status: 400 });
      }
      resultado = await registrarSolicitud({
        tipo: body.tipo,
        medio: body.medio,
        contacto: str(body.contacto)!,
        emailCuenta: str(body.emailCuenta),
        productoSlug: str(body.productoSlug),
        notas: str(body.notas),
      });
      break;
    }
    case "actualizar": {
      if (!str(body.codigo) || !ESTADOS.includes(body.estado)) {
        return NextResponse.json({ error: "Faltan o son inválidos: codigo, estado" }, { status: 400 });
      }
      resultado = await actualizarSolicitud(str(body.codigo)!, { estado: body.estado, notas: str(body.notas) });
      break;
    }
    case "cancelar_suscripcion": {
      const suscripcionId = Number.isInteger(body.suscripcionId) ? (body.suscripcionId as number) : undefined;
      if (!str(body.email) && suscripcionId == null) {
        return NextResponse.json({ error: "Falta email o suscripcionId" }, { status: 400 });
      }
      resultado = await cancelarSuscripcion({ email: str(body.email), suscripcionId });
      break;
    }
    case "revocar_compra": {
      if (!str(body.email) || !str(body.productoSlug)) {
        return NextResponse.json({ error: "Faltan: email, productoSlug" }, { status: 400 });
      }
      resultado = await revocarCompra({
        email: str(body.email)!,
        productoSlug: str(body.productoSlug)!,
        compraId: Number.isInteger(body.compraId) ? (body.compraId as number) : undefined,
      });
      break;
    }
    default:
      return NextResponse.json({ error: "accion desconocida" }, { status: 400 });
  }

  return NextResponse.json(resultado, { status: resultado.error ? 422 : 200 });
}

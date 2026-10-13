import { NextRequest, NextResponse } from "next/server";
import { exigirSecretoAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { reintentarPendientes } from "@/lib/email";
import { reclamarCompraParaUsuario } from "@/lib/compras";
import { procesarAvisosVencidos } from "@/lib/aviso-precio-servidor";
import {
  registrarSolicitud,
  actualizarSolicitud,
  cancelarSuscripcion,
  revocarCompra,
  procesarSolicitud,
  registrarReembolsoHecho,
  buscarUsuarioPorEmail,
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
//   procesar             { codigo }  -> ejecuta la baja/arrepentimiento registrado (cancela
//                        la suscripción o revoca la compra, crea la tarea de reembolso y
//                        marca la solicitud como procesada)
//   reembolso_hecho      { codigo? , tareaId?, importe, moneda, fecha?, referencia? } -> deja
//                        asentado el reembolso manual, cierra la tarea y avisa a la persona
//   pendientes           {} -> solicitudes sin procesar, tareas de reembolso y emails sin enviar
//   vincular_compra      { emailCuenta, compraId? | pagoId? } -> enlaza a mano una compra sin
//                        cuenta a la cuenta de ese email (recuperación de compra, camino admin)
//   reintentar_emails    {} -> reenvía la bandeja de emails pendientes/con error
//   avisos_precio_vencidos { ejecutar?: boolean, diasAntes?: number } -> lista (o, con
//                        ejecutar:true, CANCELA) las suscripciones que no respondieron un
//                        aviso de cambio de precio cuya vigencia llegó. Correr 1 vez por día.
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
    case "procesar": {
      if (!str(body.codigo)) return NextResponse.json({ error: "Falta codigo" }, { status: 400 });
      resultado = await procesarSolicitud(str(body.codigo)!);
      break;
    }
    case "reembolso_hecho": {
      const importe = typeof body.importe === "number" ? body.importe : NaN;
      if (!Number.isFinite(importe) || !str(body.moneda) || (!str(body.codigo) && !Number.isInteger(body.tareaId))) {
        return NextResponse.json({ error: "Faltan: importe, moneda y codigo o tareaId" }, { status: 400 });
      }
      resultado = await registrarReembolsoHecho({
        codigo: str(body.codigo),
        tareaId: Number.isInteger(body.tareaId) ? (body.tareaId as number) : undefined,
        importe,
        moneda: str(body.moneda)!,
        fecha: str(body.fecha),
        referencia: str(body.referencia),
      });
      break;
    }
    case "pendientes": {
      const admin = createAdminClient();
      const [sol, tareas, mails] = await Promise.all([
        admin.from("solicitudes_baja_arrepentimiento").select("codigo, tipo, medio, email_cuenta, producto_slug, verificacion, recibida_at, estado").not("estado", "in", "(procesada,rechazada)").order("recibida_at"),
        admin.from("tareas_reembolso").select("id, motivo, proveedor, proveedor_payment_id, email, monto, moneda, solicitud_codigo, creada_at").eq("estado", "pendiente").order("creada_at"),
        admin.from("emails_salientes").select("id, tipo, ref, para, estado, intentos, error, creado_at").in("estado", ["pendiente", "error"]).order("id"),
      ]);
      resultado = { ok: true, solicitudes: sol.data ?? [], tareasReembolso: tareas.data ?? [], emailsSinEnviar: mails.data ?? [] };
      break;
    }
    case "vincular_compra": {
      if (!str(body.emailCuenta) || (!Number.isInteger(body.compraId) && !str(body.pagoId))) {
        return NextResponse.json({ error: "Faltan: emailCuenta y compraId o pagoId" }, { status: 400 });
      }
      const userId = await buscarUsuarioPorEmail(str(body.emailCuenta)!);
      if (!userId) return NextResponse.json({ error: `No existe una cuenta con el email ${body.emailCuenta}` }, { status: 422 });
      let compraId = Number.isInteger(body.compraId) ? (body.compraId as number) : null;
      if (compraId == null) {
        const { data } = await createAdminClient().from("compras").select("id").eq("proveedor_payment_id", str(body.pagoId)!).maybeSingle();
        compraId = (data?.id as number | undefined) ?? null;
      }
      if (compraId == null) return NextResponse.json({ error: "No se encontró esa compra" }, { status: 422 });
      resultado = await reclamarCompraParaUsuario(compraId, userId);
      break;
    }
    case "avisos_precio_vencidos": {
      resultado = await procesarAvisosVencidos({
        ejecutar: body.ejecutar === true,
        diasAntes: Number.isInteger(body.diasAntes) ? (body.diasAntes as number) : 1,
      });
      break;
    }
    case "reintentar_emails": {
      resultado = { ok: true, ...(await reintentarPendientes()) };
      break;
    }
    default:
      return NextResponse.json({ error: "accion desconocida" }, { status: 400 });
  }

  return NextResponse.json(resultado, { status: resultado.error ? 422 : 200 });
}

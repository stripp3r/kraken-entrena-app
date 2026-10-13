import { createHash } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { avisarCoach, enviarEmail } from "@/lib/email";
import { constanciaSolicitud } from "@/lib/emails-plantillas";
import {
  buscarUsuarioPorEmail,
  cancelarSuscripcion,
  registrarSolicitud,
  type TipoSolicitud,
} from "@/lib/solicitudes";

// Lógica del endpoint PÚBLICO de arrepentimiento y baja (adenda legal B),
// llamado desde el formulario del sitio fit.krakenbrand.com sin login.
// Contrato completo en CLAUDE.md ("Endpoint público de arrepentimiento y baja").

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;
const MAX_POR_IP_POR_HORA = 5;
const MAX_POR_EMAIL_POR_DIA = 3;

function hashIp(ip: string) {
  return createHash("sha256")
    .update(`${ip}|${process.env.ADMIN_API_SECRET ?? "kraken"}`)
    .digest("hex")
    .slice(0, 32);
}

async function excedeLimite(clave: string, max: number, ventanaMs: number) {
  const admin = createAdminClient();
  const desde = new Date(Date.now() - ventanaMs).toISOString();
  const { count } = await admin
    .from("limites_publicos")
    .select("id", { count: "exact", head: true })
    .eq("clave", clave)
    .gte("creado_at", desde);
  if ((count ?? 0) >= max) return true;
  await admin.from("limites_publicos").insert({ clave });
  return false;
}

export type EntradaSolicitudPublica = {
  tipo: unknown;
  email: unknown;
  producto?: unknown;
  numeroOperacion?: unknown;
  website?: unknown; // honeypot: los humanos lo dejan vacío
};

export type ResultadoSolicitudPublica =
  | { ok: true; codigo: string; recibidaAt: string; tipo: TipoSolicitud; constanciaEnviadaPorEmail: boolean; verificada: boolean }
  | { ok: false; status: 400 | 429 | 500; error: string };

const texto = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function procesarSolicitudPublica(entrada: EntradaSolicitudPublica, ip: string): Promise<ResultadoSolicitudPublica> {
  // Honeypot: si un bot lo completó, se responde como si hubiera salido bien
  // (para no darle feedback) pero no se registra nada.
  if (texto(entrada.website, 200)) {
    return { ok: true, codigo: "SIN-REGISTRO", recibidaAt: new Date().toISOString(), tipo: "baja", constanciaEnviadaPorEmail: false, verificada: false };
  }

  const tipo = entrada.tipo === "arrepentimiento" || entrada.tipo === "baja" ? entrada.tipo : null;
  const email = texto(entrada.email, 254).toLowerCase();
  if (!tipo) return { ok: false, status: 400, error: "tipo debe ser 'arrepentimiento' o 'baja'." };
  if (!EMAIL_RE.test(email)) return { ok: false, status: 400, error: "Ingresá el email que usaste en la compra." };

  const producto = texto(entrada.producto, 80);
  const numeroOperacion = texto(entrada.numeroOperacion, 64);
  const ipHash = hashIp(ip);

  if (await excedeLimite(`ip:${ipHash}`, MAX_POR_IP_POR_HORA, 3600_000)) {
    return { ok: false, status: 429, error: "Demasiados intentos. Probá de nuevo en un rato o escribinos por WhatsApp." };
  }
  if (await excedeLimite(`email:${email}`, MAX_POR_EMAIL_POR_DIA, 86400_000)) {
    return { ok: false, status: 429, error: "Ya recibimos solicitudes de este email hoy. Revisá tu casilla (incluido spam) o escribinos por WhatsApp." };
  }

  const admin = createAdminClient();

  // ¿Qué compra / suscripción tiene ese email? (verificación razonable por el
  // email de la compra, sin pedir login ni motivo.)
  const userId = await buscarUsuarioPorEmail(email);
  let productoSlug: string | null = null;
  let productoNombre: string | null = null;
  if (producto) {
    const { data: pr } = await admin.from("productos").select("slug, nombre").eq("slug", producto.toLowerCase()).maybeSingle();
    if (pr) {
      productoSlug = pr.slug as string;
      productoNombre = pr.nombre as string;
    }
  }

  // Dos consultas (en vez de un .or() armado con texto) para que un email con
  // caracteres raros nunca pueda alterar el filtro.
  const columnas = "id, producto_id, proveedor, proveedor_payment_id, created_at, plazo_legal_vence, plazo_comercial_vence, user_id, productos(slug, nombre)";
  const { data: porEmail } = await admin.from("compras").select(columnas).eq("estado", "aprobado").eq("email_comprador", email);
  const { data: porUsuario } = userId
    ? await admin.from("compras").select(columnas).eq("estado", "aprobado").eq("user_id", userId)
    : { data: [] as NonNullable<typeof porEmail> };
  const vistos = new Set<number>();
  const compras = [...(porEmail ?? []), ...(porUsuario ?? [])]
    .filter((c) => (vistos.has(c.id) ? false : (vistos.add(c.id), true)))
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  type FilaCompra = (typeof compras)[number];
  const slugDe = (c: FilaCompra) => {
    const pr = Array.isArray(c.productos) ? c.productos[0] : c.productos;
    return (pr as { slug?: string } | null)?.slug ?? null;
  };
  const nombreDe = (c: FilaCompra) => {
    const pr = Array.isArray(c.productos) ? c.productos[0] : c.productos;
    return (pr as { nombre?: string } | null)?.nombre ?? null;
  };
  const compra = (compras ?? []).find((c) => !productoSlug || slugDe(c) === productoSlug) ?? null;

  const { data: subs } = userId
    ? await admin.from("suscripciones").select("id, estado, producto_slug").eq("user_id", userId).in("estado", ["activa", "pausada"]).order("id", { ascending: false })
    : { data: [] as { id: number; estado: string; producto_slug: string | null }[] };
  const sub = (subs ?? [])[0] ?? null;

  const verificada = tipo === "arrepentimiento" ? Boolean(compra || sub) : Boolean(sub || compra);
  if (!productoSlug && compra) {
    productoSlug = slugDe(compra);
    productoNombre = nombreDe(compra);
  }
  if (!productoSlug && sub?.producto_slug) productoSlug = sub.producto_slug;

  const reg = await registrarSolicitud({
    tipo,
    medio: "web",
    contacto: email,
    emailCuenta: email,
    productoSlug,
    notas: producto && !productoNombre ? `Producto indicado por la persona: ${producto}` : null,
    extra: {
      compra_id: compra?.id ?? null,
      suscripcion_id: sub?.id ?? null,
      verificacion: verificada ? "email_coincide" : "no_verificada",
      ip_hash: ipHash,
      numero_operacion: numeroOperacion || null,
      // El código se muestra en pantalla en esta misma respuesta: queda informado ya.
      estado: "codigo_enviado",
      codigo_informado_at: new Date().toISOString(),
    },
  });
  if (!("ok" in reg) || !reg.ok) return { ok: false, status: 500, error: "No pudimos registrar tu solicitud. Escribinos por WhatsApp." };

  const plantilla = constanciaSolicitud({ tipo, codigo: reg.codigo, recibidaAt: reg.recibidaAt, producto: productoNombre, verificada });
  const envio = await enviarEmail({ tipo: `constancia_${tipo}`, ref: reg.codigo, para: email, ...plantilla });
  const constanciaEnviadaPorEmail = envio.estado === "enviado" || envio.estado === "yaEnviado";
  if (constanciaEnviadaPorEmail) {
    await admin.from("solicitudes_baja_arrepentimiento").update({ constancia_enviada_at: new Date().toISOString() }).eq("codigo", reg.codigo);
  }

  const dentroDePlazo = compra?.plazo_comercial_vence ? compra.plazo_comercial_vence >= new Date().toISOString().slice(0, 10) : null;
  await avisarCoach({
    tipo: `solicitud_${tipo}`,
    ref: reg.codigo,
    asunto: `${tipo === "baja" ? "BAJA" : "ARREPENTIMIENTO"} ${reg.codigo}`,
    lineas: [
      `Código: ${reg.codigo} (${tipo}, canal web)`,
      `Email: ${email}`,
      `Producto: ${productoNombre ?? producto ?? "(no indicado)"}`,
      numeroOperacion ? `N° de operación indicado: ${numeroOperacion}` : "Sin n° de operación.",
      verificada ? "Verificada: el email coincide con una compra/suscripción." : "NO verificada: el email no coincide con ninguna compra/suscripción. Revisar a mano.",
      tipo === "arrepentimiento" && dentroDePlazo !== null ? (dentroDePlazo ? "Dentro del plazo de 14 días: reembolso del 100% sin excepciones." : "FUERA del plazo comercial de 14 días (decidir).") : "",
      `Para ejecutarla: POST /api/admin/solicitudes {"accion":"procesar","codigo":"${reg.codigo}"}`,
      "La constancia ya se envió por email y el código se mostró en pantalla.",
    ].filter(Boolean),
  });

  // Opcional (apagado por defecto): ejecutar solas las bajas VERIFICADAS. Se deja
  // apagado a propósito: cualquiera que conozca un email podría cortar la
  // renovación de otra persona. Activar con SOLICITUDES_AUTOPROCESAR_BAJA=1.
  if (tipo === "baja" && verificada && sub && process.env.SOLICITUDES_AUTOPROCESAR_BAJA === "1") {
    const r = await cancelarSuscripcion({ email });
    if (r.ok) await admin.from("solicitudes_baja_arrepentimiento").update({ estado: "procesada", resuelta_at: new Date().toISOString(), responsable: "automatico" }).eq("codigo", reg.codigo);
  }

  return { ok: true, codigo: reg.codigo, recibidaAt: reg.recibidaAt, tipo, constanciaEnviadaPorEmail, verificada };
}

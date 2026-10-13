import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { avisarCoach, enviarEmail } from "@/lib/email";
import { codigoReclamoCompra } from "@/lib/emails-plantillas";
import { reclamarCompraParaUsuario } from "@/lib/compras";

// "¿Ya compraste y no ves tu plan?": recupera una compra hecha con un email
// DISTINTO al de la cuenta (ej. pagó con uno y entró con Google con otro).
//
// Decisión (2026-10-13): código de 6 dígitos enviado al email de la compra.
// Para desbloquear hay que demostrar que ese email es tuyo (recibir el código);
// tipear el email solo no alcanza. Trade-off vs. un link: el código se escribe
// a mano (no lo consume un preview automático del cliente de correo) y vence en
// 30 minutos con máximo 5 intentos. Alternativa mínima para casos raros: la
// acción admin `vincular_compra` de /api/admin/solicitudes.
//
// Anti-enumeración: la respuesta es la misma exista o no una compra con ese
// email, y solo se manda email si existe (no se puede usar para spamear casillas).

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;
const MINUTOS_VIGENCIA = 30;
const MAX_INTENTOS = 5;
const MAX_CODIGOS_POR_HORA = 3;

const hashCodigo = (codigo: string, reclamoId: number, userId: string) =>
  createHash("sha256").update(`${codigo}|${reclamoId}|${userId}`).digest("hex");

export async function solicitarCodigoReclamo(userId: string, emailCompraCrudo: string) {
  const emailCompra = emailCompraCrudo.trim().toLowerCase();
  if (!EMAIL_RE.test(emailCompra)) return { error: "Ingresá un email válido." };

  const admin = createAdminClient();

  const desde = new Date(Date.now() - 3600_000).toISOString();
  const { count } = await admin
    .from("limites_publicos")
    .select("id", { count: "exact", head: true })
    .eq("clave", `reclamo:${userId}`)
    .gte("creado_at", desde);
  if ((count ?? 0) >= MAX_CODIGOS_POR_HORA) {
    return { error: "Pediste varios códigos seguidos. Probá de nuevo en una hora." };
  }
  await admin.from("limites_publicos").insert({ clave: `reclamo:${userId}` });

  const { data: compras } = await admin
    .from("compras")
    .select("id")
    .eq("estado", "aprobado")
    .is("user_id", null)
    .eq("email_comprador", emailCompra)
    .limit(1);

  if (compras?.length) {
    const codigo = String(randomInt(0, 1_000_000)).padStart(6, "0");
    const { data: reclamo } = await admin
      .from("reclamos_compra")
      .insert({
        user_id: userId,
        email_compra: emailCompra,
        codigo_hash: "pendiente",
        expira_at: new Date(Date.now() + MINUTOS_VIGENCIA * 60_000).toISOString(),
      })
      .select("id")
      .single();
    if (reclamo) {
      await admin.from("reclamos_compra").update({ codigo_hash: hashCodigo(codigo, reclamo.id as number, userId) }).eq("id", reclamo.id);
      await enviarEmail({ tipo: "reclamo_codigo", ref: String(reclamo.id), para: emailCompra, ...codigoReclamoCompra(codigo) });
    }
  }

  return { ok: true };
}

export async function confirmarCodigoReclamo(userId: string, emailCompraCrudo: string, codigoCrudo: string) {
  const emailCompra = emailCompraCrudo.trim().toLowerCase();
  const codigo = codigoCrudo.replace(/\D/g, "");
  if (!EMAIL_RE.test(emailCompra) || codigo.length !== 6) return { error: "Revisá el email y el código de 6 dígitos." };

  const admin = createAdminClient();
  const { data: reclamo } = await admin
    .from("reclamos_compra")
    .select("id, codigo_hash, intentos, expira_at")
    .eq("user_id", userId)
    .eq("email_compra", emailCompra)
    .is("usado_at", null)
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  const generico = { error: "El código no es válido o venció. Pedí uno nuevo." };
  if (!reclamo || new Date(reclamo.expira_at as string).getTime() < Date.now() || (reclamo.intentos as number) >= MAX_INTENTOS) {
    return generico;
  }

  await admin.from("reclamos_compra").update({ intentos: (reclamo.intentos as number) + 1 }).eq("id", reclamo.id);

  const esperado = Buffer.from(reclamo.codigo_hash as string);
  const recibido = Buffer.from(hashCodigo(codigo, reclamo.id as number, userId));
  if (esperado.length !== recibido.length || !timingSafeEqual(esperado, recibido)) return generico;

  await admin.from("reclamos_compra").update({ usado_at: new Date().toISOString() }).eq("id", reclamo.id);

  const { data: compras } = await admin
    .from("compras")
    .select("id")
    .eq("estado", "aprobado")
    .is("user_id", null)
    .eq("email_comprador", emailCompra);

  let enlazadas = 0;
  for (const c of compras ?? []) {
    const r = await reclamarCompraParaUsuario(c.id as number, userId);
    if (r.ok) enlazadas++;
  }

  if (enlazadas > 0) {
    const { data: u } = await admin.auth.admin.getUserById(userId);
    await avisarCoach({
      tipo: "compra_reclamada",
      ref: String(reclamo.id),
      asunto: "Compra recuperada con otro email",
      lineas: [`Cuenta: ${u.user?.email ?? userId}`, `Email de la compra: ${emailCompra}`, `Compras enlazadas: ${enlazadas}`, "Verificado con código enviado al email de la compra."],
    });
  }

  return { ok: true, enlazadas };
}

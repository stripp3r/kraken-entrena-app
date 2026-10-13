import { createAdminClient } from "@/lib/supabase/admin";

// Envío de emails de la app (server-only). TODO email pasa por la tabla
// `emails_salientes` (migración 100): queda registrado (evidencia de
// constancias/comprobantes) y es idempotente por (tipo, ref) -- un reintento
// del webhook o un doble click no manda el mismo email dos veces.
//
// Proveedor: Resend (API REST, sin dependencias). Variables de entorno:
//   RESEND_API_KEY  clave de la API de Resend
//   MAIL_FROM       remitente verificado en Resend, ej. "KRAKEN <hola@krakenbrand.com>"
//   COACH_EMAIL     dónde llegan los avisos al coach (compras, bajas, rechazos)
// Si falta RESEND_API_KEY o MAIL_FROM el email queda en estado 'pendiente' en la
// tabla y se manda después con reintentarPendientes() (POST /api/admin/emails).
// Nunca lanza: un problema de email jamás tiene que romper un webhook de pago.

const PLACEHOLDER_COACH = "COACH_EMAIL-no-configurado";

export const escaparHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export type EmailSaliente = {
  tipo: string;
  ref: string;
  para: string;
  asunto: string;
  html: string;
  texto?: string;
};

async function mandarPorResend(e: Pick<EmailSaliente, "para" | "asunto" | "html" | "texto"> & { idem: string }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;
  if (!key || !from) return { configurado: false as const };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "Idempotency-Key": e.idem,
    },
    body: JSON.stringify({ from, to: [e.para], subject: e.asunto, html: e.html, text: e.texto }),
  });
  const cuerpo = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
  if (!res.ok) return { configurado: true as const, ok: false as const, error: cuerpo.message ?? `HTTP ${res.status}` };
  return { configurado: true as const, ok: true as const, id: cuerpo.id ?? null };
}

export async function enviarEmail(e: EmailSaliente): Promise<{ estado: "enviado" | "pendiente" | "error" | "yaEnviado" }> {
  try {
    const admin = createAdminClient();

    const { data: existente } = await admin
      .from("emails_salientes")
      .select("id, estado")
      .eq("tipo", e.tipo)
      .eq("ref", e.ref)
      .maybeSingle();
    if (existente?.estado === "enviado") return { estado: "yaEnviado" };

    let id = existente?.id as number | undefined;
    if (!id) {
      const { data: nueva, error } = await admin
        .from("emails_salientes")
        .insert({ tipo: e.tipo, ref: e.ref, para: e.para, asunto: e.asunto, html: e.html, texto: e.texto ?? null })
        .select("id")
        .single();
      if (error || !nueva) {
        console.error("email: no se pudo registrar en emails_salientes:", error?.message);
        return { estado: "error" };
      }
      id = nueva.id as number;
    }

    const r = await mandarPorResend({ para: e.para, asunto: e.asunto, html: e.html, texto: e.texto, idem: `${e.tipo}:${e.ref}` });
    if (!r.configurado) return { estado: "pendiente" };

    if (r.ok) {
      await admin
        .from("emails_salientes")
        .update({ estado: "enviado", proveedor_id: r.id, enviado_at: new Date().toISOString(), error: null })
        .eq("id", id);
      return { estado: "enviado" };
    }

    const { data: fila } = await admin.from("emails_salientes").select("intentos").eq("id", id).single();
    await admin
      .from("emails_salientes")
      .update({ estado: "error", error: r.error, intentos: ((fila?.intentos as number) ?? 0) + 1 })
      .eq("id", id);
    console.error("email: Resend rechazó el envío:", r.error);
    return { estado: "error" };
  } catch (err) {
    console.error("email: fallo inesperado:", err instanceof Error ? err.message : err);
    return { estado: "error" };
  }
}

// Aviso al coach (COACH_EMAIL). Idempotente por (tipo, ref).
export async function avisarCoach({
  tipo,
  ref,
  asunto,
  lineas,
}: {
  tipo: string;
  ref: string;
  asunto: string;
  lineas: string[];
}) {
  const para = process.env.COACH_EMAIL?.trim() || PLACEHOLDER_COACH;
  const html = `<div style="font-family:Arial,sans-serif;font-size:14px;color:#111">${lineas
    .map((l) => `<p style="margin:4px 0">${escaparHtml(l)}</p>`)
    .join("")}</div>`;
  return enviarEmail({ tipo: `coach_${tipo}`, ref, para, asunto: `[KRAKEN] ${asunto}`, html, texto: lineas.join("\n") });
}

// Reintenta los emails 'pendiente' o 'error' (p. ej. cuando recién se configuró
// RESEND_API_KEY). Los avisos al coach guardados sin COACH_EMAIL toman el
// destinatario actual de la variable.
export async function reintentarPendientes(limite = 50) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("emails_salientes")
    .select("id, tipo, ref, para, asunto, html, texto, intentos")
    .in("estado", ["pendiente", "error"])
    .lt("intentos", 5)
    .order("id", { ascending: true })
    .limit(limite);

  let enviados = 0;
  let fallidos = 0;
  for (const f of data ?? []) {
    const para = f.para === PLACEHOLDER_COACH ? process.env.COACH_EMAIL?.trim() : f.para;
    if (!para) continue;
    const r = await mandarPorResend({ para, asunto: f.asunto, html: f.html, texto: f.texto ?? undefined, idem: `${f.tipo}:${f.ref}` });
    if (!r.configurado) return { enviados, fallidos, configurado: false };
    if (r.ok) {
      enviados++;
      await admin
        .from("emails_salientes")
        .update({ estado: "enviado", para, proveedor_id: r.id, enviado_at: new Date().toISOString(), error: null })
        .eq("id", f.id);
    } else {
      fallidos++;
      await admin
        .from("emails_salientes")
        .update({ estado: "error", error: r.error, intentos: (f.intentos as number) + 1 })
        .eq("id", f.id);
    }
  }
  return { enviados, fallidos, configurado: true };
}

import { createAdminClient } from "@/lib/supabase/admin";
import { avisarCoach, enviarEmail } from "@/lib/email";
import { precioNoAceptadoBaja } from "@/lib/emails-plantillas";
import { cancelarSuscripcion } from "@/lib/solicitudes";
import { slugsDeSuscripcion } from "@/lib/aviso-precio";

// Cambio de precio de una suscripción (adenda legal, regla 5).
//
// Regla: el precio nuevo NO se cobra hasta que la persona lo acepte de forma
// EXPRESA (el silencio no es aceptación). Decisión (2026-10-13, la más
// conservadora): si NO lo acepta -- ya sea porque toca "No acepto" o porque
// llega la fecha de vigencia sin haber respondido -- la suscripción NO se
// renueva al precio nuevo: se cancela la renovación en el proveedor y la
// persona conserva el acceso hasta el fin del período ya pagado. Se le avisa
// por email y al coach.
//
// Importante: la app NO cambia el precio en Mercado Pago/PayPal (eso lo hace el
// coach). Para que esta regla se cumpla, procesarAvisosVencidos() tiene que
// correr ANTES de que entre en vigencia el precio nuevo (ver CLAUDE.md).

async function suscripcionesAfectadas(userId: string, productoSlug: string) {
  const admin = createAdminClient();
  const { data: subs } = await admin
    .from("suscripciones")
    .select("id, producto_slug, frecuencia, estado")
    .eq("user_id", userId)
    .in("estado", ["activa", "pausada"]);
  // Criterio ESTRICTO (a diferencia del pop-up, que prefiere avisar de más): solo se
  // cancela una suscripción si hay certeza de que es del producto afectado. Una
  // suscripción de mentoría sin `producto_slug` (no se sabe si Basic o VIP) NO se
  // cancela sola: queda para que el coach la resuelva a mano.
  return (subs ?? []).filter((s) => {
    if (s.producto_slug) return s.producto_slug === productoSlug;
    if (productoSlug.startsWith("golden-")) return slugsDeSuscripcion(s, false).includes(productoSlug);
    return false;
  });
}

async function cancelarPorPrecioNoAceptado(userId: string, aviso: { id: number; producto_slug: string; titulo: string }, motivo: "rechazo" | "silencio") {
  const admin = createAdminClient();
  const subs = await suscripcionesAfectadas(userId, aviso.producto_slug);
  const { data: u } = await admin.auth.admin.getUserById(userId);
  const email = u.user?.email ?? null;

  let accesoHasta: string | null = null;
  let canceladas = 0;
  const errores: string[] = [];
  for (const s of subs) {
    const r = await cancelarSuscripcion({ suscripcionId: s.id as number });
    if (r.ok) canceladas++;
    else errores.push(String(("error" in r && r.error) || "falló la cancelación"));
    if ("accesoHasta" in r && r.accesoHasta) accesoHasta = r.accesoHasta as string;
  }

  const { data: pr } = await admin.from("productos").select("nombre").eq("slug", aviso.producto_slug).maybeSingle();
  const producto = (pr?.nombre as string | undefined) ?? aviso.producto_slug;

  if (canceladas > 0 && email) {
    await enviarEmail({ tipo: "precio_no_aceptado", ref: `${aviso.id}:${userId}`, para: email, ...precioNoAceptadoBaja({ producto, accesoHasta }) });
  }
  await avisarCoach({
    tipo: "precio_no_aceptado",
    ref: `${aviso.id}:${userId}`,
    asunto: `Precio nuevo no aceptado (${motivo === "rechazo" ? "rechazó" : "sin respuesta"})`,
    lineas: [
      `Aviso: ${aviso.titulo}`,
      `Cuenta: ${email ?? userId}`,
      `Motivo: ${motivo === "rechazo" ? "tocó No acepto" : "no respondió antes de la vigencia"}`,
      `Suscripciones canceladas: ${canceladas}${errores.length ? ` (errores: ${errores.join("; ")})` : ""}`,
      accesoHasta ? `Conserva el acceso hasta ${accesoHasta}.` : "",
    ].filter(Boolean),
  });
  return { canceladas, errores, accesoHasta };
}

// La persona tocó "No acepto" en el pop-up.
export async function rechazarAvisoPrecio(userId: string, avisoId: number) {
  const admin = createAdminClient();
  const { data: aviso } = await admin.from("avisos_precio").select("id, producto_slug, titulo").eq("id", avisoId).maybeSingle();
  if (!aviso) return { error: "No encontramos ese aviso." };

  const { error } = await admin
    .from("avisos_precio_confirmaciones")
    .upsert({ user_id: userId, aviso_id: avisoId, decision: "rechaza" }, { onConflict: "user_id,aviso_id" });
  if (error) return { error: "No pudimos guardar tu decisión. Probá de nuevo." };

  const r = await cancelarPorPrecioNoAceptado(userId, aviso as { id: number; producto_slug: string; titulo: string }, "rechazo");
  return { ok: true, ...r };
}

// Cancela las suscripciones de quienes NO respondieron un aviso cuya vigencia
// llegó (o llega en `diasAntes` días). Con ejecutar=false solo lista a quiénes
// alcanzaría. Pensado para correr una vez por día (cron o llamada manual).
export async function procesarAvisosVencidos({ ejecutar = false, diasAntes = 1 }: { ejecutar?: boolean; diasAntes?: number } = {}) {
  const admin = createAdminClient();
  const limite = new Date(Date.now() + diasAntes * 86400000).toISOString().slice(0, 10);

  const { data: avisos } = await admin
    .from("avisos_precio")
    .select("id, producto_slug, titulo, vigente_desde")
    .is("sin_aceptar_procesado_at", null)
    .not("vigente_desde", "is", null)
    .lte("vigente_desde", limite);

  const resumen: { avisoId: number; titulo: string; sinRespuesta: { userId: string; email: string | null }[]; canceladas: number }[] = [];

  for (const a of avisos ?? []) {
    const { data: subs } = await admin
      .from("suscripciones")
      .select("user_id")
      .in("estado", ["activa", "pausada"]);
    const candidatos = [...new Set((subs ?? []).map((s) => s.user_id as string))];

    const sinRespuesta: { userId: string; email: string | null }[] = [];
    for (const userId of candidatos) {
      const afectadas = await suscripcionesAfectadas(userId, a.producto_slug as string);
      if (!afectadas.length) continue;
      const { data: conf } = await admin
        .from("avisos_precio_confirmaciones")
        .select("aviso_id")
        .eq("user_id", userId)
        .eq("aviso_id", a.id)
        .maybeSingle();
      if (conf) continue;
      const { data: u } = await admin.auth.admin.getUserById(userId);
      sinRespuesta.push({ userId, email: u.user?.email ?? null });
    }

    let canceladas = 0;
    if (ejecutar) {
      for (const p of sinRespuesta) {
        const r = await cancelarPorPrecioNoAceptado(p.userId, a as { id: number; producto_slug: string; titulo: string }, "silencio");
        canceladas += r.canceladas;
      }
      await admin.from("avisos_precio").update({ sin_aceptar_procesado_at: new Date().toISOString() }).eq("id", a.id);
    }
    resumen.push({ avisoId: a.id as number, titulo: a.titulo as string, sinRespuesta, canceladas });
  }

  return { ok: true, ejecutado: ejecutar, avisos: resumen };
}

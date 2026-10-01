import { createAdminClient } from "@/lib/supabase/admin";
import { hoyISO } from "@/lib/fecha";

export type Frecuencia = "mensual" | "anual";

// external_reference (MP) / custom_id (PayPal) llevan el usuario Y la
// frecuencia elegida, codificados como "userId|frecuencia" -- así el webhook
// sabe, sin otra consulta, si tiene que sumar 1 mes o 1 año por cada cobro.
// Sin "|" (suscripciones viejas, ya reales, creadas antes de este cambio) se
// asume 'anual', que es lo que eran todas hasta ahora.
export function codificarReferencia(userId: string, frecuencia: Frecuencia): string {
  return `${userId}|${frecuencia}`;
}

export function decodificarReferencia(ref: string): { userId: string; frecuencia: Frecuencia } {
  const [userId, frecuencia] = ref.split("|");
  return { userId, frecuencia: frecuencia === "mensual" ? "mensual" : "anual" };
}

function unAnioDesde(fechaISO: string): string {
  const d = new Date(`${fechaISO}T00:00:00-03:00`);
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

function unMesDesde(fechaISO: string): string {
  const d = new Date(`${fechaISO}T00:00:00-03:00`);
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}

// Marca/actualiza la suscripción como activa sin tocar premium_hasta.
// Se llama cuando el proveedor confirma que la suscripción quedó autorizada
// (el período de acceso lo suma el cobro, no la autorización).
export async function marcarSuscripcionActiva({
  userId,
  proveedor,
  proveedorSubId,
  frecuencia,
  precio,
  moneda,
  proximoCobro,
}: {
  userId: string;
  proveedor: "mercadopago" | "paypal";
  proveedorSubId: string;
  frecuencia: Frecuencia;
  precio: number | null;
  moneda: string | null;
  proximoCobro: string | null;
}) {
  const supabase = createAdminClient();
  await supabase.from("suscripciones").upsert(
    {
      user_id: userId,
      proveedor,
      proveedor_sub_id: proveedorSubId,
      frecuencia,
      estado: "activa",
      precio,
      moneda,
      proximo_cobro: proximoCobro,
      cancelada_al: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "proveedor,proveedor_sub_id" }
  );
}

// Un cobro de Golden se acreditó (alta o renovación): empuja premium_hasta
// un período (1 mes o 1 año, según la frecuencia) más allá de lo que sea
// mayor entre hoy y premium_hasta actual, marca el origen 'golden' y deja
// la suscripción activa. Dedupe por `cobroId`: si ese cobro ya se procesó
// (ultimo_cobro_id), no vuelve a sumar el período.
export async function acreditarCobroGolden({
  userId,
  proveedor,
  proveedorSubId,
  frecuencia,
  cobroId,
  precio,
  moneda,
  proximoCobro,
}: {
  userId: string;
  proveedor: "mercadopago" | "paypal";
  proveedorSubId: string;
  frecuencia: Frecuencia;
  cobroId: string;
  precio: number | null;
  moneda: string | null;
  proximoCobro: string | null;
}) {
  const supabase = createAdminClient();
  const hoy = hoyISO();

  const { data: sub } = await supabase
    .from("suscripciones")
    .select("ultimo_cobro_id, proximo_cobro")
    .eq("proveedor", proveedor)
    .eq("proveedor_sub_id", proveedorSubId)
    .maybeSingle();

  if (sub?.ultimo_cobro_id === cobroId) {
    return { ok: true, yaAcreditado: true };
  }

  const { data: perfil } = await supabase
    .from("profiles")
    .select("premium_hasta")
    .eq("id", userId)
    .single();

  const base =
    perfil?.premium_hasta && perfil.premium_hasta > hoy ? perfil.premium_hasta : hoy;
  const nuevoHasta = frecuencia === "mensual" ? unMesDesde(base) : unAnioDesde(base);

  await supabase
    .from("profiles")
    .update({ premium_hasta: nuevoHasta, premium_origen: "golden" })
    .eq("id", userId);

  // El proveedor no siempre manda la próxima fecha de cobro en este evento
  // -- si no vino, se conserva la que ya había, o se usa nuevoHasta como
  // mejor estimación (coincide con cuándo debería tocar el próximo cobro).
  const proximoCobroFinal = proximoCobro ?? sub?.proximo_cobro ?? nuevoHasta;

  await supabase.from("suscripciones").upsert(
    {
      user_id: userId,
      proveedor,
      proveedor_sub_id: proveedorSubId,
      frecuencia,
      estado: "activa",
      precio,
      moneda,
      proximo_cobro: proximoCobroFinal,
      cancelada_al: null,
      ultimo_cobro_id: cobroId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "proveedor,proveedor_sub_id" }
  );

  return { ok: true, premiumHasta: nuevoHasta };
}

// ---------- Mentoría Online (débito automático, 2026-09-30) ----------
// Funciones NUEVAS y separadas de las de Golden de arriba -- a propósito,
// para no arriesgar la suscripción Golden real (plata de verdad) tocando
// código compartido. `marcarSuscripcionActiva`/`pausarGolden`/
// `cancelarGolden` de arriba SÍ se reusan tal cual para Mentoría Online
// (son genéricas, no hacen nada específico de Golden pese al nombre).

export type TierMentoriaOnline = "basic" | "vip";

// Prefijo "mentoria:" a propósito distinto del formato de Golden
// ("userId|frecuencia") -- así nunca se puede confundir una referencia con
// la otra en el webhook, decodificarReferenciaMentoriaOnline devuelve null
// de entrada si no matchea.
export function codificarReferenciaMentoriaOnline(userId: string, tier: TierMentoriaOnline): string {
  return `mentoria:${userId}:${tier}`;
}

export function decodificarReferenciaMentoriaOnline(
  ref: string
): { userId: string; tier: TierMentoriaOnline } | null {
  if (!ref.startsWith("mentoria:")) return null;
  const [, userId, tier] = ref.split(":");
  if (!userId || (tier !== "basic" && tier !== "vip")) return null;
  return { userId, tier };
}

// Mismo criterio que acreditarCobroGolden (base = mayor entre hoy y
// premium_hasta actual, nunca pisa días ya pagados) pero SIEMPRE mensual
// -- Mentoría Online no tiene variante anual -- y marca
// premium_origen='mentoria' + modalidad_mentoria='online' en vez de
// 'golden'.
export async function acreditarCobroMentoriaOnline({
  userId,
  proveedor,
  proveedorSubId,
  tier,
  cobroId,
  precio,
  moneda,
  proximoCobro,
}: {
  userId: string;
  proveedor: "mercadopago" | "paypal";
  proveedorSubId: string;
  tier: TierMentoriaOnline;
  cobroId: string;
  precio: number | null;
  moneda: string | null;
  proximoCobro: string | null;
}) {
  const supabase = createAdminClient();
  const hoy = hoyISO();

  const { data: sub } = await supabase
    .from("suscripciones")
    .select("ultimo_cobro_id, proximo_cobro")
    .eq("proveedor", proveedor)
    .eq("proveedor_sub_id", proveedorSubId)
    .maybeSingle();

  if (sub?.ultimo_cobro_id === cobroId) {
    return { ok: true, yaAcreditado: true };
  }

  const { data: perfil } = await supabase
    .from("profiles")
    .select("premium_hasta")
    .eq("id", userId)
    .single();

  const base = perfil?.premium_hasta && perfil.premium_hasta > hoy ? perfil.premium_hasta : hoy;
  const nuevoHasta = unMesDesde(base);

  await supabase
    .from("profiles")
    .update({ premium_hasta: nuevoHasta, premium_origen: "mentoria", modalidad_mentoria: "online" })
    .eq("id", userId);

  const proximoCobroFinal = proximoCobro ?? sub?.proximo_cobro ?? nuevoHasta;

  await supabase.from("suscripciones").upsert(
    {
      user_id: userId,
      proveedor,
      proveedor_sub_id: proveedorSubId,
      frecuencia: "mensual",
      estado: "activa",
      precio,
      moneda,
      proximo_cobro: proximoCobroFinal,
      cancelada_al: null,
      ultimo_cobro_id: cobroId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "proveedor,proveedor_sub_id" }
  );

  return { ok: true, premiumHasta: nuevoHasta, tier };
}

// La suscripción se pausó (pago rechazado, tarjeta vencida). NO se toca
// premium_hasta: el usuario sigue con acceso hasta que venza el período
// que ya pagó.
export async function pausarGolden(proveedor: string, proveedorSubId: string) {
  const supabase = createAdminClient();
  await supabase
    .from("suscripciones")
    .update({ estado: "pausada", updated_at: new Date().toISOString() })
    .eq("proveedor", proveedor)
    .eq("proveedor_sub_id", proveedorSubId);
}

// El usuario canceló la renovación. Sigue con acceso hasta proximo_cobro.
export async function cancelarGolden(proveedor: string, proveedorSubId: string) {
  const supabase = createAdminClient();
  const { data: sub } = await supabase
    .from("suscripciones")
    .select("proximo_cobro")
    .eq("proveedor", proveedor)
    .eq("proveedor_sub_id", proveedorSubId)
    .maybeSingle();

  await supabase
    .from("suscripciones")
    .update({
      estado: "cancelada",
      cancelada_al: sub?.proximo_cobro ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("proveedor", proveedor)
    .eq("proveedor_sub_id", proveedorSubId);
}

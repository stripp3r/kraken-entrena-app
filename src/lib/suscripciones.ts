import { createAdminClient } from "@/lib/supabase/admin";
import { hoyISO } from "@/lib/fecha";

function unAnioDesde(fechaISO: string): string {
  const d = new Date(`${fechaISO}T00:00:00-03:00`);
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

// Marca/actualiza la suscripción como activa sin tocar premium_hasta.
// Se llama cuando el proveedor confirma que la suscripción quedó autorizada
// (el año de acceso lo suma el cobro, no la autorización).
export async function marcarSuscripcionActiva({
  userId,
  proveedor,
  proveedorSubId,
  precio,
  moneda,
  proximoCobro,
}: {
  userId: string;
  proveedor: "mercadopago" | "paypal";
  proveedorSubId: string;
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
// un año más allá de lo que sea mayor entre hoy y premium_hasta actual, marca
// el origen 'golden' y deja la suscripción activa. Dedupe por `cobroId`: si
// ese cobro ya se procesó (ultimo_cobro_id), no vuelve a sumar el año.
export async function acreditarCobroGolden({
  userId,
  proveedor,
  proveedorSubId,
  cobroId,
  precio,
  moneda,
  proximoCobro,
}: {
  userId: string;
  proveedor: "mercadopago" | "paypal";
  proveedorSubId: string;
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
  const nuevoHasta = unAnioDesde(base);

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

import type { SupabaseClient } from "@supabase/supabase-js";

export type AvisoPrecio = {
  id: number;
  titulo: string;
  cuerpo: string;
  precioNuevo: number | null;
  moneda: string | null;
  vigenteDesde: string | null;
};

const SLUGS_MENTORIA_ONLINE = ["mentoria-online-basic", "mentoria-online-vip"];

// De qué producto es cada suscripción del usuario. Si el webhook ya guardó
// `producto_slug` se usa ese; si no (suscripciones anteriores a la migración
// 095) se infiere: Golden por su frecuencia, y mentoría online sin saber si es
// Basic o VIP, así que un aviso de cualquiera de las dos le llega (preferible
// a que alguien con la suscripción afectada no se entere).
function slugsDeSuscripcion(
  sub: { producto_slug?: string | null; frecuencia?: string | null },
  esMentoria: boolean
): string[] {
  if (sub.producto_slug) return [sub.producto_slug];
  if (esMentoria) return SLUGS_MENTORIA_ONLINE;
  return [sub.frecuencia === "mensual" ? "golden-mensual" : "golden-anual"];
}

// Primer aviso de cambio de precio SIN confirmar que le corresponde al usuario
// (tiene una suscripción activa/pausada del producto afectado), o null.
// Cualquier error (ej. migración 095 sin correr) devuelve null: un fallo acá
// nunca tiene que impedir usar la app.
export async function avisoPrecioPendiente(
  supabase: SupabaseClient,
  userId: string,
  premiumOrigen: string | null | undefined
): Promise<AvisoPrecio | null> {
  try {
    const { data: subs, error: errSubs } = await supabase
      .from("suscripciones")
      .select("producto_slug, frecuencia, estado")
      .eq("user_id", userId)
      .in("estado", ["activa", "pausada"]);

    if (errSubs || !subs?.length) return null;

    const slugs = new Set(subs.flatMap((s) => slugsDeSuscripcion(s, premiumOrigen === "mentoria")));

    const { data: avisos, error: errAvisos } = await supabase
      .from("avisos_precio")
      .select("id, titulo, cuerpo, precio_nuevo, moneda, vigente_desde, producto_slug")
      .in("producto_slug", [...slugs])
      .order("creado_at", { ascending: true });

    if (errAvisos || !avisos?.length) return null;

    const { data: confirmados } = await supabase
      .from("avisos_precio_confirmaciones")
      .select("aviso_id")
      .eq("user_id", userId)
      .in("aviso_id", avisos.map((a) => a.id));

    const yaConfirmados = new Set((confirmados ?? []).map((c) => c.aviso_id as number));
    const pendiente = avisos.find((a) => !yaConfirmados.has(a.id));
    if (!pendiente) return null;

    return {
      id: pendiente.id,
      titulo: pendiente.titulo,
      cuerpo: pendiente.cuerpo,
      precioNuevo: pendiente.precio_nuevo,
      moneda: pendiente.moneda,
      vigenteDesde: pendiente.vigente_desde,
    };
  } catch {
    return null;
  }
}

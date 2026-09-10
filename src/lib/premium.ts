import { hoyISO } from "@/lib/fecha";

// Estado de acceso de un perfil. `premium_hasta` es 'YYYY-MM-DD' (o null).
export type EstadoPremium = {
  golden_perpetuo?: boolean | null;
  premium_hasta?: string | null;
};

// Etiqueta + color para mostrar el estado de suscripción en la UI.
export type Suscripcion = {
  texto: string;
  tono: "oro" | "prueba" | "compra" | "pendiente" | "ninguna";
};

// Único criterio de acceso a la app: Golden perpetuo, o prueba/suscripción
// vigente (premium_hasta hoy o en el futuro).
export function esPremium(p: EstadoPremium | null | undefined): boolean {
  if (!p) return false;
  if (p.golden_perpetuo) return true;
  return !!p.premium_hasta && p.premium_hasta >= hoyISO();
}

// Días que faltan para que termine la prueba. null si es Golden perpetuo,
// si no hay fecha, o si ya venció.
export function diasRestantesTrial(p: EstadoPremium | null | undefined): number | null {
  if (!p || p.golden_perpetuo || !p.premium_hasta) return null;
  const hoy = new Date(`${hoyISO()}T00:00:00-03:00`).getTime();
  const fin = new Date(`${p.premium_hasta}T00:00:00-03:00`).getTime();
  const dias = Math.round((fin - hoy) / 86_400_000);
  return dias > 0 ? dias : null;
}

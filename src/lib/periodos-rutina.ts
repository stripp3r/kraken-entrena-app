import type { createClient } from "@/lib/supabase/server";
import { inicioDelDiaArgentinaUTC } from "@/lib/fecha";

export type VentanaFecha = { desde: number; hasta: number | null };

// Un usuario puede activar la misma rutina más de una vez (se cambia a
// otra un tiempo y después vuelve) -- cada activación abre una fila
// nueva en `profile_routine_history`. El historial/análisis de "esta
// rutina" tiene que sumar TODOS esos períodos, no solo el más reciente,
// si no el historial reciente desaparece apenas se reactiva una rutina
// en la que ya se venía entrenando (bug real, 2026-09-27).
export async function ventanasDeRutina(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  routineId: number
): Promise<VentanaFecha[]> {
  const { data } = await supabase
    .from("profile_routine_history")
    .select("fecha_inicio, fecha_fin")
    .eq("user_id", userId)
    .eq("routine_id", routineId);

  return (data ?? []).map((p) => ({
    desde: inicioDelDiaArgentinaUTC(p.fecha_inicio).getTime(),
    hasta: p.fecha_fin ? inicioDelDiaArgentinaUTC(p.fecha_fin).getTime() + 86_400_000 : null,
  }));
}

export function dentroDeVentanas(creadoEnISO: string, ventanas: VentanaFecha[]): boolean {
  const t = new Date(creadoEnISO).getTime();
  return ventanas.some((v) => t >= v.desde && (v.hasta === null || t < v.hasta));
}

export function inicioMasAntiguo(ventanas: VentanaFecha[]): number | null {
  return ventanas.length ? Math.min(...ventanas.map((v) => v.desde)) : null;
}

import type { SupabaseClient } from "@supabase/supabase-js";
import { TIPO_SALUD, VERSION_SALUD } from "@/lib/aceptacion-legal-version";

// Consentimiento ESPECÍFICO para datos de salud (adenda legal C): separado de
// "Acepto Términos y Privacidad". Se pide recién antes de cargar peso,
// medidas, fotos de evolución, lesiones o el formulario de ingreso -- no al
// registrarse. Texto decidido el 2026-10-13 (versión VERSION_SALUD).
export const TITULO_CONSENTIMIENTO_SALUD = "Tus datos de salud";

export const TEXTO_CONSENTIMIENTO_SALUD = [
  "Para mostrarte tu progreso vas a cargar datos relacionados con tu salud: peso, medidas corporales, fotos de evolución y, si querés, lesiones o antecedentes que importen para entrenar.",
  "Qué datos: solo los que vos cargues en esas pantallas. Todos son opcionales: cargá lo que quieras y nada más.",
  "Para qué: armar tus gráficos de evolución y ajustar tu entrenamiento y alimentación. No los usamos con fines publicitarios ni los vendemos.",
  "Quién accede: vos y el equipo de KRAKEN cuando trabajamos con vos en una mentoría. Los proveedores técnicos que alojan la app (en servidores fuera de Argentina) los procesan solo para prestar el servicio.",
  "Cuánto se conservan: mientras tu cuenta esté activa. Si eliminás tu cuenta se borran, salvo lo que la ley obliga a conservar.",
  "Tus derechos: podés acceder, rectificar y suprimir tus datos, y retirar este consentimiento cuando quieras escribiéndonos o desde Eliminar mis datos; al retirarlo se borran los datos de salud que cargaste.",
];

export const TEXTO_CASILLA_SALUD =
  "Doy mi consentimiento expreso para que KRAKEN trate los datos de salud que cargue, para los fines indicados.";

export async function tieneConsentimientoSalud(supabase: SupabaseClient, userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("aceptaciones_legales")
      .select("id")
      .eq("user_id", userId)
      .eq("tipo", TIPO_SALUD)
      .eq("version", VERSION_SALUD)
      .limit(1);
    // Si la consulta falla, no se bloquea la app (mismo criterio que el proxy).
    if (error) return true;
    return Boolean(data?.length);
  } catch {
    return true;
  }
}

import { hoyISO } from "@/lib/fecha";

// Estado de acceso de un perfil. `premium_hasta` es 'YYYY-MM-DD' (o null).
export type EstadoPremium = {
  golden_perpetuo?: boolean | null;
  premium_hasta?: string | null;
  premium_origen?: string | null;
};

// Etiqueta + color para mostrar el estado de suscripción en la UI.
export type Suscripcion = {
  texto: string;
  tono: "oro" | "prueba" | "compra" | "pendiente" | "ninguna";
};

// Clases de color por tono -- un solo lugar para Datos Personales, Inicio,
// o cualquier otra pantalla que muestre este badge.
export const TONO_SUSCRIPCION_CLASES: Record<Suscripcion["tono"], string> = {
  oro: "bg-amber-400/15 text-amber-300",
  prueba: "bg-sky-400/15 text-sky-300",
  compra: "bg-orange-400/15 text-orange-300",
  pendiente: "bg-red-400/15 text-red-300",
  ninguna: "bg-gray-500/15 text-gray-400",
};

// Único criterio de acceso a la app: Golden perpetuo, o prueba/suscripción
// vigente (premium_hasta hoy o en el futuro).
export function esPremium(p: EstadoPremium | null | undefined): boolean {
  if (!p) return false;
  if (p.golden_perpetuo) return true;
  return !!p.premium_hasta && p.premium_hasta >= hoyISO();
}

// Días que faltan para que termine la prueba. null si es Golden (perpetuo o
// suscripción paga), si no hay fecha, o si ya venció -- este contador es
// SOLO para el trial gratuito, no para el acceso pago.
export function diasRestantesTrial(p: EstadoPremium | null | undefined): number | null {
  if (
    !p ||
    p.golden_perpetuo ||
    p.premium_origen === "golden" ||
    p.premium_origen === "mentoria" ||
    !p.premium_hasta
  ) {
    return null;
  }
  const hoy = new Date(`${hoyISO()}T00:00:00-03:00`).getTime();
  const fin = new Date(`${p.premium_hasta}T00:00:00-03:00`).getTime();
  const dias = Math.round((fin - hoy) / 86_400_000);
  return dias > 0 ? dias : null;
}

// Acceso "nivel Golden" en sentido amplio: Golden real (compra o Founder) O
// mentoría (que incluye Golden como parte del servicio). Usar esto para
// cualquier gate que sea "todo lo que da Golden" (rutinas, calculadora).
export function esGoldenTier(p: EstadoPremium | null | undefined): boolean {
  if (!p) return false;
  return Boolean(p.golden_perpetuo) || p.premium_origen === "golden" || p.premium_origen === "mentoria";
}

// Acceso específico de Mentoría -- más estricto que esGoldenTier. Usar solo
// para beneficios exclusivos de mentoría (ej. Guía alimenticia), nunca para
// gates generales de Golden.
export function esMentoria(p: EstadoPremium | null | undefined): boolean {
  return p?.premium_origen === "mentoria" && esPremium(p);
}

const ddmm = (iso?: string | null) => (iso ? iso.split("-").reverse().join("/") : "");

// Etiqueta + tono para mostrar el estado de acceso en Datos Personales e
// Inicio -- un solo lugar para no repetir esta lógica en cada pantalla.
export function obtenerSuscripcion(
  profile: EstadoPremium | null,
  sub: {
    estado?: string | null;
    proximo_cobro?: string | null;
    cancelada_al?: string | null;
    frecuencia?: string | null;
  } | null
): Suscripcion {
  if (profile?.golden_perpetuo) return { texto: "Golden · Founder", tono: "oro" };

  const etiquetaFrecuencia = sub?.frecuencia === "mensual" ? " (mensual)" : "";

  if (sub && sub.estado !== "vencida") {
    if (sub.estado === "pausada") {
      return { texto: `Golden${etiquetaFrecuencia} · pago pendiente`, tono: "pendiente" };
    }
    if (sub.estado === "cancelada") {
      return {
        texto: sub.cancelada_al
          ? `Golden${etiquetaFrecuencia} · hasta ${ddmm(sub.cancelada_al)}`
          : `Golden${etiquetaFrecuencia} · cancelada`,
        tono: "oro",
      };
    }
    return {
      texto: sub.proximo_cobro
        ? `Golden${etiquetaFrecuencia} · renueva ${ddmm(sub.proximo_cobro)}`
        : `Golden${etiquetaFrecuencia}`,
      tono: "oro",
    };
  }

  // Mentoría: incluye Golden como parte del servicio, pero se muestra con
  // su propia etiqueta -- no es lo mismo que haber comprado Golden suelto.
  if (esMentoria(profile)) {
    return { texto: `Mentoría · hasta ${ddmm(profile?.premium_hasta)}`, tono: "oro" };
  }

  // Golden otorgado a mano fuera de mentoría -- no tiene fila en
  // `suscripciones` porque no pasó por Mercado Pago/PayPal, pero sigue
  // siendo acceso Golden real mientras premium_hasta no venza.
  if (profile?.premium_origen === "golden" && esPremium(profile)) {
    return { texto: `Golden · hasta ${ddmm(profile.premium_hasta)}`, tono: "oro" };
  }

  const dias = diasRestantesTrial(profile);
  if (dias != null) {
    if (profile?.premium_origen === "compra") {
      return {
        texto: `Acceso por compra · hasta ${ddmm(profile.premium_hasta)}`,
        tono: "compra",
      };
    }
    return {
      texto: `Prueba gratis · ${dias === 1 ? "queda 1 día" : `quedan ${dias} días`}`,
      tono: "prueba",
    };
  }
  return { texto: "Sin suscripción", tono: "ninguna" };
}

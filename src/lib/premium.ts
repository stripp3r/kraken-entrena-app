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

// Días que faltan para que termine la prueba. null si no es Free Trial
// (Golden, mentoría, Founder, compra) o si ya venció. SOLO para el trial
// gratuito -- antes chequeaba "no es golden/mentoria" (lista negativa), lo
// que se rompió en cuanto existió `premium_origen = 'compra'`: un cliente
// que compró un plan autoguiado veía "Prueba gratis · te quedan 91 días"
// en el banner de arriba y "Tu prueba gratis terminó" en la pantalla de
// venta de Golden, ninguna de las dos cosas ciertas (bug encontrado
// probando Compra Suelta en vivo, 2026-09-29). Ahora es una lista
// POSITIVA (solo `premium_origen === 'trial'`) para que no se repita con
// la próxima categoría que se agregue.
export function diasRestantesTrial(p: EstadoPremium | null | undefined): number | null {
  if (!p || p.premium_origen !== "trial" || !p.premium_hasta) {
    return null;
  }
  const hoy = new Date(`${hoyISO()}T00:00:00-03:00`).getTime();
  const fin = new Date(`${p.premium_hasta}T00:00:00-03:00`).getTime();
  const dias = Math.round((fin - hoy) / 86_400_000);
  return dias > 0 ? dias : null;
}

// "¿Esta cuenta ya es Golden o más (Founder/mentoría incluidos)?" -- SOLO
// para decidir si mostrar un upsell de "pasate a Golden" (Inicio, la
// página de venta de Golden). NUNCA usar esto para gatear una feature
// puntual (calculadora, catálogo, etc.) -- para eso ver `permisos()` más
// abajo, la única fuente de verdad de qué incluye cada plan.
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

// Cuenta en Free Trial (14 días, ver "Free Trial" en CLAUDE.md).
export function esTrial(p: EstadoPremium | null | undefined): boolean {
  return p?.premium_origen === "trial" && esPremium(p);
}

// Las 3 rutinas públicas estandarizadas que el Free Trial puede ver y usar
// libremente, definidas por el coach 2026-09-28 para que el usuario pruebe
// la app en serio sin regalarle el catálogo completo. Nombres tal cual
// están en `routines.nombre` -- si se renombra alguna de estas 3 rutinas,
// hay que actualizar esta lista.
export const RUTINAS_PUBLICAS_TRIAL = ["3 días - Fullbody", "Torso-Pierna", "Push Pull Legs"];

// Matriz de permisos por categoría -- reemplaza ir agregando funciones
// booleanas sueltas por cada feature nueva (patrón que ya causó 3 bugs
// reales: catálogo completo para mentoría/trial, etiqueta "Golden ·
// Founder" para mentoría, "Golden" en vez de "Mentoría" con una
// suscripción vieja). Con Compra Suelta (plan autoguiado, 2026-09-29) el
// viejo criterio binario esGoldenTier ya no alcanza -- Compra tiene
// calculadora pero NO catálogo completo ni guía, algo que ninguna función
// existente expresaba. Esta es la ÚNICA fuente de verdad de "qué puede
// hacer cada categoría"; agregar acá cualquier feature nueva que dependa
// del plan, no como un chequeo inline en la pantalla.
export type Permisos = {
  // Navegar y cambiarse a CUALQUIER rutina pública del catálogo general.
  catalogoCompleto: boolean;
  cardio: boolean;
  // Cuántas rutinas propias puede crear en "Crea tu rutina": null = sin
  // límite, 0 = bloqueado por completo, N = tope numérico.
  limiteRutinasCreadas: number | null;
  historial: boolean; // Progreso > Historial
  evolucion: boolean; // Perfil > Mi evolución
  misPdfs: boolean; // Perfil > Mis PDFs
  calculadora: boolean; // Alimentación > Calculadora de calorías
  guiaAlimenticia: boolean; // Alimentación > Guía alimenticia
};

const SIN_ACCESO: Permisos = {
  catalogoCompleto: false,
  cardio: false,
  limiteRutinasCreadas: 0,
  historial: false,
  evolucion: false,
  misPdfs: false,
  calculadora: false,
  guiaAlimenticia: false,
};

export function permisos(p: EstadoPremium | null | undefined): Permisos {
  if (!esPremium(p)) return SIN_ACCESO;

  // Founder: acceso incondicional a todo (ver "Golden Founder" en
  // CLAUDE.md).
  if (p?.premium_origen === "founder") {
    return {
      catalogoCompleto: true,
      cardio: true,
      limiteRutinasCreadas: null,
      historial: true,
      evolucion: true,
      misPdfs: true,
      calculadora: true,
      guiaAlimenticia: true,
    };
  }

  // Mentoría: todo lo de Golden + guía alimenticia (su exclusivo), pero
  // SIN catálogo completo -- solo ve SU rutina a medida vía
  // profile_routine_access (ver bug de Vane Capuano en CLAUDE.md).
  if (esMentoria(p)) {
    return {
      catalogoCompleto: false,
      cardio: true,
      limiteRutinasCreadas: null,
      historial: true,
      evolucion: true,
      misPdfs: true,
      calculadora: true,
      guiaAlimenticia: true,
    };
  }

  // Golden (mensual o anual, exactamente el mismo acceso -- confirmado
  // 2026-09-29): todo menos la guía alimenticia, que es exclusiva de
  // mentoría.
  if (p?.premium_origen === "golden") {
    return {
      catalogoCompleto: true,
      cardio: true,
      limiteRutinasCreadas: null,
      historial: true,
      evolucion: true,
      misPdfs: true,
      calculadora: true,
      guiaAlimenticia: false,
    };
  }

  // Compra suelta (plan autoguiado, 90 días -- definido 2026-09-29):
  // mismo trato que Golden en TODO menos catálogo completo (solo ve la/s
  // rutina/s de su producto vía profile_routine_access, no puede navegar
  // el resto) y Crea tu rutina (bloqueado por completo -- "compraste tu
  // plan, seguís tu plan", no es el mismo caso que el trial que sí puede
  // crear 1 para probar).
  if (p?.premium_origen === "compra") {
    return {
      catalogoCompleto: false,
      cardio: true,
      limiteRutinasCreadas: 0,
      historial: true,
      evolucion: true,
      misPdfs: true,
      calculadora: true,
      guiaAlimenticia: false,
    };
  }

  // Free Trial (14 días): bloqueado por completo en Alimentación, Mi
  // evolución, Mis PDFs, Historial, Cardio; limitado a 1 rutina propia y
  // a las 3 rutinas públicas de RUTINAS_PUBLICAS_TRIAL (chequeo aparte en
  // `rutinaIncluidaEnPlan`, no cabe en un simple booleano).
  if (esTrial(p)) {
    return {
      catalogoCompleto: false,
      cardio: false,
      limiteRutinasCreadas: 1,
      historial: false,
      evolucion: false,
      misPdfs: false,
      calculadora: false,
      guiaAlimenticia: false,
    };
  }

  return SIN_ACCESO;
}

// Único punto de verdad para "¿esta rutina PÚBLICA está incluida en el plan
// de este perfil, sin necesidad de profile_routine_access explícito?".
// Founder/Golden real ven cualquier rutina pública; Free Trial solo las 3
// de RUTINAS_PUBLICAS_TRIAL; el resto (mentoría, compra) no tiene ninguna
// así -- todo lo suyo pasa por acceso explícito. Rutinas privadas siempre
// devuelven false acá (se protegen aparte, por profile_routine_access).
export function rutinaIncluidaEnPlan(
  p: EstadoPremium | null | undefined,
  rutina: { nombre: string; es_privada?: boolean | null }
): boolean {
  if (rutina.es_privada) return false;
  if (permisos(p).catalogoCompleto) return true;
  if (esTrial(p)) return RUTINAS_PUBLICAS_TRIAL.includes(rutina.nombre);
  return false;
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
  // Ojo: NO alcanza con `golden_perpetuo` -- todas las altas de mentoría
  // (alta-cliente.js) también lo marcan true para darles Golden incluido,
  // así que esto solo debe disparar para las 2 cuentas reales del dueño
  // del negocio (`premium_origen === 'founder'`, ver `permisos()` más
  // arriba). Si no, un cliente de mentoría vería "Golden · Founder" en
  // su propio perfil, lo cual no es cierto -- bug hermano del de Vane
  // Capuano, encontrado en la misma revisión (2026-09-28).
  if (profile?.premium_origen === "founder") return { texto: "Golden · Founder", tono: "oro" };

  // Mentoría: incluye Golden como parte del servicio, pero se muestra con
  // su propia etiqueta -- no es lo mismo que haber comprado Golden suelto.
  // Va ANTES del chequeo de `sub` a propósito -- bug real encontrado
  // 2026-09-29 (mismo patrón que el de Founder de arriba): un cliente que
  // arrancó como Golden pago y después pasó a mentoría puede seguir
  // teniendo una fila vieja en `suscripciones` con estado='activa' (nadie
  // la cancela al pasar a mentoría) -- si el chequeo de `sub` fuera
  // primero, a ese cliente le seguiría apareciendo "Golden" en vez de
  // "Mentoría". Confirmado en producción con 2 cuentas reales de mentoría
  // que tenían una `suscripciones` vieja de cuando eran Golden.
  if (esMentoria(profile)) {
    return { texto: `Mentoría · hasta ${ddmm(profile?.premium_hasta)}`, tono: "oro" };
  }

  // Golden mensual y anual dan EXACTAMENTE el mismo acceso -- la única
  // diferencia es precio/duración (confirmado por el usuario 2026-09-29,
  // "no tiene que haber ninguna distinción entre uno y otro" en cuanto a
  // funcionalidad). Esta etiqueta es puramente informativa, para que el
  // usuario vea qué suscripción tiene y cuándo vence/renueva.
  const etiquetaFrecuencia =
    sub?.frecuencia === "mensual" ? " mensual" : sub?.frecuencia === "anual" ? " anual" : "";

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

  // Golden otorgado a mano fuera de mentoría -- no tiene fila en
  // `suscripciones` porque no pasó por Mercado Pago/PayPal, pero sigue
  // siendo acceso Golden real mientras premium_hasta no venza.
  if (profile?.premium_origen === "golden" && esPremium(profile)) {
    return { texto: `Golden · hasta ${ddmm(profile.premium_hasta)}`, tono: "oro" };
  }

  // Compra suelta (plan autoguiado, 90 días) -- chequea directo contra
  // esPremium, NO contra diasRestantesTrial (que ahora es estrictamente
  // solo para 'trial', ver su comentario) para no depender de que el
  // trial y la compra compartan la misma cuenta regresiva.
  if (profile?.premium_origen === "compra" && esPremium(profile)) {
    return {
      texto: `Acceso por compra · hasta ${ddmm(profile.premium_hasta)}`,
      tono: "compra",
    };
  }

  const dias = diasRestantesTrial(profile);
  if (dias != null) {
    return {
      texto: `Prueba gratis · ${dias === 1 ? "queda 1 día" : `quedan ${dias} días`}`,
      tono: "prueba",
    };
  }
  return { texto: "Sin suscripción", tono: "ninguna" };
}

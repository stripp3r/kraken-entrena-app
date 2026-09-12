// Toda la app define "el día" según la hora de Argentina (UTC-3, sin
// horario de verano), sin importar en qué huso horario corra el
// servidor (Vercel usa UTC) — evita que un registro cargado de noche
// quede fechado en el día siguiente/anterior.
const ZONA = "America/Argentina/Buenos_Aires";

export function hoyISO(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function fechaISO(fecha: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(fecha);
}

export function inicioDelDiaArgentinaUTC(fechaYMD?: string): Date {
  return new Date(`${fechaYMD ?? hoyISO()}T00:00:00-03:00`);
}

// Edad en años a partir de una fecha de nacimiento 'YYYY-MM-DD', calculada
// contra "hoy" en hora Argentina -- así nunca queda desactualizada.
export function calcularEdad(fechaNacimientoISO: string): number {
  const hoy = inicioDelDiaArgentinaUTC();
  const nacimiento = inicioDelDiaArgentinaUTC(fechaNacimientoISO);
  let edad = hoy.getUTCFullYear() - nacimiento.getUTCFullYear();
  const aunNoCumplioEsteAnio =
    hoy.getUTCMonth() < nacimiento.getUTCMonth() ||
    (hoy.getUTCMonth() === nacimiento.getUTCMonth() && hoy.getUTCDate() < nacimiento.getUTCDate());
  if (aunNoCumplioEsteAnio) edad -= 1;
  return edad;
}

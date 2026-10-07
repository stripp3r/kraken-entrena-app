// Escala monocromática de naranjas para los gráficos que comparan fechas
// (volumen por ejercicio, medidas). Pedido del coach (2026-10-07): en el
// Excel original todas las barras eran del mismo naranja en distintas
// tonalidades, y la paleta multicolor "arcoíris" que tenía la app no le
// gustaba. La fecha más vieja sale en el tono más claro y la más reciente en
// el más intenso, así el progreso se lee de un vistazo ("cada semana, más
// color") y la escala sirve para cualquier cantidad de fechas -- antes una
// lista fija de 5-7 colores se repetía en ciclo a partir de la 6ª-8ª fecha.
const TONO = 24; // naranja
const SATURACION = 92;
const LUMINOSIDAD_MAS_VIEJA = 82;
const LUMINOSIDAD_MAS_RECIENTE = 50;

function hslAHex(h: number, s: number, l: number): string {
  const sat = s / 100;
  const lum = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sat * Math.min(lum, 1 - lum);
  const f = (n: number) => lum - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const hex = (x: number) =>
    Math.round(x * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${hex(f(0))}${hex(f(8))}${hex(f(4))}`;
}

/** `n` tonos del mismo naranja, del más claro (índice 0, la fecha más vieja) al más intenso. */
export function escalaNaranja(n: number): string[] {
  return Array.from({ length: n }, (_, i) => {
    const t = n === 1 ? 1 : i / (n - 1);
    const luminosidad =
      LUMINOSIDAD_MAS_VIEJA + (LUMINOSIDAD_MAS_RECIENTE - LUMINOSIDAD_MAS_VIEJA) * t;
    return hslAHex(TONO, SATURACION, luminosidad);
  });
}

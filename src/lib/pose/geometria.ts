// Geometría básica para analizar la postura a partir de los 33 puntos que
// entrega MediaPipe Pose. Coordenadas NORMALIZADAS (x, y entre 0 y 1, con y
// hacia ABAJO como en una imagen). Nada de esto toca la cámara ni el video:
// son funciones puras sobre números, probables sin teléfono.

export type Punto = { x: number; y: number; z?: number; visibility?: number };

// Índices de MediaPipe Pose que usamos.
export const PUNTO = {
  hombroIzq: 11,
  hombroDer: 12,
  codoIzq: 13,
  codoDer: 14,
  munecaIzq: 15,
  munecaDer: 16,
  caderaIzq: 23,
  caderaDer: 24,
  rodillaIzq: 25,
  rodillaDer: 26,
  tobilloIzq: 27,
  tobilloDer: 28,
} as const;

// Ángulo (en grados, 0-180) en el vértice `b` formado por los segmentos b->a y
// b->c. Ej.: ángulo de la rodilla = anguloEn(cadera, rodilla, tobillo).
export function anguloEn(a: Punto, b: Punto, c: Punto): number {
  const v1x = a.x - b.x;
  const v1y = a.y - b.y;
  const v2x = c.x - b.x;
  const v2y = c.y - b.y;
  const n1 = Math.hypot(v1x, v1y);
  const n2 = Math.hypot(v2x, v2y);
  if (n1 === 0 || n2 === 0) return 180;
  const cos = Math.min(1, Math.max(-1, (v1x * v2x + v1y * v2y) / (n1 * n2)));
  return (Math.acos(cos) * 180) / Math.PI;
}

// Inclinación (0-90+, en grados) del segmento `desde -> hasta` respecto de la
// vertical: 0 = perfectamente vertical. Sirve para la inclinación del torso
// (de la cadera al hombro). Es la magnitud, sin signo.
export function inclinacionVertical(desde: Punto, hasta: Punto): number {
  const dx = hasta.x - desde.x;
  const dy = hasta.y - desde.y;
  if (dx === 0 && dy === 0) return 0;
  return (Math.atan2(Math.abs(dx), Math.abs(dy)) * 180) / Math.PI;
}

// Suavizado exponencial: reduce el temblor frame a frame sin retrasar mucho.
export class Suavizador {
  private valor: number | null = null;
  constructor(private readonly alfa = 0.4) {}
  push(nuevo: number): number {
    this.valor = this.valor === null ? nuevo : this.valor + this.alfa * (nuevo - this.valor);
    return this.valor;
  }
  reset() {
    this.valor = null;
  }
}

export const visibilidad = (p: Punto | undefined) => p?.visibility ?? 0;

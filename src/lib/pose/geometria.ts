// Geometría básica para analizar la postura a partir de los 33 puntos que
// entrega MediaPipe Pose. Hay dos juegos de puntos:
// - `landmarks`: coordenadas NORMALIZADAS de la imagen (x, y entre 0 y 1, con y
//   hacia ABAJO). Sirven para dibujar y para saber qué tan visible está cada punto.
// - `worldLandmarks`: coordenadas 3D en METROS con origen en el centro de la cadera
//   (x a la derecha de la imagen, y hacia abajo, z hacia la cámara). Sirven para
//   medir ángulos sin depender de desde dónde se mira (de frente, de costado o
//   en diagonal). Los ejes siguen a la cámara, no a la gravedad: el teléfono tiene
//   que estar parado y derecho.
// Nada de esto toca la cámara ni el video: son funciones puras sobre números,
// probables sin teléfono.

export type Punto = { x: number; y: number; z?: number; visibility?: number };
export type Punto3 = { x: number; y: number; z: number };

// Índices de MediaPipe Pose que usamos.
export const PUNTO = {
  nariz: 0,
  orejaIzq: 7,
  orejaDer: 8,
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

export const aVec = (p: Punto, escalaX = 1): Punto3 => ({ x: p.x * escalaX, y: p.y, z: p.z ?? 0 });
export const restar = (a: Punto3, b: Punto3): Punto3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
export const sumar = (a: Punto3, b: Punto3): Punto3 => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });
export const escalar = (a: Punto3, k: number): Punto3 => ({ x: a.x * k, y: a.y * k, z: a.z * k });
export const punto = (a: Punto3, b: Punto3) => a.x * b.x + a.y * b.y + a.z * b.z;
export const norma = (a: Punto3) => Math.hypot(a.x, a.y, a.z);

// Ángulo (en grados, 0-180) en el vértice `b` formado por los segmentos b->a y
// b->c, en 2D o 3D. Ej.: ángulo de la rodilla = angulo3D(cadera, rodilla, tobillo).
export function angulo3D(a: Punto3, b: Punto3, c: Punto3): number {
  const v1 = restar(a, b);
  const v2 = restar(c, b);
  const n1 = norma(v1);
  const n2 = norma(v2);
  if (n1 === 0 || n2 === 0) return 180;
  const cos = Math.min(1, Math.max(-1, punto(v1, v2) / (n1 * n2)));
  return (Math.acos(cos) * 180) / Math.PI;
}

// Compatibilidad con el análisis 2D de la imagen.
export function anguloEn(a: Punto, b: Punto, c: Punto): number {
  return angulo3D(aVec({ x: a.x, y: a.y }), aVec({ x: b.x, y: b.y }), aVec({ x: c.x, y: c.y }));
}

// Inclinación (0-180, en grados) del segmento `desde -> hasta` respecto de la
// VERTICAL hacia arriba (y negativa): 0 = perfectamente vertical. Sirve para la
// inclinación del torso (de la cadera al hombro). En 3D.
export function inclinacionVertical3D(desde: Punto3, hasta: Punto3): number {
  const v = restar(hasta, desde);
  const n = norma(v);
  if (n === 0) return 0;
  const cos = Math.min(1, Math.max(-1, -v.y / n));
  return (Math.acos(cos) * 180) / Math.PI;
}

// Versión 2D (imagen) usada antes; se mantiene para las pruebas existentes.
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

// Suavizado que además ignora cuadros "glitch": si el valor salta más de `saltoMax`
// de un cuadro al siguiente (el detector perdió un punto), repite el valor anterior,
// hasta `tolerados` cuadros seguidos; si el salto se mantiene, lo acepta (es real).
export class SuavizadorRobusto {
  private valor: number | null = null;
  private crudoPrevio: number | null = null;
  private seguidos = 0;
  constructor(
    private readonly alfa: number,
    private readonly saltoMax: number,
    private readonly tolerados = 4
  ) {}
  push(nuevo: number): number {
    if (this.valor !== null && this.crudoPrevio !== null && Math.abs(nuevo - this.crudoPrevio) > this.saltoMax && this.seguidos < this.tolerados) {
      this.seguidos += 1;
      return this.valor;
    }
    this.seguidos = 0;
    this.crudoPrevio = nuevo;
    this.valor = this.valor === null ? nuevo : this.valor + this.alfa * (nuevo - this.valor);
    return this.valor;
  }
  reset() {
    this.valor = null;
    this.crudoPrevio = null;
    this.seguidos = 0;
  }
}

export const visibilidad = (p: Punto | undefined) => p?.visibility ?? 0;

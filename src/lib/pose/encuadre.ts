// Guía de encuadre: le dice a la persona si está bien parada frente al teléfono, ANTES y
// mientras cuenta. Funciones puras sobre los puntos de la imagen (x, y entre 0 y 1).
// Criterio: para contar casi cualquier ejercicio alcanza con ver los dos hombros enteros
// y que no se corte el cuerpo por el borde; el tamaño se mide por el ancho de hombros
// (no por el cuerpo entero, así sirve también a menos de 1 metro en ejercicios de brazos).

import { PUNTO, type Punto } from "./geometria";

export type CodigoEncuadre = "ok" | "sin-cuerpo" | "lejos" | "cerca" | "cortado";

export type Encuadre = { codigo: CodigoEncuadre; ok: boolean; mensaje: string; voz: string | null };

const VIS = 0.5;
const ANCHO_HOMBROS_MIN = 0.14; // menos: muy lejos
const ANCHO_HOMBROS_MAX = 0.62; // más: muy cerca
const MARGEN = 0.015;

export function evaluarEncuadre(vis: Punto[] | undefined): Encuadre {
  const hI = vis?.[PUNTO.hombroIzq];
  const hD = vis?.[PUNTO.hombroDer];
  if (!vis || !hI || !hD || (hI.visibility ?? 0) < VIS || (hD.visibility ?? 0) < VIS) {
    return { codigo: "sin-cuerpo", ok: false, mensaje: "No te veo: ponete frente a la cámara, con los hombros en cuadro.", voz: "No te veo" };
  }
  const ancho = Math.abs(hI.x - hD.x);
  if (ancho < ANCHO_HOMBROS_MIN) return { codigo: "lejos", ok: false, mensaje: "Acercate un poco al teléfono.", voz: "Acercate un poco" };
  if (ancho > ANCHO_HOMBROS_MAX) return { codigo: "cerca", ok: false, mensaje: "Alejate un poco del teléfono.", voz: "Alejate un poco" };
  // ¿Se corta algún punto visible por el borde de la imagen?
  const indices = [
    PUNTO.hombroIzq, PUNTO.hombroDer, PUNTO.codoIzq, PUNTO.codoDer, PUNTO.munecaIzq, PUNTO.munecaDer,
    PUNTO.caderaIzq, PUNTO.caderaDer, PUNTO.rodillaIzq, PUNTO.rodillaDer,
  ];
  const cortado = indices.some((i) => {
    const p = vis[i];
    return p && (p.visibility ?? 0) >= VIS && (p.x < MARGEN || p.x > 1 - MARGEN || p.y < MARGEN || p.y > 1 - MARGEN);
  });
  if (cortado) return { codigo: "cortado", ok: false, mensaje: "Se te corta el cuerpo por el borde: corré el teléfono o alejate.", voz: "Se te corta el cuerpo, alejate un poco" };
  return { codigo: "ok", ok: true, mensaje: "Te veo bien.", voz: null };
}

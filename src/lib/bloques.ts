// Bloques de ejercicios (biseries): varios ejercicios consecutivos de un mismo día que se hacen seguidos, como una ronda
// (migración 113). Cada ejercicio conserva sus propias series y su progreso en workout_logs; el bloque solo cambia cómo
// se muestra el día y cómo se encadena el descanso. Lógica pura, sin pantalla.

export type InfoBloque = {
  numero: number;
  titulo: string;
  /** Posición dentro del bloque (0 = primero). */
  posicion: number;
  total: number;
  /** Descanso al pasar de un ejercicio al siguiente de la misma ronda. */
  entreS: number;
  /** Descanso al cerrar la ronda, antes de repetirla. */
  finalS: number;
};

export type FilaBloque = {
  bloque: number | null;
  bloque_titulo: string | null;
  bloque_descanso_entre_s: number | null;
  bloque_descanso_final_s: number | null;
};

const ENTRE_POR_DEFECTO_S = 60;
const FINAL_POR_DEFECTO_S = 90;

/** Info de bloque de cada fila (en el mismo orden). Un "bloque" de un solo ejercicio no es un bloque. */
export function infoDeBloques(filas: readonly FilaBloque[]): (InfoBloque | null)[] {
  return filas.map((f, i) => {
    if (f.bloque === null) return null;
    const miembros = filas.map((g, j) => ({ g, j })).filter(({ g }) => g.bloque === f.bloque);
    if (miembros.length < 2) return null;
    return {
      numero: f.bloque,
      titulo: f.bloque_titulo ?? "",
      posicion: miembros.findIndex(({ j }) => j === i),
      total: miembros.length,
      entreS: f.bloque_descanso_entre_s ?? ENTRE_POR_DEFECTO_S,
      finalS: f.bloque_descanso_final_s ?? FINAL_POR_DEFECTO_S,
    };
  });
}

/** Agrupa ejercicios consecutivos del mismo bloque; los demás quedan solos con `bloque: null`. */
export function agruparBloques<T extends { bloque?: InfoBloque | null }>(items: readonly T[]): { bloque: InfoBloque | null; items: T[] }[] {
  const grupos: { bloque: InfoBloque | null; items: T[] }[] = [];
  for (const it of items) {
    const b = it.bloque ?? null;
    const ultimo = grupos[grupos.length - 1];
    if (b && ultimo?.bloque && ultimo.bloque.numero === b.numero) ultimo.items.push(it);
    else grupos.push({ bloque: b, items: [it] });
  }
  return grupos;
}

export type TransicionBloque = {
  /** Ejercicio que sigue (puede ser el mismo bloque desde el principio) o null si terminó la última ronda. */
  siguienteId: number | null;
  /** Descanso a mostrar antes de seguir; null si no hay. */
  descansoS: number | null;
  etiqueta: string;
};

/**
 * Qué sigue después de guardar una serie del ejercicio activo de un bloque.
 * - Si no es el último del bloque: pasa al siguiente, con el descanso corto.
 * - Si es el último y quedan rondas: vuelve al primero, con el descanso de cierre de ronda.
 * - Si era la última ronda: no hay a dónde ir.
 * `seriesHechasAntes` son las series completas del ejercicio activo SIN contar la que se acaba de guardar.
 */
export function transicionBloque(
  miembros: readonly { id: number; nombre: string }[],
  activoId: number,
  info: InfoBloque,
  seriesHechasAntes: number,
  seriesObjetivo: number
): TransicionBloque {
  const i = miembros.findIndex((m) => m.id === activoId);
  if (i === -1) return { siguienteId: null, descansoS: null, etiqueta: "" };
  if (i < miembros.length - 1) {
    const sig = miembros[i + 1];
    return { siguienteId: sig.id, descansoS: info.entreS, etiqueta: `Biserie: descanso y seguí con ${sig.nombre}` };
  }
  if (seriesHechasAntes + 1 < seriesObjetivo) {
    const primero = miembros[0];
    return { siguienteId: primero.id, descansoS: info.finalS, etiqueta: `Fin de la ronda: descanso y volvé a ${primero.nombre}` };
  }
  return { siguienteId: null, descansoS: null, etiqueta: "" };
}

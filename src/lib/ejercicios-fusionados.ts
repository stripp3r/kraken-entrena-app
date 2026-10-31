// Ejercicios del catálogo que se fusionaron en otro (migración 112, 2026-10-30): id viejo -> id vigente.
// Sirve para que una pestaña abierta, una PWA con la pantalla en caché o un borrador guardado en el teléfono
// antes de la fusión no rompan al usar un id que ya no existe (las claves foráneras rechazarían el guardado).
// Se usa SOLO cuando el id viejo ya no existe en la base: así el código es seguro antes de aplicar la migración y
// también si se deshace (con el id viejo de vuelta en el catálogo, se respeta tal cual).
// Si se fusionan más ejercicios en el futuro, agregarlos acá además de la migración.
export const EJERCICIOS_FUSIONADOS: Readonly<Record<number, number>> = {
  276: 292,
  86: 85,
  143: 136,
  145: 30,
  168: 34,
  146: 240,
  273: 73,
  2: 111,
  88: 96,
};

export function idVigente(id: number): number {
  return EJERCICIOS_FUSIONADOS[id] ?? id;
}

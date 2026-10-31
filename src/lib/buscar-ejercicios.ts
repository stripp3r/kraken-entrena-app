// Filtro del selector de ejercicios de "Crea tu rutina". Funciones puras (se prueban sin pantalla).
import type { EjercicioCatalogo } from "./borrador-rutina";

export const FILTRO_TODOS = "Todos";

// Marcas combinantes de Unicode (U+0300 a U+036F): lo que queda suelto de las tildes después de normalizar a NFD.
const MARCAS_COMBINADAS = new RegExp(`[${String.fromCharCode(0x300)}-${String.fromCharCode(0x36f)}]`, "g");

/** Minúsculas y sin tildes: en el teléfono casi nadie escribe "tríceps" o "elevación" con tilde. */
export const sinTildes = (s: string) => s.normalize("NFD").replace(MARCAS_COMBINADAS, "").toLowerCase();

/**
 * Ejercicios que se pueden elegir en un día: los de alguno de los grupos del día (o del grupo elegido en el filtro) y
 * que contengan TODAS las palabras buscadas, en cualquier orden ("inclinado press" encuentra "Press inclinado con ...").
 */
export function filtrarCatalogo(
  catalogo: readonly EjercicioCatalogo[],
  gruposDelDia: readonly string[],
  filtroGrupo: string,
  busqueda: string
): EjercicioCatalogo[] {
  if (gruposDelDia.length === 0) return [];
  const palabras = sinTildes(busqueda).split(/\s+/).filter(Boolean);
  return catalogo.filter((ex) => {
    const gruposEx = ex.grupos_musculares ?? [];
    const pasaGrupo =
      filtroGrupo === FILTRO_TODOS ? gruposEx.some((g) => gruposDelDia.includes(g)) : gruposEx.includes(filtroGrupo);
    if (!pasaGrupo) return false;
    const nombre = sinTildes(ex.nombre);
    return palabras.every((p) => nombre.includes(p));
  });
}

// Grupos musculares que el usuario marca por día al armar su propia rutina
// en "Crea tu rutina". A propósito NO se infiere de `exercise_definitions
// .categoria` -- esa categoría (Legs/Pull/Push/Torso) es de scheduling, no
// de anatomía real ("Torso" mezcla ejercicios de empuje y de tracción), así
// que no sirve como fuente de verdad para calcular frecuencia/recuperación.
//
// Lista calcada 1 a 1 de las carpetas de la biblioteca de referencia
// (D:\PROYECTO FITNESS\VIDEOS\RECURSOS\TECNICAS DE EJERCICIOS\EJERCICIOS\)
// -- si un ejercicio nuevo sale de la carpeta X, su grupo muscular es X,
// sin excepción (regla del usuario, 2026-09-22). "CARDIO" no es un grupo
// muscular, se excluye a propósito.
export const GRUPOS_MUSCULARES = [
  "Pecho",
  "Espalda",
  "Hombros",
  "Bíceps",
  "Tríceps",
  "Cuádriceps",
  "Isquiotibiales",
  "Glúteos",
  "Pantorrillas",
  "Abdominales",
  "Trapecio",
  "Abductores",
  "Antebrazos",
  "Cuello",
] as const;

export type GrupoMuscular = (typeof GRUPOS_MUSCULARES)[number];

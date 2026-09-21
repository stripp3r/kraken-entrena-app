// Grupos musculares que el usuario marca por día al armar su propia rutina
// en "Crea tu rutina". A propósito NO se infiere de `exercise_definitions
// .categoria` -- esa categoría (Legs/Pull/Push/Torso) es de scheduling, no
// de anatomía real ("Torso" mezcla ejercicios de empuje y de tracción), así
// que no sirve como fuente de verdad para calcular frecuencia/recuperación.
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
] as const;

export type GrupoMuscular = (typeof GRUPOS_MUSCULARES)[number];

// MRV (Maximum Recoverable Volume) por grupo muscular -- series semanales
// "difíciles" (working sets) que ese músculo puede tolerar y todavía
// recuperarse a tiempo para la próxima sesión. Es el techo de volumen
// productivo, no un objetivo a superar: más allá de esto se considera
// volumen basura (fatiga sin estímulo extra de crecimiento).
//
// Framework de Renaissance Periodization (Dr. Mike Israetel), la
// referencia más citada en la industria para esto -- no es un número
// inventado para esta app. Fuentes:
// - Pecho/Espalda/Hombros/Cuádriceps/Isquiotibiales/Bíceps/Tríceps/
//   Pantorrillas: extremo superior del rango de MRV publicado en
//   https://arvo.guru/resources/volume-landmarks (compilación de las
//   guías de RP Strength).
// - Glúteos (16), Abdominales (25), Trapecio (26): cifra explícita de
//   RP Strength (Mike Israetel Training Landmarks), vía
//   https://help.rpstrength.com/hc/en-us/articles/32433132961431-Glutes
//   y guías equivalentes de abs/trapecio.
// - Abductores, Antebrazos, Cuello: RP no publica landmarks propios para
//   estos (son secundarios/de bajo volumen directo en la mayoría de los
//   programas) -- valor estimado por similitud con grupos chicos de
//   recuperación rápida (pantorrillas/glúteos). Ajustar si hace falta.
export const MRV_POR_GRUPO: Record<string, number> = {
  Pecho: 24,
  Espalda: 26,
  Hombros: 22,
  Cuádriceps: 24,
  Isquiotibiales: 20,
  Bíceps: 20,
  Tríceps: 18,
  Pantorrillas: 24,
  Glúteos: 16,
  Abdominales: 25,
  Trapecio: 26,
  Abductores: 16,
  Antebrazos: 20,
  Cuello: 20,
};

const MRV_POR_DEFECTO = 20;

export function mrvDeGrupo(grupo: string): number {
  return MRV_POR_GRUPO[grupo] ?? MRV_POR_DEFECTO;
}

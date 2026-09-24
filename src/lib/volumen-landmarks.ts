// Landmarks de volumen semanal por grupo muscular -- framework de
// Renaissance Periodization (Dr. Mike Israetel), la referencia más citada
// en la industria para esto, no números inventados para esta app.
//
// MEV (Minimum Effective Volume): el piso -- menos que esto y no hay
// estímulo suficiente para crecer.
// MAV (Maximum Adaptive Volume): el "sweet spot" -- la zona de mejor
// relación estímulo/fatiga, donde vive el volumen bien dosificado para la
// gran mayoría de la gente.
// MRV (Maximum Recoverable Volume): el techo de recuperación, MUY
// individual (edad de entrenamiento, genética, sueño, estrés, natural vs.
// no natural). NO es un objetivo -- para la mayoría de los naturales,
// acercarse al MRV tabulado ya es sobreentrenamiento. Se guarda acá porque
// referencia útil, pero el scoring de Volumen (ver src/lib/pentagono.ts)
// usa la banda MEV-MAV, no el MRV, como zona "bien dosificada".
//
// Convención: MEV = extremo inferior del rango publicado, MAV/MRV =
// extremo superior (mismo criterio ya usado para fijar el MRV original).
//
// Fuentes:
// - Pecho/Espalda/Hombros/Cuádriceps/Isquiotibiales/Bíceps/Tríceps/
//   Pantorrillas: rango completo (MEV/MAV/MRV) publicado en
//   https://arvo.guru/resources/volume-landmarks (compilación de las
//   guías de RP Strength) -- los 3 valores están confirmados contra esa
//   fuente.
// - Glúteos, Abdominales, Trapecio: el MRV (16/25/26) viene de una guía
//   anterior de RP Strength citada al fijar este archivo originalmente.
//   MEV/MAV acá son *estimados* por proporción (MEV ≈ 25% del MRV, MAV ≈
//   73% del MRV, el promedio observado en los 8 grupos con rango
//   completo de arriba) -- al verificar contra las guías de
//   rpstrength.com/blogs/articles/{glute,ab,trap}-hypertrophy-training-
//   tips vigentes hoy, esas páginas dan números bastante MÁS BAJOS para
//   el programa "whole body" estándar (ej. traps MRV 12-20, abs MRV
//   12-20) y coinciden mejor con el tier "Primary Priority" de RP
//   (especialización en ese músculo) que con el estándar -- o sea, el
//   MRV=16/25/26 ya cargado acá probablemente corresponde a una versión
//   distinta/más vieja de la tabla de RP, no a la vigente. No se tocó
//   (fuera de alcance de este cambio), pero vale la pena revisarlo en
//   algún momento.
// - Abductores, Antebrazos, Cuello: RP no publica landmarks propios para
//   estos. Los 3 valores (MEV, MAV y el MRV ya existente) son estimados
//   por similitud con grupos chicos de recuperación rápida. Ajustar si
//   hace falta.
//
// Verificación 2026-09-24 (pedida explícitamente antes de dar por buenos
// los MAV de Glúteos/Abdominales/Trapecio): help.rpstrength.com está detrás
// de login de cliente, no se pudo leer. Se verificó contra el blog público
// (rpstrength.com/blogs/articles/{glute,ab,trap}-hypertrophy-training-tips,
// vigente a esta fecha) en su lugar:
// - Abdominales y Trapecio: el blog da MEV 0-4, MAV 4-12, MRV 12-20 en el
//   tier estándar, y MAV 16-24, MRV 24-32+ en el tier "Priority" (foco
//   dedicado en ese músculo). Los valores ya cargados acá (MAV 20, MRV
//   25/26) encajan con el tier Priority, no con el estándar -- confirma la
//   sospecha que ya tenía este comentario.
// - Glúteos: acá SÍ hay una discrepancia más grande que en los otros dos.
//   El blog da MEV 6-8, MAV 8-24, MRV 24-30 (estándar) -- el MRV=16 ya
//   cargado queda incluso por debajo del piso del tier estándar, no solo
//   del "Priority". No se tocó (instrucción explícita de no cambiar MRV
//   ya existente), pero quedó documentado que Glúteos es el grupo con más
//   diferencia contra la fuente vigente y el candidato más probable a
//   revisar primero si se ajusta esta tabla más adelante.
export type LandmarksGrupo = { mev: number; mav: number; mrv: number };

export const LANDMARKS_POR_GRUPO: Record<string, LandmarksGrupo> = {
  Pecho: { mev: 6, mav: 18, mrv: 24 },
  Espalda: { mev: 8, mav: 20, mrv: 26 },
  Hombros: { mev: 6, mav: 16, mrv: 22 },
  Cuádriceps: { mev: 6, mav: 18, mrv: 24 },
  Isquiotibiales: { mev: 4, mav: 14, mrv: 20 },
  Bíceps: { mev: 4, mav: 14, mrv: 20 },
  Tríceps: { mev: 4, mav: 12, mrv: 18 },
  Pantorrillas: { mev: 6, mav: 16, mrv: 24 },
  Glúteos: { mev: 4, mav: 12, mrv: 16 },
  Abdominales: { mev: 6, mav: 20, mrv: 25 },
  Trapecio: { mev: 6, mav: 20, mrv: 26 },
  Abductores: { mev: 4, mav: 12, mrv: 16 },
  Antebrazos: { mev: 5, mav: 14, mrv: 20 },
  Cuello: { mev: 5, mav: 14, mrv: 20 },
};

const LANDMARKS_POR_DEFECTO: LandmarksGrupo = { mev: 5, mav: 14, mrv: 20 };

export function landmarksDeGrupo(grupo: string): LandmarksGrupo {
  return LANDMARKS_POR_GRUPO[grupo] ?? LANDMARKS_POR_DEFECTO;
}

export function mrvDeGrupo(grupo: string): number {
  return landmarksDeGrupo(grupo).mrv;
}

export function mevDeGrupo(grupo: string): number {
  return landmarksDeGrupo(grupo).mev;
}

export function mavDeGrupo(grupo: string): number {
  return landmarksDeGrupo(grupo).mav;
}

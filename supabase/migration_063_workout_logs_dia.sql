-- Migración 063: guarda en qué día de la rutina (A/B/C...) se cargó cada
-- set.
--
-- Motivo: un mismo ejercicio (mismo exercise_definition_id) puede estar
-- agendado en más de un día de una rutina -- hoy eso pasa en Anti-Flakardo
-- Fullbody (A/B/C repiten el mismo template) y Anti-Flakardo Torso Pierna
-- (A=C=Torso, B=D=Piernas). En esos casos, como los dos/tres días usan
-- EXACTAMENTE la misma prescripción (series/reps/RIR), mezclar su
-- historial es correcto: es el mismo estímulo entrenado varias veces por
-- semana. Pero si en el futuro se carga una rutina donde el mismo
-- ejercicio se repite con una prescripción DISTINTA según el día (ej. Día
-- A fuerza 5x5, Día B hipertrofia 3x15), la sugerencia de peso y el
-- historial de progreso no deben mezclar esas dos sesiones -- hoy no hay
-- forma de distinguirlas porque `workout_logs` no guarda de qué día vino
-- cada set. Esta columna es la base para que el código (ver
-- entrenamiento/[dia]/page.tsx y progreso/entrenamiento/page.tsx) pueda
-- separar el historial SOLO cuando la prescripción realmente diverge entre
-- días, sin tocar el comportamiento actual (que sigue siendo mezclar) en
-- el caso común de hoy.
--
-- Aditiva, sin backfill: los registros ya cargados quedan con dia = null
-- (no hay forma confiable de reconstruir de qué día vinieron) y siguen
-- participando del historial combinado como hasta ahora.
--
-- Correr en el SQL Editor de Supabase.

alter table public.workout_logs
  add column if not exists dia text;

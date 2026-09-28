-- Migración 082: ajustes a la rutina privada "Kraken Split" (id 7, la
-- rutina personal del coach) pedidos por el usuario, más una corrección
-- de catálogo encontrada de paso.
--
-- 5 ejercicios nuevos en el catálogo (ninguno duplicado excepto uno
-- descartado en el momento -- ver nota):
--   - Tríceps en polea alta con barra V (bilateral, agarre en V)
--   - Apertura en polea, banco inclinado
--   - Dominadas cerradas con agarre neutro
--   - Encogimiento de hombros unilateral con mancuerna (Gittleson)
--   - (NO agregado) "Hip thrust con barra": resultó ser un duplicado
--     exacto por hash MD5 de id 64 "Empuje de caderas", ya existente --
--     se usó id 64 en su lugar, no se creó una fila nueva.
--
-- Corrección de catálogo de paso: id 77 "Extensión de tríceps sobre la
-- cabeza en polea" tenía el GIF equivocado -- el texto y el flag
-- unilateral=false ya describían correctamente el movimiento a DOS
-- manos con cuerda, pero la imagen cargada mostraba una sola mano. Se
-- reemplazó el imagen_url por el GIF correcto (bilateral). Detectado
-- por el usuario revisando su propia rutina Día E.
--
-- Cambios en routine_exercises de la rutina 7 (Kraken Split):
--
-- Día A: "Tríceps en polea alta a un brazo" (unilateral) -> "Tríceps en
--   polea alta con barra V" (bilateral) -- el usuario prioriza
--   bilaterales por practicidad de tiempo.
-- Día B: "Patada de glúteo en polea" -> "Empuje de caderas" (Hip
--   thrust). "Abducción de cadera en polea" -> "Sentadilla sissy" (el
--   usuario compró una máquina de sentadilla sissy).
-- Día C: "Aperturas con mancuernas" -> "Apertura en polea, banco
--   inclinado". "Press francés con barra EZ" -> "Extensión de tríceps
--   inclinada en polea baja" (banco inclinado + polea baja + bilateral
--   -- el usuario descubrió que unilateral/con barra le molesta el
--   codo, y la leve inclinación se lo resuelve). "Jalón lateral con
--   polea a un brazo" -> "Dominadas cerradas con agarre neutro" (mismo
--   patrón de tracción, pero con el propio peso corporal en barra de
--   dominadas en vez de máquina).
-- Día D: sin cambios.
-- Día E: "Encogimiento de hombros con mancuernas" (bilateral) ->
--   "Encogimiento de hombros unilateral con mancuerna (Gittleson)".
--
-- Ejecutado por Claude vía REST con service role (son cambios de datos,
-- no de esquema) -- este archivo queda como registro. No hace falta
-- correrlo en el SQL Editor.

update public.routine_exercises set exercise_definition_id = 284 where id = 108; -- Dia A: Triceps polea alta con barra V
update public.routine_exercises set exercise_definition_id = 64, series_reps = '3 x 8-12' where id = 123; -- Dia B: Empuje de caderas
update public.routine_exercises set exercise_definition_id = 45, series_reps = '3 x 12-20' where id = 127; -- Dia B: Sentadilla sissy
update public.routine_exercises set exercise_definition_id = 286 where id = 117; -- Dia C: Apertura en polea, banco inclinado
update public.routine_exercises set exercise_definition_id = 24 where id = 120; -- Dia C: Extension triceps inclinada en polea baja
update public.routine_exercises set exercise_definition_id = 287 where id = 116; -- Dia C: Dominadas cerradas agarre neutro
update public.routine_exercises set exercise_definition_id = 288, series_reps = '3 x 10-15 por lado' where id = 135; -- Dia E: Encogimiento unilateral Gittleson

update public.exercise_definitions
  set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/extension-triceps-sobre-cabeza-polea-bilateral.gif'
  where id = 77;

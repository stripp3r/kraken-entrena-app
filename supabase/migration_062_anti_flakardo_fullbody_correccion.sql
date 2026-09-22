-- Migración 062: corrige el contenido real de "Anti-Flakardo Fullbody"
-- (antes "3 días - Fullbody").
--
-- Mismo problema que "Anti-Flakardo Torso Pierna" (migración 061): lo que
-- tenía cargado no correspondía al protocolo real -- cada día tenía una
-- selección distinta y genérica (Día A: sentadilla/banco/dorsales/press
-- militar con mancuernas/hiperextensiones/abs; Día B: fondos/peso
-- muerto/prensa/remo/vuelo lateral/abs...). El usuario mandó la captura
-- real del PDF: UN solo template de 6 ejercicios (Sentadillas, Peso
-- muerto, Press militar, Press de banca plano, Dominadas en polea, Remo en
-- polea) que se repite en los 3 días de la semana -- mismo criterio de
-- "un template repetido" ya confirmado para Torso Pierna (A=Torso,
-- C=Torso; B=Piernas, D=Piernas).
--
-- El PDF de esta rutina no muestra abdominales -- a diferencia de la vieja
-- carga, acá no se agrega ningún ejercicio de abs por criterio propio; son
-- los 6 exactos que mandó el usuario, sin más ni menos.
--
-- No toca workout_logs (apuntan a exercise_definitions directo, no a
-- routine_exercises).
--
-- Correr en el SQL Editor de Supabase.

delete from public.routine_exercises
where routine_id = (select id from public.routines where nombre = 'Anti-Flakardo Fullbody');

-- ============ DÍA A ============
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
values
  ((select id from public.routines where nombre = 'Anti-Flakardo Fullbody'), 'A', 1,
    (select id from public.exercise_definitions where nombre = 'Sentadilla con barra'), '3 x 8-10 (RIR 2)', 2),
  ((select id from public.routines where nombre = 'Anti-Flakardo Fullbody'), 'A', 2,
    (select id from public.exercise_definitions where nombre = 'Peso muerto'), '3 x 8-10 (RIR 2)', 2),
  ((select id from public.routines where nombre = 'Anti-Flakardo Fullbody'), 'A', 3,
    (select id from public.exercise_definitions where nombre = 'Press militar en máquina Smith'), '3 x 8-10 (RIR 2)', 2),
  ((select id from public.routines where nombre = 'Anti-Flakardo Fullbody'), 'A', 4,
    (select id from public.exercise_definitions where nombre = 'Press banco plano con barra'), '3 x 8-10 (RIR 2)', 2),
  ((select id from public.routines where nombre = 'Anti-Flakardo Fullbody'), 'A', 5,
    (select id from public.exercise_definitions where nombre = 'Dorsales en polea alta'), '3 x 10-12 (RIR 1)', 1),
  ((select id from public.routines where nombre = 'Anti-Flakardo Fullbody'), 'A', 6,
    (select id from public.exercise_definitions where nombre = 'Remo en máquina sentado'), '3 x 10-12 (RIR 1)', 1);

-- ============ DÍA B (repite Día A) ============
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
values
  ((select id from public.routines where nombre = 'Anti-Flakardo Fullbody'), 'B', 1,
    (select id from public.exercise_definitions where nombre = 'Sentadilla con barra'), '3 x 8-10 (RIR 2)', 2),
  ((select id from public.routines where nombre = 'Anti-Flakardo Fullbody'), 'B', 2,
    (select id from public.exercise_definitions where nombre = 'Peso muerto'), '3 x 8-10 (RIR 2)', 2),
  ((select id from public.routines where nombre = 'Anti-Flakardo Fullbody'), 'B', 3,
    (select id from public.exercise_definitions where nombre = 'Press militar en máquina Smith'), '3 x 8-10 (RIR 2)', 2),
  ((select id from public.routines where nombre = 'Anti-Flakardo Fullbody'), 'B', 4,
    (select id from public.exercise_definitions where nombre = 'Press banco plano con barra'), '3 x 8-10 (RIR 2)', 2),
  ((select id from public.routines where nombre = 'Anti-Flakardo Fullbody'), 'B', 5,
    (select id from public.exercise_definitions where nombre = 'Dorsales en polea alta'), '3 x 10-12 (RIR 1)', 1),
  ((select id from public.routines where nombre = 'Anti-Flakardo Fullbody'), 'B', 6,
    (select id from public.exercise_definitions where nombre = 'Remo en máquina sentado'), '3 x 10-12 (RIR 1)', 1);

-- ============ DÍA C (repite Día A) ============
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
values
  ((select id from public.routines where nombre = 'Anti-Flakardo Fullbody'), 'C', 1,
    (select id from public.exercise_definitions where nombre = 'Sentadilla con barra'), '3 x 8-10 (RIR 2)', 2),
  ((select id from public.routines where nombre = 'Anti-Flakardo Fullbody'), 'C', 2,
    (select id from public.exercise_definitions where nombre = 'Peso muerto'), '3 x 8-10 (RIR 2)', 2),
  ((select id from public.routines where nombre = 'Anti-Flakardo Fullbody'), 'C', 3,
    (select id from public.exercise_definitions where nombre = 'Press militar en máquina Smith'), '3 x 8-10 (RIR 2)', 2),
  ((select id from public.routines where nombre = 'Anti-Flakardo Fullbody'), 'C', 4,
    (select id from public.exercise_definitions where nombre = 'Press banco plano con barra'), '3 x 8-10 (RIR 2)', 2),
  ((select id from public.routines where nombre = 'Anti-Flakardo Fullbody'), 'C', 5,
    (select id from public.exercise_definitions where nombre = 'Dorsales en polea alta'), '3 x 10-12 (RIR 1)', 1),
  ((select id from public.routines where nombre = 'Anti-Flakardo Fullbody'), 'C', 6,
    (select id from public.exercise_definitions where nombre = 'Remo en máquina sentado'), '3 x 10-12 (RIR 1)', 1);

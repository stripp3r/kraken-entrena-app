-- Migración 061: corrige el contenido de "Anti-Flakardo Torso Pierna"
-- (antes "Entreno 4 días").
--
-- Lo que tenía cargado era un split genérico tipo Push/Pull/Piernas/Full
-- (Press militar, Vuelo lateral, Tríceps... en el Día A) que no tiene nada
-- que ver con el protocolo real -- el usuario mandó capturas del PDF real
-- de Anti-Flakardo: 2 plantillas, "Día Torso" y "Día Piernas", confirmó que
-- los 4 días de la semana son A=Torso, B=Piernas, C=Torso (repite), D=
-- Piernas (repite). Series/reps/RIR no estaban en las capturas -- el
-- usuario pidió usar criterio propio (mismo enfoque que Torso-Pierna/Push
-- Pull Legs de la migración 060), rangos moderados acorde al perfil
-- principiante/anti-abandono del producto.
--
-- "Circuito de abs" del PDF se separa en 2 ejercicios reales del catálogo
-- (Elevación de piernas colgado + Abdominales en banco declinado) -- mismo
-- criterio ya usado para "ABS CIRCUITO" en la migración 022 (Fullbody).
--
-- No toca workout_logs (esos apuntan a exercise_definitions directo, no a
-- routine_exercises -- ver arquitectura de ejercicios canónicos en
-- migración 019, no se pierde el historial de nadie que haya cargado sets
-- de esta rutina).
--
-- Correr en el SQL Editor de Supabase.

delete from public.routine_exercises
where routine_id = (select id from public.routines where nombre = 'Anti-Flakardo Torso Pierna');

-- ============ DÍA A: TORSO ============
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
values
  ((select id from public.routines where nombre = 'Anti-Flakardo Torso Pierna'), 'A', 1,
    (select id from public.exercise_definitions where nombre = 'Press banco plano con barra'), '4 x 8-10 (RIR 2)', 2),
  ((select id from public.routines where nombre = 'Anti-Flakardo Torso Pierna'), 'A', 2,
    (select id from public.exercise_definitions where nombre = 'Dorsales en polea alta'), '3 x 10-12 (RIR 2)', 2),
  ((select id from public.routines where nombre = 'Anti-Flakardo Torso Pierna'), 'A', 3,
    (select id from public.exercise_definitions where nombre = 'Remo en máquina sentado'), '3 x 10-12 (RIR 2)', 2),
  ((select id from public.routines where nombre = 'Anti-Flakardo Torso Pierna'), 'A', 4,
    (select id from public.exercise_definitions where nombre = 'Fondos en paralelas'), '3 x 10-12 (RIR 1)', 1),
  ((select id from public.routines where nombre = 'Anti-Flakardo Torso Pierna'), 'A', 5,
    (select id from public.exercise_definitions where nombre = 'Press militar en máquina Smith'), '3 x 8-10 (RIR 2)', 2),
  ((select id from public.routines where nombre = 'Anti-Flakardo Torso Pierna'), 'A', 6,
    (select id from public.exercise_definitions where nombre = 'Remo con barra parado'), '3 x 8-10 (RIR 1)', 1);

-- ============ DÍA B: PIERNAS ============
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
values
  ((select id from public.routines where nombre = 'Anti-Flakardo Torso Pierna'), 'B', 1,
    (select id from public.exercise_definitions where nombre = 'Sentadilla con barra'), '4 x 8-10 (RIR 2)', 2),
  ((select id from public.routines where nombre = 'Anti-Flakardo Torso Pierna'), 'B', 2,
    (select id from public.exercise_definitions where nombre = 'Peso muerto'), '3 x 8-10 (RIR 2)', 2),
  ((select id from public.routines where nombre = 'Anti-Flakardo Torso Pierna'), 'B', 3,
    (select id from public.exercise_definitions where nombre = 'Extensión de cuádriceps'), '3 x 12-15 (RIR 1)', 1),
  ((select id from public.routines where nombre = 'Anti-Flakardo Torso Pierna'), 'B', 4,
    (select id from public.exercise_definitions where nombre = 'Hack Squat'), '3 x 10-12 (RIR 1)', 1),
  ((select id from public.routines where nombre = 'Anti-Flakardo Torso Pierna'), 'B', 5,
    (select id from public.exercise_definitions where nombre = 'Elevación de talón parado'), '4 x 12-15 (RIR 1)', 1),
  ((select id from public.routines where nombre = 'Anti-Flakardo Torso Pierna'), 'B', 6,
    (select id from public.exercise_definitions where nombre = 'Elevación de piernas colgado'), '3 x 12-15 (RIR 1)', 1),
  ((select id from public.routines where nombre = 'Anti-Flakardo Torso Pierna'), 'B', 7,
    (select id from public.exercise_definitions where nombre = 'Abdominales en banco declinado'), '3 x 12-15 (RIR 1)', 1);

-- ============ DÍA C: TORSO (repite Día A) ============
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
values
  ((select id from public.routines where nombre = 'Anti-Flakardo Torso Pierna'), 'C', 1,
    (select id from public.exercise_definitions where nombre = 'Press banco plano con barra'), '4 x 8-10 (RIR 2)', 2),
  ((select id from public.routines where nombre = 'Anti-Flakardo Torso Pierna'), 'C', 2,
    (select id from public.exercise_definitions where nombre = 'Dorsales en polea alta'), '3 x 10-12 (RIR 2)', 2),
  ((select id from public.routines where nombre = 'Anti-Flakardo Torso Pierna'), 'C', 3,
    (select id from public.exercise_definitions where nombre = 'Remo en máquina sentado'), '3 x 10-12 (RIR 2)', 2),
  ((select id from public.routines where nombre = 'Anti-Flakardo Torso Pierna'), 'C', 4,
    (select id from public.exercise_definitions where nombre = 'Fondos en paralelas'), '3 x 10-12 (RIR 1)', 1),
  ((select id from public.routines where nombre = 'Anti-Flakardo Torso Pierna'), 'C', 5,
    (select id from public.exercise_definitions where nombre = 'Press militar en máquina Smith'), '3 x 8-10 (RIR 2)', 2),
  ((select id from public.routines where nombre = 'Anti-Flakardo Torso Pierna'), 'C', 6,
    (select id from public.exercise_definitions where nombre = 'Remo con barra parado'), '3 x 8-10 (RIR 1)', 1);

-- ============ DÍA D: PIERNAS (repite Día B) ============
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
values
  ((select id from public.routines where nombre = 'Anti-Flakardo Torso Pierna'), 'D', 1,
    (select id from public.exercise_definitions where nombre = 'Sentadilla con barra'), '4 x 8-10 (RIR 2)', 2),
  ((select id from public.routines where nombre = 'Anti-Flakardo Torso Pierna'), 'D', 2,
    (select id from public.exercise_definitions where nombre = 'Peso muerto'), '3 x 8-10 (RIR 2)', 2),
  ((select id from public.routines where nombre = 'Anti-Flakardo Torso Pierna'), 'D', 3,
    (select id from public.exercise_definitions where nombre = 'Extensión de cuádriceps'), '3 x 12-15 (RIR 1)', 1),
  ((select id from public.routines where nombre = 'Anti-Flakardo Torso Pierna'), 'D', 4,
    (select id from public.exercise_definitions where nombre = 'Hack Squat'), '3 x 10-12 (RIR 1)', 1),
  ((select id from public.routines where nombre = 'Anti-Flakardo Torso Pierna'), 'D', 5,
    (select id from public.exercise_definitions where nombre = 'Elevación de talón parado'), '4 x 12-15 (RIR 1)', 1),
  ((select id from public.routines where nombre = 'Anti-Flakardo Torso Pierna'), 'D', 6,
    (select id from public.exercise_definitions where nombre = 'Elevación de piernas colgado'), '3 x 12-15 (RIR 1)', 1),
  ((select id from public.routines where nombre = 'Anti-Flakardo Torso Pierna'), 'D', 7,
    (select id from public.exercise_definitions where nombre = 'Abdominales en banco declinado'), '3 x 12-15 (RIR 1)', 1);

-- Migración 084: recrea "3 días - Fullbody" como rutina PÚBLICA genérica,
-- independiente de "Anti-Flakardo Fullbody".
--
-- Contexto: la rutina original "3 días - Fullbody" (migración 022) fue
-- renombrada a "Anti-Flakardo Fullbody" y su contenido reemplazado por el
-- plan específico del producto pago Anti-Flakardo (migración 062) -- desde
-- entonces la app ya no tenía ninguna rutina fullbody genérica y gratuita.
-- Esto salió a la luz al definir el catálogo del Free Trial 2026-09-29: el
-- coach eligió "3 días - Fullbody" como una de las 3 rutinas estandarizadas
-- que ve el Free Trial (RUTINAS_PUBLICAS_TRIAL en src/lib/premium.ts), pero
-- esa rutina ya no existía con ese nombre -- se probó en vivo y el catálogo
-- del trial mostraba solo 2 de las 3 rutinas esperadas.
--
-- Contenido: template fullbody estándar de 3 días (A/B/C), NO el contenido
-- específico del PDF de Anti-Flakardo (que sigue siendo un producto pago
-- aparte, sin tocar acá) -- sentadilla/press/remo/peso muerto/dominadas,
-- rotando el énfasis entre los 3 días, mismo criterio de "compuestos con
-- RIR 2, aislados con RIR 1" que Torso-Pierna y Push Pull Legs (migración
-- 060). Todos los ejercicios ya existen en el catálogo, ninguno nuevo.
--
-- Correr en el SQL Editor de Supabase.

insert into public.routines (nombre, descripcion, dias)
select '3 días - Fullbody', 'Split de 3 días fullbody, alternando énfasis entre sesiones', 3
where not exists (select 1 from public.routines where nombre = '3 días - Fullbody');

-- ============ DÍA A ============
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = '3 días - Fullbody'), 'A', 1,
  (select id from public.exercise_definitions where nombre = 'Sentadilla con barra'), '4 x 6-8 (RIR 2)', 2
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = '3 días - Fullbody' and re.dia = 'A' and re.orden = 1);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = '3 días - Fullbody'), 'A', 2,
  (select id from public.exercise_definitions where nombre = 'Press banco plano con barra'), '3 x 8-10 (RIR 2)', 2
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = '3 días - Fullbody' and re.dia = 'A' and re.orden = 2);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = '3 días - Fullbody'), 'A', 3,
  (select id from public.exercise_definitions where nombre = 'Remo con barra parado'), '3 x 8-10 (RIR 2)', 2
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = '3 días - Fullbody' and re.dia = 'A' and re.orden = 3);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = '3 días - Fullbody'), 'A', 4,
  (select id from public.exercise_definitions where nombre = 'Curl femoral sentado'), '3 x 10-12 (RIR 1)', 1
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = '3 días - Fullbody' and re.dia = 'A' and re.orden = 4);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = '3 días - Fullbody'), 'A', 5,
  (select id from public.exercise_definitions where nombre = 'Elevación de talón parado'), '4 x 10-15 (RIR 1)', 1
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = '3 días - Fullbody' and re.dia = 'A' and re.orden = 5);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = '3 días - Fullbody'), 'A', 6,
  (select id from public.exercise_definitions where nombre = 'Abdominales en banco declinado'), '3 x 12-15 (RIR 1)', 1
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = '3 días - Fullbody' and re.dia = 'A' and re.orden = 6);

-- ============ DÍA B ============
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = '3 días - Fullbody'), 'B', 1,
  (select id from public.exercise_definitions where nombre = 'Peso muerto'), '4 x 6-8 (RIR 2)', 2
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = '3 días - Fullbody' and re.dia = 'B' and re.orden = 1);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = '3 días - Fullbody'), 'B', 2,
  (select id from public.exercise_definitions where nombre = 'Press militar con mancuernas'), '3 x 8-10 (RIR 2)', 2
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = '3 días - Fullbody' and re.dia = 'B' and re.orden = 2);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = '3 días - Fullbody'), 'B', 3,
  (select id from public.exercise_definitions where nombre = 'Dominadas (Pull ups)'), '3 x 6-10 (RIR 2)', 2
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = '3 días - Fullbody' and re.dia = 'B' and re.orden = 3);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = '3 días - Fullbody'), 'B', 4,
  (select id from public.exercise_definitions where nombre = 'Prensa de piernas 45°'), '3 x 10-12 (RIR 1)', 1
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = '3 días - Fullbody' and re.dia = 'B' and re.orden = 4);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = '3 días - Fullbody'), 'B', 5,
  (select id from public.exercise_definitions where nombre = 'Curl de bíceps con mancuerna parado'), '3 x 10-12 (RIR 1)', 1
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = '3 días - Fullbody' and re.dia = 'B' and re.orden = 5);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = '3 días - Fullbody'), 'B', 6,
  (select id from public.exercise_definitions where nombre = 'Elevación de piernas colgado'), '3 x 12-15 (RIR 1)', 1
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = '3 días - Fullbody' and re.dia = 'B' and re.orden = 6);

-- ============ DÍA C ============
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = '3 días - Fullbody'), 'C', 1,
  (select id from public.exercise_definitions where nombre = 'Peso muerto rumano'), '3 x 8-10 (RIR 2)', 2
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = '3 días - Fullbody' and re.dia = 'C' and re.orden = 1);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = '3 días - Fullbody'), 'C', 2,
  (select id from public.exercise_definitions where nombre = 'Press inclinado con mancuernas'), '3 x 8-10 (RIR 2)', 2
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = '3 días - Fullbody' and re.dia = 'C' and re.orden = 2);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = '3 días - Fullbody'), 'C', 3,
  (select id from public.exercise_definitions where nombre = 'Jalón al pecho en polea alta agarre supino'), '3 x 8-10 (RIR 2)', 2
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = '3 días - Fullbody' and re.dia = 'C' and re.orden = 3);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = '3 días - Fullbody'), 'C', 4,
  (select id from public.exercise_definitions where nombre = 'Fondos en banco'), '3 x 10-12 (RIR 1)', 1
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = '3 días - Fullbody' and re.dia = 'C' and re.orden = 4);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = '3 días - Fullbody'), 'C', 5,
  (select id from public.exercise_definitions where nombre = 'Elevación de talón parado'), '4 x 10-15 (RIR 1)', 1
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = '3 días - Fullbody' and re.dia = 'C' and re.orden = 5);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = '3 días - Fullbody'), 'C', 6,
  (select id from public.exercise_definitions where nombre = 'Abdominales en banco declinado'), '3 x 12-15 (RIR 1)', 1
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = '3 días - Fullbody' and re.dia = 'C' and re.orden = 6);

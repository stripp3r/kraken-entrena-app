-- Migración 060: dos rutinas públicas nuevas, armadas por Claude a pedido
-- del usuario -- las dos plantillas más conocidas del entrenamiento de
-- fuerza/hipertrofia que todavía faltaban en el catálogo, para completar el
-- combo con Full Body y Push/Pull/Legs/Full de Kraken Split.
--
-- Todos los ejercicios son los ya existentes en exercise_definitions (no se
-- crea ninguno nuevo). Series/reps con rango + RIR recomendado en el mismo
-- texto (mismo estilo que Kraken Split, ej. "3 x 10-12 (RIR 1)") y también
-- en la columna rir_objetivo. es_privada=false, creada_por_usuario=false
-- (default) -- quedan públicas y sin botón de borrar, igual que el resto
-- del catálogo del coach.
--
-- Correr en el SQL Editor de Supabase.

-- ============ TORSO-PIERNA (4 días) ============
insert into public.routines (nombre, descripcion, dias)
select 'Torso-Pierna', 'Split de 4 días torso/pierna, alternando énfasis push/pull y cuádriceps/isquios', 4
where not exists (select 1 from public.routines where nombre = 'Torso-Pierna');

-- --- Día A: Torso (empuje horizontal / tracción vertical) ---
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Torso-Pierna'), 'A', 1,
  (select id from public.exercise_definitions where nombre = 'Press banco plano con barra'), '4 x 6-8 (RIR 2)', 2
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Torso-Pierna' and re.dia = 'A' and re.orden = 1);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Torso-Pierna'), 'A', 2,
  (select id from public.exercise_definitions where nombre = 'Dominadas (Pull ups)'), '3 x 6-10 (RIR 2)', 2
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Torso-Pierna' and re.dia = 'A' and re.orden = 2);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Torso-Pierna'), 'A', 3,
  (select id from public.exercise_definitions where nombre = 'Press militar con mancuernas'), '3 x 8-10 (RIR 2)', 2
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Torso-Pierna' and re.dia = 'A' and re.orden = 3);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Torso-Pierna'), 'A', 4,
  (select id from public.exercise_definitions where nombre = 'Remo con barra parado'), '3 x 8-10 (RIR 2)', 2
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Torso-Pierna' and re.dia = 'A' and re.orden = 4);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Torso-Pierna'), 'A', 5,
  (select id from public.exercise_definitions where nombre = 'Curl de bíceps con mancuerna parado'), '3 x 10-12 (RIR 1)', 1
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Torso-Pierna' and re.dia = 'A' and re.orden = 5);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Torso-Pierna'), 'A', 6,
  (select id from public.exercise_definitions where nombre = 'Fondos en banco'), '3 x 10-12 (RIR 1)', 1
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Torso-Pierna' and re.dia = 'A' and re.orden = 6);

-- --- Día B: Pierna (cuádriceps dominante) ---
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Torso-Pierna'), 'B', 1,
  (select id from public.exercise_definitions where nombre = 'Sentadilla con barra'), '4 x 6-8 (RIR 2)', 2
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Torso-Pierna' and re.dia = 'B' and re.orden = 1);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Torso-Pierna'), 'B', 2,
  (select id from public.exercise_definitions where nombre = 'Peso muerto rumano'), '3 x 8-10 (RIR 2)', 2
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Torso-Pierna' and re.dia = 'B' and re.orden = 2);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Torso-Pierna'), 'B', 3,
  (select id from public.exercise_definitions where nombre = 'Prensa de piernas 45°'), '3 x 10-12 (RIR 1)', 1
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Torso-Pierna' and re.dia = 'B' and re.orden = 3);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Torso-Pierna'), 'B', 4,
  (select id from public.exercise_definitions where nombre = 'Curl femoral sentado'), '3 x 10-12 (RIR 1)', 1
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Torso-Pierna' and re.dia = 'B' and re.orden = 4);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Torso-Pierna'), 'B', 5,
  (select id from public.exercise_definitions where nombre = 'Elevación de talón parado'), '4 x 10-15 (RIR 1)', 1
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Torso-Pierna' and re.dia = 'B' and re.orden = 5);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Torso-Pierna'), 'B', 6,
  (select id from public.exercise_definitions where nombre = 'Abdominales en banco declinado'), '3 x 12-15 (RIR 1)', 1
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Torso-Pierna' and re.dia = 'B' and re.orden = 6);

-- --- Día C: Torso (empuje vertical / tracción horizontal) ---
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Torso-Pierna'), 'C', 1,
  (select id from public.exercise_definitions where nombre = 'Press inclinado con mancuernas'), '4 x 8-10 (RIR 2)', 2
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Torso-Pierna' and re.dia = 'C' and re.orden = 1);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Torso-Pierna'), 'C', 2,
  (select id from public.exercise_definitions where nombre = 'Remo en máquina sentado'), '3 x 8-10 (RIR 2)', 2
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Torso-Pierna' and re.dia = 'C' and re.orden = 2);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Torso-Pierna'), 'C', 3,
  (select id from public.exercise_definitions where nombre = 'Elevación lateral en máquina'), '3 x 12-15 (RIR 1)', 1
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Torso-Pierna' and re.dia = 'C' and re.orden = 3);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Torso-Pierna'), 'C', 4,
  (select id from public.exercise_definitions where nombre = 'Jalón al pecho en polea alta agarre supino'), '3 x 10-12 (RIR 2)', 2
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Torso-Pierna' and re.dia = 'C' and re.orden = 4);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Torso-Pierna'), 'C', 5,
  (select id from public.exercise_definitions where nombre = 'Extensión de tríceps en polea arrodillado'), '3 x 10-12 (RIR 1)', 1
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Torso-Pierna' and re.dia = 'C' and re.orden = 5);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Torso-Pierna'), 'C', 6,
  (select id from public.exercise_definitions where nombre = 'Curl martillo parado'), '3 x 10-12 (RIR 1)', 1
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Torso-Pierna' and re.dia = 'C' and re.orden = 6);

-- --- Día D: Pierna (isquiotibiales/glúteo dominante) ---
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Torso-Pierna'), 'D', 1,
  (select id from public.exercise_definitions where nombre = 'Peso muerto'), '4 x 5-8 (RIR 2)', 2
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Torso-Pierna' and re.dia = 'D' and re.orden = 1);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Torso-Pierna'), 'D', 2,
  (select id from public.exercise_definitions where nombre = 'Hip thrust con mancuerna'), '3 x 8-12 (RIR 2)', 2
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Torso-Pierna' and re.dia = 'D' and re.orden = 2);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Torso-Pierna'), 'D', 3,
  (select id from public.exercise_definitions where nombre = 'Estocadas'), '3 x 10-12 por pierna (RIR 1)', 1
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Torso-Pierna' and re.dia = 'D' and re.orden = 3);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Torso-Pierna'), 'D', 4,
  (select id from public.exercise_definitions where nombre = 'Curl femoral'), '3 x 10-12 (RIR 1)', 1
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Torso-Pierna' and re.dia = 'D' and re.orden = 4);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Torso-Pierna'), 'D', 5,
  (select id from public.exercise_definitions where nombre = 'Elevación de talón sentado en máquina'), '4 x 10-15 (RIR 1)', 1
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Torso-Pierna' and re.dia = 'D' and re.orden = 5);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Torso-Pierna'), 'D', 6,
  (select id from public.exercise_definitions where nombre = 'Elevación de piernas colgado'), '3 x 12-15 (RIR 1)', 1
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Torso-Pierna' and re.dia = 'D' and re.orden = 6);


-- ============ PUSH PULL LEGS (6 días) ============
insert into public.routines (nombre, descripcion, dias)
select 'Push Pull Legs', 'Split de 6 días, doble frecuencia por grupo muscular por semana', 6
where not exists (select 1 from public.routines where nombre = 'Push Pull Legs');

-- --- Día A: Push (énfasis pecho) ---
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Push Pull Legs'), 'A', 1,
  (select id from public.exercise_definitions where nombre = 'Press banco plano con barra'), '4 x 6-8 (RIR 2)', 2
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Push Pull Legs' and re.dia = 'A' and re.orden = 1);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Push Pull Legs'), 'A', 2,
  (select id from public.exercise_definitions where nombre = 'Press militar con mancuernas'), '3 x 8-10 (RIR 2)', 2
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Push Pull Legs' and re.dia = 'A' and re.orden = 2);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Push Pull Legs'), 'A', 3,
  (select id from public.exercise_definitions where nombre = 'Press inclinado con mancuernas'), '3 x 10-12 (RIR 1)', 1
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Push Pull Legs' and re.dia = 'A' and re.orden = 3);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Push Pull Legs'), 'A', 4,
  (select id from public.exercise_definitions where nombre = 'Elevación lateral en máquina'), '3 x 12-15 (RIR 1)', 1
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Push Pull Legs' and re.dia = 'A' and re.orden = 4);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Push Pull Legs'), 'A', 5,
  (select id from public.exercise_definitions where nombre = 'Fondos en banco'), '3 x 10-12 (RIR 1)', 1
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Push Pull Legs' and re.dia = 'A' and re.orden = 5);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Push Pull Legs'), 'A', 6,
  (select id from public.exercise_definitions where nombre = 'Extensión de tríceps en polea arrodillado'), '3 x 12-15 (RIR 1)', 1
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Push Pull Legs' and re.dia = 'A' and re.orden = 6);

-- --- Día B: Pull (énfasis espalda ancho) ---
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Push Pull Legs'), 'B', 1,
  (select id from public.exercise_definitions where nombre = 'Dominadas (Pull ups)'), '4 x 6-10 (RIR 2)', 2
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Push Pull Legs' and re.dia = 'B' and re.orden = 1);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Push Pull Legs'), 'B', 2,
  (select id from public.exercise_definitions where nombre = 'Remo con barra parado'), '3 x 8-10 (RIR 2)', 2
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Push Pull Legs' and re.dia = 'B' and re.orden = 2);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Push Pull Legs'), 'B', 3,
  (select id from public.exercise_definitions where nombre = 'Jalón al pecho en polea alta agarre supino'), '3 x 10-12 (RIR 2)', 2
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Push Pull Legs' and re.dia = 'B' and re.orden = 3);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Push Pull Legs'), 'B', 4,
  (select id from public.exercise_definitions where nombre = 'Face pull'), '3 x 15-20 (RIR 1)', 1
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Push Pull Legs' and re.dia = 'B' and re.orden = 4);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Push Pull Legs'), 'B', 5,
  (select id from public.exercise_definitions where nombre = 'Curl de bíceps con mancuerna parado'), '3 x 10-12 (RIR 1)', 1
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Push Pull Legs' and re.dia = 'B' and re.orden = 5);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Push Pull Legs'), 'B', 6,
  (select id from public.exercise_definitions where nombre = 'Curl martillo parado'), '3 x 10-12 (RIR 1)', 1
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Push Pull Legs' and re.dia = 'B' and re.orden = 6);

-- --- Día C: Legs (piernas completo) ---
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Push Pull Legs'), 'C', 1,
  (select id from public.exercise_definitions where nombre = 'Sentadilla con barra'), '4 x 6-8 (RIR 2)', 2
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Push Pull Legs' and re.dia = 'C' and re.orden = 1);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Push Pull Legs'), 'C', 2,
  (select id from public.exercise_definitions where nombre = 'Peso muerto rumano'), '3 x 8-10 (RIR 2)', 2
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Push Pull Legs' and re.dia = 'C' and re.orden = 2);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Push Pull Legs'), 'C', 3,
  (select id from public.exercise_definitions where nombre = 'Prensa de piernas 45°'), '3 x 10-12 (RIR 1)', 1
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Push Pull Legs' and re.dia = 'C' and re.orden = 3);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Push Pull Legs'), 'C', 4,
  (select id from public.exercise_definitions where nombre = 'Curl femoral sentado'), '3 x 10-12 (RIR 1)', 1
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Push Pull Legs' and re.dia = 'C' and re.orden = 4);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Push Pull Legs'), 'C', 5,
  (select id from public.exercise_definitions where nombre = 'Elevación de talón parado'), '4 x 10-15 (RIR 1)', 1
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Push Pull Legs' and re.dia = 'C' and re.orden = 5);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Push Pull Legs'), 'C', 6,
  (select id from public.exercise_definitions where nombre = 'Elevación de piernas colgado'), '3 x 12-15 (RIR 1)', 1
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Push Pull Legs' and re.dia = 'C' and re.orden = 6);

-- --- Día D: Push (énfasis hombro) ---
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Push Pull Legs'), 'D', 1,
  (select id from public.exercise_definitions where nombre = 'Press de hombro sentado con barra al frente'), '4 x 6-8 (RIR 2)', 2
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Push Pull Legs' and re.dia = 'D' and re.orden = 1);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Push Pull Legs'), 'D', 2,
  (select id from public.exercise_definitions where nombre = 'Press banco inclinado con barra'), '3 x 8-10 (RIR 2)', 2
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Push Pull Legs' and re.dia = 'D' and re.orden = 2);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Push Pull Legs'), 'D', 3,
  (select id from public.exercise_definitions where nombre = 'Vuelo lateral con mancuerna a un brazo'), '3 x 12-15 por lado (RIR 1)', 1
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Push Pull Legs' and re.dia = 'D' and re.orden = 3);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Push Pull Legs'), 'D', 4,
  (select id from public.exercise_definitions where nombre = 'Aperturas con mancuernas'), '3 x 12-15 (RIR 1)', 1
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Push Pull Legs' and re.dia = 'D' and re.orden = 4);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Push Pull Legs'), 'D', 5,
  (select id from public.exercise_definitions where nombre = 'Press francés con barra'), '3 x 10-12 (RIR 1)', 1
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Push Pull Legs' and re.dia = 'D' and re.orden = 5);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Push Pull Legs'), 'D', 6,
  (select id from public.exercise_definitions where nombre = 'Tríceps en polea alta a un brazo'), '3 x 12-15 por lado (RIR 1)', 1
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Push Pull Legs' and re.dia = 'D' and re.orden = 6);

-- --- Día E: Pull (énfasis espalda grosor + trapecio) ---
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Push Pull Legs'), 'E', 1,
  (select id from public.exercise_definitions where nombre = 'Remo con mancuerna a un brazo'), '4 x 8-10 por lado (RIR 2)', 2
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Push Pull Legs' and re.dia = 'E' and re.orden = 1);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Push Pull Legs'), 'E', 2,
  (select id from public.exercise_definitions where nombre = 'Dorsales en máquina'), '3 x 10-12 (RIR 2)', 2
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Push Pull Legs' and re.dia = 'E' and re.orden = 2);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Push Pull Legs'), 'E', 3,
  (select id from public.exercise_definitions where nombre = 'Remo en máquina sentado'), '3 x 10-12 (RIR 1)', 1
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Push Pull Legs' and re.dia = 'E' and re.orden = 3);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Push Pull Legs'), 'E', 4,
  (select id from public.exercise_definitions where nombre = 'Encogimiento de hombros con barra'), '3 x 10-15 (RIR 1)', 1
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Push Pull Legs' and re.dia = 'E' and re.orden = 4);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Push Pull Legs'), 'E', 5,
  (select id from public.exercise_definitions where nombre = 'Curl en banco Scott supino'), '3 x 10-12 (RIR 1)', 1
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Push Pull Legs' and re.dia = 'E' and re.orden = 5);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Push Pull Legs'), 'E', 6,
  (select id from public.exercise_definitions where nombre = 'Curl concentrado con mancuerna'), '3 x 12-15 por lado (RIR 1)', 1
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Push Pull Legs' and re.dia = 'E' and re.orden = 6);

-- --- Día F: Legs (glúteo/isquios + pantorrilla) ---
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Push Pull Legs'), 'F', 1,
  (select id from public.exercise_definitions where nombre = 'Peso muerto'), '4 x 5-8 (RIR 2)', 2
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Push Pull Legs' and re.dia = 'F' and re.orden = 1);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Push Pull Legs'), 'F', 2,
  (select id from public.exercise_definitions where nombre = 'Hip thrust con mancuerna'), '3 x 8-12 (RIR 2)', 2
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Push Pull Legs' and re.dia = 'F' and re.orden = 2);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Push Pull Legs'), 'F', 3,
  (select id from public.exercise_definitions where nombre = 'Estocadas'), '3 x 10-12 por pierna (RIR 1)', 1
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Push Pull Legs' and re.dia = 'F' and re.orden = 3);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Push Pull Legs'), 'F', 4,
  (select id from public.exercise_definitions where nombre = 'Curl femoral'), '3 x 10-12 (RIR 1)', 1
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Push Pull Legs' and re.dia = 'F' and re.orden = 4);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Push Pull Legs'), 'F', 5,
  (select id from public.exercise_definitions where nombre = 'Elevación de talón sentado en máquina'), '4 x 12-15 (RIR 1)', 1
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Push Pull Legs' and re.dia = 'F' and re.orden = 5);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
select (select id from public.routines where nombre = 'Push Pull Legs'), 'F', 6,
  (select id from public.exercise_definitions where nombre = 'Abdominales en banco declinado'), '3 x 12-15 (RIR 1)', 1
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Push Pull Legs' and re.dia = 'F' and re.orden = 6);

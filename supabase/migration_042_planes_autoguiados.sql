-- Migración 042: primera versión de las 4 rutinas para los planes
-- autoguiados que todavía se venden por WhatsApp (Grasa Sub-Cero, Híbrido,
-- En Casa, Minimalista) + sus productos, ya listos para el checkout
-- automático que ya usa Anti-Flakardo -- solo que quedan `activo = false`
-- hasta que el usuario suba el PDF de cada uno y confirme el precio.
--
-- Explícitamente una v1 ("dejalo así para arrancar, lo vamos a modificar
-- en el futuro" -- palabras del usuario): reutiliza ejercicios ya
-- existentes en el catálogo todo lo posible. Se creó un solo ejercicio
-- nuevo (Sentadilla con mancuerna / sentadilla goblet) porque "En Casa" lo
-- necesitaba sí o sí y no había ningún equivalente sin barra/máquina.
--
-- Para activar un producto cuando el usuario suba su PDF:
--   update productos set activo = true, pdf_storage_path = '<archivo>.pdf'
--   where slug = '<slug>';
-- (y ahí sí cambiar el botón del sitio web para que apunte al checkout en
-- vez de a WhatsApp).

-- ============ EJERCICIO NUEVO: SENTADILLA CON MANCUERNA (goblet) ============
insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'Sentadilla con mancuerna', 'Legs',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/sentadilla-con-mancuerna.gif',
  'Paso inicial: Parate derecho con los pies un poco más separados que el ancho de los hombros, sosteniendo una mancuerna verticalmente contra el pecho con ambas manos, por debajo de la cabeza de la mancuerna.

Posición inicial: Pecho arriba, codos apuntando hacia abajo, core activado.

Movimiento: Inhalá y bajá flexionando cadera y rodillas, como si te fueras a sentar, manteniendo la mancuerna pegada al pecho durante todo el descenso.

Contracción: Bajá hasta que los codos rocen o pasen levemente por dentro de las rodillas, sin perder la posición del pecho.

Regreso: Exhalá y empujá con los talones para volver a subir, extendiendo cadera y rodillas al mismo tiempo.

Consejo como Entrenador:

Es el sustituto ideal de la sentadilla con barra cuando entrenás en casa o no tenés rack -- el mismo patrón de movimiento, con mucho menos equipo.

Mantené el pecho arriba durante todo el movimiento, sin dejar que se redondee la espalda baja.

Si te cuesta la profundidad, empezá con una sentadilla más corta e ir ganando rango de a poco.',
  'compuesto', false
where not exists (select 1 from public.exercise_definitions where nombre = 'Sentadilla con mancuerna');
-- El video (Sentadilla con mancuerna.mp4) se linkea solo al re-correr el
-- SQL genérico de video_url sobre el bucket ejercicios-video, una vez que
-- subas ese archivo -- no hace falta nada especial acá.

-- ============ RUTINA: GRASA SUB-CERO (4 días) ============
insert into public.routines (nombre, descripcion, dias)
select 'Grasa Sub-Cero', 'Recomposición: ganar músculo y bajar grasa a la vez', 4
where not exists (select 1 from public.routines where nombre = 'Grasa Sub-Cero');

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Grasa Sub-Cero'), 'A', 1, (select id from public.exercise_definitions where nombre = 'Press banco plano con barra'), '3 x 10-15'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Grasa Sub-Cero' and re.dia = 'A' and re.orden = 1);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Grasa Sub-Cero'), 'A', 2, (select id from public.exercise_definitions where nombre = 'Remo sentado agarre cerrado'), '3 x 10-15'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Grasa Sub-Cero' and re.dia = 'A' and re.orden = 2);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Grasa Sub-Cero'), 'A', 3, (select id from public.exercise_definitions where nombre = 'Press militar con mancuernas'), '3 x 10-15'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Grasa Sub-Cero' and re.dia = 'A' and re.orden = 3);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Grasa Sub-Cero'), 'A', 4, (select id from public.exercise_definitions where nombre = 'Dorsales en polea alta'), '3 x 10-15'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Grasa Sub-Cero' and re.dia = 'A' and re.orden = 4);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Grasa Sub-Cero'), 'A', 5, (select id from public.exercise_definitions where nombre = 'Extensión de tríceps en polea'), '3 x 12-15'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Grasa Sub-Cero' and re.dia = 'A' and re.orden = 5);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Grasa Sub-Cero'), 'A', 6, (select id from public.exercise_definitions where nombre = 'Curl de bíceps con mancuerna parado'), '3 x 12-15'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Grasa Sub-Cero' and re.dia = 'A' and re.orden = 6);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Grasa Sub-Cero'), 'A', 7, (select id from public.exercise_definitions where nombre = 'Face pull'), '2 x 20 (finisher)'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Grasa Sub-Cero' and re.dia = 'A' and re.orden = 7);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Grasa Sub-Cero'), 'B', 1, (select id from public.exercise_definitions where nombre = 'Sentadillas'), '3 x 10-15'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Grasa Sub-Cero' and re.dia = 'B' and re.orden = 1);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Grasa Sub-Cero'), 'B', 2, (select id from public.exercise_definitions where nombre = 'Peso muerto rumano'), '3 x 10-15'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Grasa Sub-Cero' and re.dia = 'B' and re.orden = 2);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Grasa Sub-Cero'), 'B', 3, (select id from public.exercise_definitions where nombre = 'Cuádriceps en prensa'), '3 x 12-15'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Grasa Sub-Cero' and re.dia = 'B' and re.orden = 3);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Grasa Sub-Cero'), 'B', 4, (select id from public.exercise_definitions where nombre = 'Curl femoral'), '3 x 12-15'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Grasa Sub-Cero' and re.dia = 'B' and re.orden = 4);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Grasa Sub-Cero'), 'B', 5, (select id from public.exercise_definitions where nombre = 'Elevación de talón parado'), '3 x 15-20'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Grasa Sub-Cero' and re.dia = 'B' and re.orden = 5);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Grasa Sub-Cero'), 'B', 6, (select id from public.exercise_definitions where nombre = 'Abdominales en banco declinado'), '2 x 20 (finisher)'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Grasa Sub-Cero' and re.dia = 'B' and re.orden = 6);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Grasa Sub-Cero'), 'C', 1, (select id from public.exercise_definitions where nombre = 'Press inclinado con mancuernas'), '3 x 10-15'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Grasa Sub-Cero' and re.dia = 'C' and re.orden = 1);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Grasa Sub-Cero'), 'C', 2, (select id from public.exercise_definitions where nombre = 'Remo con mancuerna a un brazo'), '3 x 10-15 por lado'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Grasa Sub-Cero' and re.dia = 'C' and re.orden = 2);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Grasa Sub-Cero'), 'C', 3, (select id from public.exercise_definitions where nombre = 'Elevacion lateral con mancuernas'), '3 x 12-15'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Grasa Sub-Cero' and re.dia = 'C' and re.orden = 3);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Grasa Sub-Cero'), 'C', 4, (select id from public.exercise_definitions where nombre = 'Jalón lateral con polea a un brazo'), '3 x 10-15'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Grasa Sub-Cero' and re.dia = 'C' and re.orden = 4);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Grasa Sub-Cero'), 'C', 5, (select id from public.exercise_definitions where nombre = 'Extensión de tríceps inclinada con barra EZ'), '3 x 12-15'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Grasa Sub-Cero' and re.dia = 'C' and re.orden = 5);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Grasa Sub-Cero'), 'C', 6, (select id from public.exercise_definitions where nombre = 'Curl martillo con mancuernas sentado'), '3 x 12-15'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Grasa Sub-Cero' and re.dia = 'C' and re.orden = 6);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Grasa Sub-Cero'), 'C', 7, (select id from public.exercise_definitions where nombre = 'Vuelo lateral con polea'), '2 x 20 (finisher)'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Grasa Sub-Cero' and re.dia = 'C' and re.orden = 7);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Grasa Sub-Cero'), 'D', 1, (select id from public.exercise_definitions where nombre = 'Estocada búlgara en el banco'), '3 x 10-12 por pierna'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Grasa Sub-Cero' and re.dia = 'D' and re.orden = 1);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Grasa Sub-Cero'), 'D', 2, (select id from public.exercise_definitions where nombre = 'Empuje de caderas'), '3 x 10-15'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Grasa Sub-Cero' and re.dia = 'D' and re.orden = 2);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Grasa Sub-Cero'), 'D', 3, (select id from public.exercise_definitions where nombre = 'Extensión de cuádriceps'), '3 x 15-20'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Grasa Sub-Cero' and re.dia = 'D' and re.orden = 3);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Grasa Sub-Cero'), 'D', 4, (select id from public.exercise_definitions where nombre = 'Curl femoral sentado'), '3 x 15-20'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Grasa Sub-Cero' and re.dia = 'D' and re.orden = 4);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Grasa Sub-Cero'), 'D', 5, (select id from public.exercise_definitions where nombre = 'Elevación de talón en máquina Smith'), '3 x 15-20'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Grasa Sub-Cero' and re.dia = 'D' and re.orden = 5);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Grasa Sub-Cero'), 'D', 6, (select id from public.exercise_definitions where nombre = 'Elevación de piernas colgado'), '2 x 15 (finisher)'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Grasa Sub-Cero' and re.dia = 'D' and re.orden = 6);

-- ============ RUTINA: HÍBRIDO (3 días) ============
insert into public.routines (nombre, descripcion, dias)
select 'Híbrido', 'Fuerza básica para quien hace otro deporte y no quiere perder su fondo físico', 3
where not exists (select 1 from public.routines where nombre = 'Híbrido');

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Híbrido'), 'A', 1, (select id from public.exercise_definitions where nombre = 'Sentadillas'), '3 x 6-10'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Híbrido' and re.dia = 'A' and re.orden = 1);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Híbrido'), 'A', 2, (select id from public.exercise_definitions where nombre = 'Press banco plano con barra'), '3 x 6-10'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Híbrido' and re.dia = 'A' and re.orden = 2);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Híbrido'), 'A', 3, (select id from public.exercise_definitions where nombre = 'Remo con barra parado'), '3 x 6-10'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Híbrido' and re.dia = 'A' and re.orden = 3);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Híbrido'), 'A', 4, (select id from public.exercise_definitions where nombre = 'Face pull'), '2 x 15'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Híbrido' and re.dia = 'A' and re.orden = 4);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Híbrido'), 'B', 1, (select id from public.exercise_definitions where nombre = 'Peso muerto'), '3 x 5-8'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Híbrido' and re.dia = 'B' and re.orden = 1);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Híbrido'), 'B', 2, (select id from public.exercise_definitions where nombre = 'Press militar con mancuernas'), '3 x 6-10'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Híbrido' and re.dia = 'B' and re.orden = 2);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Híbrido'), 'B', 3, (select id from public.exercise_definitions where nombre = 'Dorsales en polea alta'), '3 x 6-10'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Híbrido' and re.dia = 'B' and re.orden = 3);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Híbrido'), 'B', 4, (select id from public.exercise_definitions where nombre = 'Abdominales en banco declinado'), '3 x 15'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Híbrido' and re.dia = 'B' and re.orden = 4);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Híbrido'), 'C', 1, (select id from public.exercise_definitions where nombre = 'Cuádriceps en prensa'), '3 x 8-12'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Híbrido' and re.dia = 'C' and re.orden = 1);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Híbrido'), 'C', 2, (select id from public.exercise_definitions where nombre = 'Remo con mancuerna a un brazo'), '3 x 8-12 por lado'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Híbrido' and re.dia = 'C' and re.orden = 2);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Híbrido'), 'C', 3, (select id from public.exercise_definitions where nombre = 'Press de hombro en maquina Smith'), '3 x 8-12'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Híbrido' and re.dia = 'C' and re.orden = 3);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Híbrido'), 'C', 4, (select id from public.exercise_definitions where nombre = 'Elevación de piernas colgado'), '3 x 12'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Híbrido' and re.dia = 'C' and re.orden = 4);

-- ============ RUTINA: EN CASA (3 días) ============
insert into public.routines (nombre, descripcion, dias)
select 'En Casa', 'Full body con mancuernas, bandas y peso corporal -- sin equipamiento de gimnasio', 3
where not exists (select 1 from public.routines where nombre = 'En Casa');

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'En Casa'), 'A', 1, (select id from public.exercise_definitions where nombre = 'Sentadilla con mancuerna'), '3 x 12-15'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'En Casa' and re.dia = 'A' and re.orden = 1);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'En Casa'), 'A', 2, (select id from public.exercise_definitions where nombre = 'Flexiones de brazos'), '3 x 12-20'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'En Casa' and re.dia = 'A' and re.orden = 2);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'En Casa'), 'A', 3, (select id from public.exercise_definitions where nombre = 'Remo con mancuerna a un brazo'), '3 x 12-15 por lado'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'En Casa' and re.dia = 'A' and re.orden = 3);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'En Casa'), 'A', 4, (select id from public.exercise_definitions where nombre = 'Elevación de talón parado'), '3 x 15-20'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'En Casa' and re.dia = 'A' and re.orden = 4);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'En Casa'), 'B', 1, (select id from public.exercise_definitions where nombre = 'Estocada búlgara en el banco'), '3 x 10-12 por pierna'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'En Casa' and re.dia = 'B' and re.orden = 1);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'En Casa'), 'B', 2, (select id from public.exercise_definitions where nombre = 'Press militar con mancuernas'), '3 x 10-15'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'En Casa' and re.dia = 'B' and re.orden = 2);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'En Casa'), 'B', 3, (select id from public.exercise_definitions where nombre = 'Fondos en banco'), '3 x 10-15'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'En Casa' and re.dia = 'B' and re.orden = 3);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'En Casa'), 'B', 4, (select id from public.exercise_definitions where nombre = 'Curl de bíceps con mancuerna parado'), '3 x 12-15'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'En Casa' and re.dia = 'B' and re.orden = 4);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'En Casa'), 'C', 1, (select id from public.exercise_definitions where nombre = 'Estocadas'), '3 x 12-15 por pierna'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'En Casa' and re.dia = 'C' and re.orden = 1);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'En Casa'), 'C', 2, (select id from public.exercise_definitions where nombre = 'Flexiones de brazos'), '3 x 12-20'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'En Casa' and re.dia = 'C' and re.orden = 2);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'En Casa'), 'C', 3, (select id from public.exercise_definitions where nombre = 'Remo con mancuerna a un brazo'), '3 x 12-15 por lado'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'En Casa' and re.dia = 'C' and re.orden = 3);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'En Casa'), 'C', 4, (select id from public.exercise_definitions where nombre = 'Curl martillo con mancuernas sentado'), '3 x 12-15'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'En Casa' and re.dia = 'C' and re.orden = 4);

-- ============ RUTINA: MINIMALISTA (3 días) ============
insert into public.routines (nombre, descripcion, dias)
select 'Minimalista', '2-3 sesiones cortas por semana, alta intensidad, pocos ejercicios compuestos', 3
where not exists (select 1 from public.routines where nombre = 'Minimalista');

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Minimalista'), 'A', 1, (select id from public.exercise_definitions where nombre = 'Sentadillas'), '3 x 6-10 (RIR 1)'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Minimalista' and re.dia = 'A' and re.orden = 1);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Minimalista'), 'A', 2, (select id from public.exercise_definitions where nombre = 'Press banco plano con barra'), '3 x 6-10 (RIR 1)'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Minimalista' and re.dia = 'A' and re.orden = 2);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Minimalista'), 'A', 3, (select id from public.exercise_definitions where nombre = 'Remo con barra parado'), '3 x 6-10 (RIR 1)'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Minimalista' and re.dia = 'A' and re.orden = 3);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Minimalista'), 'B', 1, (select id from public.exercise_definitions where nombre = 'Peso muerto'), '3 x 5-8 (RIR 1)'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Minimalista' and re.dia = 'B' and re.orden = 1);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Minimalista'), 'B', 2, (select id from public.exercise_definitions where nombre = 'Press militar con mancuernas'), '3 x 6-10 (RIR 1)'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Minimalista' and re.dia = 'B' and re.orden = 2);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Minimalista'), 'B', 3, (select id from public.exercise_definitions where nombre = 'Dorsales en polea alta'), '3 x 6-10 (RIR 1)'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Minimalista' and re.dia = 'B' and re.orden = 3);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Minimalista'), 'C', 1, (select id from public.exercise_definitions where nombre = 'Cuádriceps en prensa'), '3 x 8-12 (RIR 0-1)'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Minimalista' and re.dia = 'C' and re.orden = 1);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Minimalista'), 'C', 2, (select id from public.exercise_definitions where nombre = 'Fondos en paralelas'), '3 x 8-12 (RIR 0-1)'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Minimalista' and re.dia = 'C' and re.orden = 2);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Minimalista'), 'C', 3, (select id from public.exercise_definitions where nombre = 'Curl de bíceps con mancuerna parado'), '3 x 10-12 (RIR 0-1)'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Minimalista' and re.dia = 'C' and re.orden = 3);

-- ============ PRODUCTOS (inactivos hasta que subas cada PDF) ============
insert into public.productos (nombre, slug, precio_usd, precio_ars, activo)
select 'KRAKEN Grasa Sub-Cero', 'grasa-sub-cero', 29.99, 45000, false
where not exists (select 1 from public.productos where slug = 'grasa-sub-cero');

insert into public.productos (nombre, slug, precio_usd, precio_ars, activo)
select 'KRAKEN Híbrido', 'hibrido', 29.99, 45000, false
where not exists (select 1 from public.productos where slug = 'hibrido');

insert into public.productos (nombre, slug, precio_usd, precio_ars, activo)
select 'KRAKEN En Casa', 'en-casa', 29.99, 45000, false
where not exists (select 1 from public.productos where slug = 'en-casa');

insert into public.productos (nombre, slug, precio_usd, precio_ars, activo)
select 'KRAKEN Minimalista', 'minimalista', 29.99, 45000, false
where not exists (select 1 from public.productos where slug = 'minimalista');

insert into public.producto_rutinas (producto_id, routine_id)
select (select id from public.productos where slug = 'grasa-sub-cero'), (select id from public.routines where nombre = 'Grasa Sub-Cero')
where not exists (select 1 from public.producto_rutinas where producto_id = (select id from public.productos where slug = 'grasa-sub-cero'));

insert into public.producto_rutinas (producto_id, routine_id)
select (select id from public.productos where slug = 'hibrido'), (select id from public.routines where nombre = 'Híbrido')
where not exists (select 1 from public.producto_rutinas where producto_id = (select id from public.productos where slug = 'hibrido'));

insert into public.producto_rutinas (producto_id, routine_id)
select (select id from public.productos where slug = 'en-casa'), (select id from public.routines where nombre = 'En Casa')
where not exists (select 1 from public.producto_rutinas where producto_id = (select id from public.productos where slug = 'en-casa'));

insert into public.producto_rutinas (producto_id, routine_id)
select (select id from public.productos where slug = 'minimalista'), (select id from public.routines where nombre = 'Minimalista')
where not exists (select 1 from public.producto_rutinas where producto_id = (select id from public.productos where slug = 'minimalista'));

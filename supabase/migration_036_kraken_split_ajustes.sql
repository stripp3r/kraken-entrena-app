-- Migración 036: ajustes a "Kraken Split" pedidos después de probarla en vivo
-- + los GIFs que faltaban (existían en la carpeta de recursos, no se habían
-- buscado antes de dejar `imagen_url` en null).
--
-- Cambios de contenido:
-- - Curl femoral tumbado pasa a ser bilateral (se usa el ejercicio ya
--   existente "Curl femoral" en vez del "...unilateral" creado en la 035).
-- - Día B ("Lower A"): "Plancha con lastre" se reemplaza por el circuito real
--   de abdominales (mismo criterio que la migración 020: dos ejercicios
--   reales, "Elevación de piernas colgado" + "Abdominales en banco
--   declinado", en vez de un solo "circuito" ficticio). Se agrega también a
--   Día D ("Lower B"), que no tenía nada de abdomen.
-- - Día B: "Elevación de talón sentado con mancuerna" -> nuevo ejercicio
--   "Elevación de talón sentado en máquina" (equipo real que usa).
-- - Día D: "Elevación de talón en máquina Smith" -> "Elevación de talón
--   parado a una pierna" (unilateral con mancuerna, ya existía en el
--   catálogo).
-- - Día E: "Pájaro con polea unilateral" -> nuevo ejercicio "Meadows Row"
--   (3 x 10-12). "Encogimiento de hombros con barra" -> el ya existente
--   "Encogimiento de hombros con mancuernas".
--
-- Correr en el SQL Editor de Supabase después de subir los 13 GIFs de la
-- carpeta `gifs-kraken-split` (ver mensaje aparte) al bucket `ejercicios`
-- ya existente en Storage -- el mismo que usan todos los GIFs actuales.
--
-- Correr después de la migración 035.

-- ============ EJERCICIOS NUEVOS ============
insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'Meadows Row', 'Torso', null,
  'Paso inicial: Enganchá una barra en un soporte landmine (o encajala en una esquina contra la pared) y cargale peso del lado libre.

Posición inicial: Parate al lado de la barra, con las piernas separadas al ancho de los hombros y las rodillas ligeramente flexionadas. Inclinate hacia adelante desde la cadera y tomá la barra cerca del disco con una sola mano, con el torso casi paralelo al piso.

Movimiento: Exhalá y tirá de la barra hacia tu cadera, llevando el codo hacia atrás y arriba, manteniendo la espalda recta.

Contracción: Apretá el dorsal y la espalda media un instante en la parte alta del movimiento.

Regreso: Inhalá y bajá la barra de forma controlada hasta la extensión completa del brazo, sin perder la posición de la espalda.

Consejo como Entrenador:

Mantené la espalda recta durante todo el movimiento -- no la redondees para "ganar" rango de recorrido.

El ángulo diagonal de la barra permite un recorrido más largo que un remo tradicional -- aprovechalo sin perder el control.

Completá las repeticiones de un lado antes de cambiar al otro.',
  'compuesto', true
where not exists (select 1 from public.exercise_definitions where nombre = 'Meadows Row');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'Elevación de talón sentado en máquina', 'Legs', null,
  'Paso inicial: Sentate en la máquina de gemelo sentado, con las rodillas debajo de las almohadillas y las puntas de los pies apoyadas en la plataforma, talones libres en el aire.

Posición inicial: Dejá los talones caer lo más abajo posible, sintiendo un buen estiramiento en la pantorrilla.

Movimiento: Exhalá y empujá con la punta de los pies, elevando los talones lo más alto posible.

Contracción: Apretá la pantorrilla un instante en la parte más alta del movimiento.

Regreso: Inhalá y bajá los talones de forma controlada hasta el estiramiento inicial, sin rebotar.

Consejo como Entrenador:

Trabajá con el rango completo -- bajar bien el talón y subir bien arriba es más importante que la velocidad.

Evitá rebotar en la parte baja del movimiento para "ayudarte" a subir.

Es un ejercicio de aislamiento, podés usar reps más altas sin problema.',
  'aislado', false
where not exists (select 1 from public.exercise_definitions where nombre = 'Elevación de talón sentado en máquina');

-- ============ CURL FEMORAL: PASA A SER BILATERAL ============
update public.routine_exercises re
set exercise_definition_id = (select id from public.exercise_definitions where nombre = 'Curl femoral'),
    series_reps = '3 x 10-15'
from public.routines r
where re.routine_id = r.id and r.nombre = 'Kraken Split' and re.dia = 'B' and re.orden = 4;

update public.routine_exercises re
set exercise_definition_id = (select id from public.exercise_definitions where nombre = 'Curl femoral'),
    series_reps = '3 x 12-15'
from public.routines r
where re.routine_id = r.id and r.nombre = 'Kraken Split' and re.dia = 'D' and re.orden = 4;

-- ============ DÍA B: GEMELO SENTADO -> MÁQUINA (no mancuerna) ============
update public.routine_exercises re
set exercise_definition_id = (select id from public.exercise_definitions where nombre = 'Elevación de talón sentado en máquina')
from public.routines r
where re.routine_id = r.id and r.nombre = 'Kraken Split' and re.dia = 'B' and re.orden = 5;

-- ============ DÍA D: GEMELO SMITH -> PARADO A UNA PIERNA (mancuerna) =====
update public.routine_exercises re
set exercise_definition_id = (select id from public.exercise_definitions where nombre = 'Elevación de talón parado a una pierna')
from public.routines r
where re.routine_id = r.id and r.nombre = 'Kraken Split' and re.dia = 'D' and re.orden = 5;

-- ============ DÍA E: PÁJARO -> MEADOWS ROW ============
update public.routine_exercises re
set exercise_definition_id = (select id from public.exercise_definitions where nombre = 'Meadows Row'),
    series_reps = '3 x 10-12'
from public.routines r
where re.routine_id = r.id and r.nombre = 'Kraken Split' and re.dia = 'E' and re.orden = 3;

-- ============ DÍA E: ENCOGIMIENTO CON BARRA -> CON MANCUERNAS ============
update public.routine_exercises re
set exercise_definition_id = (select id from public.exercise_definitions where nombre = 'Encogimiento de hombros con mancuernas')
from public.routines r
where re.routine_id = r.id and r.nombre = 'Kraken Split' and re.dia = 'E' and re.orden = 8;

-- ============ DÍA B: PLANCHA CON LASTRE -> CIRCUITO DE ABDOMINALES =======
delete from public.routine_exercises re
using public.routines r
where re.routine_id = r.id and r.nombre = 'Kraken Split' and re.dia = 'B' and re.orden = 6;

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Kraken Split'), 'B', 6,
  (select id from public.exercise_definitions where nombre = 'Elevación de piernas colgado'), '3 x 12-15'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Kraken Split' and re.dia = 'B' and re.orden = 6);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Kraken Split'), 'B', 7,
  (select id from public.exercise_definitions where nombre = 'Abdominales en banco declinado'), '3 x 15-20'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Kraken Split' and re.dia = 'B' and re.orden = 7);

-- ============ DÍA D: SUMA CIRCUITO DE ABDOMINALES (no tenía) =============
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Kraken Split'), 'D', 7,
  (select id from public.exercise_definitions where nombre = 'Elevación de piernas colgado'), '3 x 12-15'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Kraken Split' and re.dia = 'D' and re.orden = 7);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Kraken Split'), 'D', 8,
  (select id from public.exercise_definitions where nombre = 'Abdominales en banco declinado'), '3 x 15-20'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Kraken Split' and re.dia = 'D' and re.orden = 8);

-- limpieza: "Plancha con lastre" queda sin uso en ningún lado, se borra.
delete from public.exercise_definitions
where nombre = 'Plancha con lastre'
  and not exists (select 1 from public.routine_exercises where exercise_definition_id = exercise_definitions.id);

-- ============ GIFS ============
-- Los 13 archivos de gifs-kraken-split/ ya deberían estar subidos al bucket
-- `ejercicios` (el mismo que usan todos los GIFs existentes) antes de correr
-- esto. Los que reusan un ejercicio ya viejo (Curl femoral, Elevación de
-- talón parado a una pierna, Encogimiento de hombros con mancuernas) solo
-- se pisan si ese ejercicio todavía no tenía imagen -- para no arriesgar un
-- GIF real que ya estuviera cargado.

update public.exercise_definitions set imagen_url =
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/dominadas-lastradas.gif'
where nombre = 'Dominadas lastradas';

update public.exercise_definitions set imagen_url =
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/curl-con-barra-ez.gif'
where nombre = 'Curl con barra EZ';

update public.exercise_definitions set imagen_url =
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/elevacion-talon-sentado-maquina.gif'
where nombre = 'Elevación de talón sentado en máquina';

update public.exercise_definitions set imagen_url =
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/press-banca-en-smith.gif'
where nombre = 'Press banca en Smith';

update public.exercise_definitions set imagen_url =
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/aperturas-con-mancuernas.gif'
where nombre = 'Aperturas con mancuernas';

update public.exercise_definitions set imagen_url =
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/press-frances-barra-ez.gif'
where nombre = 'Press francés con barra EZ';

update public.exercise_definitions set imagen_url =
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/pajaro-polea-unilateral.gif'
where nombre = 'Pájaro con polea unilateral';

update public.exercise_definitions set imagen_url =
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/abduccion-cadera-polea.gif'
where nombre = 'Abducción de cadera en polea';

update public.exercise_definitions set imagen_url =
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/extension-triceps-sobre-cabeza-polea.gif'
where nombre = 'Extensión de tríceps sobre la cabeza en polea';

update public.exercise_definitions set imagen_url =
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/meadows-row.gif'
where nombre = 'Meadows Row';

-- estos tres son ejercicios viejos que podrían ya tener imagen -- solo se
-- completan si están vacíos.
update public.exercise_definitions set imagen_url =
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/encogimiento-hombros-mancuernas.gif'
where nombre = 'Encogimiento de hombros con mancuernas' and imagen_url is null;

update public.exercise_definitions set imagen_url =
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/curl-femoral.gif'
where nombre = 'Curl femoral' and imagen_url is null;

update public.exercise_definitions set imagen_url =
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/elevacion-talon-parado-una-pierna.gif'
where nombre = 'Elevación de talón parado a una pierna' and imagen_url is null;

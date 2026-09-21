-- Migración 049: rediseño de piernas/hombros/brazos de "Kraken Split" pedido
-- por el usuario el 2026-09-19, más el intercambio de letras B<->D y el
-- reinicio completo del historial de esta rutina.
--
-- Requiere haber subido antes al bucket `ejercicios`:
--   - patada-de-gluteo-en-polea.gif
--   - curl-martillo-parado.gif
-- (ya subidos vía Dashboard en esta misma sesión).
--
-- Correr en el SQL Editor de Supabase después de la migración 048.

-- ============================================================
-- 0. Reinicio completo del historial de Kraken Split (pedido explícito del
--    usuario: "todo el historial del Kraken Split", no solo los ejercicios
--    que cambiaron). Va PRIMERO, antes de tocar routine_exercises: si se
--    corriera después de los pasos 2-3, los logs de los ejercicios que se
--    sacan por completo de la rutina (Curl femoral unilateral en polea,
--    Empuje de caderas, Curl martillo con mancuernas sentado) ya no
--    aparecerían en el join y quedarían sin borrar.
-- ============================================================
delete from public.workout_logs wl
using public.routine_exercises re, public.routines r
where wl.exercise_definition_id = re.exercise_definition_id
  and re.routine_id = r.id
  and r.nombre = 'Kraken Split'
  and wl.user_id = (select id from auth.users where email = 'ezequiel.arce@outlook.com');

-- ============================================================
-- 1. Ejercicios nuevos en el catálogo (exercise_definitions)
-- ============================================================

-- "Patada de glúteo en polea": variante en polea, distinta de las 3 patada de
-- glúteo sin equipo cargadas en la migración 047. GIF de la biblioteca oficial
-- (blanco y negro). Video prestado del sibling más cercano ya cargado
-- ("Patada de glúteo con pierna extendida") hasta tener uno propio.
insert into public.exercise_definitions
  (nombre, categoria, imagen_url, video_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'Patada de glúteo en polea', 'Legs',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/patada-de-gluteo-en-polea.gif',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios-video/Patada de gluteo con pierna extendida.mp4',
  'Paso inicial: Enganchá un cabestrillo de tobillo a una polea baja y colocátelo en el tobillo de la pierna que va a trabajar. Parate de frente a la máquina, sosteniéndote del marco para mantener el equilibrio.

Posición inicial: Torso levemente inclinado hacia adelante, cadera y rodilla de la pierna activa con una flexión leve.

Movimiento: Exhalá y extendé la cadera llevando la pierna hacia atrás, manteniendo la rodilla con una flexión suave y constante durante todo el recorrido.

Contracción: Apretá el glúteo un instante en el punto de máxima extensión de cadera.

Regreso: Inhalá y volvé la pierna a la posición inicial de forma controlada, sin que el cable tire de golpe.

Consejo como Entrenador:

Evitá compensar con la zona lumbar -- el movimiento sale de la cadera, no de arquear la espalda.

Completá las repeticiones de una pierna antes de cambiar de lado.'
  , 'aislado', true
where not exists (select 1 from public.exercise_definitions where nombre = 'Patada de glúteo en polea');

-- "Curl martillo parado": mismo movimiento que "Curl martillo con mancuernas
-- sentado" (ya en el catálogo), de pie en vez de sentado. GIF de la biblioteca
-- oficial. Sin video propio -- el sentado tampoco tiene, así que no hay
-- sibling del cual pedir prestado.
insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'Curl martillo parado', 'Pull',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/curl-martillo-parado.gif',
  'Paso inicial: Parate con la espalda recta y los pies a la altura de los hombros. Toma una mancuerna en cada mano con un agarre neutro (palmas mirando hacia tu cuerpo).

Posición corporal: Brazos extendidos a los costados, codos cerca del cuerpo. Esta es la posición inicial.

Movimiento: Flexioná el brazo en el codo manteniendo el antebrazo alineado, llevando la mancuerna hacia el hombro con el agarre neutro. Mantené el codo pegado al cuerpo y el torso estable, sin balancear.

Contracción: Mantené la contracción arriba un instante.

Regreso: Bajá la mancuerna de forma controlada hasta estirar completamente el brazo. Alterná o hacé ambos brazos juntos según la serie.

Consejo como Entrenador:

Evitá el impulso de piernas o torso para levantar el peso -- si tenés que balancearte, bajá la carga.',
  'aislado', true
where not exists (select 1 from public.exercise_definitions where nombre = 'Curl martillo parado');

-- ============================================================
-- 2. Cambios de contenido en Kraken Split (con las letras actuales,
--    ANTES del intercambio B<->D del paso 3)
-- ============================================================

-- Día B, orden 3: "Cuádriceps en prensa" -> "Extensión de cuádriceps"
-- (se mueve desde el día D).
update public.routine_exercises re
set exercise_definition_id = (select id from public.exercise_definitions where nombre = 'Extensión de cuádriceps'),
    series_reps = '3 x 12-20 (parciales en estiramiento al final)'
from public.routines r
where re.routine_id = r.id and r.nombre = 'Kraken Split' and re.dia = 'B' and re.orden = 3;

-- Día D, orden 3: "Extensión de cuádriceps" -> "Cuádriceps en prensa"
-- (se mueve desde el día B).
update public.routine_exercises re
set exercise_definition_id = (select id from public.exercise_definitions where nombre = 'Cuádriceps en prensa'),
    series_reps = '3 x 10-15'
from public.routines r
where re.routine_id = r.id and r.nombre = 'Kraken Split' and re.dia = 'D' and re.orden = 3;

-- Día D, orden 4: "Curl femoral unilateral en polea" -> "Peso muerto".
update public.routine_exercises re
set exercise_definition_id = (select id from public.exercise_definitions where nombre = 'Peso muerto'),
    series_reps = '3 x 6-10'
from public.routines r
where re.routine_id = r.id and r.nombre = 'Kraken Split' and re.dia = 'D' and re.orden = 4;

-- Día D, orden 2: "Empuje de caderas" -> "Patada de glúteo en polea".
update public.routine_exercises re
set exercise_definition_id = (select id from public.exercise_definitions where nombre = 'Patada de glúteo en polea'),
    series_reps = '3 x 12-15 por pierna'
from public.routines r
where re.routine_id = r.id and r.nombre = 'Kraken Split' and re.dia = 'D' and re.orden = 2;

-- Día E, orden 4: "Curl martillo con mancuernas sentado" -> "Curl martillo parado".
update public.routine_exercises re
set exercise_definition_id = (select id from public.exercise_definitions where nombre = 'Curl martillo parado')
from public.routines r
where re.routine_id = r.id and r.nombre = 'Kraken Split' and re.dia = 'E' and re.orden = 4;

-- Día E, orden 1: "Elevacion lateral con mancuernas" -> "Vuelo lateral con
-- polea" (unilateral, ya existía en el catálogo), 4 x 12-20.
update public.routine_exercises re
set exercise_definition_id = (select id from public.exercise_definitions where nombre = 'Vuelo lateral con polea'),
    series_reps = '4 x 12-20'
from public.routines r
where re.routine_id = r.id and r.nombre = 'Kraken Split' and re.dia = 'E' and re.orden = 1;

-- Día A: se agrega "Elevacion lateral con mancuernas" 3 x 12-20 como orden 7.
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Kraken Split'), 'A', 7,
  (select id from public.exercise_definitions where nombre = 'Elevacion lateral con mancuernas'), '3 x 12-20'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Kraken Split' and re.dia = 'A' and re.orden = 7);

-- Día C, orden 4: misma "Elevacion lateral con mancuernas", pero sentado en
-- vez de parado (mismo ejercicio canónico, solo cambia la postura en esta
-- rutina -- no se crea un exercise_definition nuevo).
update public.routine_exercises re
set series_reps = '4 x 12-20 + dropset final (sentado)'
from public.routines r
where re.routine_id = r.id and r.nombre = 'Kraken Split' and re.dia = 'C' and re.orden = 4;

-- ============================================================
-- 3. Intercambio de letras: lo que hoy es "B" pasa a ser "D" y viceversa.
--    Un solo UPDATE con CASE evalúa el valor viejo de "dia" antes de
--    escribir, así que no hace falta una letra temporal.
-- ============================================================
update public.routine_exercises re
set dia = case re.dia when 'B' then 'D' when 'D' then 'B' end
from public.routines r
where re.routine_id = r.id and r.nombre = 'Kraken Split' and re.dia in ('B', 'D');

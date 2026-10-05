-- Migración 090: rutina nueva completa para "Kraken Split" (routine_id = 7,
-- la rutina privada del coach, única cuenta que la usa:
-- ezequiel.arce@outlook.com). Reemplaza los 5 días A-E por el programa que
-- pasó el coach el 2026-10-05.
--
-- Ejercicio nuevo: "Tríceps katana" no existía en el catálogo. Se crea con
-- el gif prestado de "Extensión de tríceps sobre la cabeza en polea" (id 77,
-- mecánica muy similar -- extensión de tríceps en polea alta con los codos
-- fijos) hasta que el coach suba un gif/video propio -- mismo criterio ya
-- usado antes para no dejar imagen_url en null.
--
-- "Sentadilla con barra" (id 123) YA fue corregida fuera de esta migración
-- (video subido a Storage y vinculado directo vía API) -- el coach había
-- notado que "Cómo realizarlo" no mostraba el video aunque debía existir;
-- la causa real era que el archivo nunca se había subido a Supabase
-- Storage, solo estaba en la carpeta local de staging.
--
-- Interpretaciones hechas sobre nombres ambiguos que el coach pasó en
-- lenguaje coloquial (avisarle si alguna no es la que tenía en mente):
--   "vuelo con mancuernas" (días A y D) -> "Elevación lateral con
--     mancuernas" (id 14) -- el catálogo reserva "vuelo" para movimientos
--     de hombro (vuelo lateral/posterior/frontal), nunca para pecho (eso
--     siempre se llama "apertura" acá), así que se interpretó como
--     elevación lateral.
--   "extension de triceps en polea unilateral" (día A) -> "Tríceps en
--     polea alta a un brazo" (id 22, jalón estándar a un brazo).
--   "elevacion frontal en polea unilateral" (día A) -> "Elevación frontal
--     en polea baja a un brazo" (id 63).
--   "biceps unilateral en scott" (día D) -> "Curl en polea a un brazo en
--     banco Scott" (id 5, variante en polea -- no había una versión con
--     mancuerna sin agarre invertido).
--   "gemelo parado en smith" (día E) -> "Elevación de talón en máquina
--     Smith" (id 10).
--   "curl femoral tumbado" (día C) -> "Curl femoral" (id 6, es la variante
--     tumbada/acostada por default en este catálogo, distinta de "Curl
--     femoral sentado").
--
-- Correr en el SQL Editor de Supabase.

-- ============ EJERCICIO NUEVO: TRÍCEPS KATANA ============
insert into public.exercise_definitions
  (nombre, categoria, imagen_url, tipo_esfuerzo, unilateral, alternativa_id, grupos_musculares, como_hacerlo)
select
  'Tríceps katana',
  'Push',
  (select imagen_url from public.exercise_definitions where nombre = 'Extensión de tríceps sobre la cabeza en polea'),
  'aislado',
  false,
  (select id from public.exercise_definitions where nombre = 'Extensión de tríceps sobre la cabeza en polea'),
  array['Tríceps'],
  'Paso inicial: Colocá una cuerda en una polea alta y parate de costado o de frente a la máquina, agarrando la cuerda con ambas manos.

Posición inicial: Codos flexionados y pegados al cuerpo, cuerda a la altura del hombro opuesto -- como si fueras a desenvainar una katana.

Movimiento: Exhalá y extendé los codos llevando la cuerda en diagonal hacia abajo y hacia el lado contrario del cuerpo, en un trazo recto.

Contracción: Apretá el tríceps un instante con los brazos extendidos.

Regreso: Inhalá y volvé a flexionar los codos de forma controlada, sin perder la tensión del cable.

Consejo como Entrenador:

Los codos se mantienen pegados al torso durante todo el recorrido -- el movimiento sale del antebrazo, no del hombro.

Mantené el trazo diagonal constante, sin cortar el recorrido a mitad de camino.'
where not exists (select 1 from public.exercise_definitions where nombre = 'Tríceps katana');

-- ============ RESETEAR RUTINA "KRAKEN SPLIT" ============
delete from public.routine_exercises
where routine_id = (select id from public.routines where nombre = 'Kraken Split');

-- ============ DÍA A ============
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
values
  ((select id from public.routines where nombre = 'Kraken Split'), 'A', 1,
    (select id from public.exercise_definitions where nombre = 'Elevacion lateral con mancuernas'), '3 x 12-20'),
  ((select id from public.routines where nombre = 'Kraken Split'), 'A', 2,
    (select id from public.exercise_definitions where nombre = 'Press inclinado en máquina Smith'), '4 x 8-12'),
  ((select id from public.routines where nombre = 'Kraken Split'), 'A', 3,
    (select id from public.exercise_definitions where nombre = 'Press inclinado con mancuernas'), '3 x 8-12'),
  ((select id from public.routines where nombre = 'Kraken Split'), 'A', 4,
    (select id from public.exercise_definitions where nombre = 'Fondos en paralelas'), '3 x 8-12'),
  ((select id from public.routines where nombre = 'Kraken Split'), 'A', 5,
    (select id from public.exercise_definitions where nombre = 'Tríceps en polea alta a un brazo'), '3 x 10-15'),
  ((select id from public.routines where nombre = 'Kraken Split'), 'A', 6,
    (select id from public.exercise_definitions where nombre = 'Elevación frontal en polea baja a un brazo'), '3 x 12-20');

-- ============ DÍA B ============
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
values
  ((select id from public.routines where nombre = 'Kraken Split'), 'B', 1,
    (select id from public.exercise_definitions where nombre = 'Dominadas lastradas'), '3 x 6-10'),
  ((select id from public.routines where nombre = 'Kraken Split'), 'B', 2,
    (select id from public.exercise_definitions where nombre = 'Meadows Row'), '3 x 8-12'),
  ((select id from public.routines where nombre = 'Kraken Split'), 'B', 3,
    (select id from public.exercise_definitions where nombre = 'Pájaro con polea unilateral'), '3 x 12-20'),
  ((select id from public.routines where nombre = 'Kraken Split'), 'B', 4,
    (select id from public.exercise_definitions where nombre = 'Encogimiento de hombros unilateral con mancuerna (Gittleson)'), '3 x 10-15 por lado'),
  ((select id from public.routines where nombre = 'Kraken Split'), 'B', 5,
    (select id from public.exercise_definitions where nombre = 'Curl martillo parado'), '3 x 10-15'),
  ((select id from public.routines where nombre = 'Kraken Split'), 'B', 6,
    (select id from public.exercise_definitions where nombre = 'Curl de bíceps en banco inclinado con mancuernas'), '3 x 10-15');

-- ============ DÍA C ============
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
values
  ((select id from public.routines where nombre = 'Kraken Split'), 'C', 1,
    (select id from public.exercise_definitions where nombre = 'Sentadilla con barra'), '4 x 5-8'),
  ((select id from public.routines where nombre = 'Kraken Split'), 'C', 2,
    (select id from public.exercise_definitions where nombre = 'Hiperextensiones'), '3 x 10-15'),
  ((select id from public.routines where nombre = 'Kraken Split'), 'C', 3,
    (select id from public.exercise_definitions where nombre = 'Extensión de cuádriceps'), '4 x 12-20'),
  ((select id from public.routines where nombre = 'Kraken Split'), 'C', 4,
    (select id from public.exercise_definitions where nombre = 'Curl femoral'), '2 x 10-15'),
  ((select id from public.routines where nombre = 'Kraken Split'), 'C', 5,
    (select id from public.exercise_definitions where nombre = 'Elevación de talón sentado en máquina'), '4 x 10-15'),
  ((select id from public.routines where nombre = 'Kraken Split'), 'C', 6,
    (select id from public.exercise_definitions where nombre = 'Abdominales en banco declinado'), '3 x 15-20'),
  ((select id from public.routines where nombre = 'Kraken Split'), 'C', 7,
    (select id from public.exercise_definitions where nombre = 'Elevación de piernas colgado'), '3 x 12-15');

-- ============ DÍA D ============
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
values
  ((select id from public.routines where nombre = 'Kraken Split'), 'D', 1,
    (select id from public.exercise_definitions where nombre = 'Tríceps katana'), '3 x 10-15'),
  ((select id from public.routines where nombre = 'Kraken Split'), 'D', 2,
    (select id from public.exercise_definitions where nombre = 'Curl en polea a un brazo en banco Scott'), '3 x 10-15'),
  ((select id from public.routines where nombre = 'Kraken Split'), 'D', 3,
    (select id from public.exercise_definitions where nombre = 'Elevacion lateral con mancuernas'), '3 x 12-20'),
  ((select id from public.routines where nombre = 'Kraken Split'), 'D', 4,
    (select id from public.exercise_definitions where nombre = 'Fondos en paralelas'), '3 x 8-12'),
  ((select id from public.routines where nombre = 'Kraken Split'), 'D', 5,
    (select id from public.exercise_definitions where nombre = 'Dominadas cerradas con agarre neutro'), '3 x 8-12'),
  ((select id from public.routines where nombre = 'Kraken Split'), 'D', 6,
    (select id from public.exercise_definitions where nombre = 'Press militar con mancuernas'), '3 x 8-12'),
  ((select id from public.routines where nombre = 'Kraken Split'), 'D', 7,
    (select id from public.exercise_definitions where nombre = 'Remo con barra parado'), '3 x 8-12');

-- ============ DÍA E ============
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
values
  ((select id from public.routines where nombre = 'Kraken Split'), 'E', 1,
    (select id from public.exercise_definitions where nombre = 'Peso muerto'), '4 x 5-8'),
  ((select id from public.routines where nombre = 'Kraken Split'), 'E', 2,
    (select id from public.exercise_definitions where nombre = 'Estocada búlgara en el banco'), '3-4 x 8-12 por pierna'),
  ((select id from public.routines where nombre = 'Kraken Split'), 'E', 3,
    (select id from public.exercise_definitions where nombre = 'Empuje de caderas'), '3 x 8-12'),
  ((select id from public.routines where nombre = 'Kraken Split'), 'E', 4,
    (select id from public.exercise_definitions where nombre = 'Elevación de talón en máquina Smith'), '4 x 10-15'),
  ((select id from public.routines where nombre = 'Kraken Split'), 'E', 5,
    (select id from public.exercise_definitions where nombre = 'Sentadilla sissy'), '3 x 12-20'),
  ((select id from public.routines where nombre = 'Kraken Split'), 'E', 6,
    (select id from public.exercise_definitions where nombre = 'Elevación de piernas colgado'), '3 x 12-15'),
  ((select id from public.routines where nombre = 'Kraken Split'), 'E', 7,
    (select id from public.exercise_definitions where nombre = 'Abdominales en banco declinado'), '3 x 15-20');

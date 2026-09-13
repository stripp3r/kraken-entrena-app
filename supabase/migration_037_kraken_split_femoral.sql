-- Migración 037: separa el curl femoral de Kraken Split en sus dos variantes
-- reales -- la rutina original tenía un día con curl femoral SENTADO
-- (bilateral) y otro día UNILATERAL en polea, no el mismo ejercicio
-- repetido dos veces.
--
-- Día B (Lower A): "Curl femoral" (tumbado) -> "Curl femoral sentado"
-- (bilateral, ya existía en el catálogo).
-- Día D (Lower B): "Curl femoral" (tumbado) -> "Curl femoral unilateral en
-- polea" (ejercicio nuevo, con el GIF real que encontró el usuario).
--
-- Correr en el SQL Editor después de subir
-- gifs-kraken-split/curl-femoral-unilateral-en-polea.gif al bucket
-- `ejercicios` (el mismo de siempre).
--
-- Correr después de la migración 036.

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'Curl femoral unilateral en polea', 'Pull',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/curl-femoral-unilateral-en-polea.gif',
  'Paso inicial: Enganchá un cabestrillo de tobillo a una polea baja y colocátelo en el tobillo de la pierna que va a trabajar. Parate de frente a la máquina, sosteniéndote del marco para mantener el equilibrio.

Posición inicial: Parate con una ligera flexión en la rodilla de apoyo, y la pierna enganchada extendida hacia atrás de la polea.

Movimiento: Exhalá y flexioná la rodilla de la pierna activa, llevando el talón hacia el glúteo contra la resistencia del cable.

Contracción: Apretá el isquiotibial un instante en la posición de máxima flexión.

Regreso: Inhalá y extendé la pierna de forma controlada, sin que el cable tire de golpe.

Consejo como Entrenador:

Mantené la cadera lo más quieta posible -- el movimiento sale de la rodilla, no de balancear el cuerpo.

Trabajar unilateral con polea permite un rango de movimiento más libre que una máquina de curl femoral tradicional.

Completá las repeticiones de una pierna antes de cambiar de lado.',
  'aislado', true
where not exists (select 1 from public.exercise_definitions where nombre = 'Curl femoral unilateral en polea');

-- Día B: pasa a ser el sentado, bilateral ("doble").
update public.routine_exercises re
set exercise_definition_id = (select id from public.exercise_definitions where nombre = 'Curl femoral sentado')
from public.routines r
where re.routine_id = r.id and r.nombre = 'Kraken Split' and re.dia = 'B' and re.orden = 4;

-- Día D: pasa a ser el unilateral en polea.
update public.routine_exercises re
set exercise_definition_id = (select id from public.exercise_definitions where nombre = 'Curl femoral unilateral en polea'),
    series_reps = '3 x 12-15 por pierna'
from public.routines r
where re.routine_id = r.id and r.nombre = 'Kraken Split' and re.dia = 'D' and re.orden = 4;

-- limpieza: el "Curl femoral tumbado unilateral" de la migración 035 quedó
-- sin uso desde la 036 (nunca tuvo GIF) -- se borra.
delete from public.exercise_definitions
where nombre = 'Curl femoral tumbado unilateral'
  and not exists (select 1 from public.routine_exercises where exercise_definition_id = exercise_definitions.id);

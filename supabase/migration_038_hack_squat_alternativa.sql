-- Migración 038: agrega "Hack Squat" como alternativa de "Cuádriceps en
-- prensa" (y viceversa) -- el usuario notó que ese ejercicio no tenía
-- alternativa cargada, a diferencia de otros.
--
-- Correr en el SQL Editor después de subir gifs-kraken-split/hack-squat.gif
-- al bucket `ejercicios` (el mismo de siempre).

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'Hack Squat', 'Legs',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/hack-squat.gif',
  'Paso inicial: Colocate en la máquina de hack squat con los hombros debajo de las almohadillas y la espalda bien apoyada contra el respaldo.

Posición inicial: Apoyá los pies al ancho de los hombros sobre la plataforma, un poco adelantados respecto a la cadera, y liberá los seguros laterales.

Movimiento: Inhalá y bajá flexionando las rodillas hasta formar un ángulo de 90 grados aproximadamente, manteniendo la espalda pegada al respaldo.

Contracción: Exhalá y empujá con los talones para volver a subir, sin trabar las rodillas con violencia arriba.

Regreso: Repetí el descenso controlado para la siguiente repetición.

Consejo como Entrenador:

Es una excelente alternativa a la prensa cuando esa máquina está ocupada -- trabaja el cuádriceps de forma similar, con el plus de mantener la espalda fija contra el respaldo.

No dejes que las rodillas se vayan hacia adentro al bajar.

Ajustá la posición de los pies (más arriba = más glúteo/isquios, más abajo = más cuádriceps) según el énfasis que busques.',
  'compuesto', false
where not exists (select 1 from public.exercise_definitions where nombre = 'Hack Squat');

-- alternativa en ambos sentidos
update public.exercise_definitions
set alternativa_id = (select id from public.exercise_definitions where nombre = 'Hack Squat')
where nombre = 'Cuádriceps en prensa';

update public.exercise_definitions
set alternativa_id = (select id from public.exercise_definitions where nombre = 'Cuádriceps en prensa')
where nombre = 'Hack Squat';

-- Migracion 009: agrega Press de hombro en maquina Smith como
-- ejercicio de referencia (fuera de la rutina del dia, solo para servir
-- de alternativa) y lo vincula como alternativa de Press militar con mancuernas.

-- routine_id queda en null a propósito: este ejercicio no pertenece a
-- ningún día programado, existe solo como alternativa de otro.
insert into public.exercises (nombre, dia, categoria, orden, imagen_url, como_hacerlo)
values (
  'Press de hombro en maquina Smith',
  'A',
  'Push',
  99,
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/press-hombro-smith.gif',
  'Paso inicial: Ajusta la máquina Smith a la altura adecuada para que la barra se encuentre a la altura de los hombros cuando estás sentado. Coloca un banco debajo de la barra para apoyar tu espalda durante el ejercicio.

Posición corporal: Siéntate en el banco y coloca los pies firmemente en el suelo. Asegúrate de que tu espalda esté apoyada en el respaldo del banco y que tu núcleo esté activado para mantener una postura estable. Agarra la barra con las manos en un agarre pronado ligeramente más ancho que el ancho de los hombros.

Movimiento: Comienza con la barra descansando sobre tus hombros y mantén los codos flexionados. Levanta la barra empujando hacia arriba, extendiendo los brazos hacia arriba, hasta que los brazos estén completamente extendidos y la barra esté por encima de la cabeza. Mantén los codos ligeramente doblados durante todo el movimiento.

Regreso: Lentamente, baja la barra, controlando el descenso y manteniendo la tensión en los músculos de los hombros. Regresa a la posición inicial con la barra descansando sobre tus hombros.

Consejo como entrenador:

Es posible que tenga que ajustar el asiento varias veces hasta que llegue a una posición cómoda.

Si está demasiado lejos de la barra, sentirá como si estuviera empujando hacia adelante, y si está demasiado cerca de la barra, tendrá problemas para despejar la barbilla mientras empuja por encima de la cabeza.

Mantenga una buena postura en la zona lumbar y el cuello durante este ejercicio y muévase de manera lenta y controlada.

La máquina Smith puede ser buena para las personas que son nuevas en el press militar con barra y también puede beneficiar a las personas que quieren levantar pesas pesadas sin alguien que los ayude.'
);

update public.exercises
set alternativa_id = (select id from public.exercises where nombre = 'Press de hombro en maquina Smith')
where nombre = 'Press militar con mancuernas';

-- deshace el ejemplo anterior (dos ejercicios que ya estaban los dos
-- cargados en el día A no es un buen ejemplo de "alternativa" real).
update public.exercises set alternativa_id = null
where nombre in ('Vuelo lateral con polea', 'Vuelo lateral con mancuerna a un brazo');

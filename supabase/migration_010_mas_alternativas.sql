-- Migracion 010: alternativas reales para el resto de los ejercicios de prueba.

insert into public.exercises (nombre, dia, categoria, orden, imagen_url, como_hacerlo)
values (
  'Elevacion lateral con mancuernas',
  'A',
  'Push',
  99,
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/elevacion-lateral-mancuernas.gif',
  'Paso inicial: Párate con los pies separados al ancho de los hombros y sostén una mancuerna en cada mano, con las palmas de las manos mirando hacia el cuerpo. Mantén las rodillas ligeramente flexionadas y la espalda recta.

Posición corporal: Mantén los brazos extendidos a los lados, paralelos al suelo, y los codos ligeramente flexionados. Asegúrate de que los hombros estén hacia abajo y hacia atrás, y el núcleo activado para mantener una buena postura durante todo el ejercicio.

Movimiento: Levanta lentamente los brazos hacia los lados hasta que estén paralelos al suelo. Mantén el control y evita balancear el cuerpo o utilizar impulso. Mantén una ligera flexión en los codos durante todo el movimiento.

Regreso: Baja lentamente los brazos de vuelta a la posición inicial, controlando el movimiento en todo momento. Evita dejar caer las mancuernas o permitir que los hombros se desplomen.

Consejo como entrenador:

Mantén un ritmo controlado y evita usar un peso excesivo que comprometa la técnica adecuada.

Mantén el enfoque en la tensión y el trabajo de los músculos de los hombros durante todo el ejercicio.'
);

update public.exercises
set alternativa_id = (select id from public.exercises where nombre = 'Elevacion lateral con mancuernas')
where nombre = 'Vuelo lateral con polea';

insert into public.exercises (nombre, dia, categoria, orden, imagen_url, como_hacerlo)
values (
  'Elevacion lateral en maquina',
  'A',
  'Push',
  99,
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/elevacion-lateral-maquina.gif',
  'Paso inicial: Ajusta el asiento y la almohadilla en el caso de que la maquina lo permita, según tu altura y comodidad. Asegúrate de que los agarres estén a la altura de los hombros.

Posición corporal: Siéntate en la máquina con la espalda apoyada y los pies firmemente plantados en el suelo. Agarra los agarres con las manos, manteniendo los codos ligeramente flexionados o flexionados dependiendo de la máquina.

Movimiento: Mantén una postura estable y contrae los músculos abdominales. Con un movimiento controlado, levanta los brazos hacia los lados, manteniendo los codos ligeramente flexionados o flexionados según la máquina. El movimiento debe ser suave y controlado, evitando cualquier balanceo o impulso.

Apertura y regreso: Al llegar al punto más alto del movimiento, donde los brazos estén paralelos al suelo, mantén la posición durante un segundo y luego regresa lentamente a la posición inicial, controlando el movimiento.

Consejo como entrenador:

Mantén la espalda recta y evita inclinarte hacia adelante o hacia atrás durante el ejercicio.

Mantén el control en todo momento y evita utilizar el impulso para levantar los brazos.

Es importante seleccionar un peso adecuado que te permita realizar el ejercicio de manera correcta y segura.'
);

update public.exercises
set alternativa_id = (select id from public.exercises where nombre = 'Elevacion lateral en maquina')
where nombre = 'Vuelo lateral con mancuerna a un brazo';

insert into public.exercises (nombre, dia, categoria, orden, imagen_url, como_hacerlo)
values (
  'Fondos en banco',
  'A',
  'Push',
  99,
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/fondos-en-banco.gif',
  'Paso inicial: Colócate frente a un banco resistente o una superficie elevada similar, como una silla robusta o una barra paralela. Asegúrate de que el banco esté estable y no se mueva durante el ejercicio.

Posición corporal: Coloca las manos sobre el borde del banco, separadas aproximadamente a la anchura de los hombros. Extiende las piernas hacia adelante y apoya los talones en un banco o en el suelo, manteniendo las rodillas extendidas. Inclina ligeramente el torso hacia adelante.

Movimiento: Comienza bajando el cuerpo flexionando los codos, manteniendo los codos cerca del cuerpo. Desciende hasta que los brazos estén paralelos al suelo o ligeramente por debajo. Mantén una postura recta y controlada durante todo el movimiento.

Empuje: Una vez alcanzado el punto más bajo, comienza a empujar hacia arriba mediante la extensión de los brazos. Vuelve a la posición inicial sin bloquear completamente los codos y manteniendo el control del movimiento.

Regreso: Repite el movimiento descendiendo nuevamente los brazos hacia abajo y flexionando los codos para volver a la posición inicial.

Consejo como entrenador:

Mantén una buena alineación corporal durante todo el ejercicio.

Evita balancear el cuerpo o compensar el esfuerzo con otros músculos.

Mantén una respiración constante y controlada, exhalando al empujar hacia arriba y inhalando al bajar el cuerpo.'
);

update public.exercises
set alternativa_id = (select id from public.exercises where nombre = 'Fondos en banco')
where nombre = 'Fondos en paralelas';

-- Migracion 017: completa el dia A con los 2 ejercicios de triceps que
-- faltaban del Excel original (TRICEPS PL y EXT. INCLIN PL), detectados por
-- el usuario al comparar contra su Excel. Mismo estandar que el resto: texto
-- real de Hoja2, imagen real verificada, alternativa real cada uno.

insert into public.exercises (nombre, dia, categoria, orden, imagen_url, como_hacerlo, routine_id, tipo_esfuerzo, unilateral)
values (
  'Extensión de tríceps en polea',
  'A',
  'Push',
  5,
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/gif-triceps-polea.gif',
  'Paso inicial: Colócate frente a una máquina de polea alta con una barra unida al cable. Asegura la barra en posición recta y coloca los pies a una distancia aproximada al ancho de los hombros.

Posición corporal: Párate erguido y mantén una ligera inclinación hacia adelante desde las caderas. Agarra la barra con un agarre pronado (palmas hacia abajo) y coloca las manos a una distancia ligeramente más estrecha que el ancho de los hombros. Mantén los codos cerca del cuerpo y los brazos extendidos.

Movimiento: Contrae los músculos del tríceps y exhala mientras llevas la barra hacia abajo, doblando los codos. Mantén los codos pegados al cuerpo y evita que se muevan hacia adelante o hacia los lados. Continúa bajando la barra hasta que tus brazos estén completamente extendidos sin bloquearlos hasta sentir un estiramiento en los tríceps.

Regreso: Inhala y flexiona los codos para llevar la barra hacia arriba, volviendo a la posición inicial. Mantén los músculos del tríceps activos durante todo el movimiento.

Consejo como Entrenador:

Mantén una postura adecuada, evitando arquear la espalda o utilizar impulso adicional durante el ejercicio.

Mantén los codos cerca del cuerpo para centrar el trabajo en los tríceps y reducir la tensión en los hombros.

Asegúrate de llevar los hombros hacia atrás y abrir el pecho para evitar involucrar inadvertidamente estos músculos.

Ajusta el peso de la polea según tu nivel de fuerza y capacidad, y realiza los movimientos de forma controlada.',
  (select id from public.routines where nombre = 'Entreno 4 días'),
  'aislado',
  true
);

insert into public.exercises (nombre, dia, categoria, orden, imagen_url, como_hacerlo)
values (
  'Extensión de tríceps en máquina',
  'A',
  'Push',
  99,
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/gif-extension-triceps-maquina.gif',
  'Paso inicial: Siéntate en la máquina para tríceps y ajusta el asiento para que estés cómodo. Alinea tus hombros lo más cerca posible al punto de pivote de la máquina.

Posición corporal: Mantén la espalda recta y los pies firmemente plantados en el suelo. Agarra las asas de la máquina con un agarre neutro, con las palmas hacia adentro y los codos ligeramente flexionados.

Movimiento: Exhala y empuja hacia abajo en la máquina, extendiendo completamente los brazos mientras mantienes los codos cerca del cuerpo. Mantén la posición extendida durante un segundo para sentir la contracción en los tríceps.

Regreso: Inhala y lentamente regresa a la posición inicial, flexionando los codos mientras mantienes el control del movimiento. No permitas que los hombros se levanten hacia las orejas mientras doblas los codos.

Consejo como Entrenador:

Es importante mantener los hombros hacia abajo y hacia atrás durante todo el movimiento para evitar que se encorven hacia adelante.

Asegúrate de mantener una buena alineación corporal y evitar balancearte hacia adelante o hacia atrás.'
);

insert into public.exercises (nombre, dia, categoria, orden, imagen_url, como_hacerlo, routine_id, tipo_esfuerzo, unilateral)
values (
  'Extensión de tríceps inclinada en polea baja',
  'A',
  'Push',
  6,
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/gif-extension-triceps-inclinada-polea.gif',
  'Paso inicial: Ajusta la polea baja con la barra en un punto donde puedas alcanzarla cómodamente desde el banco inclinado. Asegúrate de que el banco esté ajustado a un ángulo de aproximadamente 45 grados. Coloca una barra en la polea baja y ajusta el peso deseado.

Posición corporal: Siéntate en el extremo del banco inclinado con la espalda apoyada en el respaldo y los pies firmemente plantados en el suelo. Toma la barra con ambas manos y sosténla sobre tu cabeza con los brazos extendidos, asegurándote de que la barra esté directamente sobre tu cabeza.

Movimiento: Mantén los codos estables y cerca de la cabeza. Baja lentamente la barra detrás de tu cabeza mientras inhalas, doblando los codos y sintiendo el estiramiento en los tríceps. Detente cuando tus brazos estén aproximadamente paralelos al suelo o hasta que sientas un estiramiento cómodo en los tríceps.

Empuje y Regreso: Contrae los tríceps y extiende los brazos hacia arriba, llevando la barra de vuelta a la posición inicial, mientras exhalas. Mantén el control del movimiento y siente la tensión en los tríceps durante todo el ejercicio.

Consejo como Entrenador:

Mantén los codos estables y cerca de la cabeza durante todo el movimiento para maximizar la activación de los tríceps y evitar el estrés excesivo en los codos y los hombros.

Utiliza un rango de movimiento cómodo y controlado, y elige un peso de la barra que te permita completar el ejercicio con buena forma.',
  (select id from public.routines where nombre = 'Entreno 4 días'),
  'aislado',
  false
);

insert into public.exercises (nombre, dia, categoria, orden, imagen_url, como_hacerlo)
values (
  'Extensión de tríceps inclinada con barra EZ',
  'A',
  'Push',
  99,
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/gif-extension-triceps-inclinada-barra-ez.gif',
  'Paso inicial: Ajusta el banco inclinado a un ángulo de aproximadamente 45 grados. Coloca una barra EZ en el soporte de la máquina o en el suelo cerca del banco.

Posición corporal: Siéntate en el extremo del banco inclinado con la espalda apoyada en el respaldo y los pies firmemente plantados en el suelo. Toma la barra EZ con ambas manos y sosténla sobre tu cabeza con los brazos extendidos, asegurándote de que la barra esté directamente sobre tu cabeza.

Movimiento: Mantén los codos fijos en su lugar y baja lentamente la barra detrás de tu cabeza mientras inhalas, doblando los codos y sintiendo el estiramiento en los tríceps. Detente cuando tus brazos estén aproximadamente paralelos al suelo o hasta que sientas un estiramiento cómodo en los tríceps.

Empuje y Regreso: Contrae los tríceps y extiende los brazos hacia arriba, llevando la barra de vuelta a la posición inicial, mientras exhalas, manteniendo el control del movimiento y sintiendo la tensión en los tríceps.

Consejo como Entrenador:

Mantén los codos estables y cerca de la cabeza durante todo el movimiento para maximizar la activación de los tríceps y evitar el estrés excesivo en los codos y los hombros.

Utiliza un rango de movimiento cómodo y controlado, y selecciona un peso de barra que te permita completar el ejercicio con buena forma.'
);

update public.exercises
set alternativa_id = (select id from public.exercises where nombre = 'Extensión de tríceps en máquina')
where nombre = 'Extensión de tríceps en polea' and dia = 'A' and routine_id is not null;

update public.exercises
set alternativa_id = (select id from public.exercises where nombre = 'Extensión de tríceps inclinada con barra EZ')
where nombre = 'Extensión de tríceps inclinada en polea baja' and dia = 'A' and routine_id is not null;

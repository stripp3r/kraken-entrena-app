-- Migración 020: rutina '5 días - hipertrofia', construida sobre la
-- arquitectura de ejercicios canónicos (migración 019). La mayoría de sus 30
-- ejercicios ya existen en la app (se reutiliza el mismo exercise_definitions
-- por nombre, para que el historial de fuerza de esos movimientos siga siendo
-- uno solo, sin importar qué rutina los prescriba); solo 8 son nuevos.
--
-- 'ABS CIRCUITO' (Hoja2) no es un solo ejercicio sino un circuito de 2
-- movimientos distintos -- se separó en 'Elevación de piernas colgado' y
-- 'Abdominales en banco declinado' como dos ejercicios reales e independientes
-- (por eso los días A y C tienen 7 ejercicios en vez de 6).
--
-- 'GEMELOS P SM' (día B) no existe como abreviatura en la Hoja2 de este
-- archivo (typo del propio Excel) -- usuario confirmó que es el mismo
-- 'gemelos parado en Smith' que ya existe en la app como 'Elevación de talón
-- en máquina Smith'.
--
-- 'PRESS BANCO INCLIANDO CON MANCUERNAS' (día C) repite el mismo bug de
-- Hoja2 ya visto en la migración 013 (texto de la sentadilla sissy pegado por
-- error) -- no hay ficha docx real para esta variante inclinada en la carpeta
-- de recursos, así que su 'cómo hacerlo' es una adaptación (banco a 45°) del
-- texto real y verificado de 'Press de banco con mancuernas' (mismo equipo),
-- aprobada por el usuario.
--
-- Correr en el SQL Editor de Supabase después de la migración 019.

insert into public.routines (nombre, descripcion, dias)
select '5 días - hipertrofia', 'Split de 5 días enfocado en hipertrofia', 5
where not exists (select 1 from public.routines where nombre = '5 días - hipertrofia');

-- ============ EJERCICIOS NUEVOS ============
insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'Elevación de piernas colgado', 'Legs',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/elevacion-piernas-colgado.gif',
  'Paso inicial: Agarra una barra de dominadas con las palmas hacia adelante y las manos al ancho de los hombros.

Posición inicial: Cuelga de la barra con los brazos extendidos y el cuerpo recto, pies juntos y piernas rectas.

Movimiento: Inhala y levanta las piernas rectas lentamente hasta que estén paralelas al suelo o lo más alto que puedas sin perder la forma. Mantén la espalda recta y el core activado.

Contracción: Pausa brevemente en la parte superior, asegurándote de que los abdominales inferiores estén contraídos.

Regreso: Exhala y baja lentamente las piernas a la posición inicial, controlando el movimiento.

Consejo como Entrenador:

Evita el uso de impulso para balancear las piernas, ya que esto puede disminuir la efectividad del ejercicio.

Mantén el enfoque en tus músculos abdominales y controla tanto la elevación como el descenso de las piernas.',
  'aislado', false
where not exists (select 1 from public.exercise_definitions where nombre = 'Elevación de piernas colgado');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'Abdominales en banco declinado', 'Legs',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/abdominales-banco-declinado.gif',
  'Paso inicial: Ajusta el banco inclinado a un ángulo cómodo y siéntate, colocando los pies bajo las almohadillas.

Posición inicial: Cruza los brazos sobre el pecho o coloca las manos detrás de la cabeza. Mantén los pies firmes y el core activado.

Movimiento: Inhala y baja lentamente el torso hacia atrás hasta un ángulo de 45 grados con el banco. Exhala y usa los abdominales para levantar el torso de vuelta.

Contracción: Pausa brevemente en la parte superior, asegurándote de que los abdominales estén contraídos.

Regreso: 
Baja lentamente a la posición inicial, controlando el movimiento.

Consejo como Entrenador:

Mantén la concentración en los abdominales y evita jalar del cuello con las manos.

Mantén una respiración constante y controlada durante todo el ejercicio.',
  'aislado', false
where not exists (select 1 from public.exercise_definitions where nombre = 'Abdominales en banco declinado');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'Peso muerto', 'Pull',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/peso-muerto.gif',
  'Paso inicial: Coloca una barra con pesas en el suelo delante de ti.
Párate con los pies separados al ancho de las caderas, de manera que tus espinillas queden cerca de la barra (aproximadamente a una pulgada de distancia).

Posición inicial: Dobla las rodillas y baja las caderas para agarrar la barra con un agarre en pronación (palmas hacia ti) o un agarre mixto (una palma hacia ti y la otra hacia adelante).
Las manos deben estar ligeramente más anchas que el ancho de tus hombros.
Mantén la espalda recta, el pecho hacia arriba y los hombros justo por delante de la barra.
Asegúrate de que tus caderas estén a un nivel intermedio entre los hombros y las rodillas.

Movimiento: Inhala profundamente para llenar el abdomen de aire y activar el core.
Comienza el levantamiento empujando con los talones contra el suelo y extendiendo las rodillas.
A medida que la barra sube, manténla cerca de tu cuerpo y extiende las caderas al mismo tiempo que las rodillas.
Mantén la barra en contacto con tus piernas durante todo el movimiento, levantándola hasta que estés completamente erguido con las caderas y rodillas extendidas.

Contracción: Pausa brevemente en la parte superior del movimiento con el torso erguido y los hombros retraídos hacia atrás, pero sin hiperextender la espalda baja.

Regreso: Exhala y baja la barra de manera controlada invirtiendo el movimiento: dobla las caderas primero y luego las rodillas, manteniendo la barra cerca del cuerpo hasta que vuelva al suelo.

Consejo como Entrenador:

Asegúrate de mantener una buena técnica durante todo el ejercicio, especialmente al bajar la barra.

Mantén la espalda recta y evita redondear los hombros o arquear la espalda.

No levantes la barra con un movimiento brusco, realiza el levantamiento de manera controlada.

Si eres principiante, comienza con un peso ligero y aumenta gradualmente la resistencia a medida que te sientas más cómodo con el movimiento.',
  'compuesto', false
where not exists (select 1 from public.exercise_definitions where nombre = 'Peso muerto');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'Curl martillo con mancuernas sentado', 'Pull',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/curl-martillo-mancuernas-sentado.gif',
  'Paso inicial: Siéntate en un banco con la espalda recta y los pies apoyados en el suelo. Toma una mancuerna en cada mano con un agarre neutro (palmas de las manos mirando hacia tu cuerpo).

Posición corporal: Mantén los brazos extendidos a los costados, con los codos cerca del cuerpo y las palmas de las manos mirando hacia tu cuerpo. Esta es la posición inicial.

Movimiento: Comienza doblando el brazo derecho en el codo mientras mantienes el antebrazo en línea recta. Levanta la mancuerna hacia el hombro manteniendo el agarre neutro. Asegúrate de mantener el codo pegado al cuerpo y el torso estable.

Contracción: Mantén la contracción en la parte superior del movimiento durante un breve momento, sintiendo la activación de los músculos del antebrazo y del bíceps.

Regreso: Con un movimiento controlado, baja la mancuerna lentamente hacia la posición inicial, estirando completamente los brazos. Repite el mismo movimiento con el brazo izquierdo.

Consejo como Entrenador:

Asegúrate de mantener una postura adecuada y evitar balancear el cuerpo durante el movimiento.

Mantén la concentración en los músculos del antebrazo y del bíceps, evitando utilizar impulso o movimiento excesivo de los hombros.

Controla el peso de las mancuernas y el ritmo del movimiento para obtener mejores resultados y reducir el riesgo de lesiones.',
  'aislado', true
where not exists (select 1 from public.exercise_definitions where nombre = 'Curl martillo con mancuernas sentado');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'Press inclinado con mancuernas', 'Torso',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/press-inclinado-con-mancuernas.gif',
  'Paso inicial: Ajusta el banco a una posición inclinada de aproximadamente 45 grados. Acuéstate en el banco con una mancuerna en cada mano. Asegúrate de que tus pies estén firmemente apoyados en el suelo y tu espalda esté bien apoyada en el respaldo. Sostén las mancuernas a la altura de la parte superior del pecho, con las palmas de las manos mirando hacia adelante.

Posición corporal: Mantén una postura estable y activa el núcleo para mantener una buena estabilidad durante todo el ejercicio. Mantén los codos ligeramente flexionados y los hombros hacia abajo y hacia atrás.

Movimiento: Empuja las mancuernas hacia arriba y ligeramente hacia atrás (siguiendo el ángulo del banco), extendiendo los brazos mientras mantienes las palmas mirando hacia adelante. Mantén los codos alineados con los hombros y evita que se desvíen hacia afuera.

Contracción: Cuando las mancuernas estén cerca de la posición final, contrae los músculos de la parte superior del pecho, sintiendo la tensión en esa zona. Mantén la posición durante un segundo para maximizar la contracción muscular.

Regreso: Lentamente, baja las mancuernas hacia abajo, doblando los codos y manteniendo el control del movimiento. Evita que las mancuernas toquen el pecho por completo para mantener la tensión en los músculos del pecho.

Consejo como Entrenador:

Asegúrate de mantener una técnica adecuada en todo momento.

Evita arquear la espalda, mantener los codos demasiado abiertos o bloquear los codos al final del movimiento.

También es importante utilizar un peso adecuado que te permita mantener la forma correcta y completar el rango de movimiento completo.

Recuerda que la calidad del movimiento es más importante que la cantidad de peso levantado.',
  'compuesto', false
where not exists (select 1 from public.exercise_definitions where nombre = 'Press inclinado con mancuernas');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'Flexiones de brazos inclinadas', 'Torso',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/flexiones-brazos-inclinadas.gif',
  'Paso Inicial: Coloca la caja de madera en un lugar adecuado, asegurándote de que esté estable y no se deslice durante el ejercicio.

Posición Corporal: Ponte de pie frente a la caja, con los pies a la altura de los hombros. Inclínate hacia adelante y coloca las manos en la caja, un poco más anchas que el ancho de los hombros. Extiende los brazos completamente.

Movimiento: Inclínate hacia adelante bajando tu cuerpo hacia la caja doblando los codos. Mantén el cuerpo en línea recta desde la cabeza hasta los talones.

Empuje y Regreso: Empuja hacia arriba con las manos para volver a la posición inicial. Asegúrate de mantener la forma adecuada y de que tus codos estén ligeramente flexionados al final del movimiento.

Consejo como Entrenador:

Mantén el núcleo contraído y el cuerpo en una línea recta durante todo el movimiento para asegurar la correcta activación de los músculos centrales y evitar arquear la espalda.

Ajusta la altura de la caja según tu nivel de condición física. A medida que te vuelvas más fuerte, puedes reducir la altura para aumentar la dificultad.

Controla la velocidad del movimiento, es más efectivo hacer repeticiones controladas y bien ejecutadas que tratar de hacer muchas repeticiones de manera apresurada.',
  'compuesto', false
where not exists (select 1 from public.exercise_definitions where nombre = 'Flexiones de brazos inclinadas');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'Elevación frontal en polea baja a un brazo', 'Torso',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/elevacion-frontal-polea-baja-un-brazo.gif',
  'Paso Inicial: Comienza por configurar la máquina de polea baja con el accesorio de una sola mano, que generalmente se llama una manija de cuerda o una manija.

Posición Corporal: Párate de espalda a la máquina con los pies a la altura de los hombros. Mantén una ligera flexión en las rodillas. Agarra la manija con la mano que estará haciendo el ejercicio. Asegúrate de que el brazo que va a trabajar esté ligeramente doblado en el codo y mantén una postura erguida con la espalda recta.

Movimiento y Empuje: Con un movimiento controlado, eleva el brazo hacia adelante frente a tu cuerpo. Mantén el codo ligeramente doblado durante todo el movimiento. Continúa elevando la manija hasta que el brazo esté paralelo al suelo o hasta donde sientas una contracción en los músculos frontales del hombro.

Regreso: Lentamente, baja el brazo de regreso a la posición inicial, manteniendo el control.

Consejo como Entrenador:

Asegúrate de que todo el movimiento sea suave y controlado.

Evita el impulso o el balanceo del cuerpo, ya que esto podría reducir la efectividad del ejercicio y aumentar el riesgo de lesiones.

Selecciona un peso adecuado para ti, para que puedas completar el número deseado de repeticiones con la forma correcta.',
  'aislado', true
where not exists (select 1 from public.exercise_definitions where nombre = 'Elevación frontal en polea baja a un brazo');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'Empuje de caderas', 'Legs',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/empuje-de-caderas.gif',
  'Paso inicial: Coloca una barra cargada frente a un banco robusto.
Siéntate en el suelo con la parte superior de la espalda apoyada en el borde del banco.
Rueda la barra sobre tus piernas hasta que quede justo por encima de tus caderas.
Coloca una almohadilla o un cojín en la barra para mayor comodidad.

Posición inicial: Dobla las rodillas y planta los pies firmemente en el suelo, separados al ancho de las caderas.
Mantén los pies directamente debajo de las rodillas o ligeramente más adelante.
Sostén la barra con ambas manos para estabilizarla.

Movimiento: Inhala y comienza a levantar las caderas hacia el techo, empujando a través de los talones.
Mientras levantas las caderas, mantén la espalda recta y evita arquear la parte baja de la espalda.
Levanta las caderas hasta que tu torso y muslos formen una línea recta, paralela al suelo.

Contracción: Pausa brevemente en la parte superior del movimiento y aprieta los glúteos con fuerza para maximizar la contracción.

Regreso: Exhala y baja lentamente las caderas de vuelta a la posición inicial, controlando el movimiento en todo momento.
Asegúrate de que la barra baje con control hasta que las caderas casi toquen el suelo.

Consejo como Entrenador:

Comienza con un peso ligero para dominar la técnica y evitar lesiones.

Coloca los pies firmemente en el suelo y las rodillas alineadas con los tobillos.

Utiliza la fuerza de tus glúteos y tus caderas para impulsar el peso hacia arriba, manteniendo la espalda recta en todo momento.',
  'compuesto', false
where not exists (select 1 from public.exercise_definitions where nombre = 'Empuje de caderas');

-- ============ RUTINA: SCHEDULING POR DÍA ============
-- ---- DÍA A ----
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '5 días - hipertrofia'), 'A', 1,
  (select id from public.exercise_definitions where nombre = 'Press inclinado en máquina Smith')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '5 días - hipertrofia' and re.dia = 'A' and re.orden = 1
);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '5 días - hipertrofia'), 'A', 2,
  (select id from public.exercise_definitions where nombre = 'Press militar con mancuernas')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '5 días - hipertrofia' and re.dia = 'A' and re.orden = 2
);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '5 días - hipertrofia'), 'A', 3,
  (select id from public.exercise_definitions where nombre = 'Elevacion lateral con mancuernas')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '5 días - hipertrofia' and re.dia = 'A' and re.orden = 3
);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '5 días - hipertrofia'), 'A', 4,
  (select id from public.exercise_definitions where nombre = 'Extensión de tríceps en polea')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '5 días - hipertrofia' and re.dia = 'A' and re.orden = 4
);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '5 días - hipertrofia'), 'A', 5,
  (select id from public.exercise_definitions where nombre = 'Fondos en paralelas')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '5 días - hipertrofia' and re.dia = 'A' and re.orden = 5
);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '5 días - hipertrofia'), 'A', 6,
  (select id from public.exercise_definitions where nombre = 'Elevación de piernas colgado')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '5 días - hipertrofia' and re.dia = 'A' and re.orden = 6
);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '5 días - hipertrofia'), 'A', 7,
  (select id from public.exercise_definitions where nombre = 'Abdominales en banco declinado')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '5 días - hipertrofia' and re.dia = 'A' and re.orden = 7
);

-- ---- DÍA B ----
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '5 días - hipertrofia'), 'B', 1,
  (select id from public.exercise_definitions where nombre = 'Jalón lateral con polea a un brazo')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '5 días - hipertrofia' and re.dia = 'B' and re.orden = 1
);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '5 días - hipertrofia'), 'B', 2,
  (select id from public.exercise_definitions where nombre = 'Remo con barra parado')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '5 días - hipertrofia' and re.dia = 'B' and re.orden = 2
);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '5 días - hipertrofia'), 'B', 3,
  (select id from public.exercise_definitions where nombre = 'Peso muerto')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '5 días - hipertrofia' and re.dia = 'B' and re.orden = 3
);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '5 días - hipertrofia'), 'B', 4,
  (select id from public.exercise_definitions where nombre = 'Curl femoral')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '5 días - hipertrofia' and re.dia = 'B' and re.orden = 4
);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '5 días - hipertrofia'), 'B', 5,
  (select id from public.exercise_definitions where nombre = 'Curl martillo con mancuernas sentado')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '5 días - hipertrofia' and re.dia = 'B' and re.orden = 5
);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '5 días - hipertrofia'), 'B', 6,
  (select id from public.exercise_definitions where nombre = 'Elevación de talón en máquina Smith')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '5 días - hipertrofia' and re.dia = 'B' and re.orden = 6
);

-- ---- DÍA C ----
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '5 días - hipertrofia'), 'C', 1,
  (select id from public.exercise_definitions where nombre = 'Press inclinado con mancuernas')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '5 días - hipertrofia' and re.dia = 'C' and re.orden = 1
);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '5 días - hipertrofia'), 'C', 2,
  (select id from public.exercise_definitions where nombre = 'Vuelo lateral con polea')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '5 días - hipertrofia' and re.dia = 'C' and re.orden = 2
);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '5 días - hipertrofia'), 'C', 3,
  (select id from public.exercise_definitions where nombre = 'Flexiones de brazos inclinadas')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '5 días - hipertrofia' and re.dia = 'C' and re.orden = 3
);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '5 días - hipertrofia'), 'C', 4,
  (select id from public.exercise_definitions where nombre = 'Elevación frontal en polea baja a un brazo')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '5 días - hipertrofia' and re.dia = 'C' and re.orden = 4
);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '5 días - hipertrofia'), 'C', 5,
  (select id from public.exercise_definitions where nombre = 'Extensión de tríceps inclinada en polea baja')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '5 días - hipertrofia' and re.dia = 'C' and re.orden = 5
);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '5 días - hipertrofia'), 'C', 6,
  (select id from public.exercise_definitions where nombre = 'Elevación de piernas colgado')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '5 días - hipertrofia' and re.dia = 'C' and re.orden = 6
);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '5 días - hipertrofia'), 'C', 7,
  (select id from public.exercise_definitions where nombre = 'Abdominales en banco declinado')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '5 días - hipertrofia' and re.dia = 'C' and re.orden = 7
);

-- ---- DÍA D ----
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '5 días - hipertrofia'), 'D', 1,
  (select id from public.exercise_definitions where nombre = 'Remo en polea baja a un brazo sentado')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '5 días - hipertrofia' and re.dia = 'D' and re.orden = 1
);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '5 días - hipertrofia'), 'D', 2,
  (select id from public.exercise_definitions where nombre = 'Remo con mancuerna a un brazo')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '5 días - hipertrofia' and re.dia = 'D' and re.orden = 2
);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '5 días - hipertrofia'), 'D', 3,
  (select id from public.exercise_definitions where nombre = 'Remo en máquina T (landmine)')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '5 días - hipertrofia' and re.dia = 'D' and re.orden = 3
);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '5 días - hipertrofia'), 'D', 4,
  (select id from public.exercise_definitions where nombre = 'Face pull')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '5 días - hipertrofia' and re.dia = 'D' and re.orden = 4
);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '5 días - hipertrofia'), 'D', 5,
  (select id from public.exercise_definitions where nombre = 'Curl de bíceps en banco inclinado con mancuernas')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '5 días - hipertrofia' and re.dia = 'D' and re.orden = 5
);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '5 días - hipertrofia'), 'D', 6,
  (select id from public.exercise_definitions where nombre = 'Curl en polea a un brazo en banco Scott')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '5 días - hipertrofia' and re.dia = 'D' and re.orden = 6
);

-- ---- DÍA E ----
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '5 días - hipertrofia'), 'E', 1,
  (select id from public.exercise_definitions where nombre = 'Extensión de cuádriceps')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '5 días - hipertrofia' and re.dia = 'E' and re.orden = 1
);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '5 días - hipertrofia'), 'E', 2,
  (select id from public.exercise_definitions where nombre = 'Sentadillas')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '5 días - hipertrofia' and re.dia = 'E' and re.orden = 2
);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '5 días - hipertrofia'), 'E', 3,
  (select id from public.exercise_definitions where nombre = 'Estocada búlgara en el banco')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '5 días - hipertrofia' and re.dia = 'E' and re.orden = 3
);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '5 días - hipertrofia'), 'E', 4,
  (select id from public.exercise_definitions where nombre = 'Empuje de caderas')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '5 días - hipertrofia' and re.dia = 'E' and re.orden = 4
);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '5 días - hipertrofia'), 'E', 5,
  (select id from public.exercise_definitions where nombre = 'Hiperextensiones')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '5 días - hipertrofia' and re.dia = 'E' and re.orden = 5
);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '5 días - hipertrofia'), 'E', 6,
  (select id from public.exercise_definitions where nombre = 'Elevación de talón parado a una pierna')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '5 días - hipertrofia' and re.dia = 'E' and re.orden = 6
);

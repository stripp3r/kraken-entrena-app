-- Migración 073: 8 ejercicios de Hombros -- novena tanda (segunda parte
-- de Hombros) de la revisión del catálogo músculo por músculo (ver
-- 065-072 para las anteriores).
--
-- De los 9 nombres pasados, 1 resultó near-duplicate PREEXISTENTE (no
-- hash-identico, pero misma posición/equipo/musculo real) y no se
-- agregó: "Dumbbell-Incline-Rear-Lateral-Raise" (prono en banco
-- inclinado con mancuernas, deltoide posterior) coincide en todo con
-- id 8 "Deltoides posteriores en banco inclinado con mancuernas" ya
-- cargado -- mismo caso que id10/id202 documentado en la migración 070.
--
-- NOTA aparte: "Dumbbell-Rear-Fly" se cargó como ejercicio nuevo (Vuelo
-- posterior con mancuernas sentado inclinado) pero su postura de partida
-- es muy similar a la de "Remo con mancuernas sentado inclinado para
-- deltoide posterior" (id 250, migración 072) -- se mantuvieron
-- separados porque la técnica real difiere (vuelo con ángulo de codo
-- fijo vs remo con el codo liderando el movimiento), pero queda
-- documentado por si el usuario prefiere fusionarlos.
--
-- GIFs ya subidos al bucket `ejercicios` de Storage. Correr en el SQL
-- Editor de Supabase.

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, tipo_esfuerzo, unilateral, grupos_musculares, como_hacerlo)
values
  (
    'Apertura con banda para deltoide posterior',
    'Torso',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/apertura-banda-deltoide-posterior.gif',
    'aislado',
    false,
    array['Hombros'],
    E'Paso inicial: Parate con los pies al ancho de cadera, sosteniendo una banda elástica con ambas manos, brazos extendidos al frente a la altura de los hombros.\n\nPosición inicial: Palmas hacia abajo, leve tensión en la banda, codos casi extendidos.\n\nMovimiento: Exhalá y abrí los brazos hacia los costados, separando las manos y llevando los omóplatos hacia atrás, sin flexionar los codos.\n\nContracción: Apretá los omóplatos y el deltoides posterior un instante con los brazos bien abiertos.\n\nRegreso: Inhalá y llevá los brazos de vuelta al frente de forma controlada, sin perder la tensión de la banda.\n\nConsejo como Entrenador:\n\nEs un ejercicio ideal para el calentamiento de hombro o como finisher liviano -- priorizá la técnica y el aprieto de los omóplatos por sobre la tensión de la banda.'
  ),
  (
    'Press de hombro detrás de nuca con banda',
    'Push',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/press-hombro-detras-nuca-banda.gif',
    'compuesto',
    false,
    array['Hombros'],
    E'Paso inicial: Parate sobre el centro de una banda elástica con ambos pies, sosteniendo un extremo en cada mano detrás de la nuca, codos apuntando hacia los costados.\n\nPosición inicial: Codos flexionados por detrás de la cabeza, banda con tensión.\n\nMovimiento: Exhalá y empujá ambas manos hacia arriba, extendiendo los brazos por encima de la cabeza.\n\nContracción: Apretá el hombro un instante arriba, sin bloquear el codo con fuerza.\n\nRegreso: Inhalá y bajá las manos de forma controlada detrás de la nuca.\n\nConsejo como Entrenador:\n\nEl recorrido detrás de la nuca exige buena movilidad de hombro -- si sentís pinzamiento o molestia, es mejor hacer el press al frente en su lugar.'
  ),
  (
    'Remo al mentón con banda',
    'Torso',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/remo-menton-banda.gif',
    'compuesto',
    false,
    array['Hombros'],
    E'Paso inicial: Parate sobre el centro de una banda elástica con ambos pies, sosteniendo un extremo en cada mano frente a los muslos, palmas hacia el cuerpo.\n\nPosición inicial: Brazos casi extendidos, banda con tensión.\n\nMovimiento: Exhalá y llevá las manos hacia arriba pegadas al cuerpo, liderando con los codos hasta la altura del mentón.\n\nContracción: Apretá los hombros un instante arriba, con los codos por encima de las muñecas.\n\nRegreso: Inhalá y bajá las manos de forma controlada a la posición inicial.\n\nConsejo como Entrenador:\n\nSi sentís molestia en el hombro al llevar los codos muy arriba, cortá el recorrido a la altura del pecho -- no hace falta llegar hasta el mentón para que el ejercicio funcione.'
  ),
  (
    'Remo de pie con banda para deltoide posterior',
    'Torso',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/remo-pie-banda-deltoide-posterior.gif',
    'aislado',
    false,
    array['Hombros'],
    E'Paso inicial: Parate frente a un anclaje de banda elástica a la altura del pecho, sosteniendo un extremo en cada mano con los brazos extendidos hacia adelante.\n\nPosición inicial: Torso erguido, core activado, leve flexión de rodillas.\n\nMovimiento: Exhalá y remá la banda hacia el torso, separando bien los codos hacia los costados y llevándolos altos.\n\nContracción: Apretá los deltoides posteriores un instante al final del recorrido.\n\nRegreso: Inhalá y extendé los brazos de forma controlada a la posición inicial.\n\nConsejo como Entrenador:\n\nMantené el torso fijo durante todo el movimiento -- si te vas hacia atrás para ayudarte, el trabajo se corre de los hombros a la espalda media.'
  ),
  (
    'Flexión en parada de manos (Handstand Push-Up)',
    'Push',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/flexion-parada-de-manos.gif',
    'compuesto',
    false,
    array['Hombros'],
    E'Paso inicial: Apoyá las manos en el piso frente a una pared y subí a una parada de manos, apoyando los talones en la pared para mantener el equilibrio.\n\nPosición inicial: Cuerpo lo más recto posible, brazos extendidos, core y glúteos activados.\n\nMovimiento: Inhalá y bajá el cuerpo flexionando los codos hasta que la cabeza casi toque el piso.\n\nContracción: Exhalá y empujá con fuerza para volver a extender los brazos por completo.\n\nRegreso: Controlá la bajada en cada repetición, sin dejar caer el cuerpo de golpe.\n\nConsejo como Entrenador:\n\nEs un ejercicio avanzado que exige buena fuerza de hombro y equilibrio -- si todavía no podés hacerlo con control, practicá primero el press de hombro con mancuernas o en máquina para construir la base de fuerza necesaria.'
  ),
  (
    'Vuelo posterior con mancuernas sentado inclinado',
    'Torso',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/vuelo-posterior-mancuernas-sentado-inclinado.gif',
    'aislado',
    false,
    array['Hombros'],
    E'Paso inicial: Sentate en la punta de un banco con una mancuerna en cada mano y el torso inclinado bien hacia adelante, casi paralelo al piso.\n\nPosición inicial: Brazos colgando hacia abajo, palmas enfrentadas, leve flexión fija en los codos.\n\nMovimiento: Exhalá y abrí ambos brazos hacia los costados en forma de arco, manteniendo la flexión de codo fija durante todo el recorrido.\n\nContracción: Apretá los deltoides posteriores un instante en el punto más alto.\n\nRegreso: Inhalá y bajá las mancuernas de forma controlada a la posición inicial.\n\nConsejo como Entrenador:\n\nA diferencia del remo (donde el codo lidera y se lleva hacia el techo), acá el brazo se mantiene con un ángulo fijo durante todo el arco -- es una técnica distinta que aísla más el deltoides posterior y menos la espalda media.'
  ),
  (
    'Elevación frontal en banco inclinado con mancuerna',
    'Torso',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/elevacion-frontal-banco-inclinado-mancuerna.gif',
    'aislado',
    true,
    array['Hombros'],
    E'Paso inicial: Sentate reclinado en un banco inclinado con una mancuerna en cada mano, brazos colgando a los costados.\n\nPosición inicial: Espalda apoyada en el respaldo, core activado, palmas hacia el cuerpo.\n\nMovimiento: Exhalá y elevá un brazo al frente, con el codo casi extendido, hasta la altura del hombro.\n\nContracción: Apretá el deltoides anterior un instante en el punto más alto.\n\nRegreso: Inhalá y bajá el brazo de forma controlada, alternando con el otro lado.\n\nConsejo como Entrenador:\n\nLa inclinación del banco le saca el impulso que se suele usar parado -- vas a sentir que necesitás bastante menos peso que en la versión de pie.'
  ),
  (
    'Remo al mentón con barra',
    'Torso',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/remo-menton-barra.gif',
    'compuesto',
    false,
    array['Hombros'],
    E'Paso inicial: Parate con los pies al ancho de cadera, sosteniendo una barra con agarre prono cerrado (manos separadas al ancho de los hombros o un poco menos), frente a los muslos.\n\nPosición inicial: Brazos extendidos, barra apoyada contra el cuerpo.\n\nMovimiento: Exhalá y llevá la barra hacia arriba pegada al cuerpo, liderando con los codos hasta la altura del mentón.\n\nContracción: Apretá los hombros un instante arriba, con los codos por encima de las muñecas.\n\nRegreso: Inhalá y bajá la barra de forma controlada a la posición inicial.\n\nConsejo como Entrenador:\n\nUn agarre muy cerrado suma estrés innecesario a la muñeca y al hombro -- si sentís molestia, abrí un poco más las manos o probá la versión en polea, que tiene una trayectoria más libre.'
  );

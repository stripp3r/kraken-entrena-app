-- Migración 072: 7 ejercicios de Hombros -- octava tanda de la
-- revisión del catálogo músculo por músculo (ver 065-071 para las
-- anteriores). Los 7 nombres pasados resultaron ser ejercicios reales
-- faltantes (variantes/aparatos distintos a los ya cargados), ninguno
-- duplicado.
--
-- GIFs ya subidos al bucket `ejercicios` de Storage. Correr en el SQL
-- Editor de Supabase.

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, tipo_esfuerzo, unilateral, grupos_musculares, como_hacerlo)
values
  (
    'Elevación frontal acostada en polea',
    'Torso',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/elevacion-frontal-acostada-polea.gif',
    'aislado',
    false,
    array['Hombros'],
    E'Paso inicial: Acostate boca arriba en el piso, con la cabeza cerca de la base de una polea baja doble, sosteniendo un agarre en cada mano con los brazos extendidos hacia atrás por encima de la cabeza.\n\nPosición inicial: Brazos casi extendidos apoyados en el piso, palmas hacia abajo, core activado.\n\nMovimiento: Exhalá y elevá ambos brazos en arco hacia adelante y arriba, manteniendo los codos casi extendidos, hasta que queden perpendiculares al piso.\n\nContracción: Apretá el deltoides anterior un instante en el punto más alto.\n\nRegreso: Inhalá y bajá los brazos de forma controlada a la posición inicial.\n\nConsejo como Entrenador:\n\nAl estar acostado, le sacás el impulso de la cadera y la espalda baja que suele aparecer en la elevación frontal parada -- el deltoides anterior trabaja solo, sin trampa.'
  ),
  (
    'Remo con mancuernas sentado inclinado para deltoide posterior',
    'Pull',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/remo-mancuernas-sentado-inclinado-deltoide-posterior.gif',
    'aislado',
    false,
    array['Hombros'],
    E'Paso inicial: Sentate en la punta de un banco con una mancuerna en cada mano y el torso inclinado bien hacia adelante, casi paralelo al piso.\n\nPosición inicial: Brazos colgando hacia abajo, palmas enfrentadas, espalda recta.\n\nMovimiento: Exhalá y remá ambas mancuernas hacia arriba y hacia afuera, llevando los codos altos y separados del torso.\n\nContracción: Apretá los deltoides posteriores un instante en el punto más alto.\n\nRegreso: Inhalá y bajá las mancuernas de forma controlada a la posición inicial.\n\nConsejo como Entrenador:\n\nLa clave es llevar el codo alto y abierto, no pegado al cuerpo -- así el trabajo se queda en el deltoides posterior y no se corre hacia la espalda media.'
  ),
  (
    'Remo en polea de rodillas con cuerda para deltoide posterior',
    'Pull',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/remo-polea-rodillas-cuerda-deltoide-posterior.gif',
    'aislado',
    false,
    array['Hombros'],
    E'Paso inicial: Arrodillate frente a una polea baja con una cuerda enganchada, sosteniendo un extremo en cada mano con los brazos extendidos hacia adelante.\n\nPosición inicial: Torso erguido, core activado, brazos extendidos a la altura de los hombros.\n\nMovimiento: Exhalá y remá la cuerda hacia el torso, separando bien los codos hacia los costados y llevándolos altos.\n\nContracción: Apretá los deltoides posteriores un instante al final del recorrido.\n\nRegreso: Inhalá y extendé los brazos de forma controlada a la posición inicial.\n\nConsejo como Entrenador:\n\nEstar arrodillado elimina el impulso de las piernas y la cadera -- todo el trabajo queda en el deltoides posterior en vez de convertirse en un remo de espalda.'
  ),
  (
    'Elevación lateral en máquina con agarre',
    'Push',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/elevacion-lateral-maquina-agarre.gif',
    'aislado',
    false,
    array['Hombros'],
    E'Paso inicial: Sentate en la máquina con la espalda apoyada y tomá el agarre vertical con el brazo pegado al costado del cuerpo.\n\nPosición inicial: Codo con una leve flexión fija, brazo abajo.\n\nMovimiento: Exhalá y elevá el brazo hacia el costado hasta la altura del hombro, liderando el movimiento con el codo.\n\nContracción: Apretá el deltoides lateral un instante en el punto más alto.\n\nRegreso: Inhalá y bajá el brazo de forma controlada.\n\nConsejo como Entrenador:\n\nEl agarre fijo de esta máquina (a diferencia de la de apoyo con almohadilla) hace que también entren el antebrazo y la mano para sostener el agarre -- concentrate en empujar con el codo, no en apretar la mano.'
  ),
  (
    'Elevación lateral con landmine',
    'Push',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/elevacion-lateral-landmine.gif',
    'aislado',
    true,
    array['Hombros'],
    E'Paso inicial: Parate al lado de una barra anclada en un landmine, sosteniendo la punta con el brazo más cercano; el otro brazo puede apoyarse en la cadera.\n\nPosición inicial: Brazo casi extendido, la punta de la barra cerca del muslo.\n\nMovimiento: Exhalá y elevá la barra hacia el costado, liderando con el codo, hasta que el brazo quede casi paralelo al piso.\n\nContracción: Apretá el deltoides lateral un instante en el punto más alto.\n\nRegreso: Inhalá y bajá la barra de forma controlada.\n\nConsejo como Entrenador:\n\nEl peso de la barra en el landmine cambia a medida que subís por el ángulo, lo que le suma una resistencia distinta a la de la mancuerna -- se siente más pesado abajo, más liviano arriba.'
  ),
  (
    'Press de hombro en máquina agarre martillo',
    'Push',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/press-hombro-maquina-agarre-martillo.gif',
    'compuesto',
    false,
    array['Hombros'],
    E'Paso inicial: Sentate en la máquina con la espalda apoyada en el respaldo y tomá los agarres verticales (neutros) a la altura de los hombros.\n\nPosición inicial: Codos flexionados, agarres a la altura de los hombros, core activado.\n\nMovimiento: Exhalá y empujá los agarres hacia arriba hasta extender los brazos casi por completo.\n\nContracción: Apretá el hombro un instante arriba, sin bloquear el codo con fuerza.\n\nRegreso: Inhalá y bajá los agarres de forma controlada a la posición inicial.\n\nConsejo como Entrenador:\n\nEl agarre neutro (martillo) es más amigable para el hombro que el agarre pronado de la máquina Smith -- una buena opción si sentís molestias en el hombro con el press tradicional.'
  ),
  (
    'Elevación lateral con banda elástica',
    'Push',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/elevacion-lateral-banda-elastica.gif',
    'aislado',
    false,
    array['Hombros'],
    E'Paso inicial: Parate sobre el centro de una banda elástica con ambos pies, sosteniendo un extremo en cada mano a los costados del cuerpo.\n\nPosición inicial: Brazos casi extendidos, leve flexión fija en los codos.\n\nMovimiento: Exhalá y elevá ambos brazos hacia los costados hasta la altura del hombro, liderando con los codos.\n\nContracción: Apretá el deltoides lateral un instante en el punto más alto.\n\nRegreso: Inhalá y bajá los brazos de forma controlada, resistiendo la tensión de la banda.\n\nConsejo como Entrenador:\n\nA diferencia de la mancuerna, la banda tiene más tensión arriba que abajo -- es una buena variante para sumar al final de tu rutina de hombro cuando ya no tenés mancuernas livianas disponibles.'
  );

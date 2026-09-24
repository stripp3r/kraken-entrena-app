-- Migración 067: 13 ejercicios de Cuádriceps que estaban en la biblioteca
-- de referencia pero no en el catálogo -- tercera tanda de la revisión
-- músculo por músculo (ver migración 065 Abdominales, 066 Bíceps).
--
-- De 18 nombres pasados por el usuario: 4 resultaron duplicados exactos
-- (mismo GIF que uno ya cargado -- Hack Squat, Sentadilla pistol asistida,
-- Estocada búlgara en el banco, Prensa de piernas horizontal) y 1 estaba
-- mal ubicado (Landmine Romanian Deadlift es Isquiotibiales/Glúteos, no
-- Cuádriceps -- no se cargó en esta tanda). Los 13 de acá son los que
-- quedaron después de descartar esos 5.
--
-- GIFs ya subidos al bucket `ejercicios` de Storage. Correr en el SQL
-- Editor de Supabase.

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, tipo_esfuerzo, unilateral, grupos_musculares, como_hacerlo)
values
  (
    'Estocada búlgara con barra',
    'Legs',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/estocada-bulgara-con-barra.gif',
    'compuesto',
    true,
    array['Cuádriceps', 'Glúteos'],
    E'Paso inicial: Parate de espaldas a un banco, apoyá el empeine de un pie sobre el banco y sostené una barra en la espalda como en una sentadilla.\n\nPosición inicial: Pierna de adelante semiflexionada, torso erguido, core activado.\n\nMovimiento: Inhalá y bajá flexionando la rodilla de adelante hasta que el muslo quede paralelo al piso, dejando que la rodilla de atrás se acerque al piso.\n\nContracción: Exhalá y empujá con el talón de adelante para volver a subir.\n\nRegreso: Extendé la pierna de adelante hasta la posición inicial, sin bloquear la rodilla.\n\nConsejo como Entrenador:\n\nCon la barra en la espalda el equilibrio es más exigente que con mancuernas -- arrancá liviano hasta dominar la posición.\n\nLa mayor parte del peso corporal tiene que quedar sobre la pierna de adelante, la de atrás solo da equilibrio.'
  ),
  (
    'Salto de zancada con mancuernas',
    'Legs',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/salto-de-zancada-con-mancuernas.gif',
    'compuesto',
    true,
    array['Cuádriceps', 'Glúteos'],
    E'Paso inicial: Parate en posición de zancada, un pie adelante y otro atrás, sosteniendo una mancuerna en cada mano a los costados.\n\nPosición inicial: Ambas rodillas semiflexionadas, torso erguido, core activado.\n\nMovimiento: Bajá hasta que ambas rodillas formen un ángulo de 90°, después empujá con fuerza hacia arriba saltando y cambiando la pierna de adelante en el aire.\n\nContracción: Aterrizá suave, absorbiendo el impacto flexionando ambas rodillas.\n\nRegreso: Bajá directo a la siguiente repetición sin pausa, alternando de pierna en cada salto.\n\nConsejo como Entrenador:\n\nEs un ejercicio pliométrico de alta exigencia articular -- no es para principiantes ni para los primeros ejercicios de la sesión.\n\nAterrizá siempre con la rodilla alineada con el pie, nunca hacia adentro.'
  ),
  (
    'Sentadilla con salto y mancuernas',
    'Legs',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/sentadilla-con-salto-y-mancuernas.gif',
    'compuesto',
    false,
    array['Cuádriceps', 'Glúteos'],
    E'Paso inicial: Parate con los pies al ancho de hombros, sosteniendo una mancuerna en cada mano a los costados.\n\nPosición inicial: Pecho arriba, core activado, mirada al frente.\n\nMovimiento: Bajá en sentadilla hasta que los muslos queden paralelos al piso, después empujá con fuerza explosiva hacia arriba hasta despegar los pies del piso.\n\nContracción: Aterrizá suave, absorbiendo el impacto flexionando las rodillas directo hacia otra sentadilla.\n\nRegreso: Encadená las repeticiones sin perder la técnica por la fatiga.\n\nConsejo como Entrenador:\n\nUsá un peso liviano -- el objetivo acá es la potencia y la velocidad, no la carga máxima.\n\nSi la técnica se degrada por el cansancio, cortá la serie ahí.'
  ),
  (
    'Sentadilla con mancuernas',
    'Legs',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/sentadilla-con-mancuernas.gif',
    'compuesto',
    false,
    array['Cuádriceps', 'Glúteos'],
    E'Paso inicial: Parate con los pies al ancho de hombros, sosteniendo una mancuerna en cada mano a los costados del cuerpo.\n\nPosición inicial: Pecho arriba, core activado, mirada al frente.\n\nMovimiento: Inhalá y bajá flexionando cadera y rodillas hasta que los muslos queden paralelos al piso o un poco más abajo.\n\nContracción: Exhalá y empujá con los talones para volver a subir.\n\nRegreso: Extendé caderas y rodillas hasta la posición inicial, sin bloquear las rodillas.\n\nConsejo como Entrenador:\n\nA diferencia del goblet (una mancuerna al pecho), acá las mancuernas a los costados permiten cargar más peso total por brazo, pero exigen más de la zona media para mantener el torso erguido.'
  ),
  (
    'Extensión de cuádriceps con banda sentado',
    'Legs',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/extension-cuadriceps-banda-sentado.gif',
    'aislado',
    true,
    array['Cuádriceps'],
    E'Paso inicial: Sentate en un banco con las rodillas flexionadas a 90°, anclá una banda elástica en la base del banco y colocá el otro extremo alrededor del tobillo.\n\nPosición inicial: Espalda erguida, core activado, tensión ya presente en la banda.\n\nMovimiento: Exhalá y extendé la rodilla llevando el pie hacia adelante y arriba contra la resistencia de la banda.\n\nContracción: Apretá el cuádriceps un instante con la pierna extendida.\n\nRegreso: Inhalá y flexioná la rodilla de forma controlada hasta volver a 90°.\n\nConsejo como Entrenador:\n\nEs la alternativa a la máquina de extensión cuando no tenés acceso a una -- la banda da resistencia creciente a medida que estirás la pierna, distinto a la máquina pero igual de válido.\n\nMantené el muslo quieto, todo el movimiento sale de la rodilla.'
  ),
  (
    'Zancada lateral con mancuerna',
    'Legs',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/zancada-lateral-con-mancuerna.gif',
    'compuesto',
    true,
    array['Cuádriceps', 'Glúteos'],
    E'Paso inicial: Parate con los pies juntos, sosteniendo una mancuerna con ambas manos frente al pecho.\n\nPosición inicial: Torso erguido, core activado.\n\nMovimiento: Inhalá y dá un paso amplio hacia un costado, flexionando esa rodilla mientras la otra pierna se mantiene extendida.\n\nContracción: Exhalá y empujá con el talón de la pierna flexionada para volver al centro.\n\nRegreso: Juntá los pies en el centro antes de repetir hacia el mismo lado o alternar.\n\nConsejo como Entrenador:\n\nLa pierna que queda extendida trabaja sobre todo aductores e isquiotibiales por el estiramiento, mientras la pierna flexionada hace el trabajo de cuádriceps y glúteo.\n\nNo dejes que la rodilla de la pierna flexionada se meta hacia adentro.'
  ),
  (
    'Estocada hacia atrás con landmine',
    'Legs',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/estocada-atras-landmine.gif',
    'compuesto',
    true,
    array['Cuádriceps', 'Glúteos'],
    E'Paso inicial: Parate frente a una barra landmine, sosteniendo la punta con ambas manos a la altura del pecho.\n\nPosición inicial: Pies al ancho de cadera, torso erguido, core activado.\n\nMovimiento: Inhalá y dá un paso amplio hacia atrás con una pierna, bajando hasta que ambas rodillas formen un ángulo de 90°.\n\nContracción: Exhalá y empujá con el talón de la pierna de adelante para volver a la posición inicial.\n\nRegreso: Juntá los pies antes de repetir con la misma pierna o alternar.\n\nConsejo como Entrenador:\n\nEl peso de la barra apoyado en el piso hace que la trayectoria sea distinta a una estocada con mancuernas -- acompañá el movimiento del extremo de la barra con los brazos en vez de mantenerlos rígidos.'
  ),
  (
    'Sentadilla frontal con landmine',
    'Legs',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/sentadilla-frontal-landmine.gif',
    'compuesto',
    false,
    array['Cuádriceps', 'Glúteos'],
    E'Paso inicial: Parate frente a una barra landmine, sosteniendo la punta con ambas manos juntas a la altura del pecho o el hombro.\n\nPosición inicial: Pies al ancho de hombros, pecho arriba, core activado.\n\nMovimiento: Inhalá y bajá en sentadilla manteniendo los codos altos y el torso lo más vertical posible.\n\nContracción: Exhalá y empujá con los talones para volver a subir.\n\nRegreso: Extendé caderas y rodillas hasta la posición inicial.\n\nConsejo como Entrenador:\n\nAl tener el peso adelante, esta sentadilla exige mantener el torso más erguido que una sentadilla con barra atrás -- si se te va el peso hacia adelante, achicá la profundidad.'
  ),
  (
    E'Farmer\'s Walk',
    'Legs',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/farmers-walk.gif',
    'compuesto',
    false,
    array['Cuádriceps'],
    E'Paso inicial: Pará entre dos mancuernas o pesas rusas pesadas, agachate y agarrá una en cada mano.\n\nPosición inicial: Parate erguido con las pesas a los costados, hombros hacia atrás, core activado.\n\nMovimiento: Caminá hacia adelante con pasos firmes y controlados, manteniendo el torso estable.\n\nContracción: Sostené el agarre y la postura durante todo el recorrido.\n\nRegreso: Al llegar a la distancia u objetivo, apoyá las pesas en el piso con control.\n\nConsejo como Entrenador:\n\nAunque el trabajo de piernas es real (por eso está clasificado acá), el Farmer\'s Walk trabaja fuerte también agarre, trapecio y core -- es un ejercicio muy completo, no hace falta sumarle mucho más volumen ese día si ya lo incluiste.'
  ),
  (
    'Estocada búlgara sin peso',
    'Legs',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/estocada-bulgara-sin-peso.gif',
    'compuesto',
    true,
    array['Cuádriceps', 'Glúteos'],
    E'Paso inicial: Parate de espaldas a un banco, apoyá el empeine de un pie sobre el banco, manos en la cintura o sueltas a los costados.\n\nPosición inicial: Pierna de adelante semiflexionada, torso erguido, core activado.\n\nMovimiento: Inhalá y bajá flexionando la rodilla de adelante hasta que el muslo quede paralelo al piso.\n\nContracción: Exhalá y empujá con el talón de adelante para volver a subir.\n\nRegreso: Extendé la pierna de adelante hasta la posición inicial, sin bloquear la rodilla.\n\nConsejo como Entrenador:\n\nEs la versión sin peso -- ideal para aprender la técnica y el equilibrio antes de sumar mancuernas o barra, o como opción de calentamiento/activación.'
  ),
  (
    'Extensión de cuádriceps unilateral en máquina',
    'Legs',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/extension-cuadriceps-unilateral-maquina.gif',
    'aislado',
    true,
    array['Cuádriceps'],
    E'Paso inicial: Sentate en la máquina de extensión de cuádriceps y ajustá el respaldo para que las rodillas queden alineadas con el eje de la máquina.\n\nPosición inicial: Rodillas flexionadas a 90°, tobillos bajo el rodillo, manos sosteniendo los agarres.\n\nMovimiento: Exhalá y extendé una sola pierna hasta que quede casi recta, sin mover la otra pierna.\n\nContracción: Apretá el cuádriceps un instante en la posición más alta.\n\nRegreso: Inhalá y bajá de forma controlada hasta volver a 90°, después repetí con la otra pierna.\n\nConsejo como Entrenador:\n\nTrabajar una pierna a la vez permite parejar diferencias de fuerza entre ambos lados -- útil si notás que un cuádriceps está más atrasado que el otro.'
  ),
  (
    'Prensa de piernas 45° unilateral',
    'Legs',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/prensa-de-piernas-45-unilateral.gif',
    'compuesto',
    true,
    array['Cuádriceps'],
    E'Paso inicial: Sentate en la prensa de piernas a 45° y apoyá un solo pie en el centro de la plataforma, al ancho de cadera.\n\nPosición inicial: Rodilla flexionada cerca del pecho, sin que la zona lumbar se despegue del respaldo.\n\nMovimiento: Exhalá y empujá la plataforma extendiendo la pierna, sin bloquear la rodilla al final.\n\nContracción: Apretá el cuádriceps un instante con la pierna extendida.\n\nRegreso: Inhalá y bajá de forma controlada hasta que la rodilla vuelva cerca del pecho.\n\nConsejo como Entrenador:\n\nUsá bastante menos peso que en la versión de dos piernas -- es fácil sobreestimar la carga al pasar de bilateral a unilateral.\n\nSi la rodilla se te va hacia adentro, es señal de que el peso es demasiado.'
  ),
  (
    'Sentadilla frontal con barra',
    'Legs',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/sentadilla-frontal-con-barra.gif',
    'compuesto',
    false,
    array['Cuádriceps', 'Glúteos'],
    E'Paso inicial: Colocá la barra sobre los deltoides frontales, cruzando los brazos por encima para sostenerla (o agarre olímpico si tenés la movilidad).\n\nPosición inicial: Codos altos, pecho arriba, pies al ancho de hombros, core activado.\n\nMovimiento: Inhalá y bajá en sentadilla manteniendo el torso lo más vertical posible.\n\nContracción: Exhalá y empujá con los talones para volver a subir.\n\nRegreso: Extendé caderas y rodillas hasta la posición inicial.\n\nConsejo como Entrenador:\n\nSi se te caen los codos durante la bajada, la barra se va a ir hacia adelante -- priorizá mantener los codos arriba por sobre la profundidad de la sentadilla.'
  );

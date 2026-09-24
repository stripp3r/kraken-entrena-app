-- Migración 068: 10 ejercicios de Espalda que estaban en la biblioteca de
-- referencia pero no en el catálogo -- cuarta tanda de la revisión
-- músculo por músculo (ver 065 Abdominales, 066 Bíceps, 067 Cuádriceps).
--
-- De 15 nombres pasados: 5 eran duplicados exactos o casi idénticos a
-- ejercicios ya cargados (dos GIF distintos resultaron ser el mismo remo
-- sentado agarre cerrado que ya existía -- id 66). "Remo horizontal a un
-- brazo para deltoide posterior" se clasifica [Hombros, Espalda, Trapecio]
-- (Hombros primero) porque el propio archivo lo etiqueta "_Shoulder_" y
-- el músculo resaltado en el GIF es el deltoide posterior, no la espalda
-- media -- mismo criterio que ya se usa con Face pull.
--
-- GIFs ya subidos al bucket `ejercicios` de Storage. Correr en el SQL
-- Editor de Supabase.

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, tipo_esfuerzo, unilateral, grupos_musculares, como_hacerlo)
values
  (
    'Jalón cruzado en polea doble',
    'Pull',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/jalon-cruzado-polea-doble.gif',
    'compuesto',
    false,
    array['Espalda', 'Bíceps'],
    E'Paso inicial: Parate en el centro de una polea doble, tomá un agarre en cada mano desde arriba y cruzá los brazos por encima de la cabeza.\n\nPosición inicial: Brazos extendidos y cruzados hacia arriba, torso levemente inclinado hacia adelante, core activado.\n\nMovimiento: Exhalá y llevá los codos hacia abajo y hacia los costados del cuerpo, manteniendo los brazos cruzados durante todo el recorrido.\n\nContracción: Apretá la espalda un instante con los codos abajo.\n\nRegreso: Inhalá y volvé a extender los brazos hacia arriba de forma controlada.\n\nConsejo como Entrenador:\n\nEl cruce de los brazos hace que la línea de tracción sea distinta a un jalón tradicional -- se siente más la parte baja del dorsal.\n\nNo uses el peso del cuerpo para tirar, el movimiento sale de la espalda.'
  ),
  (
    'Pullover en polea sentado en banco inclinado',
    'Pull',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/pullover-polea-banco-inclinado.gif',
    'aislado',
    false,
    array['Espalda', 'Pecho'],
    E'Paso inicial: Sentate de espaldas a la polea alta en un banco inclinado, tomá una barra con agarre supino y llevala por encima de la cabeza con los brazos extendidos.\n\nPosición inicial: Brazos extendidos arriba y atrás de la cabeza, core activado.\n\nMovimiento: Exhalá y llevá la barra hacia abajo en arco, manteniendo los brazos casi extendidos, hasta la altura del pecho o el abdomen.\n\nContracción: Apretá el dorsal un instante en el punto más bajo.\n\nRegreso: Inhalá y volvé la barra hacia arriba y atrás de forma controlada.\n\nConsejo como Entrenador:\n\nA diferencia del pullover acostado, la posición inclinada cambia el ángulo de tracción -- probá los dos y quedate con el que sientas más en el dorsal.\n\nLos codos se mantienen con una leve flexión fija durante todo el recorrido, no es un press.'
  ),
  (
    'Remo invertido con correas',
    'Pull',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/remo-invertido-con-correas.gif',
    'compuesto',
    false,
    array['Espalda', 'Bíceps'],
    E'Paso inicial: Colgá un par de correas o anillas de un soporte alto, tomalas con ambas manos y acostate debajo con el cuerpo en línea recta, sosteniéndote de los talones.\n\nPosición inicial: Brazos extendidos, cuerpo recto de la cabeza a los talones, core y glúteos activados.\n\nMovimiento: Exhalá y tirá de las correas llevando el pecho hacia las manos, juntando los omóplatos.\n\nContracción: Apretá la espalda un instante con el pecho arriba.\n\nRegreso: Inhalá y bajá de forma controlada hasta la extensión completa de los brazos.\n\nConsejo como Entrenador:\n\nCuanto más horizontal el cuerpo (pies más adelante), más difícil el ejercicio -- regulá la dificultad con el ángulo del cuerpo, no solo agregando peso.'
  ),
  (
    'Remo sentado a un brazo con banda y giro',
    'Pull',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/remo-sentado-un-brazo-banda-giro.gif',
    'compuesto',
    true,
    array['Espalda', 'Bíceps'],
    E'Paso inicial: Sentate en el piso con las piernas extendidas, anclá una banda elástica a la altura de los pies y sostené el otro extremo con una mano.\n\nPosición inicial: Torso levemente inclinado hacia adelante, brazo extendido, core activado.\n\nMovimiento: Exhalá y tirá de la banda llevando el codo hacia atrás, girando el torso levemente hacia ese mismo lado.\n\nContracción: Apretá la espalda un instante con el codo atrás.\n\nRegreso: Inhalá y volvé a extender el brazo y a destorcer el torso de forma controlada.\n\nConsejo como Entrenador:\n\nEl giro del torso suma trabajo de oblicuos al remo, pero no lo fuerces -- si te tira la zona lumbar, reducí el rango del giro.'
  ),
  (
    'Remo en máquina T con pecho apoyado',
    'Pull',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/remo-maquina-t-pecho-apoyado.gif',
    'compuesto',
    false,
    array['Espalda', 'Bíceps', 'Trapecio'],
    E'Paso inicial: Acostate boca abajo sobre el banco inclinado de la máquina, con el pecho apoyado y tomá los agarres con ambas manos.\n\nPosición inicial: Brazos extendidos hacia abajo, core y pecho firmes contra el banco.\n\nMovimiento: Exhalá y tirá de los agarres hacia arriba, juntando los omóplatos, sin despegar el pecho del banco.\n\nContracción: Apretá la espalda un instante en el punto más alto.\n\nRegreso: Inhalá y bajá de forma controlada hasta la extensión completa.\n\nConsejo como Entrenador:\n\nEl apoyo del pecho elimina por completo el impulso del cuerpo -- si necesitás balancearte para levantar el peso, es que es demasiado.'
  ),
  (
    'Remo con barra en máquina Smith agarre invertido',
    'Pull',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/remo-smith-agarre-invertido.gif',
    'compuesto',
    false,
    array['Espalda', 'Bíceps', 'Trapecio'],
    E'Paso inicial: Colocate frente a la barra de la máquina Smith con las manos en agarre supino (palmas hacia arriba), un poco más angosto que el ancho de hombros.\n\nPosición inicial: Torso inclinado hacia adelante desde la cadera, espalda recta, rodillas semiflexionadas.\n\nMovimiento: Exhalá y tirá de la barra hacia el abdomen, llevando los codos pegados al cuerpo.\n\nContracción: Apretá la espalda un instante con la barra arriba.\n\nRegreso: Inhalá y bajá la barra de forma controlada hasta la extensión completa de los brazos.\n\nConsejo como Entrenador:\n\nEl agarre invertido (supino) le suma trabajo a los bíceps y cambia el ángulo de tracción hacia la espalda media-baja comparado con el agarre pronado.\n\nLa trayectoria fija de la máquina Smith ayuda a mantener la técnica si tenés dudas con la barra libre.'
  ),
  (
    'Remo en máquina sentado con placas',
    'Pull',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/remo-maquina-sentado-placas.gif',
    'compuesto',
    false,
    array['Espalda', 'Bíceps', 'Trapecio'],
    E'Paso inicial: Sentate en la máquina de remo cargada con placas, apoyá el pecho contra el respaldo y tomá los agarres.\n\nPosición inicial: Brazos extendidos hacia adelante, pecho firme contra el apoyo.\n\nMovimiento: Exhalá y tirá de los agarres hacia el torso, juntando los omóplatos.\n\nContracción: Apretá la espalda un instante en el punto más contraído.\n\nRegreso: Inhalá y volvé a extender los brazos de forma controlada.\n\nConsejo como Entrenador:\n\nEl mecanismo de palanca de esta máquina da una curva de resistencia distinta a la de una polea con cable -- suele sentirse más pesada al arrancar el movimiento.'
  ),
  (
    'Remo horizontal a un brazo para deltoide posterior',
    'Pull',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/remo-horizontal-deltoide-posterior.gif',
    'aislado',
    true,
    array['Hombros', 'Espalda', 'Trapecio'],
    E'Paso inicial: Parate al lado de una polea baja, tomá el agarre con el brazo opuesto (cruzando el cuerpo) con la palma hacia abajo.\n\nPosición inicial: Brazo extendido hacia el punto de anclaje, torso erguido, core activado.\n\nMovimiento: Exhalá y tirá del cable hacia atrás y hacia el costado, llevando el codo alto y hacia atrás como si remaras horizontal.\n\nContracción: Apretá el deltoide posterior un instante en el punto más atrás.\n\nRegreso: Inhalá y volvé a extender el brazo de forma controlada.\n\nConsejo como Entrenador:\n\nA diferencia de un remo tradicional, acá el codo se mantiene alto (a la altura del hombro), no pegado al cuerpo -- eso es lo que le da el énfasis al deltoide posterior en vez de a la espalda media.'
  ),
  (
    'Jalón dorsal de rodillas con agarre paralelo',
    'Pull',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/jalon-dorsal-rodillas-agarre-paralelo.gif',
    'compuesto',
    false,
    array['Espalda', 'Bíceps'],
    E'Paso inicial: Arrodillate en el centro de una polea doble, tomá un agarre en cada mano con las palmas encontradas (agarre paralelo) y llevalos por encima de la cabeza.\n\nPosición inicial: Brazos extendidos hacia arriba, torso erguido, core activado.\n\nMovimiento: Exhalá y tirá de ambos agarres hacia abajo y hacia los costados del cuerpo, como en una dominada.\n\nContracción: Apretá la espalda un instante con los codos abajo.\n\nRegreso: Inhalá y volvé a extender los brazos hacia arriba de forma controlada.\n\nConsejo como Entrenador:\n\nEstar de rodillas en vez de sentado en una máquina te obliga a mantener el core firme para no perder el equilibrio -- sumá esa exigencia extra a la cuenta.'
  ),
  (
    'Remo landmine con barra',
    'Pull',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/remo-landmine-agarre-directo.gif',
    'compuesto',
    false,
    array['Espalda', 'Bíceps', 'Trapecio'],
    E'Paso inicial: Parate sobre una barra anclada en un landmine, agarrala con ambas manos justo debajo de los discos.\n\nPosición inicial: Torso inclinado hacia adelante desde la cadera, espalda recta, rodillas semiflexionadas.\n\nMovimiento: Exhalá y tirá de la barra hacia el abdomen, llevando los codos hacia atrás.\n\nContracción: Apretá la espalda un instante con la barra arriba.\n\nRegreso: Inhalá y bajá la barra de forma controlada hasta la extensión completa de los brazos.\n\nConsejo como Entrenador:\n\nA diferencia de la versión con agarre en T, acá agarrás la barra directo -- las manos quedan más juntas, lo que cambia un poco el énfasis hacia la espalda media.'
  );

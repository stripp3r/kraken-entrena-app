-- Migracion 013: completa los dias B, C y D de Entrenamiento con el mismo
-- estandar del dia A -- ejercicio real, GIF real subido a Storage,
-- 'como hacerlo' + consejo extraidos de la hoja Hoja2 del Excel original,
-- y una alternativa real (mismo movimiento, otro equipo) por cada uno.
-- Correr en el SQL Editor de Supabase despues de las migraciones anteriores.

-- Nota: se detecto que la fila de Hoja2 de 'PRESS BANCO INCLIANDO CON MANCUERNAS'
-- tiene el texto de 'como hacerlo' de otro ejercicio pegado por error (bug propio
-- del Excel original, no de esta migracion) -- se uso 'PRESS BANCO PLANO CON BARRA'
-- como alternativa del press inclinado en su lugar, con texto verificado correcto.

-- ============ DIA B ============
insert into public.exercises (nombre, dia, categoria, orden, imagen_url, como_hacerlo, routine_id)
values (
  'Remo en polea baja a un brazo sentado',
  'B',
  'Pull',
  1,
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/remo-polea-baja-un-brazo-sentado.gif',
  'Paso inicial: Ajusta la polea en una posición baja y coloca un agarre de una sola mano en la empuñadura de la polea.

Posición corporal: Párate de frente a la máquina de poleas, mantén los pies separados al ancho de los hombros y coloca el pie opuesto al brazo que realizará el ejercicio ligeramente adelante. Mantén una postura erguida con la espalda recta y el núcleo activado para mantener la estabilidad.

Movimiento: Agarra la empuñadura con el brazo extendido y comienza a jalar hacia arriba y hacia el centro de tu cuerpo. Mantén el codo ligeramente flexionado y dirige el movimiento hacia el lado contrario del brazo que estás utilizando. Concéntrese en controlar el movimiento y sentir la contracción en los músculos de la espalda.

Contracción: Cuando el brazo esté en posición cercana a tu torso, contrae los músculos de la espalda y mantén la posición durante un segundo para sentir la contracción muscular.

Regreso: Lentamente, extiende el brazo hacia abajo y hacia el frente, volviendo a la posición inicial. Mantén el control del movimiento durante todo el ejercicio.

Consejo como Entrenador:

Asegúrate de seleccionar un peso adecuado que te permita realizar el ejercicio con buena forma y control.

Mantén una postura estable y evita balancear el cuerpo o usar impulso. Además, enfócate en sentir la contracción en los músculos de la espalda y evita que otros grupos musculares compensen el movimiento.',
  (select id from public.routines where nombre = 'Entreno 4 días')
);

insert into public.exercises (nombre, dia, categoria, orden, imagen_url, como_hacerlo, routine_id)
values (
  'Jalón lateral con polea a un brazo',
  'B',
  'Pull',
  2,
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/jalon-lateral-polea-un-brazo.gif',
  'Posición inicial: Ajusta una polea alta con un agarre en forma de asa (D-handle). Selecciona un peso adecuado.
Colócate frente a la máquina con una posición estable, preferiblemente con los pies al ancho de los hombros. Toma el asa con una mano y si lo prefieres, apoya la mano libre sobre tu cintura o muslo para mayor estabilidad.
Mantén el torso erguido y los hombros hacia atrás.

Movimiento: Inhala y, mientras exhalas, tira del cable hacia abajo doblando el codo y llevándolo hacia tu costado. Concéntrate en usar el dorsal y los músculos de la espalda para realizar el movimiento, no el brazo.
Lleva el codo hacia abajo y ligeramente hacia atrás, alineándolo con el costado de tu cuerpo. Al mismo tiempo, contrae los dorsales durante el tirón.

Contracción: Mantén la contracción durante un segundo cuando el asa esté cerca de tu torso, enfocándote en la activación del dorsal.

Descenso: Inhala y lentamente deja que el asa suba de vuelta a la posición inicial mientras mantienes el control. Evita que el peso te jale hacia arriba.
Asegúrate de que el brazo quede completamente extendido en la parte superior del movimiento.

Repeticiones: Repite el movimiento para el número deseado de repeticiones con un brazo y luego cambia al otro.

Consejo como Entrenador:

Mantén el torso erguido y evita balancear el cuerpo durante el movimiento para asegurarte de que el trabajo se centre en los dorsales.

Contrae los músculos de la espalda al tirar del cable, asegurándote de llevar el codo hacia el torso y no hacia afuera.

Realiza el movimiento de manera controlada en ambas fases (tirón y retorno), evitando que el peso te impulse hacia atrás.

Respira de manera constante: exhala al bajar el cable e inhala al soltarlo.',
  (select id from public.routines where nombre = 'Entreno 4 días')
);

insert into public.exercises (nombre, dia, categoria, orden, imagen_url, como_hacerlo, routine_id)
values (
  'Curl femoral',
  'B',
  'Pull',
  3,
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/curl-femoral.gif',
  'Paso inicial: Ajusta la máquina de curl femoral para que los cojines queden justo por encima de tus talones y asegúrate de que la máquina esté configurada según tu altura.
Acuéstate boca abajo en la máquina con las piernas extendidas y los tobillos debajo del cojín acolchado.
Agarra las asas de la máquina o el borde del banco para mayor estabilidad.

Posición inicial: Mantén el cuerpo alineado con la cabeza, la espalda y las caderas en una posición neutral.
Asegúrate de que tus pies estén alineados con el cojín y tus rodillas no estén completamente bloqueadas.

Movimiento: Inhala y comienza el movimiento doblando las rodillas y llevando los talones hacia los glúteos.
Mantén el movimiento suave y controlado, enfocándote en contraer los isquiotibiales (músculos de la parte posterior del muslo).

Contracción: Pausa brevemente en la parte superior del movimiento, cuando los talones estén cerca de los glúteos, para maximizar la contracción en los isquiotibiales.

Regreso: Exhala y baja lentamente los talones de vuelta a la posición inicial, extendiendo las piernas de manera controlada.
Evita dejar que las piernas se estiren completamente para mantener la tensión en los músculos durante todo el ejercicio.

Consejo como Entrenador:

Controla el movimiento en todo momento y no utilices impulso para levantar las piernas. Ajusta la resistencia de la máquina de acuerdo a tu nivel de fuerza y condición física.

Realiza el ejercicio de forma lenta y controlada para obtener mejores resultados y reducir el riesgo de lesiones.',
  (select id from public.routines where nombre = 'Entreno 4 días')
);

insert into public.exercises (nombre, dia, categoria, orden, imagen_url, como_hacerlo, routine_id)
values (
  'Hiperextensiones',
  'B',
  'Pull',
  4,
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/hiperextensiones.gif',
  'Paso inicial: Ajusta el banco de hiperextensiones para que tus caderas queden alineadas con el borde superior del acolchado.
Coloca los pies debajo de las almohadillas para asegurarlos y mantén las piernas rectas.

Posición inicial: Inclínate hacia adelante desde la cintura para que la parte superior de tu cuerpo quede perpendicular al suelo. Mantén los brazos cruzados sobre el pecho o detrás de la cabeza.

Movimiento: Inhala y comienza a levantar la parte superior del cuerpo extendiendo la columna y llevando el torso hacia arriba.
Mantén un ligero arco en la espalda, concentrándote en usar los músculos de la espalda baja y los glúteos.

Contracción: Pausa brevemente en la parte superior del movimiento cuando tu cuerpo forme una línea recta desde la cabeza hasta los talones.
Asegúrate de no hiperextender la espalda baja.

Regreso: Exhala y baja lentamente la parte superior del cuerpo de vuelta a la posición inicial, manteniendo el control durante todo el movimiento.

Consejo como Entrenador:

Ajusta el banco para que tus caderas queden al borde y tu cuerpo esté alineado.

Mantén la columna vertebral neutral y contrae los músculos del core durante todo el movimiento.

Desciende lentamente manteniendo el control y evita el hiperextender la espalda al subir.',
  (select id from public.routines where nombre = 'Entreno 4 días')
);

insert into public.exercises (nombre, dia, categoria, orden, imagen_url, como_hacerlo, routine_id)
values (
  'Curl de bíceps en banco inclinado con mancuernas',
  'B',
  'Pull',
  5,
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/curl-biceps-banco-inclinado-mancuernas.gif',
  'Paso Inicial: Ajusta el banco a una posición inclinada de alrededor de 45 grados. Selecciona las mancuernas con un peso adecuado para tu nivel de fuerza.

Posición Corporal: Siéntate en el banco inclinado con la espalda apoyada y los pies firmemente en el suelo. Mantén una ligera curva en la espalda baja y los hombros hacia atrás.

Movimiento: Sujeta una mancuerna en cada mano, con las palmas mirando hacia adelante (agarre supino). Deja que los brazos cuelguen a los lados, completamente extendidos. Sin mover los codos, dobla los brazos llevando las mancuernas hacia tus hombros mientras contraes los bíceps.

Empuje: Realiza el movimiento de flexión en el codo al contraer los bíceps y levantar las mancuernas hacia arriba.

Regreso: Baja las mancuernas de manera controlada y lenta hasta la posición inicial, manteniendo el control en todo momento.

Consejo como Entrenador:

Mantén los codos pegados al banco durante todo el movimiento para enfocarte en el trabajo de los bíceps.

Evita usar impulso o movimiento excesivo del cuerpo para obtener el máximo beneficio del ejercicio.',
  (select id from public.routines where nombre = 'Entreno 4 días')
);

insert into public.exercises (nombre, dia, categoria, orden, imagen_url, como_hacerlo, routine_id)
values (
  'Curl en polea a un brazo en banco Scott',
  'B',
  'Pull',
  6,
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/curl-polea-un-brazo-banco-scott.gif',
  'Paso Inicial: Ajusta la altura del banco Scott para que tus axilas descansen cómodamente en la parte superior del cojín y tus brazos cuelguen directamente hacia abajo. Coloca un accesorio de polea baja en la máquina de cable. Asegúrate de que la polea esté en la posición más baja posible.

Posición Corporal: Siéntate en el banco Scott de manera que tus axilas estén apoyadas en el cojín y tus brazos cuelguen directamente hacia abajo. Toma la empuñadura del cable de la mano a trabajar con un agarre supino (palma hacia arriba). Asegúrate de tener un agarre firme y cómodo.

Movimiento: Comienza con el brazo completamente extendido, permitiendo que el músculo esté completamente estirado. Manteniendo el codo fijo en el cojín del banco, realiza un curl de bíceps al tirar del cable hacia arriba. Concédele a tus bíceps la máxima contracción en la parte superior del movimiento.

Empuje y Regreso: Después de alcanzar la contracción máxima, baja el cable de manera controlada hasta que el brazo esté completamente extendido nuevamente.

Consejo como Entrenador:

Control de Movimiento: Evita usar impulso o balanceo para levantar el peso. Mantén el movimiento controlado en todo momento para asegurar que los bíceps estén realizando el trabajo.

Respiración: Exhala mientras realizas el curl hacia arriba y inhala durante el descenso del brazo.

Ajuste de Peso: Selecciona un peso que te permita realizar el ejercicio con buena forma. Es preferible aumentar el peso gradualmente a medida que ganas fuerza.',
  (select id from public.routines where nombre = 'Entreno 4 días')
);

-- ============ DIA C ============
insert into public.exercises (nombre, dia, categoria, orden, imagen_url, como_hacerlo, routine_id)
values (
  'Press inclinado en máquina Smith',
  'C',
  'Torso',
  1,
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/press-inclinado-smith.gif',
  'Paso inicial: Ajusta el banco en una posición inclinada de aproximadamente 45 grados. Coloca la barra en el soporte a una altura que te permita alcanzarla cómodamente desde la posición acostado en el banco.

Posición corporal: Siéntate en el banco y acuéstate en posición inclinada con la espalda apoyada sobre el respaldo. Asegúrate de que los pies estén firmemente colocados en el suelo para obtener estabilidad. Agarra la barra con las manos ligeramente más separadas que el ancho de los hombros y las palmas mirando hacia adelante.

Movimiento: Contrae los músculos del abdomen y desbloquea la barra del soporte, llevándola hacia abajo controladamente hacia la parte superior del pecho. Asegúrate de mantener los codos ligeramente doblados y los brazos en línea con los hombros durante todo el movimiento.

Empuje y regreso: Exhala y empuja la barra hacia arriba, extendiendo los brazos y llevando la barra hacia arriba hasta su posición inicial dejando los brazos casi completamente extendidos.

Consejo como Entrenador:

Recuerda mantener una forma controlada en todo momento.

Evita bloquear tus codos en la posición extendida para mantener la tensión en los músculos del pecho y minimizar el riesgo de lesiones.

Mantén la espalda pegada al banco para un mejor apoyo.

El banco puede reclinarse menos; no tiene que ser igual al ejemplo brindado.',
  (select id from public.routines where nombre = 'Entreno 4 días')
);

insert into public.exercises (nombre, dia, categoria, orden, imagen_url, como_hacerlo, routine_id)
values (
  'Flexiones de brazos',
  'C',
  'Torso',
  2,
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/flexiones-de-brazos.gif',
  'Paso inicial: Colócate en posición de plancha, apoyando tus manos en el suelo a la altura de los hombros y extendiendo las piernas hacia atrás, de manera que tu cuerpo quede alineado desde la cabeza hasta los pies.

Posición corporal: Mantén el abdomen contraído y los glúteos apretados para mantener una buena alineación corporal durante todo el ejercicio. Mantén los codos ligeramente flexionados.

Movimiento: Dobla los codos y baja el cuerpo hacia el suelo, manteniendo la columna vertebral recta y los codos apuntando ligeramente hacia atrás. Desciende hasta que tu pecho esté cerca del suelo o hasta donde sea cómodo para ti.

Empuje y Regreso: Desde la posición más baja, extiende los codos y empuja el cuerpo hacia arriba, manteniendo los músculos del pecho y los tríceps activos durante todo el movimiento. Mantén la alineación del cuerpo y evita bloquear los codos en la posición extendida.

Consejo como Entrenador:

Mantén una buena técnica y forma durante todo el ejercicio.

Asegúrate de mantener el cuerpo alineado y evitar arquear la espalda o hundir los hombros.

Controla el movimiento en todo momento y evita balancear el cuerpo o hacer movimientos bruscos.

Adapta la dificultad del ejercicio ajustando la posición de las manos o realizando variaciones, como las flexiones de rodillas, si es necesario.',
  (select id from public.routines where nombre = 'Entreno 4 días')
);

insert into public.exercises (nombre, dia, categoria, orden, imagen_url, como_hacerlo, routine_id)
values (
  'Encogimiento de hombros con mancuernas',
  'C',
  'Torso',
  3,
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/encogimiento-hombros-mancuernas.webp',
  'Paso inicial: Toma una mancuerna en cada mano y coloca los pies separados al ancho de los hombros.

Posición corporal: Mantén la espalda recta y los hombros relajados.

Movimiento: Eleva los hombros hacia arriba, acercándolos lo más posible a las orejas. Mantén los brazos extendidos a los costados del cuerpo. Sostén la posición en la parte superior durante un segundo, enfocándote en la contracción de los músculos del hombro.

Regreso: Baja los hombros de manera controlada, volviendo a la posición inicial

Consejo como Entrenador:

Asegúrate de no encorvar los hombros ni arquear la espalda durante el ejercicio.

Mantén la concentración en los músculos del hombro y evita la compensación con otros grupos musculares.

Importante utilizar un peso adecuado para evitar lesiones y mantener una técnica correcta.',
  (select id from public.routines where nombre = 'Entreno 4 días')
);

insert into public.exercises (nombre, dia, categoria, orden, imagen_url, como_hacerlo, routine_id)
values (
  'Remo en máquina T (landmine)',
  'C',
  'Torso',
  4,
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/remo-maquina-t.gif',
  'Paso inicial: Ajusta el asiento de la máquina para que tus pies estén apoyados firmemente en el suelo y tus rodillas estén dobladas en un ángulo de 90 grados aproximadamente. Agarra las asas de la máquina con un agarre neutro (palmas mirando hacia abajo) y coloca los pies sobre las plataformas para mantener una posición estable.

Posición corporal: Siéntate con la espalda recta y los hombros relajados. Mantén el pecho abierto y la mirada al frente.

Movimiento: Inhala y comienza el movimiento al empujar con los pies y tirando de las asas hacia tu pecho al mismo tiempo. Mantén los codos cerca del cuerpo y los hombros hacia abajo durante todo el movimiento. Cuando hayas llevado las asas hacia tu pecho, exhala y mantén la posición durante un momento, sintiendo la contracción de los músculos de la espalda.

Regreso: Después de mantener la posición, controla el retorno de las asas a la posición inicial mientras inhalas

Consejo como Entrenador:

Asegúrate de mantener una buena postura durante todo el ejercicio, evitando arquear la espalda o encorvar los hombros.

Mantén el movimiento suave y controlado, evitando sacudidas o impulsos excesivos.

Si eres principiante o tienes alguna lesión, es recomendable comenzar con un peso ligero y aumentar gradualmente a medida que te sientas más cómodo y seguro con la técnica.',
  (select id from public.routines where nombre = 'Entreno 4 días')
);

insert into public.exercises (nombre, dia, categoria, orden, imagen_url, como_hacerlo, routine_id)
values (
  'Remo con mancuerna a un brazo',
  'C',
  'Torso',
  5,
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/remo-mancuerna-un-brazo.gif',
  'Paso inicial: Coloca un banco plano a tu lado. Sujeta una mancuerna con tu mano izquierda y coloca tu rodilla derecha y tu mano derecha sobre el banco, manteniendo tu espalda recta y paralela al suelo.

Posición corporal: Asegúrate de que tu rodilla izquierda esté alineada con tu cadera izquierda y que tu pie izquierda esté apoyado firmemente en el suelo. Mantén tu brazo izquierdo extendido y perpendicular al suelo, sosteniendo la mancuerna con un agarre firme.

Movimiento: Flexiona tu codo izquierdo y lleva la mancuerna hacia tu cuerpo, manteniendo tu brazo pegado al torso y sin mover los codos ni el resto del cuerpo. Mantén el control del movimiento en todo momento.

Contracción: En la posición de máxima contracción, aprieta tu músculo bíceps y mantén la tensión durante un segundo para sentir la contracción máxima en el brazo derecho.

Regreso: De manera controlada, baja la mancuerna hasta la posición inicial, extendiendo completamente tu codo. Evita permitir que la mancuerna caiga bruscamente o perder el control del movimiento.

Consejo como Entrenador:

Mantén una buena postura y control durante todo el ejercicio.

Asegúrate de utilizar un peso adecuado y realizar el movimiento de manera suave y controlada.

Mantén la respiración constante y evita utilizar impulso o balanceo para levantar la mancuerna.',
  (select id from public.routines where nombre = 'Entreno 4 días')
);

insert into public.exercises (nombre, dia, categoria, orden, imagen_url, como_hacerlo, routine_id)
values (
  'Face pull',
  'C',
  'Torso',
  6,
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/face-pull.gif',
  'Paso inicial: Ajusta la polea alta a una altura aproximada de tus hombros y asegúrate de que la cuerda o agarre estén conectados.

Posición corporal: Párate frente a la polea y agarra las cuerdas o el agarre con ambas manos, manteniendo tus brazos extendidos.

Movimiento: Da un paso hacia atrás y adopta una posición ligeramente inclinada hacia adelante. Mantén una ligera flexión en las rodillas y una posición estable. Tira de las cuerdas o el agarre hacia tu cara, llevando tus codos hacia atrás y hacia arriba, manteniendo los brazos paralelos al suelo. A medida que tires hacia atrás, enfócate en contraer los músculos de la espalda y los hombros.

Regreso: De manera controlada, permite que las cuerdas o el agarre vuelvan a la posición inicial, estirando los brazos nuevamente.

Consejo como Entrenador:

Mantén los hombros hacia abajo y hacia atrás durante todo el movimiento para evitar tensiones en el cuello y asegurarte de que la carga se centre en los músculos adecuados.

Ajusta la resistencia de la polea para que puedas completar el ejercicio con una técnica correcta.

El ejercicio debe ejecutarse manera lenta y controlada.',
  (select id from public.routines where nombre = 'Entreno 4 días')
);

-- ============ DIA D ============
insert into public.exercises (nombre, dia, categoria, orden, imagen_url, como_hacerlo, routine_id)
values (
  'Extensión de cuádriceps',
  'D',
  'Legs',
  1,
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/extension-cuadriceps.gif',
  'Paso inicial: Siéntate en la máquina de extensión de pierna y ajusta el asiento de manera que tus rodillas queden alineadas con el eje de la máquina.
Coloca los tobillos debajo del cojín acolchado y ajusta la almohadilla de la máquina para que quede justo encima de tus pies.

Posición inicial: Agarra las asas de la máquina para mayor estabilidad.
Mantén la espalda recta y apoyada contra el respaldo.
Los pies deben estar separados al ancho de las caderas.

Movimiento: Inhala y comienza a levantar el peso extendiendo las piernas, empujando hacia arriba con los pies.
Extiende las piernas hasta que estén completamente rectas, pero sin bloquear las rodillas.

Contracción: Pausa brevemente en la parte superior del movimiento para maximizar la contracción en los músculos del cuadríceps.

Regreso: Exhala y baja lentamente las piernas de vuelta a la posición inicial, manteniendo el control durante todo el movimiento.

Consejo como Entrenador:

Controla el movimiento en todo momento, elevando los pies hacia arriba hasta que las piernas estén completamente rectas y bajando lentamente para mantener la tensión constante en los cuádriceps.

Mantén la atención en tus cuádriceps y evita usar impulso o arquear la espalda durante el ejercicio para maximizar la eficacia y prevenir lesiones.

Si sientes molestias o dolor en las rodillas, detén el ejercicio de inmediato y comunicalo.',
  (select id from public.routines where nombre = 'Entreno 4 días')
);

insert into public.exercises (nombre, dia, categoria, orden, imagen_url, como_hacerlo, routine_id)
values (
  'Sentadillas',
  'D',
  'Legs',
  2,
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/sentadillas.gif',
  'Paso inicial: Coloca una barra sobre una jaula de sentadillas o un soporte a una altura que te permita colocarla cómodamente sobre tus trapecios.
Agarra la barra con las manos a una distancia un poco más ancha que la de los hombros.
Pasa debajo de la barra y colócala sobre la parte superior de la espalda (trapecios), no sobre el cuello.

Posición inicial: Levanta la barra de los soportes y da un paso atrás.
Coloca los pies separados al ancho de los hombros, con los dedos ligeramente apuntando hacia afuera.
Mantén el core activado, el pecho hacia arriba y los hombros hacia atrás.

Movimiento: Inhala y comienza a bajar el cuerpo empujando las caderas hacia atrás y doblando las rodillas.
Desciende hasta que tus muslos estén al menos paralelos al suelo, o más abajo si tu flexibilidad lo permite.
Mantén la espalda recta y evita redondearla durante el movimiento.

Contracción: Pausa brevemente en la parte inferior del movimiento, asegurándote de que las rodillas estén alineadas con los pies.

Regreso: Exhala y empuja hacia arriba a través de los talones, extendiendo las caderas y las rodillas para volver a la posición inicial.
Mantén el control durante todo el movimiento y evita el uso de impulso.

Consejo como Entrenador:

Mantén la espalda recta, los hombros hacia atrás y los abdominales contraídos. Controla la respiración: inhala al bajar y exhala al subir.

Comienza con una carga ligera. Aumentarás en el proceso.

Coloca los pies a la altura de los hombros, las rodillas alineadas con los pies y lleva la cola hacia atrás al bajar.

Recuerda que la sentadilla con barra es un ejercicio complejo, por lo que es importante aprender la técnica correctamente para dominarla por completo.',
  (select id from public.routines where nombre = 'Entreno 4 días')
);

insert into public.exercises (nombre, dia, categoria, orden, imagen_url, como_hacerlo, routine_id)
values (
  'Estocada búlgara en el banco',
  'D',
  'Legs',
  3,
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/estocada-bulgara-banco.gif',
  'Paso inicial: Coloca un banco o una superficie elevada detrás de ti.
Toma una mancuerna en cada mano con las palmas mirando hacia el cuerpo.
Párate en una posición dividida, con una pierna adelantada y la otra apoyada en el banco detrás de ti.

Posición corporal: Mantén los pies separados al ancho de las caderas y el torso erguido.
Asegúrate de que la pierna adelantada esté lo suficientemente adelante como para que al bajar, la rodilla no pase la punta del pie. Mantén las mancuernas a los lados del cuerpo con los brazos extendidos y relajados.

Movimiento: Inhala profundamente y comienza a bajar el cuerpo doblando la rodilla y la cadera de la pierna delantera.Baja hasta que la rodilla de la pierna trasera casi toque el suelo, asegurándote de mantener el torso erguido y el núcleo activado.

Contracción: Mantén la posición baja durante un segundo, asegurándote de que el peso esté distribuido en el talón de la pierna delantera.

Regreso: Exhala mientras empujas a través del talón de la pierna delantera para regresar a la posición inicial.
Mantén el control del movimiento y evita el impulso. Repite el movimiento por el número deseado de repeticiones antes de cambiar de pierna.

Consejo como Entrenador:

Mantén el equilibrio concentrándote en un punto fijo delante de ti.

Asegúrate de que la rodilla de la pierna delantera no pase la punta del pie durante el descenso.

Mantén el torso erguido y evita inclinarte hacia adelante.

Utiliza un peso que te permita realizar el movimiento con control y buena forma.

Respira profundamente antes de bajar y exhala al subir.',
  (select id from public.routines where nombre = 'Entreno 4 días')
);

insert into public.exercises (nombre, dia, categoria, orden, imagen_url, como_hacerlo, routine_id)
values (
  'Sentadilla sissy',
  'D',
  'Legs',
  4,
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/sentadilla-sissy.gif',
  'Paso inicial: Colócate de pie con los pies separados a la altura de los hombros.
Puedes utilizar una barra, pared o cualquier otro soporte para ayudarte con el equilibrio si es tu primera vez realizando el ejercicio.

Posición inicial: Mantén el cuerpo erguido, con los glúteos apretados y el core activado.
El objetivo es que tus caderas se mantengan lo más alineadas posible con tus rodillas durante todo el ejercicio.

Movimiento: Inhala y comienza a llevar las rodillas hacia adelante, bajando lentamente. Al hacerlo, permite que los talones se despeguen del suelo.
Mantén las caderas hacia adelante y baja todo lo que puedas, sintiendo cómo los cuádriceps se estiran y trabajan.
La parte superior de tu cuerpo debe mantenerse erguida durante todo el movimiento.

Contracción: Una vez que hayas alcanzado la profundidad máxima que puedes controlar, pausa por un segundo en la parte inferior.

Regreso: Exhala y utiliza la fuerza de tus cuádriceps para regresar a la posición inicial, extendiendo las rodillas y volviendo a colocar los talones en el suelo de manera controlada.

Consejo como Entrenador:

Mantén el core firme y la espalda lo más recta posible durante todo el movimiento para evitar tensiones innecesarias en la zona lumbar.

Comienza sin peso adicional hasta que domines la técnica, ya que es un ejercicio avanzado que puede ser desafiante.

Asegúrate de mantener las caderas hacia adelante mientras bajas para aislar el trabajo en los cuádriceps.

Realiza el ejercicio de manera controlada, evitando caer rápidamente en la parte excéntrica del movimiento.',
  (select id from public.routines where nombre = 'Entreno 4 días')
);

insert into public.exercises (nombre, dia, categoria, orden, imagen_url, como_hacerlo, routine_id)
values (
  'Elevación de talón en máquina Smith',
  'D',
  'Legs',
  5,
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/elevacion-talon-parado.gif',
  'Paso inicial: Coloca la barra de la máquina Smith en una altura adecuada para que puedas levantar los talones cómodamente.
Parado debajo de la barra, coloca los hombros debajo de ella y sostén la barra con las manos a la anchura de los hombros.

Posición inicial: Mantén una postura erguida con la espalda recta y el core activado.
Los pies deben estar separados al ancho de las caderas y colocados debajo de la barra.

Movimiento: Inhala profundamente y, empujando a través de los antepiés, levanta los talones lo más alto posible.
Concéntrate en contraer los músculos de la pantorrilla al levantar los talones.

Contracción: Mantén la contracción en la parte superior del movimiento durante un breve segundo para maximizar la activación de las pantorrillas.
Asegúrate de sentir la tensión en los músculos de la pantorrilla.

Regreso: Exhala y baja lentamente los talones de vuelta a la posición inicial, permitiendo que desciendan ligeramente por debajo del nivel del antepié para un estiramiento completo de las pantorrillas.
Mantén el control del movimiento durante todo el descenso.

Consejo como Entrenador:

Asegúrate de que la barra esté en una posición segura y cómoda en la máquina Smith antes de comenzar el ejercicio.

Mantén una buena postura durante todo el ejercicio, con la espalda recta y el core comprometido.

Realiza el movimiento de manera lenta y controlada para maximizar la activación muscular y evitar lesiones.

Concéntrate en apretar los músculos de la pantorrilla en la parte superior del movimiento.

Respira de manera constante: exhala al levantar los talones e inhala al bajarlos.',
  (select id from public.routines where nombre = 'Entreno 4 días')
);

insert into public.exercises (nombre, dia, categoria, orden, imagen_url, como_hacerlo, routine_id)
values (
  'Elevación de talón parado a una pierna',
  'D',
  'Legs',
  6,
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/elevacion-talon-parado-1-pierna.gif',
  'Paso inicial: Ponte de pie frente a una superficie estable, como una pared o una barra, para mantener el equilibrio.
Levanta un pie del suelo y flexiona ligeramente la rodilla de la pierna que permanece en el suelo.

Posición inicial: Apoya el antepié del pie que está en el aire en el suelo, dejando el talón levantado.
Mantén una postura erguida con la espalda recta y el core activado.

Movimiento: Inhala profundamente y, empujando a través del antepié, levanta el talón lo más alto posible.
Concéntrate en contraer los músculos de la pantorrilla al levantar el talón.

Contracción: Mantén la contracción en la parte superior del movimiento durante un breve segundo para maximizar la activación de la pantorrilla.
Asegúrate de sentir la tensión en los músculos de la pantorrilla.

Regreso: Exhala y baja lentamente el talón de vuelta a la posición inicial, permitiendo que descienda ligeramente por debajo del nivel del antepié para un estiramiento completo de la pantorrilla.
Mantén el control del movimiento durante todo el descenso.

Consejo como Entrenador:

Mantén una buena postura durante todo el ejercicio, con la espalda recta y el core comprometido.

Realiza el movimiento de manera lenta y controlada para maximizar la activación muscular y evitar lesiones.

Concéntrate en apretar los músculos de la pantorrilla en la parte superior del movimiento.

Respira de manera constante: exhala al levantar el talón e inhala al bajarlo.',
  (select id from public.routines where nombre = 'Entreno 4 días')
);

-- ============ ALTERNATIVAS ============
insert into public.exercises (nombre, dia, categoria, orden, imagen_url, como_hacerlo)
values (
  'Remo en máquina sentado',
  'B',
  'Pull',
  99,
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/remo-maquina-sentado.gif',
  'Paso inicial: Siéntate en la máquina de remo con los pies apoyados en las plataformas y agarrando las asas de la máquina con las manos.

Posición corporal: Mantén la espalda recta y los hombros relajados. Los pies deben estar colocados firmemente en las plataformas con las rodillas ligeramente flexionadas.

Movimiento: Inclina ligeramente el torso hacia adelante desde la cadera mientras mantienes los brazos extendidos. Esta será tu posición inicial. Para iniciar el movimiento, tira de las asas hacia atrás, llevando los codos hacia atrás y cerca de tu cuerpo. Hazlo manteniendo los hombros hacia abajo y la espalda recta. Siente cómo se activan los músculos de la espalda durante este movimiento.

Regreso: Luego, extiende los brazos hacia adelante para volver a la posición inicial, donde el torso está ligeramente inclinado hacia adelante y los brazos están extendidos.

Consejo como Entrenador:

Asegúrate de mantener una postura adecuada durante todo el ejercicio, manteniendo la espalda recta y los hombros relajados.

No hagas movimientos bruscos y controla el movimiento en todo momento para evitar lesiones.'
);

insert into public.exercises (nombre, dia, categoria, orden, imagen_url, como_hacerlo)
values (
  'Dorsales en máquina',
  'B',
  'Pull',
  99,
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/dorsales-maquina.gif',
  'Paso inicial: Siéntate frente a la máquina de dorsales. Asegúrate de ajustar el peso de la máquina según tu nivel de fuerza y habilidad.

Posición corporal: Agarra de las manijas de la máquina con un agarre pronador (palmas mirando hacia abajo).

Movimiento: Manteniendo la espalda recta y los abdominales contraídos, tira de la máquina hacia bajo, llevando los codos hacia atrás y apretando los omóplatos. El objetivo es enfocarse en la contracción de los músculos de la espalda mientras realizas el movimiento.

Contracción: Cuando la barra este cerca de tu cuerpo y los codos pegados al cuerpo, mantén la posición durante un segundo y siente la contracción en los músculos de la espalda.

Regreso: De manera controlada, permite que la barra se mueva hacia arriba y estire los brazos nuevamente hasta alcanzar la posición inicial.

Consejo como Entrenador:

Asegúrate de mantener una buena técnica durante todo el ejercicio.

Evita utilizar el impulso del cuerpo para realizar el movimiento y concéntrate en la contracción de los músculos de la espalda.

Además, no olvides ajustar el peso de la máquina según tus capacidades y realizar el movimiento de forma suave y controlada'
);

insert into public.exercises (nombre, dia, categoria, orden, imagen_url, como_hacerlo)
values (
  'Curl femoral sentado',
  'B',
  'Pull',
  99,
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/curl-femoral-sentado.gif',
  'Paso inicial: Siéntate en la máquina de curl femoral y ajusta el asiento y el respaldo para que tus piernas estén completamente extendidas y los rodillos estén encima de tus tobillos.
Ajusta el respaldo de manera que tu espalda esté completamente apoyada.

Posición inicial: Agarra las manijas laterales de la máquina para estabilizar tu cuerpo.
Mantén una postura erguida con el pecho hacia afuera y los hombros hacia atrás.

Movimiento: Inhala profundamente y comienza a flexionar las rodillas, llevando los rodillos hacia tus glúteos.
Mantén el movimiento lento y controlado, asegurándote de que las rodillas se mantengan en línea con los tobillos y las caderas.

Contracción: Mantén la contracción en la parte superior del movimiento durante un breve segundo para maximizar la activación muscular.

Regreso: Exhala y lentamente extiende las piernas de vuelta a la posición inicial, manteniendo el control del movimiento para evitar que el peso caiga bruscamente.

Consejo como Entrenador:

Ajusta la máquina para que el rodillo esté justo encima de tus tobillos y el respaldo del asiento esté en una posición que permita que tu espalda esté completamente apoyada.

Utiliza un peso adecuado que te permita realizar el ejercicio con buena forma y control.

Mantén el core comprometido para estabilizar el cuerpo durante el ejercicio.

Realiza el movimiento de manera lenta y controlada para maximizar la activación muscular y evitar lesiones.'
);

insert into public.exercises (nombre, dia, categoria, orden, imagen_url, como_hacerlo)
values (
  'Peso muerto rumano',
  'B',
  'Pull',
  99,
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/peso-muerto-rumano.gif',
  'Paso inicial: Coloca una barra frente a ti en el suelo y párate con los pies separados al ancho de los hombros.
La barra debe estar cerca de tus espinillas, con tus manos sosteniendo la barra a la misma anchura que tus hombros.

Posición inicial: Mantén una postura erguida, con los hombros hacia atrás y el pecho hacia afuera. Mantén una ligera flexión en las rodillas y lleva la barra hacia abajo, manteniendo la espalda recta.

Movimiento: Inhala profundamente y comienza a bajar la barra hacia abajo, empujando tus caderas hacia atrás y manteniendo las piernas casi completamente extendidas.
Baja la barra hasta que sientas un estiramiento en los isquiotibiales, manteniendo la espalda recta y los hombros hacia atrás.

Contracción: Mantén la posición baja durante un segundo, sintiendo la tensión en los músculos de la cadena posterior.

Regreso: Exhala mientras empujas a través de los talones para levantar la barra hacia arriba.
Mantén la espalda recta y los hombros hacia atrás durante todo el movimiento.
Sube hasta que estés de pie completamente erguido, llevando las caderas hacia adelante para completar el movimiento.

Consejo como Entrenador:

Utiliza un peso adecuado que te permita realizar el ejercicio con buena forma y control.

Mantén una postura estable y el equilibrio en todo momento.

Mantén el pecho erguido y la espalda recta durante todo el ejercicio.

Controla el movimiento y evita balancearte hacia adelante o hacia atrás.

Asegúrate de mantener los músculos abdominales contraídos para proteger la espalda baja.'
);

insert into public.exercises (nombre, dia, categoria, orden, imagen_url, como_hacerlo)
values (
  'Curl de bíceps con mancuerna parado',
  'B',
  'Pull',
  99,
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/curl-biceps-mancuerna-parado.gif',
  'Paso inicial: Ponte de pie con los pies separados al ancho de los hombros.
Sostén una mancuerna en cada mano con las palmas mirando hacia adelante y los brazos extendidos a los lados del cuerpo.

Posición inicial: Mantén una ligera flexión en las rodillas para una mayor estabilidad.
Asegúrate de que los codos estén cerca del torso y que los hombros estén hacia atrás y hacia abajo.

Movimiento: Inhala y comienza a levantar las mancuernas doblando los codos.
Mantén los codos inmóviles mientras levantas las mancuernas hacia los hombros.

Contracción: Pausa brevemente en la parte superior del movimiento, asegurándote de que los bíceps estén completamente contraídos.

Regreso: Exhala y baja lentamente las mancuernas de regreso a la posición inicial, controlando el movimiento en todo momento.

Consejo como Entrenador:

Mantén los codos cerca del cuerpo en todo momento para activar al máximo los músculos del bíceps.

Controla el movimiento y evita movimientos bruscos para prevenir lesiones.

Evita extender completamente los brazos en cada repetición para mantener la tensión en los músculos del bíceps.

Realiza el giro de la muñeca de manera suave y controlada para maximizar la activación muscular y mantener el control en todo el rango de movimiento.'
);

insert into public.exercises (nombre, dia, categoria, orden, imagen_url, como_hacerlo)
values (
  'Bíceps en banco Scott',
  'B',
  'Pull',
  99,
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/biceps-banco-scott.gif',
  'Paso inicial: Ajusta el banco Scott de modo que tus axilas estén apoyadas en el cojín acolchado y tus brazos cuelguen sobre el soporte inclinado. Agarra la barra EZ con un agarre en supinación (palmas hacia arriba) y asegúrate de que tus manos estén separadas a una distancia ligeramente menor que el ancho de tus hombros.

Posición corporal: Siéntate en el banco con la espalda recta y los pies apoyados en el suelo. Mantén los codos cerca del soporte inclinado y las axilas firmemente apoyadas en el cojín. Esta posición ayudará a aislar y centrar el trabajo en los músculos del bíceps.

Movimiento: Con un movimiento lento y controlado, flexiona los codos y levanta la barra hacia arriba hasta que tus antebrazos estén perpendicular al suelo. Mantén los codos pegados al soporte inclinado durante todo el movimiento y evita cualquier impulso o movimiento excesivo de los hombros.

Contracción y Regreso: En la parte superior del movimiento, contrae los músculos del bíceps y mantén la posición durante un breve instante. Luego, de manera controlada, baja la barra de vuelta a la posición inicial, estirando completamente los brazos sin bloquear los codos.

Consejo como Entrenador:

Mantén una buena postura durante todo el ejercicio, evitando el impulso o el balanceo excesivo del cuerpo; el movimiento debe ser únicamente realizado por los brazos.

Controla el peso en todo momento y concéntrate en sentir la tensión en los músculos del bíceps.

Siempre elige un peso que te permita realizar el ejercicio de forma adecuada y sin comprometer la técnica.'
);

insert into public.exercises (nombre, dia, categoria, orden, imagen_url, como_hacerlo)
values (
  'Press banco plano con barra',
  'C',
  'Torso',
  99,
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/press-banco-plano-barra.gif',
  'Paso inicial: Acuéstate en un banco plano con los pies apoyados firmemente en el suelo. Asegúrate de que tus ojos estén alineados con la barra.

Posición corporal: Coloca los pies separados a la anchura de los hombros y mantén los glúteos y la espalda baja en contacto con el banco. Agarra la barra con las manos ligeramente más anchas que el ancho de los hombros, con un agarre pronado (palmas hacia adelante).

Movimiento: Desbloquea la barra de los soportes y baja lentamente la barra hacia tu pecho, manteniendo los codos ligeramente flexionados hacia los lados. Mantén los hombros hacia abajo y hacia atrás y mantén una postura estable durante todo el movimiento.

Empuje y Regreso: Empuja la barra hacia arriba con un movimiento controlado, extendiendo los brazos y volviendo a la posición inicial. Mantén los músculos del pecho activos y enfócate en empujar la barra de manera explosiva pero controlada.

Consejo como Entrenador:

Mantén una buena técnica durante todo el ejercicio. Evita arquear la espalda o balancear el cuerpo para evitar lesiones.

Asegúrate de que la barra se mueva en una línea recta sobre tu pecho y no dejes que se hunda demasiado en tu pecho.

Siempre realiza el ejercicio con un peso que puedas controlar adecuadamente y busca la asistencia de un profesional si es necesario'
);

insert into public.exercises (nombre, dia, categoria, orden, imagen_url, como_hacerlo)
values (
  'Press de banco con mancuernas',
  'C',
  'Torso',
  99,
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/press-banco-mancuernas.gif',
  'Paso inicial: Acuéstate en un banco plano con una mancuerna en cada mano. Asegúrate de que tus pies estén firmemente apoyados en el suelo y tu espalda esté bien apoyada en el banco. Sostén las mancuernas a la altura de los hombros, con las palmas de las manos mirando hacia adelante.

Posición corporal: Mantén una postura estable y activa el núcleo para mantener una buena estabilidad durante todo el ejercicio. Mantén los codos ligeramente flexionados y los hombros hacia abajo y hacia atrás.

Movimiento: Empuja las mancuernas hacia arriba, extendiendo los brazos mientras mantienes las palmas mirando hacia adelante. Mantén los codos alineados con los hombros y evita que se desvíen hacia afuera.

Contracción: Cuando las mancuernas estén cerca de la posición final, contrae los músculos del pecho, sintiendo la tensión en la zona pectoral. Mantén la posición durante un segundo para maximizar la contracción muscular.

Regreso: Lentamente, baja las mancuernas hacia abajo, doblando los codos y manteniendo el control del movimiento. Evita que las mancuernas toquen el pecho por completo para mantener la tensión en los músculos del pecho.

Consejo como Entrenador:

Asegúrate de mantener una técnica adecuada en todo momento.

Evita arquear la espalda, mantener los codos demasiado abiertos o bloquear los codos al final del movimiento.

También es importante utilizar un peso adecuado que te permita mantener la forma correcta y completar el rango de movimiento completo.

Recuerda que la calidad del movimiento es más importante que la cantidad de peso levantado.'
);

insert into public.exercises (nombre, dia, categoria, orden, imagen_url, como_hacerlo)
values (
  'Encogimiento de hombros con barra',
  'C',
  'Torso',
  99,
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/encogimiento-hombros-barra.gif',
  'Paso inicial: Colócate de pie con los pies a la anchura de los hombros y sostén una barra con un agarre pronado (palmas hacia abajo) y las manos separadas a la distancia de los hombros.

Posición corporal: Mantén la espalda recta, los hombros hacia atrás y el pecho hacia afuera. Mantén una ligera flexión en las rodillas para mayor estabilidad.

Movimiento: Eleva los hombros hacia arriba en dirección a las orejas lo más que puedas. Asegúrate de mantener los brazos rectos durante todo el movimiento y no encorvar la espalda. En la posición más alta del movimiento, realiza una breve contracción sosteniendo los hombros en su posición elevada.

Regreso: Lentamente baja los hombros de vuelta a la posición inicial bajo control.

Consejo como Entrenador:

Evita usar un peso excesivo que pueda comprometer la técnica.

Realiza el ejercicio de forma controlada y enfócate en sentir la contracción en los músculos del hombro durante todo el movimiento.'
);

insert into public.exercises (nombre, dia, categoria, orden, imagen_url, como_hacerlo)
values (
  'Remo con barra parado',
  'C',
  'Torso',
  99,
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/remo-barra-parado.gif',
  'Paso inicial: Colócate de pie con los pies separados al ancho de los hombros y las rodillas ligeramente flexionadas. Sujeta la barra con un agarre pronado (palmas hacia abajo) y separa las manos a una distancia un poco mayor que el ancho de los hombros.

Posición corporal: Mantén la espalda recta, el pecho hacia adelante y los hombros hacia atrás. Esto te ayudará a mantener una buena postura durante todo el ejercicio.

Movimiento: Inicia el movimiento llevando la barra hacia arriba, manteniendo los codos cerca del cuerpo. A medida que subes la barra, los codos se deben dirigir hacia atrás, apuntando hacia el techo.

Contracción: Cuando la barra esté cerca del torso, contrae los músculos de la espalda, especialmente los músculos del área de los omóplatos. Mantén la posición durante un segundo para sentir la contracción muscular.

Regreso: Baja la barra lentamente, controlando el movimiento y manteniendo la tensión en los músculos de la espalda. Vuelve a la posición inicial y repite el movimiento para completar el número deseado de repeticiones.

Consejo como Entrenador:

Asegúrate de mantener una buena postura y técnica durante todo el ejercicio.

Mantén la espalda recta y evita hacer balanceo con el cuerpo. Mantén los codos cerca del cuerpo durante el movimiento.

Ajusta el peso de la barra para tener una buena ejecución'
);

insert into public.exercises (nombre, dia, categoria, orden, imagen_url, como_hacerlo)
values (
  'Remo arrodillado en polea alta',
  'C',
  'Torso',
  99,
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/remo-arrodillado-polea-alta.gif',
  'Paso inicial: Ajusta la polea alta en el gimnasio y coloca la cuerda o soga en el gancho correspondiente. Ajusta el peso en la máquina de acuerdo a tu nivel de fuerza y condición física. Coloca una esterilla o almohadilla en el suelo para arrodillarte cómodamente.

Posición corporal: Arrodíllate frente a la máquina de polea alta, manteniendo las rodillas separadas a la altura de los hombros. Asegúrate de que tus rodillas estén en contacto con el suelo y que tu espalda esté recta. Agarra la soga con ambas manos, con las palmas en pronación y mantén las manos a la altura de tus hombros. Estira completamente tus brazos y mantén una ligera inclinación hacia atrás en la parte superior de tu cuerpo.

Movimiento: Desde esta posición inicial, tira de la cuerda hacia tu cara llevando los codos hacia afuera y hacia abajo. Contrae los músculos de la parte superior de la espalda y los hombros mientras llevas la cuerda hacia tu mentón. Mantén una pausa breve cuando llegues a la posición para sentir la contracción en los músculos de la espalda.

Empuje y regreso: De manera controlada, vuelve a estirar los brazos para llevar la cuerda de regreso a la posición inicial. Extiende completamente los codos al final del movimiento. Repite el movimiento durante el número deseado de repeticiones.

Consejo como Entrenador:

Controla siempre la velocidad del movimiento y evita utilizar un peso excesivo. La forma adecuada es más importante que la cantidad de peso que levantas.

Mantén los hombros hacia abajo y hacia atrás durante todo el movimiento para enfocarte en los músculos de la espalda.

Respira de manera adecuada: exhala al tirar de la cuerda y exhala al regresarla a la posición inicial.

No utilices impulso excesivo ni movimiento de balanceo. La técnica adecuada es esencial para evitar lesiones.'
);

insert into public.exercises (nombre, dia, categoria, orden, imagen_url, como_hacerlo)
values (
  'Deltoides posteriores en banco inclinado con mancuernas',
  'C',
  'Torso',
  99,
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/deltoides-posteriores-banco-inclinado-mancuernas.gif',
  'Paso inicial: Colócate en un banco inclinado a aproximadamente 45 grados. Toma una mancuerna en cada mano y coloca los pies firmemente en el suelo.

Posición corporal: Mantén la espalda recta y el núcleo activado. Deja que los brazos cuelguen rectos hacia abajo con las palmas mirando hacia tu cuerpo.

Movimiento: Inhala y levanta las mancuernas hacia los lados, manteniendo los brazos ligeramente flexionados. Los codos deben apuntar hacia afuera y los hombros deben estar hacia abajo y hacia atrás. Cuando las mancuernas estén cerca de tu pecho, exhala y contrae los deltoides posteriores. Mantén la posición durante un segundo para sentir la contracción muscular.

Regreso: Lentamente, baja las mancuernas de vuelta a la posición inicial, controlando el movimiento y evitando que los brazos se estiren por completo.

Consejo como Entrenador:

Asegúrate de mantener la inclinación de 45 grados durante todo el ejercicio para enfocarte en los deltoides posteriores.

Evita balancear el cuerpo o usar impulso para levantar las mancuernas.

Mantén el enfoque en los músculos de la espalda y los hombros, y evita la tensión excesiva en el cuello y los brazos.'
);

insert into public.exercises (nombre, dia, categoria, orden, imagen_url, como_hacerlo)
values (
  'Cuádriceps en prensa',
  'D',
  'Legs',
  99,
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/cuadriceps-prensa.gif',
  'Paso inicial: Siéntate en la máquina de prensa con la espalda bien apoyada contra el respaldo.
Coloca los pies en la plataforma a una distancia ligeramente más estrecha que el ancho de los hombros, con las puntas de los pies ligeramente hacia afuera.
Asegúrate de que las rodillas estén alineadas con los pies para evitar estrés en las articulaciones.

Posición inicial: Libera los seguros de la máquina y extiende las piernas sin bloquear completamente las rodillas.
Agarra las asas de la máquina para mayor estabilidad.

Movimiento: Inhala y comienza a bajar la plataforma doblando las rodillas, manteniendo el control y la espalda apoyada en el respaldo.
Baja hasta que las rodillas formen un ángulo de 90 grados o hasta donde te sientas cómodo sin comprometer la forma.

Contracción: Pausa brevemente en la parte inferior del movimiento para maximizar la activación de los cuádriceps.

Regreso: Exhala y empuja la plataforma hacia arriba extendiendo las piernas de manera controlada, evitando el bloqueo completo de las rodillas.
Mantén la tensión en los cuádriceps durante todo el movimiento.

Consejo como Entrenador:

Evita arquear la espalda o levantar los talones de la plataforma.

Controla el movimiento en todo momento y evita hacer rebotes o utilizar impulso para levantar la carga.

Ajusta la carga de acuerdo a tu nivel de condición física y aumenta gradualmente a medida que te sientas más cómodo y fuerte en el ejercicio.'
);

insert into public.exercises (nombre, dia, categoria, orden, imagen_url, como_hacerlo)
values (
  'Sentadilla en máquina Smith',
  'D',
  'Legs',
  99,
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/sentadilla-smith.gif',
  'Paso inicial: Colócate debajo de la barra de la máquina Smith y apoya la parte superior de los hombros debajo de la barra.
Sujeta la barra con las manos a una distancia ligeramente superior al ancho de los hombros.

Posición inicial: Párate con los pies separados al ancho de los hombros y mira hacia adelante.
La barra debe estar descansando en la parte superior de los hombros, sostenida por la máquina Smith.

Movimiento: Inhala profundamente y flexiona las rodillas para bajar el cuerpo hacia el suelo.
Baja lentamente hasta que tus muslos estén paralelos al suelo o hasta donde sea cómodo para ti.
Mantén el equilibrio y la estabilidad durante todo el movimiento.

Contracción: Mantén la posición baja durante un segundo, asegurándote de tener el control y la estabilidad.

Regreso: Exhala mientras empujas a través de los talones para volver a la posición inicial.
Mantén el control del movimiento y repite según sea necesario.

Consejo como Entrenador:

Ajusta la altura de la barra de la máquina Smith para que esté a la altura de tus hombros o un poco más baja.

Utiliza un peso adecuado que te permita realizar el ejercicio con buena forma y control.

Mantén una postura estable y el equilibrio en todo momento.

Controla el movimiento y evita balancearte hacia adelante o hacia atrás.

Mantén el pecho erguido y la espalda recta durante todo el ejercicio.'
);

insert into public.exercises (nombre, dia, categoria, orden, imagen_url, como_hacerlo)
values (
  'Estocadas',
  'D',
  'Legs',
  99,
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/estocadas.gif',
  'Paso inicial: Párate derecho con los pies juntos y las manos en las caderas o sosteniendo mancuernas a los lados.
Mantén la postura erguida y el núcleo activado.

Posición corporal: Da un paso amplio hacia adelante con una pierna, asegurándote de mantener el torso recto y erguido.
La pierna trasera debe estar recta y el talón elevado.

Movimiento: Inhala y comienza a bajar el cuerpo doblando ambas rodillas hasta que la pierna delantera esté paralela al suelo y la rodilla trasera casi toque el suelo.
Mantén el peso en el talón de la pierna delantera y la rodilla alineada con el tobillo.

Contracción: Mantén la posición baja durante un segundo, asegurándote de que el núcleo esté activado y la postura sea correcta.

Regreso: Exhala mientras empujas a través del talón de la pierna delantera para regresar a la posición inicial.
Repite el movimiento con la otra pierna, alternando las piernas con cada repetición.

Consejo como Entrenador:

Mantén el torso erguido y la espalda recta durante todo el movimiento.

Asegúrate de que la rodilla de la pierna delantera no pase la punta del pie al bajar.

Mantén la mirada hacia adelante y el núcleo activado para mejorar el equilibrio.

Utiliza un peso que te permita realizar el movimiento con control y buena forma.

Respira profundamente antes de bajar y exhala al subir.'
);

insert into public.exercises (nombre, dia, categoria, orden, imagen_url, como_hacerlo)
values (
  'Sentadilla isométrica',
  'D',
  'Legs',
  99,
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/sentadilla-isometrica.gif',
  'Paso inicial: Encuentra una pared plana y despejada.
Párate con la espalda apoyada contra la pared y los pies separados al ancho de los hombros, a unos 30-50 cm de la pared.

Posición corporal: Deslízate hacia abajo por la pared hasta que tus muslos estén paralelos al suelo, como si estuvieras sentado en una silla.
Mantén las rodillas en un ángulo de 90 grados y asegúrate de que estén alineadas con los tobillos, sin que las rodillas pasen de la punta de los pies.

Isometría: Mantén la posición, manteniendo el núcleo activado y el pecho erguido.
Mantén los brazos relajados a los lados o cruzados sobre el pecho.
Mantén la postura durante el tiempo deseado, asegurándote de mantener una respiración constante y controlada.

Regreso: Para finalizar el ejercicio, empuja hacia arriba con los pies y deslízate hacia arriba por la pared hasta volver a la posición de pie.

Consejo como Entrenador:

Mantén el pecho erguido y la espalda recta durante todo el ejercicio.

Asegúrate de que las rodillas estén alineadas con los pies y no se desplacen hacia adentro.

Mantén el núcleo activado para mejorar la estabilidad y reducir la tensión en la espalda baja.

Respira de manera controlada y constante durante la isometría.'
);

insert into public.exercises (nombre, dia, categoria, orden, imagen_url, como_hacerlo)
values (
  'Elevación de talón parado',
  'D',
  'Legs',
  99,
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/elevacion-talon-parado.gif',
  'Paso inicial: Ajusta la máquina de elevación de talones para que se acomode a tu altura.
Coloca los hombros debajo de las almohadillas de soporte y las puntas de los pies en el borde de la plataforma.
Los talones deben estar colgando fuera de la plataforma.

Posición inicial: Ponte de pie con los pies separados al ancho de los hombros.
Mantén una ligera flexión en las rodillas.
Agarra las asas de la máquina si están disponibles para mayor estabilidad.
Mantén el core activado y la espalda recta.

Movimiento: Inhala y comienza a levantar los talones empujando hacia arriba con las puntas de los pies.
Sube hasta que estés en la posición de puntillas, sintiendo una buena contracción en los músculos de la pantorrilla.

Contracción: Pausa brevemente en la parte superior del movimiento para maximizar la contracción en los músculos de la pantorrilla.

Regreso: Exhala y baja lentamente los talones de vuelta a la posición inicial, permitiendo que los talones bajen lo más que puedas sin perder el control.
Mantén la tensión en las pantorrillas durante todo el movimiento.

Consejo como Entrenador:

Utiliza un rango completo de movimiento, bajando los talones por debajo del nivel del suelo.

Mantén el abdomen contraído para estabilizar el torso durante el ejercicio.

Controla el peso en todo momento y evita balancearte hacia adelante o hacia atrás.'
);

insert into public.exercises (nombre, dia, categoria, orden, imagen_url, como_hacerlo)
values (
  'Elevación de talón sentado con mancuerna',
  'D',
  'Legs',
  99,
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/elevacion-talon-sentado-mancuerna.gif',
  'Paso inicial: Siéntate en un banco con una mancuerna en cada mano.
Coloca la parte delantera de los pies sobre una superficie elevada (como un escalón o una placa de pesas), dejando los talones colgando en el aire.
Coloca las mancuernas sobre los muslos, cerca de las rodillas, para añadir resistencia.

Posición inicial: Asegúrate de que tus pies estén separados al ancho de las caderas.
Mantén una postura erguida con la espalda recta y el core activado.

Movimiento: Inhala profundamente y, empujando a través de la parte delantera de los pies, levanta los talones lo más alto posible.
Concéntrate en contraer los músculos de las pantorrillas al levantar los talones.

Contracción: Mantén la contracción en la parte superior del movimiento durante un breve segundo para maximizar la activación de las pantorrillas.
Asegúrate de sentir la tensión en los músculos de las pantorrillas.

Regreso: Exhala y baja lentamente los talones de vuelta a la posición inicial, permitiendo que los talones desciendan ligeramente por debajo del nivel de la superficie elevada para un estiramiento completo de las pantorrillas.
Mantén el control del movimiento durante todo el descenso.

Consejo como Entrenador:

Mantén una buena postura durante todo el ejercicio, con la espalda recta y el core comprometido.

Realiza el movimiento de manera lenta y controlada para maximizar la activación muscular y evitar lesiones.

Concéntrate en apretar los músculos de la pantorrilla en la parte superior del movimiento.

Respira de manera constante: exhala al levantar los talones e inhala al bajarlos.'
);

-- ============ LINKS alternativa_id ============
update public.exercises
set alternativa_id = (select id from public.exercises where nombre = 'Remo en máquina sentado')
where nombre = 'Remo en polea baja a un brazo sentado' and dia = 'B' and routine_id is not null;

update public.exercises
set alternativa_id = (select id from public.exercises where nombre = 'Dorsales en máquina')
where nombre = 'Jalón lateral con polea a un brazo' and dia = 'B' and routine_id is not null;

update public.exercises
set alternativa_id = (select id from public.exercises where nombre = 'Curl femoral sentado')
where nombre = 'Curl femoral' and dia = 'B' and routine_id is not null;

update public.exercises
set alternativa_id = (select id from public.exercises where nombre = 'Peso muerto rumano')
where nombre = 'Hiperextensiones' and dia = 'B' and routine_id is not null;

update public.exercises
set alternativa_id = (select id from public.exercises where nombre = 'Curl de bíceps con mancuerna parado')
where nombre = 'Curl de bíceps en banco inclinado con mancuernas' and dia = 'B' and routine_id is not null;

update public.exercises
set alternativa_id = (select id from public.exercises where nombre = 'Bíceps en banco Scott')
where nombre = 'Curl en polea a un brazo en banco Scott' and dia = 'B' and routine_id is not null;

update public.exercises
set alternativa_id = (select id from public.exercises where nombre = 'Press banco plano con barra')
where nombre = 'Press inclinado en máquina Smith' and dia = 'C' and routine_id is not null;

update public.exercises
set alternativa_id = (select id from public.exercises where nombre = 'Press de banco con mancuernas')
where nombre = 'Flexiones de brazos' and dia = 'C' and routine_id is not null;

update public.exercises
set alternativa_id = (select id from public.exercises where nombre = 'Encogimiento de hombros con barra')
where nombre = 'Encogimiento de hombros con mancuernas' and dia = 'C' and routine_id is not null;

update public.exercises
set alternativa_id = (select id from public.exercises where nombre = 'Remo con barra parado')
where nombre = 'Remo en máquina T (landmine)' and dia = 'C' and routine_id is not null;

update public.exercises
set alternativa_id = (select id from public.exercises where nombre = 'Remo arrodillado en polea alta')
where nombre = 'Remo con mancuerna a un brazo' and dia = 'C' and routine_id is not null;

update public.exercises
set alternativa_id = (select id from public.exercises where nombre = 'Deltoides posteriores en banco inclinado con mancuernas')
where nombre = 'Face pull' and dia = 'C' and routine_id is not null;

update public.exercises
set alternativa_id = (select id from public.exercises where nombre = 'Cuádriceps en prensa')
where nombre = 'Extensión de cuádriceps' and dia = 'D' and routine_id is not null;

update public.exercises
set alternativa_id = (select id from public.exercises where nombre = 'Sentadilla en máquina Smith')
where nombre = 'Sentadillas' and dia = 'D' and routine_id is not null;

update public.exercises
set alternativa_id = (select id from public.exercises where nombre = 'Estocadas')
where nombre = 'Estocada búlgara en el banco' and dia = 'D' and routine_id is not null;

update public.exercises
set alternativa_id = (select id from public.exercises where nombre = 'Sentadilla isométrica')
where nombre = 'Sentadilla sissy' and dia = 'D' and routine_id is not null;

update public.exercises
set alternativa_id = (select id from public.exercises where nombre = 'Elevación de talón parado')
where nombre = 'Elevación de talón en máquina Smith' and dia = 'D' and routine_id is not null;

update public.exercises
set alternativa_id = (select id from public.exercises where nombre = 'Elevación de talón sentado con mancuerna')
where nombre = 'Elevación de talón parado a una pierna' and dia = 'D' and routine_id is not null;

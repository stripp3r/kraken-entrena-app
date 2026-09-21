-- Migracion 054: 65 ejercicios nuevos del catalogo, extraidos del listado
-- autoritativo del Excel original (Hoja2) y con GIF real de la biblioteca de
-- referencia oficial (NUNCA las imagenes incrustadas del Excel, que son solo
-- capturas de esos mismos GIF -- ver CLAUDE.md).
--
-- Confirmados sin GIF real disponible en la biblioteca (quedan afuera a
-- proposito, no inventar un reemplazo): Sentadilla con cinturon (belt squat),
-- Curl femoral con mancuerna, Estocadas para gluteos landmine, Sentadilla
-- asistida (solo existia una foto estatica .jfif, no un GIF).
--
-- Correr en el SQL Editor de Supabase despues de subir los 65 GIF al bucket
-- `ejercicios` (ya subidos en esta sesion).

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Chin up agarre cerrado', 'Pull',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/chin-up-agarre-cerrado.gif',
  'Colgate de la barra con agarre cerrado y prono (manos casi juntas). Tirá de tu cuerpo hacia arriba hasta que el mentón pase la barra, llevando los codos hacia abajo y atrás. Bajá controlado hasta la extensión completa. El agarre cerrado exige más de los brazos que la dominada estándar.',
  'compuesto', false, ARRAY['Espalda','Bíceps']
where not exists (select 1 from public.exercise_definitions where nombre = 'Chin up agarre cerrado');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Dominada asistida con banda elástica', 'Pull',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/dominada-asistida-banda-elastica.gif',
  'Enganchá una banda elástica en la barra y apoyá una rodilla o el pie dentro del lazo. La banda te empuja hacia arriba en la parte más difícil del recorrido. Hacé el movimiento completo de la dominada con el impulso asistido, y a medida que ganes fuerza usá una banda de menor resistencia.',
  'compuesto', false, ARRAY['Espalda','Bíceps']
where not exists (select 1 from public.exercise_definitions where nombre = 'Dominada asistida con banda elástica');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Dominada con agarre invertido', 'Pull',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/dominada-agarre-invertido.gif',
  'Agarrá la barra con las palmas mirando hacia vos (agarre supino). Tirá de tu cuerpo hacia arriba manteniendo el torso estable, hasta que el mentón supere la barra. Bajá de forma controlada. El agarre invertido suma más participación del bíceps que la dominada tradicional.',
  'compuesto', false, ARRAY['Espalda','Bíceps']
where not exists (select 1 from public.exercise_definitions where nombre = 'Dominada con agarre invertido');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Dominadas (Pull ups)', 'Pull',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/dominadas-pull-ups.gif',
  'Colgate de la barra con agarre prono, un poco más ancho que los hombros. Tirá hacia arriba llevando el pecho hacia la barra, sin balancear el cuerpo. Bajá controlado hasta los brazos extendidos. Es el ejercicio base de espalda con el propio peso corporal.',
  'compuesto', false, ARRAY['Espalda','Bíceps']
where not exists (select 1 from public.exercise_definitions where nombre = 'Dominadas (Pull ups)');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Dorsales en polea alta agarre cerrado', 'Pull',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/dorsales-polea-alta-agarre-cerrado.gif',
  'Sentate en la máquina de jalón con las piernas fijas, usando la barra en V o un agarre cerrado. Tirá de la barra hacia la parte alta del pecho llevando los codos hacia abajo y adelante. Volvé controlado a la extensión completa. El agarre cerrado enfatiza la parte baja del dorsal.',
  'compuesto', false, ARRAY['Espalda','Bíceps']
where not exists (select 1 from public.exercise_definitions where nombre = 'Dorsales en polea alta agarre cerrado');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Dorsales en polea alta agarre supino', 'Pull',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/dorsales-polea-alta-agarre-supino.gif',
  'Sentate en la máquina de jalón con agarre supino (palmas hacia vos), manos a la altura de los hombros. Tirá de la barra hacia el pecho llevando los codos hacia abajo. Volvé controlado. El agarre supino suma más trabajo de bíceps que el agarre pronado tradicional.',
  'compuesto', false, ARRAY['Espalda','Bíceps']
where not exists (select 1 from public.exercise_definitions where nombre = 'Dorsales en polea alta agarre supino');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Remo alto con cable a un brazo', 'Pull',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/remo-alto-cable-un-brazo.gif',
  'De pie frente a la polea alta, tomá el agarre con un brazo y girá levemente el torso al tirar. Llevá el codo hacia atrás y arriba, apretando el omóplato. Volvé controlado a la posición inicial. Completá las repeticiones de un lado antes de cambiar.',
  'compuesto', true, ARRAY['Espalda']
where not exists (select 1 from public.exercise_definitions where nombre = 'Remo alto con cable a un brazo');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Pulldown a un brazo en polea alta', 'Pull',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/pulldown-un-brazo-polea-alta.gif',
  'Sentate o parate frente a la polea alta con un agarre de un solo brazo. Tirá hacia abajo y atrás llevando el codo cerca del cuerpo, apretando el dorsal al final del recorrido. Volvé controlado. Completá las repeticiones de un brazo antes de cambiar.',
  'compuesto', true, ARRAY['Espalda']
where not exists (select 1 from public.exercise_definitions where nombre = 'Pulldown a un brazo en polea alta');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Remo parado con barra agarre cerrado', 'Pull',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/remo-parado-barra-agarre-cerrado.gif',
  'De pie, inclinado hacia adelante con la espalda recta, tomá la barra con agarre cerrado. Tirá de la barra hacia el abdomen llevando los codos pegados al cuerpo. Bajá controlado sin perder la postura de la espalda. El agarre cerrado suma más trabajo de la espalda media.',
  'compuesto', false, ARRAY['Espalda','Bíceps']
where not exists (select 1 from public.exercise_definitions where nombre = 'Remo parado con barra agarre cerrado');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Pull over en polea', 'Pull',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/pull-over-en-polea.gif',
  'De pie frente a la polea alta con cuerda, brazos extendidos por encima de la cabeza. Llevá los brazos hacia abajo y adelante, manteniéndolos levemente flexionados, hasta la altura de los muslos. Volvé controlado a la posición inicial sintiendo el estiramiento del dorsal.',
  'aislado', false, ARRAY['Espalda','Pecho']
where not exists (select 1 from public.exercise_definitions where nombre = 'Pull over en polea');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Aperturas con mancuernas inclinada', 'Push',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/aperturas-mancuernas-inclinada.gif',
  'Acostate en un banco inclinado con una mancuerna en cada mano, brazos extendidos sobre el pecho con leve flexión de codo. Abrí los brazos hacia los costados en arco hasta sentir el estiramiento del pecho. Volvé al punto inicial apretando el pecho arriba.',
  'aislado', false, ARRAY['Pecho']
where not exists (select 1 from public.exercise_definitions where nombre = 'Aperturas con mancuernas inclinada');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Aperturas en polea acostado', 'Push',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/aperturas-polea-acostado.gif',
  'Acostate en el piso o un banco bajo entre dos poleas bajas, con un cable en cada mano. Llevá los brazos hacia arriba y adelante en arco, juntándolos sobre el pecho. Volvé controlado a la posición inicial.',
  'aislado', false, ARRAY['Pecho']
where not exists (select 1 from public.exercise_definitions where nombre = 'Aperturas en polea acostado');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Aperturas inclinadas en máquina', 'Push',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/aperturas-inclinadas-maquina.gif',
  'Sentate en la máquina de aperturas ajustada en ángulo inclinado, con los brazos apoyados en las palancas. Juntá los brazos al frente en arco, apretando el pecho. Volvé controlado hasta sentir el estiramiento.',
  'aislado', false, ARRAY['Pecho']
where not exists (select 1 from public.exercise_definitions where nombre = 'Aperturas inclinadas en máquina');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Aperturas inclinadas en polea alta', 'Push',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/aperturas-inclinadas-polea-alta.gif',
  'De pie entre dos poleas altas, inclinado levemente hacia adelante, tomá un cable en cada mano. Llevá los brazos hacia abajo y adelante en arco, hasta juntarlos frente al abdomen. Volvé controlado a la posición inicial.',
  'aislado', false, ARRAY['Pecho']
where not exists (select 1 from public.exercise_definitions where nombre = 'Aperturas inclinadas en polea alta');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Cruce en polea parado (apertura)', 'Push',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/cruce-polea-parado.gif',
  'De pie en el centro de la máquina de cruce de poleas, con un cable en cada mano a la altura de los hombros. Llevá los brazos hacia adelante y abajo cruzándolos levemente frente al cuerpo. Volvé controlado a la posición inicial.',
  'aislado', false, ARRAY['Pecho']
where not exists (select 1 from public.exercise_definitions where nombre = 'Cruce en polea parado (apertura)');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Flexiones con rodillas apoyadas', 'Push',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/flexiones-rodillas-apoyadas.gif',
  'Apoyá las rodillas y las manos en el piso, un poco más anchas que los hombros, con el torso alineado desde las rodillas a la cabeza. Bajá el pecho hacia el piso flexionando los codos, y empujá de vuelta arriba. Variante más accesible de la flexión de brazos estándar.',
  'compuesto', false, ARRAY['Pecho','Tríceps']
where not exists (select 1 from public.exercise_definitions where nombre = 'Flexiones con rodillas apoyadas');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Fondos en paralelas asistida', 'Push',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/fondos-paralelas-asistida.gif',
  'Usá la máquina asistida (contrapeso o banda) para reducir el peso corporal en los fondos. Bajá el cuerpo flexionando los codos hasta 90°, manteniendo el torso levemente inclinado, y empujá de vuelta arriba. Bajá la asistencia a medida que ganes fuerza.',
  'compuesto', false, ARRAY['Pecho','Tríceps']
where not exists (select 1 from public.exercise_definitions where nombre = 'Fondos en paralelas asistida');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Press banco inclinado con barra', 'Push',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/press-banco-inclinado-barra.gif',
  'Acostate en un banco inclinado (30-45°) con la barra a la altura del pecho superior, agarre un poco más ancho que los hombros. Bajá la barra controlada hasta tocar la parte alta del pecho, y empujá hacia arriba hasta extender los brazos.',
  'compuesto', false, ARRAY['Pecho']
where not exists (select 1 from public.exercise_definitions where nombre = 'Press banco inclinado con barra');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Press de pecho en banco inclinado con poleas', 'Push',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/press-pecho-inclinado-poleas.gif',
  'Sentate en un banco inclinado entre dos poleas bajas, con un cable en cada mano a la altura del pecho. Empujá hacia adelante y arriba hasta extender los brazos, y volvé controlado a la posición inicial.',
  'compuesto', false, ARRAY['Pecho']
where not exists (select 1 from public.exercise_definitions where nombre = 'Press de pecho en banco inclinado con poleas');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Press de pecho inclinado en máquina', 'Push',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/press-pecho-inclinado-maquina.gif',
  'Sentate en la máquina de press inclinado con la espalda apoyada y las manos en las agarraderas a la altura del pecho superior. Empujá hacia adelante hasta extender los brazos, y volvé controlado.',
  'compuesto', false, ARRAY['Pecho']
where not exists (select 1 from public.exercise_definitions where nombre = 'Press de pecho inclinado en máquina');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Press de pecho inclinado en máquina Hammer', 'Push',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/press-pecho-inclinado-maquina-hammer.gif',
  'Sentate en la máquina Hammer de press inclinado, con las manos en las agarraderas independientes a la altura del pecho. Empujá hacia adelante y arriba hasta extender los brazos, y volvé controlado. El agarre independiente permite un recorrido más natural.',
  'compuesto', false, ARRAY['Pecho']
where not exists (select 1 from public.exercise_definitions where nombre = 'Press de pecho inclinado en máquina Hammer');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Press martillo con mancuernas inclinado', 'Push',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/press-martillo-mancuernas-inclinado.gif',
  'Acostate en un banco inclinado con una mancuerna en cada mano, agarre neutro (palmas enfrentadas) a la altura del pecho. Empujá hacia arriba hasta extender los brazos, y bajá controlado. El agarre neutro suma trabajo de tríceps.',
  'compuesto', false, ARRAY['Pecho','Hombros']
where not exists (select 1 from public.exercise_definitions where nombre = 'Press martillo con mancuernas inclinado');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Press de banca cerrado con mancuernas', 'Push',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/press-banca-cerrado-mancuernas.gif',
  'Acostate en un banco plano con una mancuerna en cada mano, manteniéndolas juntas sobre el pecho durante todo el movimiento. Bajá controlado hasta el pecho y empujá hacia arriba. El agarre cerrado suma más trabajo de tríceps que el press estándar.',
  'compuesto', false, ARRAY['Pecho','Tríceps']
where not exists (select 1 from public.exercise_definitions where nombre = 'Press de banca cerrado con mancuernas');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Extensión de tríceps en polea arrodillado', 'Push',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/extension-triceps-polea-arrodillado.gif',
  'Arrodillate de espaldas a la polea alta, con la cuerda o barra sujeta detrás de la cabeza. Extendé los brazos hacia adelante y arriba, manteniendo los codos fijos, y volvé controlado. La posición arrodillada estabiliza el torso.',
  'aislado', false, ARRAY['Tríceps']
where not exists (select 1 from public.exercise_definitions where nombre = 'Extensión de tríceps en polea arrodillado');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Press de banca agarre cerrado supino', 'Push',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/press-banca-agarre-cerrado-supino.gif',
  'Acostate en el banco con la barra en agarre cerrado y supino (palmas hacia vos, si el agarre lo permite) o cerrado pronado. Bajá la barra controlada hasta el pecho y empujá hacia arriba. Enfatiza el tríceps más que el press estándar.',
  'compuesto', false, ARRAY['Pecho','Tríceps']
where not exists (select 1 from public.exercise_definitions where nombre = 'Press de banca agarre cerrado supino');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Tríceps agarre supino en polea alta a un brazo', 'Push',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/triceps-agarre-supino-polea-alta-un-brazo.gif',
  'De pie frente a la polea alta, tomá el agarre con una mano en supinación (palma hacia arriba). Extendé el brazo hacia abajo manteniendo el codo pegado al cuerpo, y volvé controlado. Completá un brazo antes de cambiar.',
  'aislado', true, ARRAY['Tríceps']
where not exists (select 1 from public.exercise_definitions where nombre = 'Tríceps agarre supino en polea alta a un brazo');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Tríceps en polea alta a un brazo', 'Push',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/triceps-polea-alta-un-brazo.gif',
  'De pie frente a la polea alta, tomá el agarre con una mano en pronación. Extendé el brazo hacia abajo manteniendo el codo pegado al cuerpo, y volvé controlado. Completá un brazo antes de cambiar.',
  'aislado', true, ARRAY['Tríceps']
where not exists (select 1 from public.exercise_definitions where nombre = 'Tríceps en polea alta a un brazo');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Press francés en polea parado', 'Push',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/press-frances-polea-parado.gif',
  'De pie de espaldas a la polea alta, con la cuerda sujeta detrás de la cabeza y los codos apuntando hacia arriba. Extendé los brazos hacia adelante y arriba, manteniendo los codos fijos, y volvé controlado.',
  'aislado', false, ARRAY['Tríceps']
where not exists (select 1 from public.exercise_definitions where nombre = 'Press francés en polea parado');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Fondo en banco (pies en el piso)', 'Push',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/fondo-banco-pies-piso.gif',
  'Apoyá las manos en el borde de un banco detrás tuyo y los pies en el piso con las rodillas flexionadas. Bajá el cuerpo flexionando los codos, y empujá de vuelta arriba. Variante más accesible que el fondo con piernas extendidas.',
  'compuesto', false, ARRAY['Tríceps','Pecho']
where not exists (select 1 from public.exercise_definitions where nombre = 'Fondo en banco (pies en el piso)');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Deltoides posteriores banco inclinado con barra', 'Torso',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/deltoides-posteriores-banco-inclinado-barra.gif',
  'Acostate boca abajo en un banco inclinado, con una barra sostenida con los brazos colgando. Elevá la barra hacia los costados llevando los omóplatos hacia atrás, y bajá controlado. El apoyo en el banco elimina el impulso del cuerpo.',
  'aislado', false, ARRAY['Hombros']
where not exists (select 1 from public.exercise_definitions where nombre = 'Deltoides posteriores banco inclinado con barra');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Press militar en máquina Smith', 'Torso',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/press-militar-maquina-smith.gif',
  'Sentate o parate bajo la barra de la máquina Smith, agarre a la altura de los hombros. Empujá la barra hacia arriba hasta extender los brazos, y bajá controlado hasta la altura de los hombros. La guía fija facilita concentrarte en el empuje.',
  'compuesto', false, ARRAY['Hombros']
where not exists (select 1 from public.exercise_definitions where nombre = 'Press militar en máquina Smith');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Press de hombro sentado con barra al frente', 'Torso',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/press-hombro-sentado-barra-frente.gif',
  'Sentate en un banco con respaldo, la barra apoyada a la altura de los hombros por delante del cuello. Empujá hacia arriba hasta extender los brazos, y bajá controlado. Mantené el torso estable sin arquear la espalda baja.',
  'compuesto', false, ARRAY['Hombros']
where not exists (select 1 from public.exercise_definitions where nombre = 'Press de hombro sentado con barra al frente');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Remo al mentón en polea', 'Torso',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/remo-menton-polea.gif',
  'De pie frente a la polea baja con una barra o cuerda, agarre cerrado. Tirá hacia arriba llevando los codos hacia afuera y arriba hasta la altura del mentón, y bajá controlado.',
  'compuesto', false, ARRAY['Hombros','Espalda']
where not exists (select 1 from public.exercise_definitions where nombre = 'Remo al mentón en polea');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Vuelo frontal con disco', 'Torso',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/vuelo-frontal-disco.gif',
  'De pie con un disco sostenido con ambas manos frente a los muslos. Elevá el disco al frente hasta la altura de los hombros, manteniendo los brazos casi extendidos. Bajá controlado.',
  'aislado', false, ARRAY['Hombros']
where not exists (select 1 from public.exercise_definitions where nombre = 'Vuelo frontal con disco');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Encogimiento de hombros con polea', 'Torso',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/encogimiento-hombros-polea.gif',
  'De pie frente a la polea baja, con el cable sostenido con ambas manos y los brazos extendidos. Elevá los hombros hacia las orejas sin flexionar los codos, y bajá controlado.',
  'aislado', false, ARRAY['Espalda']
where not exists (select 1 from public.exercise_definitions where nombre = 'Encogimiento de hombros con polea');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Encogimientos de hombros banco inclinado', 'Torso',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/encogimiento-hombros-banco-inclinado.gif',
  'Acostate boca abajo en un banco inclinado con una mancuerna en cada mano, brazos colgando. Elevá los hombros hacia las orejas, y bajá controlado. La posición inclinada aísla mejor el trapecio superior.',
  'aislado', false, ARRAY['Espalda']
where not exists (select 1 from public.exercise_definitions where nombre = 'Encogimientos de hombros banco inclinado');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Curl bíceps con barra en polea baja', 'Pull',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/curl-biceps-barra-polea-baja.gif',
  'De pie frente a la polea baja con una barra recta o EZ, agarre supino. Flexioná los codos llevando la barra hacia el pecho, manteniendo los codos pegados al cuerpo. Bajá controlado.',
  'aislado', false, ARRAY['Bíceps']
where not exists (select 1 from public.exercise_definitions where nombre = 'Curl bíceps con barra en polea baja');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Curl con mancuernas alternas sentado', 'Pull',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/curl-mancuernas-alternas-sentado.gif',
  'Sentate en un banco con una mancuerna en cada mano, brazos colgando. Flexioná un brazo llevando la mancuerna hacia el hombro, y bajá mientras flexionás el otro. Alterná los brazos en cada repetición.',
  'aislado', false, ARRAY['Bíceps']
where not exists (select 1 from public.exercise_definitions where nombre = 'Curl con mancuernas alternas sentado');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Curl concentrado con mancuerna', 'Pull',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/curl-concentrado-mancuerna.gif',
  'Sentate en un banco, apoyá el codo contra la parte interna del muslo del mismo lado, sosteniendo una mancuerna. Flexioná el codo llevando la mancuerna hacia el hombro, y bajá controlado. El apoyo del codo aísla el bíceps al máximo.',
  'aislado', false, ARRAY['Bíceps']
where not exists (select 1 from public.exercise_definitions where nombre = 'Curl concentrado con mancuerna');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Curl de bíceps a un brazo en polea baja', 'Pull',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/curl-biceps-un-brazo-polea-baja.gif',
  'De pie frente a la polea baja, tomá el agarre con una mano, codo pegado al cuerpo. Flexioná el codo llevando la mano hacia el hombro, y bajá controlado. Completá un brazo antes de cambiar.',
  'aislado', true, ARRAY['Bíceps']
where not exists (select 1 from public.exercise_definitions where nombre = 'Curl de bíceps a un brazo en polea baja');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Curl de bíceps inclinado en polea', 'Pull',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/curl-biceps-inclinado-polea.gif',
  'Sentate en un banco inclinado colocado frente a la polea baja, brazos extendidos hacia atrás sujetando el agarre. Flexioná los codos llevando las manos hacia los hombros, y bajá controlado. La posición inclinada mantiene tensión constante.',
  'aislado', false, ARRAY['Bíceps']
where not exists (select 1 from public.exercise_definitions where nombre = 'Curl de bíceps inclinado en polea');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Curl de bíceps pronación con mancuernas', 'Pull',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/curl-biceps-pronacion-mancuernas.gif',
  'De pie con una mancuerna en cada mano, agarre pronado (palmas hacia abajo). Flexioná los codos llevando las mancuernas hacia los hombros, manteniendo la pronación. Trabaja el antebrazo y la porción del bíceps de forma distinta al curl estándar.',
  'aislado', false, ARRAY['Bíceps']
where not exists (select 1 from public.exercise_definitions where nombre = 'Curl de bíceps pronación con mancuernas');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Curl en banco Scott supino', 'Pull',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/curl-banco-scott-supino.gif',
  'Sentate en el banco Scott con los brazos apoyados sobre el respaldo inclinado, agarre supino con barra EZ o recta. Flexioná los codos llevando la barra hacia los hombros, y bajá controlado sin despegar los brazos del banco.',
  'aislado', false, ARRAY['Bíceps']
where not exists (select 1 from public.exercise_definitions where nombre = 'Curl en banco Scott supino');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Abductores externos en polea', 'Legs',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/abductores-externos-polea.gif',
  'De pie al lado de la polea baja, con el cable enganchado al tobillo de la pierna más alejada. Llevá la pierna hacia afuera del cuerpo en abducción, y volvé controlado. Completá un lado antes de cambiar.',
  'aislado', true, ARRAY['Glúteos']
where not exists (select 1 from public.exercise_definitions where nombre = 'Abductores externos en polea');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Abductores internos en máquina', 'Legs',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/abductores-internos-maquina.gif',
  'Sentate en la máquina de aductores con las piernas apoyadas en las palancas acolchadas, separadas. Juntá las piernas presionando hacia el centro, y volvé controlado a la posición abierta.',
  'aislado', false, ARRAY['Glúteos']
where not exists (select 1 from public.exercise_definitions where nombre = 'Abductores internos en máquina');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Abductores internos en polea', 'Legs',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/abductores-internos-polea.gif',
  'De pie al lado de la polea baja, con el cable enganchado al tobillo de la pierna más cercana. Cruzá la pierna hacia el lado contrario del cuerpo en aducción, y volvé controlado. Completá un lado antes de cambiar.',
  'aislado', true, ARRAY['Glúteos']
where not exists (select 1 from public.exercise_definitions where nombre = 'Abductores internos en polea');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Sentadilla Goblet', 'Legs',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/sentadilla-goblet.gif',
  'Sostené una mancuerna o kettlebell verticalmente contra el pecho con ambas manos. Bajá en sentadilla manteniendo el torso erguido y los codos entre las rodillas, y subí empujando con los talones.',
  'compuesto', false, ARRAY['Cuádriceps','Glúteos']
where not exists (select 1 from public.exercise_definitions where nombre = 'Sentadilla Goblet');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Sentadilla pies elevados', 'Legs',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/sentadilla-pies-elevados.gif',
  'Con una barra en la espalda, colocá los pies sobre una plataforma o discos elevados. Bajá en sentadilla controlada y subí empujando con los talones. La elevación de los pies cambia el énfasis hacia el cuádriceps.',
  'compuesto', false, ARRAY['Cuádriceps','Glúteos']
where not exists (select 1 from public.exercise_definitions where nombre = 'Sentadilla pies elevados');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Sentadilla sumo con mancuerna', 'Legs',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/sentadilla-sumo-con-mancuerna.gif',
  'Parate con las piernas bien separadas y las puntas hacia afuera, sosteniendo una mancuerna con ambas manos entre las piernas. Bajá en sentadilla manteniendo el torso erguido, y subí empujando con los talones.',
  'compuesto', false, ARRAY['Cuádriceps','Glúteos']
where not exists (select 1 from public.exercise_definitions where nombre = 'Sentadilla sumo con mancuerna');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Sentadilla pistol', 'Legs',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/sentadilla-pistol.gif',
  'De pie sobre una pierna, extendé la otra pierna hacia adelante. Bajá en sentadilla sobre la pierna de apoyo lo más controlado posible, y subí. Es una sentadilla a una pierna avanzada, requiere fuerza y equilibrio.',
  'compuesto', true, ARRAY['Cuádriceps','Glúteos']
where not exists (select 1 from public.exercise_definitions where nombre = 'Sentadilla pistol');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Sentadilla pistol asistida', 'Legs',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/sentadilla-pistol-asistida.gif',
  'Sostenete de un soporte, banda o correa con una mano mientras hacés la sentadilla a una pierna. La asistencia te ayuda a mantener el equilibrio y controlar el descenso. Progresión hacia la sentadilla pistol libre.',
  'compuesto', true, ARRAY['Cuádriceps','Glúteos']
where not exists (select 1 from public.exercise_definitions where nombre = 'Sentadilla pistol asistida');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Sentadilla Smith', 'Legs',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/sentadilla-smith.gif',
  'Colocate bajo la barra de la máquina Smith con los pies levemente adelantados. Bajá en sentadilla controlada y subí empujando con los talones. La guía fija de la máquina facilita concentrarte en el descenso.',
  'compuesto', false, ARRAY['Cuádriceps','Glúteos']
where not exists (select 1 from public.exercise_definitions where nombre = 'Sentadilla Smith');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Sentadilla isométrica con pelota', 'Legs',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/sentadilla-isometrica-pelota.gif',
  'Apoyá la espalda contra una pelota suiza pegada a la pared, y bajá hasta que las rodillas queden en 90°. Mantené la posición isométrica el tiempo indicado, sin mover el torso.',
  'compuesto', false, ARRAY['Cuádriceps','Glúteos']
where not exists (select 1 from public.exercise_definitions where nombre = 'Sentadilla isométrica con pelota');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Step up con mancuernas', 'Legs',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/step-up-con-mancuernas.gif',
  'Con una mancuerna en cada mano, subí a un banco o cajón con una pierna, empujando con el talón hasta quedar parado arriba. Bajá controlado y repetí. Completá las repeticiones de una pierna antes de cambiar.',
  'compuesto', true, ARRAY['Cuádriceps','Glúteos']
where not exists (select 1 from public.exercise_definitions where nombre = 'Step up con mancuernas');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Femorales nórdicos', 'Legs',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/femorales-nordicos.gif',
  'Arrodillate con los tobillos sujetos por un compañero o un soporte fijo. Bajá el torso hacia adelante lo más controlado posible usando solo los isquiotibiales, y volvé (o apoyate con las manos si hace falta). Ejercicio avanzado de mucha exigencia excéntrica.',
  'aislado', false, ARRAY['Isquiotibiales']
where not exists (select 1 from public.exercise_definitions where nombre = 'Femorales nórdicos');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Curl femoral 1 pierna', 'Legs',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/curl-femoral-1-pierna.gif',
  'De pie frente a la polea baja o en la máquina de pie, enganchá el cable a un tobillo. Flexioná la rodilla llevando el talón hacia el glúteo, y volvé controlado. Completá una pierna antes de cambiar.',
  'aislado', true, ARRAY['Isquiotibiales']
where not exists (select 1 from public.exercise_definitions where nombre = 'Curl femoral 1 pierna');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Hip thrust con 1 pierna', 'Legs',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/hip-thrust-con-1-pierna.gif',
  'Apoyá la espalda alta contra un banco, con una pierna extendida y la otra apoyada en el piso. Empujá la cadera hacia arriba usando solo la pierna de apoyo, y bajá controlado. Completá un lado antes de cambiar.',
  'compuesto', true, ARRAY['Glúteos']
where not exists (select 1 from public.exercise_definitions where nombre = 'Hip thrust con 1 pierna');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Puente de glúteos', 'Legs',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/puente-de-gluteos.gif',
  'Acostate boca arriba con las rodillas flexionadas y los pies apoyados en el piso. Empujá la cadera hacia arriba apretando los glúteos, hasta formar una línea recta entre rodillas y hombros. Bajá controlado.',
  'compuesto', false, ARRAY['Glúteos']
where not exists (select 1 from public.exercise_definitions where nombre = 'Puente de glúteos');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Hip thrust elevado con banco', 'Legs',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/hip-thrust-elevado-banco.gif',
  'Apoyá la espalda alta contra un banco y los pies sobre otro banco o plataforma elevada. Empujá la cadera hacia arriba apretando los glúteos, y bajá controlado. La elevación de pies aumenta el rango de movimiento.',
  'compuesto', false, ARRAY['Glúteos']
where not exists (select 1 from public.exercise_definitions where nombre = 'Hip thrust elevado con banco');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Puente de glúteos elevado en banco', 'Legs',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/puente-de-gluteos-elevado-banco.gif',
  'Acostate boca arriba con los pies apoyados sobre un banco o plataforma elevada. Empujá la cadera hacia arriba apretando los glúteos, y bajá controlado.',
  'compuesto', false, ARRAY['Glúteos']
where not exists (select 1 from public.exercise_definitions where nombre = 'Puente de glúteos elevado en banco');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Hip thrust con mancuerna', 'Legs',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/hip-thrust-con-mancuerna.gif',
  'Acostate boca arriba con las rodillas flexionadas y una mancuerna apoyada sobre la cadera, sostenida con ambas manos. Empujá la cadera hacia arriba apretando los glúteos, y bajá controlado.',
  'compuesto', false, ARRAY['Glúteos']
where not exists (select 1 from public.exercise_definitions where nombre = 'Hip thrust con mancuerna');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Patada de glúteo lateral', 'Legs',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/patada-de-gluteo-lateral.gif',
  'En cuatro apoyos, con la rodilla flexionada en 90°, elevá la pierna hacia el costado manteniendo el ángulo de la rodilla. Volvé controlado. Completá una pierna antes de cambiar.',
  'aislado', true, ARRAY['Glúteos']
where not exists (select 1 from public.exercise_definitions where nombre = 'Patada de glúteo lateral');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Patada de glúteo lateral con banda elástica', 'Legs',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/patada-de-gluteo-lateral-con-banda.gif',
  'Colocate una banda elástica alrededor de los tobillos. En cuatro apoyos, elevá la pierna hacia el costado contra la resistencia de la banda, y volvé controlado. Completá una pierna antes de cambiar.',
  'aislado', true, ARRAY['Glúteos']
where not exists (select 1 from public.exercise_definitions where nombre = 'Patada de glúteo lateral con banda elástica');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Estocadas para glúteos', 'Legs',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/estocadas-para-gluteos.gif',
  'Dá un paso largo hacia adelante y bajá hasta que ambas rodillas formen 90°, manteniendo el torso erguido e inclinado levemente adelante. Empujá con el talón delantero para volver. El paso más largo enfatiza el glúteo por sobre el cuádriceps.',
  'compuesto', true, ARRAY['Glúteos','Cuádriceps']
where not exists (select 1 from public.exercise_definitions where nombre = 'Estocadas para glúteos');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Elevación de talón en Smith', 'Legs',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/elevacion-talon-smith.gif',
  'Colocate bajo la barra de la máquina Smith con la punta de los pies sobre una plataforma elevada. Elevate sobre la punta de los pies lo más alto posible, y bajá controlado hasta sentir el estiramiento de la pantorrilla.',
  'aislado', false, ARRAY['Pantorrillas']
where not exists (select 1 from public.exercise_definitions where nombre = 'Elevación de talón en Smith');

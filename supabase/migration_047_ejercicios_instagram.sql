-- Migración 047: 24 ejercicios nuevos para el catálogo general (repositorio,
-- todavía no entran en ninguna rutina puntual -- el usuario los va a ir
-- aplicando a rutinas futuras según haga falta). Vienen de clips descargados
-- de Instagram (cuenta demicstory), ya recortados/comprimidos a gif por
-- Claude y renombrados exactos al `nombre` de cada fila.
--
-- Además completa 2 ejercicios YA EXISTENTES a los que les faltaba un video:
--   - id 4  "Curl de bíceps en banco inclinado con mancuernas" -> video principal
--   - id 14 "Elevacion lateral con mancuernas" -> video FEM (a confirmar, ver nota abajo)
--
-- El `imagen_url` (gif) se fija acá mismo con la URL final de Storage, igual
-- que ya se hizo con "Sentadilla con mancuerna" en la migración 042 -- el gif
-- todavía no está subido, hay que subirlo al bucket "ejercicios" con el
-- nombre exacto de archivo indicado en cada insert.
--
-- El `video_url` de estos 24 (y el de los 2 que faltaban) se completa solo,
-- SIN volver a correr nada más que el bloque genérico del final, una vez que
-- subas los .mp4 al bucket "ejercicios-video" con el nombre exacto:
-- "<nombre>.mp4" (o "<nombre> FEM.mp4" para la variante femenina).
--
-- Correr en el SQL Editor de Supabase después de la migración 046.

-- ============ ABDOMINALES / CORE ============

insert into public.exercise_definitions (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'Crunch de bicicleta', 'Legs',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/Crunch de bicicleta.gif',
  'Paso inicial: Acostate boca arriba, llevá las manos detrás de la cabeza sin entrelazar los dedos, y levantá los pies del piso con las rodillas flexionadas a 90°.

Posición inicial: Zona lumbar apoyada contra el piso durante todo el ejercicio, core activado.

Movimiento: Exhalá y llevá el codo hacia la rodilla contraria, extendiendo al mismo tiempo la otra pierna, como si estuvieras pedaleando en el aire.

Contracción: Apretá el oblicuo un instante en el punto de mayor giro.

Regreso: Inhalá y cambiá de lado de forma controlada, sin tironear del cuello con las manos.

Consejo como Entrenador:

El movimiento sale de girar el torso, no de tirar del cuello con las manos -- las manos solo acompañan la cabeza.

Cuanto más lento el ritmo, más trabajan los oblicuos -- no hace falta ir rápido.

Si sentís molestia lumbar, achicá el rango de la pierna que se extiende.',
  'aislado', false
where not exists (select 1 from public.exercise_definitions where nombre = 'Crunch de bicicleta');

insert into public.exercise_definitions (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'Crunch abdominal', 'Legs',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/Crunch abdominal.gif',
  'Paso inicial: Acostate boca arriba con las rodillas flexionadas y los pies apoyados en el piso, manos apoyadas livianamente detrás de la cabeza o cruzadas sobre el pecho.

Posición inicial: Zona lumbar en contacto con el piso, mentón separado del pecho.

Movimiento: Exhalá y levantá los omóplatos del piso, curvando la zona superior de la espalda hacia adelante.

Contracción: Apretá el abdomen un instante en el punto más alto, sin que la zona lumbar se despegue del piso.

Regreso: Inhalá y bajá de forma controlada hasta rozar el piso con los omóplatos, sin relajar del todo el abdomen.

Consejo como Entrenador:

No hace falta subir mucho -- el recorrido real del crunch es corto, lo que importa es la contracción, no la altura.

Evitá tirar del cuello con las manos, son solo un apoyo liviano.

Exhalar en la subida ayuda a activar mejor el abdomen.',
  'aislado', false
where not exists (select 1 from public.exercise_definitions where nombre = 'Crunch abdominal');

insert into public.exercise_definitions (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'Crunch básico', 'Legs',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/Crunch básico.gif',
  'Paso inicial: Acostate boca arriba, rodillas flexionadas, pies apoyados en el piso al ancho de la cadera, brazos extendidos hacia adelante o cruzados sobre el pecho.

Posición inicial: Zona lumbar apoyada, core activado antes de empezar a moverte.

Movimiento: Exhalá y curvá la parte alta de la espalda hacia arriba, llevando el pecho hacia las rodillas.

Contracción: Apretá el abdomen superior un instante en la parte alta del movimiento.

Regreso: Inhalá y volvé a bajar de forma controlada, sin golpear la espalda contra el piso.

Consejo como Entrenador:

Es la variante más simple del crunch -- ideal para aprender a sentir el abdomen antes de sumar giros o piernas en el aire.

La calidad de la contracción importa más que la cantidad de repeticiones.

Mantené el cuello relajado, la mirada hacia el techo durante todo el movimiento.',
  'aislado', false
where not exists (select 1 from public.exercise_definitions where nombre = 'Crunch básico');

insert into public.exercise_definitions (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'Crunch lateral apoyado en codo', 'Legs',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/Crunch lateral apoyado en codo.gif',
  'Paso inicial: Acostate de costado apoyado sobre el antebrazo, con las piernas semiflexionadas apiladas una sobre otra.

Posición inicial: Cadera despegada del piso, formando una línea desde el hombro hasta las rodillas.

Movimiento: Exhalá y acercá la cadera hacia las costillas, flexionando el torso hacia el costado que está apoyado.

Contracción: Apretá el oblicuo de ese lado un instante en el punto más alto.

Regreso: Inhalá y volvé a la posición inicial de forma controlada, sin dejar caer la cadera de golpe.

Consejo como Entrenador:

Completá todas las repeticiones de un lado antes de cambiar al otro.

El movimiento es corto -- no hace falta gran rango, la clave es la contracción del oblicuo.

Si te cuesta el equilibrio, apoyá la mano libre en el piso por delante del cuerpo.',
  'aislado', true
where not exists (select 1 from public.exercise_definitions where nombre = 'Crunch lateral apoyado en codo');

insert into public.exercise_definitions (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'Elevación de cadera con rodillas flexionadas', 'Legs',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/Elevación de cadera con rodillas flexionadas.gif',
  'Paso inicial: Acostate boca arriba con las piernas levantadas y las rodillas flexionadas a 90°, brazos apoyados a los costados del cuerpo para dar estabilidad.

Posición inicial: Zona lumbar apoyada en el piso, abdomen inferior activado.

Movimiento: Exhalá y despegá la cadera del piso llevando las rodillas hacia el pecho, usando el abdomen y no el impulso de las piernas.

Contracción: Apretá el abdomen inferior un instante en el punto más alto.

Regreso: Inhalá y bajá la cadera de forma controlada, sin que las piernas caigan de golpe.

Consejo como Entrenador:

El movimiento es chico -- la cadera se despega apenas unos centímetros, no hace falta llevar las rodillas hasta la frente.

Evitá usar el balanceo de las piernas para "ayudar" -- tiene que salir del abdomen inferior.

Si sentís tensión en la zona lumbar, bajá el ritmo y reducí el rango.',
  'aislado', false
where not exists (select 1 from public.exercise_definitions where nombre = 'Elevación de cadera con rodillas flexionadas');

insert into public.exercise_definitions (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'Elevación de cadera en plancha lateral', 'Legs',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/Elevación de cadera en plancha lateral.gif',
  'Paso inicial: Ubicate en plancha lateral, apoyado sobre el antebrazo, con el cuerpo alineado desde la cabeza hasta los pies.

Posición inicial: Cadera un poco despegada del piso, core activado, esa es tu posición baja.

Movimiento: Exhalá y subí la cadera todo lo que puedas, apretando el oblicuo del lado apoyado.

Contracción: Mantené un instante en el punto más alto antes de bajar.

Regreso: Inhalá y bajá la cadera de forma controlada, sin apoyarla del todo en el piso entre repetición y repetición.

Consejo como Entrenador:

Mantené el cuerpo en una sola línea recta durante todo el movimiento -- no dejes que la cadera se vaya hacia adelante o atrás.

Completá las repeticiones de un lado antes de cambiar al otro.

Si es muy exigente al principio, apoyá la rodilla de abajo en el piso para reducir la dificultad.',
  'aislado', true
where not exists (select 1 from public.exercise_definitions where nombre = 'Elevación de cadera en plancha lateral');

insert into public.exercise_definitions (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'Elevación de piernas acostado', 'Legs',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/Elevación de piernas acostado.gif',
  'Paso inicial: Acostate boca arriba con las piernas extendidas y las manos apoyadas debajo de la zona lumbar o a los costados del cuerpo.

Posición inicial: Piernas juntas y extendidas, apenas separadas del piso.

Movimiento: Exhalá y subí las piernas extendidas hasta formar un ángulo de 90° con el piso, sin flexionar las rodillas.

Contracción: Apretá el abdomen inferior un instante en la parte alta.

Regreso: Inhalá y bajá las piernas de forma controlada, sin dejarlas caer ni tocar el piso entre repeticiones.

Consejo como Entrenador:

Cuanto más lenta la bajada, más trabaja el abdomen inferior -- ahí está el verdadero esfuerzo del ejercicio.

Si sentís que se te arquea la zona lumbar, no bajes tanto las piernas o flexioná apenas las rodillas.

Mantené las piernas juntas durante todo el recorrido.',
  'aislado', false
where not exists (select 1 from public.exercise_definitions where nombre = 'Elevación de piernas acostado');

insert into public.exercise_definitions (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'Elevación de piernas sentado con apoyo de manos', 'Legs',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/Elevación de piernas sentado con apoyo de manos.gif',
  'Paso inicial: Sentate en el piso, inclinado levemente hacia atrás, con las manos apoyadas detrás de tu cuerpo para sostener el torso.

Posición inicial: Piernas extendidas y apenas despegadas del piso, core activado.

Movimiento: Exhalá y subí las piernas extendidas hacia arriba, sin flexionar las rodillas.

Contracción: Apretá el abdomen un instante en el punto más alto.

Regreso: Inhalá y bajá las piernas de forma controlada hasta casi rozar el piso.

Consejo como Entrenador:

El apoyo de las manos te da estabilidad -- usalo para mantener la espalda recta, no para hacer trampa con el impulso.

Si te cuesta mantener las piernas extendidas, empezá con una flexión leve de rodillas.

Controlá especialmente la bajada, ahí es donde más trabaja el abdomen.',
  'aislado', false
where not exists (select 1 from public.exercise_definitions where nombre = 'Elevación de piernas sentado con apoyo de manos');

insert into public.exercise_definitions (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'Elevación de rodillas al pecho', 'Legs',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/Elevación de rodillas al pecho.gif',
  'Paso inicial: Acostate boca arriba con las piernas extendidas y las manos apoyadas a los costados del cuerpo o debajo de la zona lumbar.

Posición inicial: Piernas juntas, apenas despegadas del piso.

Movimiento: Exhalá y llevá las rodillas flexionadas hacia el pecho, usando el abdomen para levantar la cadera apenas.

Contracción: Apretá el abdomen un instante con las rodillas cerca del pecho.

Regreso: Inhalá y extendé las piernas de nuevo de forma controlada, sin dejarlas caer de golpe.

Consejo como Entrenador:

Es una buena progresión antes de pasar a elevación de piernas con las piernas extendidas -- exige menos por el brazo de palanca más corto.

Mantené el movimiento lento y controlado, no uses el balanceo de las piernas.

Si sentís tensión lumbar, apoyá más las manos debajo de la zona baja de la espalda.',
  'aislado', false
where not exists (select 1 from public.exercise_definitions where nombre = 'Elevación de rodillas al pecho');

insert into public.exercise_definitions (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'Elevación de rodillas sentado con apoyo de manos', 'Legs',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/Elevación de rodillas sentado con apoyo de manos.gif',
  'Paso inicial: Sentate en el piso, inclinado levemente hacia atrás, con las manos apoyadas detrás de tu cuerpo para sostener el torso.

Posición inicial: Piernas semiextendidas y apenas despegadas del piso, core activado.

Movimiento: Exhalá y llevá las rodillas flexionadas hacia el pecho.

Contracción: Apretá el abdomen un instante con las rodillas cerca del pecho.

Regreso: Inhalá y extendé las piernas de nuevo de forma controlada, sin apoyarlas del todo en el piso entre repeticiones.

Consejo como Entrenador:

Es más accesible que la versión con piernas extendidas -- buena opción si todavía estás ganando fuerza de abdomen inferior.

El apoyo de las manos es para estabilidad, no para empujarte con los brazos.

Mantené la espalda lo más derecha posible, sin dejar que se redondee de más.',
  'aislado', false
where not exists (select 1 from public.exercise_definitions where nombre = 'Elevación de rodillas sentado con apoyo de manos');

insert into public.exercise_definitions (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'Giro oblicuo acostado', 'Legs',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/Giro oblicuo acostado.gif',
  'Paso inicial: Acostate boca arriba con las piernas levantadas y las rodillas flexionadas a 90°, brazos extendidos hacia los costados o hacia arriba para dar equilibrio.

Posición inicial: Zona superior de la espalda apenas despegada del piso, core activado.

Movimiento: Exhalá y girá las piernas hacia un costado, manteniendo las rodillas juntas, hasta cerca de rozar el piso.

Contracción: Apretá el oblicuo del lado contrario un instante en el punto de mayor giro.

Regreso: Inhalá y volvé las piernas al centro de forma controlada antes de girar hacia el otro lado.

Consejo como Entrenador:

El movimiento sale de girar la cadera y las piernas juntas, no de separarlas.

Cuanto más controlado el descenso hacia el costado, más trabajan los oblicuos.

Si te cuesta el equilibrio, apoyá los brazos extendidos en cruz a los costados del cuerpo.',
  'aislado', false
where not exists (select 1 from public.exercise_definitions where nombre = 'Giro oblicuo acostado');

insert into public.exercise_definitions (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'Giro ruso', 'Legs',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/Giro ruso.gif',
  'Paso inicial: Sentate en el piso con las rodillas flexionadas y los pies apoyados (o levantados del piso para más dificultad), inclinando el torso levemente hacia atrás.

Posición inicial: Espalda recta (no redondeada), manos juntas o sosteniendo un peso frente al pecho.

Movimiento: Exhalá y girá el torso llevando las manos hacia un costado del cuerpo.

Contracción: Apretá el oblicuo de ese lado un instante en el punto de mayor giro.

Regreso: Inhalá y girá hacia el centro y después hacia el otro costado, de forma controlada.

Consejo como Entrenador:

Si mantenés los pies apoyados en el piso el ejercicio es más accesible; levantarlos lo hace bastante más exigente.

El giro sale de rotar el torso, no solo de mover los brazos de un lado a otro.

Mantené la espalda recta durante todo el ejercicio -- si se te redondea, es señal de que hay que bajar la dificultad.',
  'aislado', false
where not exists (select 1 from public.exercise_definitions where nombre = 'Giro ruso');

insert into public.exercise_definitions (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'Crunch inverso', 'Legs',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/Crunch inverso.gif',
  'Paso inicial: Acostate boca arriba con las piernas levantadas y las rodillas flexionadas a 90°, brazos apoyados a los costados del cuerpo o sosteniéndote de algo fijo detrás de la cabeza.

Posición inicial: Zona lumbar apoyada en el piso, abdomen inferior activado.

Movimiento: Exhalá y despegá la cadera del piso llevando las rodillas hacia el pecho, enrollando la pelvis hacia arriba.

Contracción: Apretá el abdomen inferior un instante en el punto más alto.

Regreso: Inhalá y bajá la cadera de forma controlada, sin que las piernas caigan de golpe ni la zona lumbar se arquee.

Consejo como Entrenador:

A diferencia del crunch normal, acá el movimiento sale de la cadera hacia arriba, no de los hombros hacia adelante.

Evitá usar el impulso de las piernas -- el movimiento tiene que ser lento y controlado.

Si sentís que necesitás balancearte para levantar la cadera, es señal de que hay que bajar el rango.',
  'aislado', false
where not exists (select 1 from public.exercise_definitions where nombre = 'Crunch inverso');

insert into public.exercise_definitions (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'Toe touch', 'Legs',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/Toe touch.gif',
  'Paso inicial: Acostate boca arriba con las piernas extendidas hacia el techo (perpendiculares al piso) y los brazos extendidos hacia adelante.

Posición inicial: Zona lumbar apoyada en el piso, piernas lo más verticales posible.

Movimiento: Exhalá y levantá los hombros del piso, estirando los brazos hacia los pies como si quisieras tocarte los tobillos.

Contracción: Apretá el abdomen superior un instante en el punto más alto, sin que la zona lumbar se despegue del piso.

Regreso: Inhalá y bajá los hombros de forma controlada hasta casi rozar el piso.

Consejo como Entrenador:

No hace falta llegar a tocarte los pies -- lo importante es la contracción del abdomen, no el rango completo.

Mantené las piernas lo más extendidas y verticales posible durante todo el ejercicio.

Si sentís tensión en el cuello, bajá el ritmo y concentrate en que el movimiento salga del abdomen.',
  'aislado', false
where not exists (select 1 from public.exercise_definitions where nombre = 'Toe touch');

insert into public.exercise_definitions (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'V-Up completo', 'Legs',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/V-Up completo.gif',
  'Paso inicial: Acostate boca arriba con brazos y piernas extendidos, formando una línea recta.

Posición inicial: Core activado antes de empezar el movimiento.

Movimiento: Exhalá y levantá simultáneamente el torso y las piernas extendidas, buscando tocar los pies con las manos en el aire, formando una "V" con el cuerpo.

Contracción: Apretá el abdomen un instante en el punto más alto del movimiento.

Regreso: Inhalá y bajá torso y piernas juntos, de forma controlada, sin que golpeen el piso.

Consejo como Entrenador:

Es un ejercicio exigente -- si todavía no te sale el rango completo, hacé la versión con rodillas flexionadas hasta ganar fuerza.

El movimiento sale de flexionar la cadera con el abdomen, no de tirar del cuello con las manos.

Bajar de forma controlada es tan importante como subir -- no dejes que el cuerpo caiga de golpe.',
  'aislado', false
where not exists (select 1 from public.exercise_definitions where nombre = 'V-Up completo');

insert into public.exercise_definitions (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'V-Up oblicuo', 'Legs',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/V-Up oblicuo.gif',
  'Paso inicial: Acostate de costado con las piernas apiladas y extendidas, el brazo de abajo apoyado en el piso o extendido para dar equilibrio.

Posición inicial: Cuerpo alineado, core activado.

Movimiento: Exhalá y levantá simultáneamente las piernas juntas y el torso hacia un costado, buscando tocar los pies con la mano de arriba.

Contracción: Apretá el oblicuo de ese lado un instante en el punto más alto.

Regreso: Inhalá y bajá de forma controlada hasta casi rozar el piso con piernas y torso.

Consejo como Entrenador:

Completá todas las repeticiones de un lado antes de cambiar al otro.

Es más exigente que el V-Up tradicional -- si te cuesta, hacé la versión con las rodillas semiflexionadas.

El movimiento sale del oblicuo, no de balancear el cuerpo para tomar impulso.',
  'aislado', true
where not exists (select 1 from public.exercise_definitions where nombre = 'V-Up oblicuo');

-- ============ BÍCEPS ============

insert into public.exercise_definitions (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'Curl spider con mancuernas', 'Pull',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/Curl spider con mancuernas.gif',
  'Paso inicial: Apoyá el pecho contra el lado inclinado de un banco Scott o un banco inclinado a 45°, dejando los brazos colgar hacia abajo con una mancuerna en cada mano.

Posición inicial: Brazos completamente extendidos, hombros relajados, sin que se despeguen del banco.

Movimiento: Inhalá y flexioná los codos llevando las mancuernas hacia los hombros, sin mover los brazos hacia adelante.

Contracción: Apretá el bíceps un instante en la parte alta del movimiento.

Regreso: Exhalá y bajá las mancuernas de forma controlada hasta la extensión completa.

Consejo como Entrenador:

Al estar el pecho apoyado, se elimina casi todo el impulso del cuerpo -- el bíceps trabaja solo, sin ayuda de la espalda.

Sentís mucho más el estiramiento en la parte baja del movimiento que en un curl parado -- aprovechalo, bajando siempre hasta la extensión completa.

Controlá especialmente la bajada, es la fase donde más se construye el músculo en este ejercicio.',
  'aislado', false
where not exists (select 1 from public.exercise_definitions where nombre = 'Curl spider con mancuernas');

-- ============ HOMBROS ============

insert into public.exercise_definitions (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'Elevación frontal con mancuernas', 'Torso',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/Elevación frontal con mancuernas.gif',
  'Paso inicial: Parate o sentate derecho con una mancuerna en cada mano, apoyadas contra los muslos con las palmas hacia el cuerpo.

Posición inicial: Brazos extendidos hacia abajo, con una ligera flexión de codo que se mantiene fija durante todo el ejercicio.

Movimiento: Exhalá y levantá las mancuernas hacia adelante, hasta la altura de los hombros, sin balancear el torso.

Contracción: Apretá el deltoide anterior un instante en el punto más alto.

Regreso: Inhalá y bajá las mancuernas de forma controlada hasta la posición inicial.

Consejo como Entrenador:

Podés alternar los brazos (uno sube mientras el otro baja) o subir los dos juntos -- ambas formas son válidas, elegí la que te resulte más cómoda.

Evitá usar el impulso de la cadera para "ayudar" a subir el peso.

Usá un peso moderado -- es un ejercicio de aislamiento para una zona chica del hombro.',
  'aislado', false
where not exists (select 1 from public.exercise_definitions where nombre = 'Elevación frontal con mancuernas');

insert into public.exercise_definitions (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'Vuelo posterior con mancuernas de pie', 'Torso',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/Vuelo posterior con mancuernas de pie.gif',
  'Paso inicial: Parate (o sentate en el borde de un banco) con una mancuerna en cada mano, e inclinate hacia adelante desde la cadera hasta que el torso quede casi paralelo al piso.

Posición inicial: Brazos colgando hacia abajo con una ligera flexión de codo, espalda recta, no redondeada.

Movimiento: Exhalá y abrí los brazos hacia los costados en forma de arco, llevando las mancuernas hasta la altura de los hombros.

Contracción: Apretá el deltoide posterior un instante en el punto más alto.

Regreso: Inhalá y bajá las mancuernas de forma controlada hasta la posición inicial.

Consejo como Entrenador:

A diferencia de la versión apoyado en un banco inclinado, acá el torso no tiene ningún apoyo -- exigí más el core para mantener la posición inclinada sin que la espalda se redondee.

Mantené siempre la misma flexión leve de codo durante todo el movimiento.

Usá un peso liviano, es un ejercicio de aislamiento para una zona chica del hombro.',
  'aislado', false
where not exists (select 1 from public.exercise_definitions where nombre = 'Vuelo posterior con mancuernas de pie');

-- ============ PECHO ============

insert into public.exercise_definitions (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'Aperturas en máquina Pec Deck', 'Torso',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/Aperturas en máquina Pec Deck.gif',
  'Paso inicial: Sentate en la máquina Pec Deck con la espalda apoyada contra el respaldo y tomá las agarraderas (o apoyá los antebrazos en las almohadillas) con los brazos abiertos.

Posición inicial: Codos con una ligera flexión fija, pecho arriba, hombros hacia abajo y atrás.

Movimiento: Exhalá y juntá las manos (o los codos) hacia adelante, en forma de arco, sin que los brazos se conviertan en un press.

Contracción: Apretá el pecho un instante en el punto de mayor cierre.

Regreso: Inhalá y volvé a abrir los brazos de forma controlada hasta sentir un buen estiramiento en el pecho.

Consejo como Entrenador:

La ventaja de la máquina frente a las mancuernas es que el recorrido queda fijo -- aprovechá eso para concentrarte en sentir el pecho, no en estabilizar el peso.

Ajustá el asiento para que las agarraderas queden a la altura del pecho antes de empezar.

Mantené la misma flexión de codo durante todo el movimiento -- si el codo se flexiona y extiende, se convierte en un press y pierde el enfoque en el pecho.',
  'aislado', false
where not exists (select 1 from public.exercise_definitions where nombre = 'Aperturas en máquina Pec Deck');

-- ============ GLÚTEOS ============

insert into public.exercise_definitions (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'Activación de glúteo de rodillas con banda', 'Legs',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/Activación de glúteo de rodillas con banda.gif',
  'Paso inicial: Colocate una banda elástica por encima de las rodillas y apoyate en cuatro apoyos (manos y rodillas en el piso).

Posición inicial: Espalda neutra, core activado, rodillas al ancho de la cadera contra la resistencia de la banda.

Movimiento: Exhalá y separá una rodilla hacia afuera, contra la banda, sin mover la cadera ni el torso.

Contracción: Apretá el glúteo medio un instante en el punto más alto.

Regreso: Inhalá y volvé la rodilla a la posición inicial de forma controlada, sin que la banda tire de golpe.

Consejo como Entrenador:

Es un ejercicio pensado para "activar" el glúteo antes de entrenar piernas, no para cargar mucho peso -- priorizá sentir el músculo por sobre la cantidad de repeticiones.

Mantené la cadera y la espalda lo más quietas posible, el movimiento sale solo de la cadera que trabaja.

Completá las repeticiones de un lado antes de cambiar al otro.',
  'aislado', true
where not exists (select 1 from public.exercise_definitions where nombre = 'Activación de glúteo de rodillas con banda');

insert into public.exercise_definitions (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'Patada de glúteo con banda de resistencia', 'Legs',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/Patada de glúteo con banda de resistencia.gif',
  'Paso inicial: Colocate una banda elástica alrededor de ambos pies (o entre el pie y una base fija) y apoyate en cuatro apoyos (manos y rodillas en el piso).

Posición inicial: Espalda neutra, core activado, rodilla de la pierna que trabaja flexionada a 90°.

Movimiento: Exhalá y llevá el talón hacia atrás y arriba, contra la resistencia de la banda, manteniendo la rodilla flexionada.

Contracción: Apretá el glúteo de esa pierna un instante en el punto más alto.

Regreso: Inhalá y volvé la pierna a la posición inicial de forma controlada, sin dejar que la banda la traiga de golpe.

Consejo como Entrenador:

El movimiento sale de extender la cadera, no de levantar la pierna con la zona lumbar -- si sentís que se te arquea la espalda baja, reducí el rango.

Mantené la rodilla flexionada a 90° durante todo el ejercicio.

Completá las repeticiones de una pierna antes de cambiar a la otra.',
  'aislado', true
where not exists (select 1 from public.exercise_definitions where nombre = 'Patada de glúteo con banda de resistencia');

insert into public.exercise_definitions (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'Patada de glúteo con pierna extendida', 'Legs',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/Patada de glúteo con pierna extendida.gif',
  'Paso inicial: Apoyate en cuatro apoyos (manos y rodillas en el piso), con una pierna extendida hacia atrás y apenas despegada del piso.

Posición inicial: Espalda neutra, core activado, pierna extendida sin bloquear la rodilla del todo.

Movimiento: Exhalá y llevá la pierna extendida hacia arriba, extendiendo la cadera, sin flexionar la rodilla.

Contracción: Apretá el glúteo de esa pierna un instante en el punto más alto.

Regreso: Inhalá y bajá la pierna de forma controlada, sin que toque el piso entre repeticiones.

Consejo como Entrenador:

Al mantener la pierna extendida, el brazo de palanca es más largo -- se siente más exigente que la versión con rodilla flexionada.

Evitá compensar con la zona lumbar -- el movimiento tiene que salir de la cadera, no de arquear la espalda.

Completá las repeticiones de una pierna antes de cambiar a la otra.',
  'aislado', true
where not exists (select 1 from public.exercise_definitions where nombre = 'Patada de glúteo con pierna extendida');

insert into public.exercise_definitions (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'Patada de glúteo cruzada Fire Hydrant', 'Legs',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/Patada de glúteo cruzada Fire Hydrant.gif',
  'Paso inicial: Apoyate en cuatro apoyos (manos y rodillas en el piso), con la espalda neutra y el core activado.

Posición inicial: Rodilla de la pierna que trabaja flexionada a 90°, apoyada junto a la otra rodilla.

Movimiento: Exhalá y separá la rodilla hacia afuera y ligeramente hacia atrás en diagonal, manteniendo la flexión de 90° (el movimiento clásico de "Fire Hydrant").

Contracción: Apretá el glúteo medio de esa pierna un instante en el punto más alto.

Regreso: Inhalá y volvé la rodilla a la posición inicial de forma controlada.

Consejo como Entrenador:

El movimiento combina abducción y una leve extensión de cadera -- por eso trabaja tanto el glúteo medio como el mayor, distinto a una abducción pura.

Mantené la cadera y el torso lo más quietos posible, sin rotar hacia el costado que trabaja.

Completá las repeticiones de una pierna antes de cambiar a la otra.',
  'aislado', true
where not exists (select 1 from public.exercise_definitions where nombre = 'Patada de glúteo cruzada Fire Hydrant');

-- ============ COMPLETAR VIDEOS DE EJERCICIOS EXISTENTES ============
-- id 4  "Curl de bíceps en banco inclinado con mancuernas" -- no tenía video.
-- id 14 "Elevacion lateral con mancuernas" -- video FEM a confirmar antes de
-- subir el archivo (ver chat). Si ya tenía uno cargado, este bloque no lo
-- toca porque solo completa lo que está en null.

-- ============ COMPLETAR video_url DESDE EL BUCKET "ejercicios-video" ============
-- Genérico e idempotente: solo completa lo que todavía está en null, nunca
-- pisa un video ya cargado. Correr las veces que haga falta a medida que se
-- van subiendo archivos nuevos al bucket.

update public.exercise_definitions ed
set video_url = concat(
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios-video/',
  so.name
)
from storage.objects so
where so.bucket_id = 'ejercicios-video'
  and so.name = concat(ed.nombre, '.mp4')
  and ed.video_url is null;

update public.exercise_definitions ed
set video_url_fem = concat(
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios-video/',
  so.name
)
from storage.objects so
where so.bucket_id = 'ejercicios-video'
  and so.name = concat(ed.nombre, ' FEM.mp4')
  and ed.video_url_fem is null;

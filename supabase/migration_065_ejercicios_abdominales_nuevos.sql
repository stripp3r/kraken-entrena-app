-- Migración 065: 5 ejercicios de Abdominales que estaban en la biblioteca
-- de referencia (D:\PROYECTO FITNESS\VIDEOS\RECURSOS\TECNICAS DE
-- EJERCICIOS\EJERCICIOS\ABDOMINALES\) pero nunca se habían cargado al
-- catálogo -- primera tanda de la revisión músculo por músculo iniciada
-- 2026-09-24. Los GIF ya están subidos al bucket `ejercicios` de Storage
-- (mismo bucket, mismo patrón de nombre kebab-case que el resto).
--
-- Dos de los 7 GIF que se revisaron en esta tanda resultaron ser el mismo
-- ejercicio (elevación de piernas en banco declinado, pierna recta) bajo
-- dos nombres de archivo distintos -- se cargó una sola vez. Uno más
-- ("Elbow-to-Knee-Sit-up") se descartó por overlap real con "Crunch
-- abdominal"/"Crunch básico" ya cargados.
--
-- Correr en el SQL Editor de Supabase.

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, tipo_esfuerzo, unilateral, grupos_musculares, como_hacerlo)
values
  (
    'Crunch en polea de rodillas',
    'Legs',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/crunch-en-polea-de-rodillas.gif',
    'aislado',
    false,
    array['Abdominales'],
    E'Paso inicial: Arrodillate frente a la polea alta con un accesorio de cuerda, sostenelo con ambas manos a los lados de la cabeza o el cuello.\n\nPosición inicial: Caderas atrás, columna en posición neutra, core activado antes de arrancar.\n\nMovimiento: Exhalá y flexioná la columna llevando los codos hacia las rodillas, dejando que las caderas se muevan levemente hacia atrás como bisagra.\n\nContracción: Apretá el abdomen un instante en el punto de mayor flexión, sin tirar del cuello con los brazos.\n\nRegreso: Inhalá y volvé a extender el torso de forma controlada, sin perder la tensión en el abdomen.\n\nConsejo como Entrenador:\n\nEl movimiento sale de flexionar la columna, no de bajar los brazos -- las manos y los codos solo acompañan a la cabeza.\n\nUsá un peso que te permita sentir el abdomen trabajando, no el peso levantándote a vos.'
  ),
  (
    'Sit-up completo',
    'Legs',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/sit-up-completo.gif',
    'aislado',
    false,
    array['Abdominales'],
    E'Paso inicial: Acostate boca arriba con las rodillas flexionadas y los pies apoyados en el piso, podés enganchar los pies debajo de algo fijo o pedirle a alguien que te los sostenga.\n\nPosición inicial: Manos cruzadas sobre el pecho o detrás de la cabeza sin entrelazar los dedos, core activado.\n\nMovimiento: Exhalá y subí el torso completo hasta quedar sentado, llevando el pecho hacia las rodillas.\n\nContracción: Apretá el abdomen un instante en la posición más alta.\n\nRegreso: Inhalá y bajá el torso de forma controlada hasta volver a apoyar la espalda en el piso.\n\nConsejo como Entrenador:\n\nA diferencia del crunch, acá se mueve toda la columna -- es normal que entren en juego los flexores de cadera, no hace falta evitarlo.\n\nSi sentís molestia lumbar, priorizá el crunch parcial en su lugar.'
  ),
  (
    'Patada de tijera sentado',
    'Legs',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/patada-de-tijera-sentado.gif',
    'aislado',
    false,
    array['Abdominales'],
    E'Paso inicial: Sentate en la punta de un banco, manos apoyadas a los costados o agarradas del borde para sostenerte.\n\nPosición inicial: Reclinate levemente hacia atrás con la zona lumbar apoyada, piernas extendidas y levantadas del piso.\n\nMovimiento: Exhalá y llevá las piernas en un movimiento de tijera, alternando cuál queda arriba y cuál abajo, sin tocar el piso.\n\nContracción: Mantené el abdomen contraído durante todo el movimiento, es lo que sostiene la posición.\n\nRegreso: Seguí alternando de forma controlada durante el tiempo o las repeticiones indicadas.\n\nConsejo como Entrenador:\n\nCuanto más reclinado el torso, más difícil -- ajustá el ángulo según tu nivel.\n\nSi se te arquea la zona lumbar o pierde apoyo, achicá el rango de las piernas.'
  ),
  (
    'Abdominales en banco plano',
    'Legs',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/abdominales-banco-plano.gif',
    'aislado',
    false,
    array['Abdominales'],
    E'Paso inicial: Sentate en un banco plano con las piernas extendidas hacia adelante, apoyando los talones en el piso o en el otro extremo del banco.\n\nPosición inicial: Reclinate hacia atrás hasta el punto donde sostengas la tensión en el abdomen, manos cruzadas sobre el pecho o detrás de la cabeza.\n\nMovimiento: Exhalá y subí el torso hacia adelante, usando el abdomen para incorporarte.\n\nContracción: Apretá el abdomen un instante en la posición más alta, sin usar impulso.\n\nRegreso: Inhalá y bajá el torso de forma controlada, sin llegar a apoyar completamente la espalda si querés mantener tensión continua.\n\nConsejo como Entrenador:\n\nEl banco no tiene el ángulo fijo de un banco declinado -- ajustá cuánto te reclinás hacia atrás para regular la dificultad.'
  ),
  (
    'Elevación de piernas en banco declinado',
    'Legs',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/elevacion-piernas-banco-declinado.gif',
    'aislado',
    false,
    array['Abdominales'],
    E'Paso inicial: Acostate boca arriba en un banco declinado, con la cabeza hacia el extremo más alto y sujetándote del respaldo o los agarres detrás de la cabeza.\n\nPosición inicial: Piernas extendidas y juntas, apenas por encima del banco, zona lumbar apoyada.\n\nMovimiento: Exhalá y levantá las piernas rectas (o con una leve flexión de rodilla) hasta que queden perpendiculares al banco.\n\nContracción: Apretá el abdomen inferior un instante en la parte más alta, sin usar impulso de la cadera.\n\nRegreso: Inhalá y bajá las piernas de forma controlada, sin dejar que la zona lumbar se despegue del banco.\n\nConsejo como Entrenador:\n\nSi no llegás a mantener la zona lumbar apoyada durante todo el recorrido, achicá el rango de bajada de las piernas.'
  );

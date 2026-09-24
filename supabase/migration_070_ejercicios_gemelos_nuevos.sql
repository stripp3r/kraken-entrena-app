-- Migración 070: 3 ejercicios de Pantorrillas -- sexta tanda de la
-- revisión del catálogo músculo por músculo (ver 065-069 para las
-- anteriores). Los 3 nombres pasados resultaron ser ejercicios reales
-- faltantes, ninguno duplicado.
--
-- GIFs ya subidos al bucket `ejercicios` de Storage. Correr en el SQL
-- Editor de Supabase.

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, tipo_esfuerzo, unilateral, grupos_musculares, como_hacerlo)
values
  (
    'Elevación de talón tipo burro en máquina',
    'Legs',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/elevacion-talon-donkey-maquina.gif',
    'aislado',
    false,
    array['Pantorrillas'],
    E'Paso inicial: Colocate en la máquina de elevación de talón tipo burro, apoyando el torso inclinado hacia adelante contra el respaldo acolchado y la cadera bajo el soporte.\n\nPosición inicial: Talones colgando fuera de la plataforma, rodillas casi extendidas, core activado.\n\nMovimiento: Exhalá y elevate en puntas de pie lo más alto posible.\n\nContracción: Apretá la pantorrilla un instante en el punto más alto.\n\nRegreso: Inhalá y bajá los talones de forma controlada, dejando que se estiren por debajo del nivel de la plataforma.\n\nConsejo como Entrenador:\n\nLa posición inclinada hacia adelante (a diferencia del talón parado tradicional) cambia el ángulo de la cadera y permite un rango de movimiento más completo en el tobillo -- aprovechá el estiramiento abajo sin rebotar.'
  ),
  (
    'Elevación de talón en prensa de piernas 45°',
    'Legs',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/elevacion-talon-prensa-45.gif',
    'aislado',
    false,
    array['Pantorrillas'],
    E'Paso inicial: Sentate en la prensa de piernas a 45° y apoyá solo la punta de los pies en el borde inferior de la plataforma, con las piernas extendidas.\n\nPosición inicial: Rodillas casi extendidas (sin bloquear), talones colgando fuera de la plataforma.\n\nMovimiento: Exhalá y empujá la plataforma extendiendo los tobillos, elevando los talones lo más posible.\n\nContracción: Apretá la pantorrilla un instante en el punto más alto.\n\nRegreso: Inhalá y dejá que los talones bajen de forma controlada, estirando la pantorrilla.\n\nConsejo como Entrenador:\n\nMantené las rodillas quietas durante todo el movimiento -- si se flexionan y extienden, el trabajo se va a cuádriceps en vez de quedarse en la pantorrilla.'
  ),
  (
    'Elevación de talón en prensa de piernas horizontal',
    'Legs',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/elevacion-talon-prensa-horizontal.gif',
    'aislado',
    false,
    array['Pantorrillas'],
    E'Paso inicial: Sentate en la prensa de piernas horizontal y apoyá solo la punta de los pies en el borde inferior de la plataforma, con las piernas extendidas.\n\nPosición inicial: Rodillas casi extendidas (sin bloquear), talones colgando fuera de la plataforma.\n\nMovimiento: Exhalá y empujá la plataforma extendiendo los tobillos, elevando los talones lo más posible.\n\nContracción: Apretá la pantorrilla un instante en el punto más alto.\n\nRegreso: Inhalá y dejá que los talones bajen de forma controlada, estirando la pantorrilla.\n\nConsejo como Entrenador:\n\nEs la misma idea que en la prensa a 45°, pero acá el recorrido es horizontal en vez de inclinado -- probá las dos y quedate con la que te resulte más cómoda para el tobillo.'
  );

-- NOTA aparte, no relacionada a los 3 de arriba: al hacer el chequeo
-- exhaustivo de esta tanda se encontró un near-duplicate PREEXISTENTE en
-- el catálogo (no en esta migración): id 10 "Elevación de talón en
-- máquina Smith" e id 202 "Elevación de talón en Smith" son el mismo
-- ejercicio real (parado en máquina Smith), con dos ilustraciones
-- distintas y nombres casi idénticos. id 10 está en uso (routine_exercises
-- id 164, rutina 8, día D); id 202 no está en ninguna rutina ni
-- workout_log. Pendiente de decisión del usuario: borrar id 202 (sin
-- riesgo, cero referencias) o dejarlo. No se tocó todavía.

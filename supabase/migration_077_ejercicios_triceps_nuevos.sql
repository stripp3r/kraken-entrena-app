-- Migración 077: 7 ejercicios de Tríceps -- doceava tanda de la
-- revisión del catálogo músculo por músculo (ver 065-076 para las
-- anteriores). Esta tanda tuvo la mayor densidad de duplicados
-- detectados hasta ahora, incluyendo duplicados ENTRE los propios
-- nombres que pasó el usuario (confirmando su advertencia explícita de
-- que él tampoco está exento de pasar repetidos).
--
-- De los 13 nombres pasados:
--   - 1 fue duplicado EXACTO (hash MD5 idéntico), descartado:
--       "oie_vIZuHJIrxzsP" (fondos entre dos bancos) = id 27 "Fondos en banco"
--   - 5 fueron near-duplicates (mismo ejercicio real, distinta
--     ilustración o mismo movimiento descrito de otra forma) -- NO
--     agregados, pendientes de revisión si el usuario quiere
--     confirmarlos:
--       "triceps polea.gif" ~ id 22 "Tríceps en polea alta a un brazo"
--       "12271301-Cable-Standing-One-Arm-Tricep-Pushdown-Overhand-Grip" ~ id 22 (mismo agarre pronado descrito en su texto)
--       "Tríceps pulley pronado" ~ id 22 (tercer near-duplicate del mismo ejercicio, entre sí mismos)
--       "17241301-Cable-Rope-High-Pulley-Overhead-Tricep-Extension" ~ id 77 "Extensión de tríceps sobre la cabeza en polea" (su texto ya describe cuerda + polea alta + a dos manos)
--       "16061301-Cable-Reverse-Grip-Triceps-Pushdown-SZ-bar" ~ id 163 "Tríceps agarre supino en polea alta a un brazo"
--   - 7 eran ejercicios reales faltantes, se agregan en esta migración.
--
-- GIFs ya subidos al bucket `ejercicios` de Storage. Correr en el SQL
-- Editor de Supabase.

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, tipo_esfuerzo, unilateral, grupos_musculares, como_hacerlo)
values
  (
    'Extensión de tríceps sobre la cabeza en polea a un brazo',
    'Push',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/extension-triceps-cabeza-polea-un-brazo.gif',
    'aislado',
    true,
    array['Tríceps'],
    E'Paso inicial: Colocá un agarre simple en una polea alta y dale la espalda a la máquina, dando un paso adelante para generar tensión en el cable.\n\nPosición inicial: Sostené el agarre con una mano por encima de la cabeza, codo flexionado apuntando hacia el techo.\n\nMovimiento: Exhalá y extendé el codo llevando el agarre hacia adelante y arriba, sin mover el hombro ni el codo de su posición.\n\nContracción: Apretá el tríceps un instante en la extensión completa.\n\nRegreso: Inhalá y volvé a flexionar el codo de forma controlada.\n\nConsejo como Entrenador:\n\nAl ser unilateral podés enfocarte en cada brazo por separado y corregir si un lado está más débil que el otro -- una ventaja sobre la versión con cuerda a dos manos.'
  ),
  (
    'Extensión de tríceps en polea cruzada (cross)',
    'Push',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/extension-triceps-polea-cruzada.gif',
    'aislado',
    false,
    array['Tríceps'],
    E'Paso inicial: Parate en el centro de una máquina cross (polea doble), sosteniendo un agarre en cada mano desde las poleas altas.\n\nPosición inicial: Codos flexionados a la altura del pecho, brazos cruzados frente al cuerpo.\n\nMovimiento: Exhalá y extendé ambos brazos hacia abajo y hacia afuera, estirando los codos por completo.\n\nContracción: Apretá el tríceps un instante en la extensión completa.\n\nRegreso: Inhalá y volvé a flexionar los codos de forma controlada.\n\nConsejo como Entrenador:\n\nEl cruce de los cables suma una línea de tensión distinta a la de una polea simple -- mantené el torso fijo y dejá que el movimiento salga solo de los codos.'
  ),
  (
    'Extensión de tríceps en polea lateral a un brazo',
    'Push',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/extension-triceps-polea-lateral-un-brazo.gif',
    'aislado',
    true,
    array['Tríceps'],
    E'Paso inicial: Parate de costado a una polea alta, con el codo de la mano más cercana a la máquina flexionado y pegado al cuerpo.\n\nPosición inicial: Codo fijo junto a las costillas, antebrazo cruzado al frente del cuerpo.\n\nMovimiento: Exhalá y extendé el codo hacia abajo y hacia el costado, sin despegarlo del cuerpo.\n\nContracción: Apretá el tríceps un instante en la extensión completa.\n\nRegreso: Inhalá y volvé a flexionar el codo de forma controlada.\n\nConsejo como Entrenador:\n\nLa posición lateral cambia el ángulo de tracción respecto a la polea tradicional de frente -- mantené el codo bien pegado al cuerpo durante todo el recorrido para no perder tensión.'
  ),
  (
    'Extensión de tríceps con polea por detrás (Rear Drive)',
    'Push',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/extension-triceps-polea-rear-drive.gif',
    'aislado',
    true,
    array['Tríceps'],
    E'Paso inicial: Parate de espaldas a una polea alta, con el codo de un brazo flexionado por detrás de la cabeza y la mano cerca del hombro opuesto.\n\nPosición inicial: Codo apuntando hacia arriba y atrás, brazo cruzado por detrás de la cabeza.\n\nMovimiento: Exhalá y extendé el codo llevando la mano hacia atrás y arriba, alejándola de la cabeza.\n\nContracción: Apretá el tríceps un instante en la extensión completa.\n\nRegreso: Inhalá y volvé a flexionar el codo de forma controlada.\n\nConsejo como Entrenador:\n\nEs una variante menos común que trabaja el tríceps desde un ángulo cruzado -- andá con poco peso hasta acostumbrarte a la trayectoria, que es distinta a la extensión tradicional.'
  ),
  (
    'Extensión de tríceps acostado en polea (press francés en polea acostado)',
    'Push',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/extension-triceps-acostado-polea.gif',
    'aislado',
    false,
    array['Tríceps'],
    E'Paso inicial: Acostate boca arriba en un banco plano con la cabeza cerca de la base de una polea baja, sosteniendo una cuerda con ambas manos por encima de la cabeza.\n\nPosición inicial: Brazos extendidos hacia arriba, cuerda sobre la frente.\n\nMovimiento: Inhalá y bajá la cuerda flexionando los codos, llevándola hacia atrás de la cabeza.\n\nContracción: Exhalá y extendé los codos para volver a subir la cuerda.\n\nRegreso: Repetí la bajada de forma controlada.\n\nConsejo como Entrenador:\n\nEstar acostado con la polea detrás de la cabeza mantiene tensión constante en el tríceps durante todo el recorrido, a diferencia de la versión con mancuernas o barra donde la tensión baja cerca de la posición final.'
  ),
  (
    'Press francés unilateral sentado con mancuerna',
    'Push',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/press-frances-unilateral-sentado-mancuerna.gif',
    'aislado',
    true,
    array['Tríceps'],
    E'Paso inicial: Sentate con respaldo, sosteniendo una mancuerna en una mano por encima de la cabeza.\n\nPosición inicial: Brazo extendido hacia arriba, codo apuntando al techo.\n\nMovimiento: Inhalá y bajá la mancuerna detrás de la cabeza flexionando el codo, manteniéndolo fijo y apuntando hacia arriba.\n\nContracción: Exhalá y extendé el codo para volver a subir la mancuerna.\n\nRegreso: Repetí la bajada de forma controlada.\n\nConsejo como Entrenador:\n\nTrabajar un brazo a la vez te permite corregir asimetrías de fuerza entre los dos lados -- sostené el banco o apoyá la otra mano en el codo de trabajo para más estabilidad.'
  ),
  (
    'Press francés unilateral en polea cruzada (cross)',
    'Push',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/press-frances-unilateral-polea-cruzada.gif',
    'aislado',
    true,
    array['Tríceps'],
    E'Paso inicial: Parate en el centro de una máquina cross, sosteniendo un agarre con una mano desde una polea alta, codo flexionado por encima de la cabeza.\n\nPosición inicial: Codo apuntando hacia el techo, mano detrás de la cabeza.\n\nMovimiento: Exhalá y extendé el codo llevando el agarre hacia adelante y arriba.\n\nContracción: Apretá el tríceps un instante en la extensión completa.\n\nRegreso: Inhalá y volvé a flexionar el codo de forma controlada.\n\nConsejo como Entrenador:\n\nUsar la máquina cross en vez de una polea simple te da más opciones de ángulo -- probá pararte más cerca o más lejos de la máquina para variar el estímulo.'
  );

-- Migración 075: 10 ejercicios de Pecho -- décima tanda de la revisión
-- del catálogo músculo por músculo (ver 065-074 para las anteriores).
--
-- De los 14 nombres pasados:
--   - 2 fueron duplicados EXACTOS (hash MD5 idéntico), descartados:
--       "Supien máquina máquina Smith" = id 72 "Press banca en Smith"
--       "oie_Vrzmr9YBX68H" (dumbbell bench press) = id 33 "Press de banco con mancuernas"
--   - 2 fueron near-duplicates PREEXISTENTES (mismo ejercicio real,
--     distinta ilustración -- mismo patrón que id10/id202 de la
--     migración 070), NO agregados, pendientes de confirmación del
--     usuario si hace falta revisarlos:
--       "00471301-Barbell-Incline-Bench-Press" ~ id 155 "Press banco inclinado con barra"
--       "00301301-Barbell-Close-Grip-Bench-Press" ~ id 162 "Press de banca agarre cerrado supino"
--   - 10 eran ejercicios reales faltantes, se agregan en esta migración.
--
-- GIFs ya subidos al bucket `ejercicios` de Storage. Correr en el SQL
-- Editor de Supabase.

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, tipo_esfuerzo, unilateral, grupos_musculares, como_hacerlo)
values
  (
    'Flexión de brazos con agarres (parallettes)',
    'Torso',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/flexion-brazos-agarres-parallettes.gif',
    'compuesto',
    false,
    array['Pecho'],
    E'Paso inicial: Colocá un par de agarres (parallettes) en el piso al ancho de los hombros y apoyá las manos sobre ellos en posición de plancha.\n\nPosición inicial: Cuerpo recto de pies a cabeza, brazos extendidos, core activado.\n\nMovimiento: Inhalá y bajá el pecho flexionando los codos, dejando que baje por debajo del nivel de las manos gracias a la altura de los agarres.\n\nContracción: Exhalá y empujá con fuerza para volver a extender los brazos.\n\nRegreso: Controlá la bajada en cada repetición.\n\nConsejo como Entrenador:\n\nLos agarres elevados suman un rango de movimiento mayor que la flexión tradicional en el piso -- vas a sentir un estiramiento extra del pecho abajo, pero exige más movilidad de hombro.'
  ),
  (
    'Flexión de brazos abierta (agarre ancho)',
    'Torso',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/flexion-brazos-abierta-agarre-ancho.gif',
    'compuesto',
    false,
    array['Pecho'],
    E'Paso inicial: Apoyate en el piso en posición de plancha con las manos bien separadas, más anchas que los hombros.\n\nPosición inicial: Cuerpo recto, core activado, brazos casi extendidos.\n\nMovimiento: Inhalá y bajá el pecho flexionando los codos hacia los costados.\n\nContracción: Exhalá y empujá con fuerza para volver a extender los brazos.\n\nRegreso: Controlá la bajada en cada repetición.\n\nConsejo como Entrenador:\n\nEl agarre ancho reduce el recorrido pero suma más énfasis en la parte externa del pecho -- si sentís molestia en el hombro, achicá un poco la separación de las manos.'
  ),
  (
    'Flexión de brazos declinada (pies elevados)',
    'Torso',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/flexion-brazos-declinada-pies-elevados.gif',
    'compuesto',
    false,
    array['Pecho'],
    E'Paso inicial: Apoyá los pies sobre un banco y las manos en el piso al ancho de los hombros, quedando en posición de plancha declinada.\n\nPosición inicial: Cuerpo recto, core activado, brazos casi extendidos.\n\nMovimiento: Inhalá y bajá el pecho flexionando los codos.\n\nContracción: Exhalá y empujá con fuerza para volver a extender los brazos.\n\nRegreso: Controlá la bajada en cada repetición.\n\nConsejo como Entrenador:\n\nElevar los pies desplaza más peso corporal hacia los brazos y suma énfasis en la parte superior del pecho -- es una progresión más exigente que la flexión tradicional.'
  ),
  (
    'Press de banca agarre cerrado con barra EZ',
    'Push',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/press-banca-agarre-cerrado-barra-ez.gif',
    'compuesto',
    false,
    array['Pecho'],
    E'Paso inicial: Acostate en un banco plano y tomá una barra EZ con un agarre cerrado, manos separadas al ancho de los hombros o un poco menos.\n\nPosición inicial: Barra sobre el pecho, brazos extendidos.\n\nMovimiento: Inhalá y bajá la barra de forma controlada hasta rozar el pecho, manteniendo los codos cerca del cuerpo.\n\nContracción: Exhalá y empujá la barra hacia arriba hasta extender los brazos.\n\nRegreso: Repetí el descenso de forma controlada.\n\nConsejo como Entrenador:\n\nLa curvatura de la barra EZ le saca tensión a la muñeca comparado con una barra recta -- una buena opción si sentís molestia con el agarre cerrado tradicional.'
  ),
  (
    'Flexión de brazos cerrada (diamante)',
    'Torso',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/flexion-brazos-cerrada-diamante.gif',
    'compuesto',
    false,
    array['Pecho'],
    E'Paso inicial: Apoyate en el piso en posición de plancha, con las manos juntas debajo del pecho formando un triángulo con los dedos.\n\nPosición inicial: Cuerpo recto, core activado, brazos casi extendidos.\n\nMovimiento: Inhalá y bajá el pecho flexionando los codos, manteniéndolos cerca del cuerpo.\n\nContracción: Exhalá y empujá con fuerza para volver a extender los brazos.\n\nRegreso: Controlá la bajada en cada repetición.\n\nConsejo como Entrenador:\n\nEl agarre cerrado suma mucho más trabajo de tríceps que la flexión tradicional -- si todavía no te sale con buena técnica, practicá primero con las rodillas apoyadas.'
  ),
  (
    'Press banco plano con barra agarre ancho',
    'Push',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/press-banco-plano-barra-agarre-ancho.gif',
    'compuesto',
    false,
    array['Pecho'],
    E'Paso inicial: Acostate en un banco plano y tomá la barra con un agarre bien abierto, más ancho que los hombros.\n\nPosición inicial: Barra sobre el pecho, brazos extendidos.\n\nMovimiento: Inhalá y bajá la barra de forma controlada hasta rozar el pecho.\n\nContracción: Exhalá y empujá la barra hacia arriba hasta extender los brazos.\n\nRegreso: Repetí el descenso de forma controlada.\n\nConsejo como Entrenador:\n\nEl agarre ancho acorta el recorrido de la barra pero suma más estrés al hombro -- asegurate de tener buena movilidad antes de cargar peso pesado con esta variante.'
  ),
  (
    'Press de banco declinado con mancuernas',
    'Push',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/press-banco-declinado-mancuernas.gif',
    'compuesto',
    false,
    array['Pecho'],
    E'Paso inicial: Acostate en un banco declinado (cabeza más abajo que las piernas), con una mancuerna en cada mano a la altura del pecho.\n\nPosición inicial: Piernas trabadas en el soporte del banco, mancuernas sobre el pecho, brazos extendidos.\n\nMovimiento: Inhalá y bajá las mancuernas de forma controlada hasta la altura del pecho.\n\nContracción: Exhalá y empujá las mancuernas hacia arriba hasta extender los brazos.\n\nRegreso: Repetí el descenso de forma controlada.\n\nConsejo como Entrenador:\n\nLa inclinación negativa del banco pone más énfasis en la parte inferior del pecho -- usá menos peso que en la versión plana hasta acostumbrarte a la posición invertida.'
  ),
  (
    'Press de banca con barra (pies en el banco)',
    'Push',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/press-banca-barra-pies-en-banco.gif',
    'compuesto',
    false,
    array['Pecho'],
    E'Paso inicial: Acostate en un banco plano y apoyá los pies sobre el mismo banco (en vez del piso), con la barra sobre el pecho.\n\nPosición inicial: Espalda apoyada, core activado, brazos extendidos con la barra sobre el pecho.\n\nMovimiento: Inhalá y bajá la barra de forma controlada hasta rozar el pecho.\n\nContracción: Exhalá y empujá la barra hacia arriba hasta extender los brazos.\n\nRegreso: Repetí el descenso de forma controlada.\n\nConsejo como Entrenador:\n\nSacar los pies del piso elimina el impulso de piernas y aplana la zona lumbar contra el banco -- vas a mover menos peso que en la versión tradicional, pero el pecho trabaja más puro.'
  ),
  (
    'Floor press con mancuernas',
    'Push',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/floor-press-mancuernas.gif',
    'compuesto',
    false,
    array['Pecho'],
    E'Paso inicial: Acostate en el piso boca arriba con las rodillas flexionadas y una mancuerna en cada mano a la altura del pecho.\n\nPosición inicial: Brazos flexionados, codos apoyados en el piso, mancuernas sobre el pecho.\n\nMovimiento: Exhalá y empujá las mancuernas hacia arriba hasta extender los brazos.\n\nContracción: Apretá el pecho un instante arriba.\n\nRegreso: Inhalá y bajá las mancuernas hasta que los codos toquen el piso, sin rebotar.\n\nConsejo como Entrenador:\n\nEl piso corta el recorrido apenas el codo lo toca -- eso saca la parte más profunda del movimiento y le baja el estrés al hombro, una buena opción si venís de una molestia o querés entrenar el press sin banco.'
  ),
  (
    'Aperturas con mancuernas en el piso con rodillo (rango extendido)',
    'Torso',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/aperturas-mancuernas-piso-rodillo.gif',
    'aislado',
    false,
    array['Pecho'],
    E'Paso inicial: Acostate en el piso con un rodillo o cilindro apoyado debajo de la parte alta de la espalda (a la altura de los omóplatos), rodillas flexionadas y pies apoyados, sosteniendo una mancuerna en cada mano por encima del pecho.\n\nPosición inicial: Brazos casi extendidos, palmas enfrentadas, hombros por debajo del nivel del torso gracias al rodillo.\n\nMovimiento: Inhalá y abrí los brazos hacia los costados en forma de arco, dejando que bajen por debajo de la línea del cuerpo.\n\nContracción: Exhalá y juntá las mancuernas arriba, apretando el pecho.\n\nRegreso: Repetí la apertura de forma controlada.\n\nConsejo como Entrenador:\n\nEl rodillo debajo de la espalda permite que el hombro baje más de lo que podría en un banco plano, sumando un estiramiento extra al pecho -- mantené siempre una leve flexión fija en el codo para no forzar la articulación.'
  );

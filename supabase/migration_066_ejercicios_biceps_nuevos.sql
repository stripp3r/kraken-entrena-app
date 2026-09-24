-- Migración 066: 2 ejercicios de Bíceps que estaban en la biblioteca de
-- referencia pero no en el catálogo -- segunda tanda de la revisión
-- músculo por músculo (ver migración 065 para la primera, Abdominales).
--
-- "Curl Scott a un brazo agarre invertido" se clasifica como
-- [Antebrazos, Bíceps] (Antebrazos primero) -- el agarre pronado le saca
-- protagonismo al bíceps braquial y se lo da al braquiorradial; el propio
-- archivo de la biblioteca lo etiqueta "_Forearms_", no "_Upper-Arms_".
--
-- GIFs ya subidos al bucket `ejercicios` de Storage. Correr en el SQL
-- Editor de Supabase.

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, tipo_esfuerzo, unilateral, grupos_musculares, como_hacerlo)
values
  (
    'Curl spider con barra EZ',
    'Pull',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/curl-spider-con-barra-ez.gif',
    'aislado',
    false,
    array['Bíceps'],
    E'Paso inicial: Acostate boca abajo sobre un banco inclinado (spider curl), con el pecho apoyado y los brazos colgando hacia adelante, sosteniendo una barra EZ con agarre supino.\n\nPosición inicial: Brazos completamente extendidos, codos apuntando al piso, core y pecho firmes contra el banco.\n\nMovimiento: Exhalá y flexioná los codos llevando la barra hacia la parte superior de los brazos, sin despegar los brazos del banco.\n\nContracción: Apretá el bíceps un instante en el punto más alto.\n\nRegreso: Inhalá y bajá la barra de forma controlada hasta la extensión completa.\n\nConsejo como Entrenador:\n\nEl apoyo del pecho en el banco elimina el impulso del cuerpo -- si sentís que balanceás los hombros para ayudar, bajá el peso.\n\nLa posición estira más el bíceps en la parte baja que un curl parado, prestá atención ahí especialmente.'
  ),
  (
    'Curl Scott a un brazo agarre invertido',
    'Pull',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/curl-scott-a-un-brazo-agarre-invertido.gif',
    'aislado',
    true,
    array['Antebrazos', 'Bíceps'],
    E'Paso inicial: Sentate en un banco Scott y apoyá un brazo sobre el respaldo, sosteniendo una mancuerna con la palma hacia abajo (agarre pronado).\n\nPosición inicial: Brazo extendido apoyado en el banco, muñeca firme, core activado.\n\nMovimiento: Exhalá y flexioná el codo llevando la mancuerna hacia el hombro, manteniendo la palma hacia abajo durante todo el recorrido.\n\nContracción: Apretá el antebrazo/bíceps un instante en el punto más alto.\n\nRegreso: Inhalá y bajá la mancuerna de forma controlada hasta la extensión completa.\n\nConsejo como Entrenador:\n\nEl agarre invertido (prono) le saca protagonismo al bíceps y se lo da al braquiorradial (antebrazo) -- por eso el peso que vas a mover es bastante menor que en un curl tradicional, no es motivo de preocupación.\n\nNo dejes que la muñeca se quiebre hacia abajo en la bajada -- mantenela firme.'
  );

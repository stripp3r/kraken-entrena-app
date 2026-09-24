-- Migración 069: 3 ejercicios de Isquiotibiales -- quinta tanda de la
-- revisión del catálogo músculo por músculo (ver 065-068 para las
-- anteriores).
--
-- Incluye "Peso muerto rumano con landmine", que originalmente el usuario
-- había pasado en la tanda de Cuádriceps (carpeta equivocada) -- se dejó
-- afuera de la migración 067 a propósito y se carga acá, en el grupo
-- correcto (confirmado por el usuario).
--
-- "Curl femoral en camilla unilateral (GIF pack).gif" resultó ser un
-- duplicado exacto de "Curl femoral tumbado unilateral" (id 130) ya
-- cargado -- no se agregó.
--
-- GIFs ya subidos al bucket `ejercicios` de Storage. Correr en el SQL
-- Editor de Supabase.

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, tipo_esfuerzo, unilateral, grupos_musculares, como_hacerlo)
values
  (
    'Peso muerto sumo',
    'Pull',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/peso-muerto-sumo.gif',
    'compuesto',
    false,
    array['Isquiotibiales', 'Glúteos', 'Cuádriceps'],
    E'Paso inicial: Parate con los pies bien separados (más anchos que los hombros) y las puntas apuntando hacia afuera, la barra en el piso frente a vos.\n\nPosición inicial: Agarrá la barra por dentro de las piernas, brazos verticales, pecho arriba, espalda recta.\n\nMovimiento: Exhalá y empujá el piso con ambos pies, extendiendo caderas y rodillas al mismo tiempo hasta quedar completamente parado.\n\nContracción: Apretá glúteos un instante arriba, sin hiperextender la zona lumbar.\n\nRegreso: Inhalá y bajá la barra pegada a las piernas, flexionando cadera y rodillas a la vez.\n\nConsejo como Entrenador:\n\nLa postura sumo acorta el recorrido y suma más cuádriceps y aductores que un peso muerto convencional -- suele permitir mover más peso, pero exige buena movilidad de cadera.\n\nLas rodillas tienen que empujar hacia afuera, en la misma dirección que los pies, durante todo el movimiento.'
  ),
  (
    'Hiperextensión inversa en máquina',
    'Pull',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/hiperextension-inversa-maquina.gif',
    'aislado',
    false,
    array['Glúteos', 'Isquiotibiales'],
    E'Paso inicial: Acostate boca abajo sobre la máquina con la cadera en el borde del banco, sostenete de los agarres con ambas manos y enganchá los tobillos en el rodillo.\n\nPosición inicial: Piernas colgando hacia abajo, torso firme sobre el banco, core activado.\n\nMovimiento: Exhalá y elevá las piernas hacia atrás y arriba hasta que queden alineadas con el torso.\n\nContracción: Apretá glúteos e isquiotibiales un instante en la posición más alta.\n\nRegreso: Inhalá y bajá las piernas de forma controlada hasta la posición inicial.\n\nConsejo como Entrenador:\n\nA diferencia de la hiperextensión tradicional (donde se mueve el torso y las piernas quedan fijas), acá es al revés -- las piernas se mueven y el torso queda fijo, lo que le saca presión a la zona lumbar.'
  ),
  (
    'Peso muerto rumano con landmine',
    'Pull',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/peso-muerto-rumano-landmine.gif',
    'compuesto',
    false,
    array['Isquiotibiales', 'Glúteos'],
    E'Paso inicial: Parate frente a una barra anclada en un landmine, sosteniendo la punta con ambas manos frente a los muslos.\n\nPosición inicial: Pies al ancho de cadera, rodillas con una leve flexión fija, espalda recta.\n\nMovimiento: Inhalá y empujá la cadera hacia atrás, bajando la punta de la barra pegada a las piernas, hasta sentir el estiramiento en los isquiotibiales.\n\nContracción: Exhalá y empujá la cadera hacia adelante para volver a subir, apretando glúteos arriba.\n\nRegreso: Extendé la cadera hasta la posición inicial, sin hiperextender la zona lumbar.\n\nConsejo como Entrenador:\n\nEl ángulo del landmine hace que la resistencia se sienta distinta a una barra libre -- la carga aumenta a medida que te parás más derecho.\n\nEs una buena opción para quien recién arranca con el patrón de bisagra de cadera, la trayectoria fija ayuda a mantener la técnica.'
  );

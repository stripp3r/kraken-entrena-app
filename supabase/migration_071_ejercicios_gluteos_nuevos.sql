-- Migración 071: 2 ejercicios de Glúteos -- séptima tanda de la
-- revisión del catálogo músculo por músculo (ver 065-070 para las
-- anteriores). De los 4 nombres pasados, 2 resultaron duplicados exactos
-- (hash MD5 idéntico al archivo ya cargado) y se descartaron:
--   "Extensão de cadera 01"        = id 106 "Patada de glúteo con pierna extendida"
--   "Elevação pélvica unilateral"  = id 107 "Patada de glúteo cruzada Fire Hydrant"
--
-- NOTA aparte sobre id 107: al comparar se notó que su nombre actual en
-- la base ("Patada de glúteo cruzada Fire Hydrant") no coincide con lo
-- que muestra la imagen (un puente de glúteos unilateral acostado boca
-- arriba, no una patada cruzada en cuadrupedia). Posible error de nombre
-- preexistente, ajeno a esta migración -- no se tocó, queda documentado
-- por si el usuario quiere corregirlo.
--
-- GIFs ya subidos al bucket `ejercicios` de Storage. Correr en el SQL
-- Editor de Supabase.

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, tipo_esfuerzo, unilateral, grupos_musculares, como_hacerlo)
values
  (
    'Patada de glúteo parada en banco',
    'Legs',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/patada-de-gluteo-parada-en-banco.gif',
    'aislado',
    true,
    array['Glúteos'],
    E'Paso inicial: Parate sobre un banco plano con una rodilla apoyada y ligeramente flexionada, y las manos apoyadas en el extremo del banco para sostener el equilibrio.\n\nPosición inicial: Torso inclinado hacia adelante, pierna libre colgando fuera del banco con la rodilla extendida.\n\nMovimiento: Exhalá y llevá la pierna libre hacia atrás y arriba, por encima de la línea del banco, extendiendo la cadera.\n\nContracción: Apretá el glúteo un instante en el punto más alto.\n\nRegreso: Inhalá y bajá la pierna de forma controlada, dejando que baje por debajo del nivel del banco para aprovechar el estiramiento.\n\nConsejo como Entrenador:\n\nAl estar parado sobre el banco en vez del piso, la pierna que trabaja tiene más recorrido hacia abajo, lo que suma un estiramiento extra al glúteo en cada repetición.\n\nMantené la rodilla de apoyo con una leve flexión fija durante todo el movimiento para no perder el equilibrio.'
  ),
  (
    'Patada de glúteo en máquina de cuadrupedia',
    'Legs',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/patada-de-gluteo-maquina-cuadrupedia.gif',
    'aislado',
    true,
    array['Glúteos'],
    E'Paso inicial: Apoyá las rodillas y los antebrazos sobre las plataformas acolchadas de la máquina, quedando en posición de cuadrupedia, y enganchá el tobillo en el soporte de la polea.\n\nPosición inicial: Espalda neutra, core activado, pierna de trabajo con la rodilla flexionada cerca del pecho.\n\nMovimiento: Exhalá y empujá la plataforma hacia atrás y arriba, extendiendo la cadera de la pierna enganchada.\n\nContracción: Apretá el glúteo un instante en el punto más alto, sin hiperextender la zona lumbar.\n\nRegreso: Inhalá y llevá la pierna de vuelta a la posición inicial de forma controlada.\n\nConsejo como Entrenador:\n\nLa posición de cuadrupedia fija el torso y aísla mejor el glúteo que la patada de glúteo en polea parado -- es una buena opción para sentir mejor el músculo sin compensar con la zona lumbar.'
  );

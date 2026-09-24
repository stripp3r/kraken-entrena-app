-- Migración 076: 2 ejercicios de Trapecio -- oncena tanda de la
-- revisión del catálogo músculo por músculo (ver 065-075 para las
-- anteriores). Los 2 nombres pasados resultaron ser ejercicios reales
-- faltantes (posición/equipo distintos a los encogimientos ya
-- cargados: barra, mancuernas, polea de pie, banco inclinado),
-- ninguno duplicado.
--
-- GIFs ya subidos al bucket `ejercicios` de Storage. Correr en el SQL
-- Editor de Supabase.

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, tipo_esfuerzo, unilateral, grupos_musculares, como_hacerlo)
values
  (
    'Encogimiento de hombros acostado en polea',
    'Torso',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/encogimiento-hombros-acostado-polea.gif',
    'aislado',
    false,
    array['Trapecio'],
    E'Paso inicial: Acostate boca arriba en un banco plano, con la cabeza cerca de la base de una polea baja, sosteniendo un agarre en cada mano por detrás de la cabeza.\n\nPosición inicial: Brazos casi extendidos hacia atrás, hombros relajados.\n\nMovimiento: Exhalá y elevá los hombros hacia las orejas, sin flexionar los codos.\n\nContracción: Apretá el trapecio un instante en el punto más alto.\n\nRegreso: Inhalá y bajá los hombros de forma controlada, dejando que se estiren hacia atrás.\n\nConsejo como Entrenador:\n\nEstar acostado saca el impulso de piernas y cadera que aparece en el encogimiento parado -- el trapecio trabaja aislado, sin ayuda del resto del cuerpo.'
  ),
  (
    'Encogimiento de hombros con banda elástica',
    'Torso',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/encogimiento-hombros-banda-elastica.gif',
    'aislado',
    false,
    array['Trapecio'],
    E'Paso inicial: Parate sobre el centro de una banda elástica con ambos pies, sosteniendo un extremo en cada mano a los costados del cuerpo.\n\nPosición inicial: Brazos extendidos, banda con tensión, hombros relajados.\n\nMovimiento: Exhalá y elevá los hombros hacia las orejas, sin flexionar los codos.\n\nContracción: Apretá el trapecio un instante en el punto más alto.\n\nRegreso: Inhalá y bajá los hombros de forma controlada, resistiendo la tensión de la banda.\n\nConsejo como Entrenador:\n\nA diferencia de la barra o la mancuerna, la banda tiene más tensión arriba que abajo -- es una buena opción para sumar al final de la rutina cuando ya no tenés más peso disponible.'
  );

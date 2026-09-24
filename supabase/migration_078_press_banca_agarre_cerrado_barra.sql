-- Migración 078: agrega "Press de banca agarre cerrado con barra recta",
-- que en la migración 075 se había dejado afuera como posible
-- near-duplicate de id 162 "Press de banca agarre cerrado supino". El
-- usuario corrigió: el ancho de agarre (cerrado vs. amplio) es en sí
-- mismo lo que distingue variantes de press de banca, así que no
-- corresponde tratarlo como duplicado -- se agrega como ejercicio
-- aparte, en la misma línea que ya se hizo con "Press banco plano con
-- barra agarre ancho" (migración 075) y "Press de banca agarre cerrado
-- con barra EZ" (también 075).
--
-- GIF ya subido al bucket `ejercicios` de Storage. Correr en el SQL
-- Editor de Supabase.

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, tipo_esfuerzo, unilateral, grupos_musculares, como_hacerlo)
values
  (
    'Press de banca agarre cerrado con barra recta',
    'Push',
    'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/press-banca-agarre-cerrado-barra-recta.gif',
    'compuesto',
    false,
    array['Tríceps', 'Pecho'],
    E'Paso inicial: Acostate en un banco plano y tomá la barra recta con un agarre cerrado, manos separadas al ancho de los hombros o un poco menos.\n\nPosición inicial: Barra sobre el pecho, brazos extendidos.\n\nMovimiento: Inhalá y bajá la barra de forma controlada hasta rozar la parte baja del pecho, manteniendo los codos cerca del cuerpo.\n\nContracción: Exhalá y empujá la barra hacia arriba hasta extender los brazos.\n\nRegreso: Repetí el descenso de forma controlada.\n\nConsejo como Entrenador:\n\nEl agarre cerrado con barra recta le suma más trabajo al tríceps que el press estándar -- mantené los codos pegados al cuerpo, no abiertos, para que el hombro no cargue de más.'
  );

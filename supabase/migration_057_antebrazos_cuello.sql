-- Migración 057: primeros ejercicios de Antebrazos y Cuello -- los dos
-- grupos musculares que quedaron en 0 después de la migración 055 (no
-- porque falte clasificar nada, sino porque el catálogo todavía no tenía
-- ningún ejercicio de esos grupos). El usuario pidió 4 básicos de cada uno
-- para tener un piso, no el listado completo.
--
-- GIFs ya subidos al bucket `ejercicios` en esta sesión, cada uno comparado
-- por contenido (perceptual hash de varios frames) contra los 180 GIFs ya
-- existentes en el catálogo antes de subirlos -- ninguno es duplicado (regla
-- de proceso agregada en la migración 056, aplicada ya en esta tanda).

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Curl de muñeca con barra', 'Pull',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/antebrazo-curl-muneca-barra.gif',
  'Sentate en un banco con los antebrazos apoyados sobre los muslos, palmas hacia arriba, sosteniendo la barra con agarre prono. Dejá caer la barra hacia las puntas de los dedos y después flexioná la muñeca llevándola hacia arriba, sin mover el antebrazo. Bajá controlado.',
  'aislado', false, ARRAY['Antebrazos']
where not exists (select 1 from public.exercise_definitions where nombre = 'Curl de muñeca con barra');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Curl de muñeca invertida con mancuernas', 'Pull',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/antebrazo-curl-muneca-invertida-mancuernas.gif',
  'Sentate con los antebrazos apoyados sobre los muslos, palmas hacia abajo, sosteniendo una mancuerna en cada mano. Extendé la muñeca levantando el dorso de la mano hacia arriba y bajá controlado, sin mover el antebrazo. Trabaja el lado opuesto al curl de muñeca tradicional.',
  'aislado', false, ARRAY['Antebrazos']
where not exists (select 1 from public.exercise_definitions where nombre = 'Curl de muñeca invertida con mancuernas');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Curl con barra agarre invertido', 'Pull',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/antebrazo-curl-barra-agarre-invertido.gif',
  'Parado, sostené la barra con agarre prono (palmas hacia abajo), manos separadas al ancho de los hombros. Flexioná los codos llevando la barra hacia el pecho sin mover los brazos del torso, y bajá controlado hasta la extensión completa. El agarre invertido pone mucho más énfasis en el antebrazo que el curl tradicional.',
  'aislado', false, ARRAY['Antebrazos']
where not exists (select 1 from public.exercise_definitions where nombre = 'Curl con barra agarre invertido');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Prensión manual', 'Pull',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/antebrazo-prension-manual.gif',
  'De pie o sentado, sostené un dinamómetro o gripper de mano y cerrá los dedos con fuerza máxima, manteniendo la contracción unos segundos antes de soltar. Hacé las repeticiones con una mano y después con la otra. Ejercicio isométrico para fuerza de agarre.',
  'aislado', true, ARRAY['Antebrazos']
where not exists (select 1 from public.exercise_definitions where nombre = 'Prensión manual');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Extensión de cuello acostado con peso', 'Torso',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/cuello-extension-acostado-peso.gif',
  'Acostado boca abajo en un banco con la cabeza fuera del borde, sostené un disco contra la nuca con ambas manos. Extendé el cuello llevando la cabeza hacia atrás y arriba, y volvé controlado a la posición inicial. Movimiento chico, sin cargar peso de más.',
  'aislado', false, ARRAY['Cuello']
where not exists (select 1 from public.exercise_definitions where nombre = 'Extensión de cuello acostado con peso');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Flexión de cuello acostado con peso', 'Torso',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/cuello-flexion-acostado-peso.gif',
  'Acostado boca arriba en un banco con la cabeza fuera del borde, sostené un disco apoyado sobre la frente con ambas manos. Flexioná el cuello llevando el mentón hacia el pecho, y volvé controlado a la posición inicial. Movimiento chico, sin cargar peso de más.',
  'aislado', false, ARRAY['Cuello']
where not exists (select 1 from public.exercise_definitions where nombre = 'Flexión de cuello acostado con peso');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Extensión de cuello en polea con arnés', 'Torso',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/cuello-extension-polea-arnes.gif',
  'Sentado de espaldas a la polea con un arnés de cabeza enganchado al cable, inclinate levemente hacia adelante. Extendé el cuello llevando la cabeza hacia atrás contra la resistencia de la polea, y volvé controlado.',
  'aislado', false, ARRAY['Cuello']
where not exists (select 1 from public.exercise_definitions where nombre = 'Extensión de cuello en polea con arnés');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral, grupos_musculares)
select 'Flexión de cuello en polea con arnés', 'Torso',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/cuello-flexion-polea-arnes.gif',
  'Sentado de frente a la polea con un arnés de cabeza enganchado al cable, inclinate levemente hacia atrás. Flexioná el cuello llevando el mentón hacia el pecho contra la resistencia de la polea, y volvé controlado.',
  'aislado', false, ARRAY['Cuello']
where not exists (select 1 from public.exercise_definitions where nombre = 'Flexión de cuello en polea con arnés');

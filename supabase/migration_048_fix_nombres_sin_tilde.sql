-- Migración 048: 14 ejercicios de la migración 047 quedaron sin imagen_url
-- (y sin poder completar video_url) porque el Dashboard de Supabase
-- rechaza subir archivos cuyo NOMBRE tiene alguna tilde (á, é, í, ó, ú) --
-- "File name is invalid". Es el mismo motivo por el que los ejercicios
-- viejos (cuadriceps-prensa.gif, curl-biceps-...) ya usaban nombres de
-- archivo sin tilde -- acá se aplica el mismo criterio, pero SOLO al
-- nombre del archivo en Storage. El `nombre` del ejercicio en la base
-- sigue con tilde, como corresponde en español.
--
-- Los archivos ya renombrados (sin tilde) están en las carpetas
-- gifs-faltantes-sin-tilde/ y videos-faltantes-sin-tilde/ del repo --
-- subilos a los buckets "ejercicios" y "ejercicios-video" ANTES de correr
-- esta migración (si no, el link va a quedar apuntando a un archivo que
-- todavía no existe -- no rompe nada, pero no se ve la imagen hasta subirlo).
--
-- Correr en el SQL Editor de Supabase después de la migración 047, y
-- después de subir los archivos sin tilde a Storage.

update public.exercise_definitions set
  imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/Activacion de gluteo de rodillas con banda.gif'
where nombre = 'Activación de glúteo de rodillas con banda';

update public.exercise_definitions set
  imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/Aperturas en maquina Pec Deck.gif'
where nombre = 'Aperturas en máquina Pec Deck';

update public.exercise_definitions set
  imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/Crunch basico.gif'
where nombre = 'Crunch básico';

update public.exercise_definitions set
  imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/Elevacion de cadera con rodillas flexionadas.gif'
where nombre = 'Elevación de cadera con rodillas flexionadas';

update public.exercise_definitions set
  imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/Elevacion de cadera en plancha lateral.gif'
where nombre = 'Elevación de cadera en plancha lateral';

update public.exercise_definitions set
  imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/Elevacion de piernas acostado.gif'
where nombre = 'Elevación de piernas acostado';

update public.exercise_definitions set
  imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/Elevacion de piernas sentado con apoyo de manos.gif'
where nombre = 'Elevación de piernas sentado con apoyo de manos';

update public.exercise_definitions set
  imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/Elevacion de rodillas al pecho.gif'
where nombre = 'Elevación de rodillas al pecho';

update public.exercise_definitions set
  imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/Elevacion de rodillas sentado con apoyo de manos.gif'
where nombre = 'Elevación de rodillas sentado con apoyo de manos';

update public.exercise_definitions set
  imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/Elevacion frontal con mancuernas.gif'
where nombre = 'Elevación frontal con mancuernas';

update public.exercise_definitions set
  imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/Patada de gluteo con banda de resistencia.gif'
where nombre = 'Patada de glúteo con banda de resistencia';

update public.exercise_definitions set
  imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/Patada de gluteo con pierna extendida.gif'
where nombre = 'Patada de glúteo con pierna extendida';

update public.exercise_definitions set
  imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/Patada de gluteo cruzada Fire Hydrant.gif'
where nombre = 'Patada de glúteo cruzada Fire Hydrant';

-- video_url / video_url_fem: mismo criterio que el bloque genérico de la
-- migración 047, pero matcheando contra los nombres de archivo SIN tilde
-- (no contra `nombre || '.mp4'`, que ahora no coincide con el archivo real).

update public.exercise_definitions set video_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios-video/Activacion de gluteo de rodillas con banda.mp4'
where nombre = 'Activación de glúteo de rodillas con banda';

update public.exercise_definitions set video_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios-video/Aperturas en maquina Pec Deck.mp4'
where nombre = 'Aperturas en máquina Pec Deck';

update public.exercise_definitions set video_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios-video/Crunch basico.mp4'
where nombre = 'Crunch básico';

update public.exercise_definitions set video_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios-video/Elevacion de cadera con rodillas flexionadas.mp4'
where nombre = 'Elevación de cadera con rodillas flexionadas';

update public.exercise_definitions set video_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios-video/Elevacion de cadera en plancha lateral.mp4'
where nombre = 'Elevación de cadera en plancha lateral';

update public.exercise_definitions set video_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios-video/Elevacion de piernas acostado.mp4'
where nombre = 'Elevación de piernas acostado';

update public.exercise_definitions set video_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios-video/Elevacion de piernas sentado con apoyo de manos.mp4'
where nombre = 'Elevación de piernas sentado con apoyo de manos';

update public.exercise_definitions set video_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios-video/Elevacion de rodillas al pecho.mp4'
where nombre = 'Elevación de rodillas al pecho';

update public.exercise_definitions set video_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios-video/Elevacion de rodillas sentado con apoyo de manos.mp4'
where nombre = 'Elevación de rodillas sentado con apoyo de manos';

update public.exercise_definitions set
  video_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios-video/Elevacion frontal con mancuernas.mp4',
  video_url_fem = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios-video/Elevacion frontal con mancuernas FEM.mp4'
where nombre = 'Elevación frontal con mancuernas';

update public.exercise_definitions set video_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios-video/Patada de gluteo con banda de resistencia.mp4'
where nombre = 'Patada de glúteo con banda de resistencia';

update public.exercise_definitions set video_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios-video/Patada de gluteo con pierna extendida.mp4'
where nombre = 'Patada de glúteo con pierna extendida';

update public.exercise_definitions set video_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios-video/Patada de gluteo cruzada Fire Hydrant.mp4'
where nombre = 'Patada de glúteo cruzada Fire Hydrant';

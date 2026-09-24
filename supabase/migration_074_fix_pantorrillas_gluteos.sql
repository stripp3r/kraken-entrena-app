-- Migración 074: correcciones puntuales al catálogo, confirmadas por el
-- usuario, resultado de los hallazgos de las migraciones 070 y 071.
--
-- 1) Pantorrillas: id 10 "Elevación de talón en máquina Smith" e id 202
--    "Elevación de talón en Smith" eran el mismo ejercicio real (dos
--    ilustraciones distintas). id 202 no tenía ninguna referencia en
--    routine_exercises ni workout_logs (verificado antes de borrar).
--    El usuario confirmó que son el mismo ejercicio y pidió que quede
--    uno solo -- se borra id 202, queda id 10.
delete from public.exercise_definitions where id = 202;

-- 2) Glúteos: id 107 se había renombrado por error a "Puente de glúteos
--    unilateral" al sospechar (por la imagen) que el nombre "Patada de
--    glúteo cruzada Fire Hydrant" estaba mal puesto. Revisando más a
--    fondo, el `como_hacerlo` y el `video_url` de id 107 sí describen
--    correctamente un fire hydrant en cuadrupedia -- el nombre original
--    era correcto. El error real es que el `imagen_url` (GIF) tiene
--    cargado el archivo equivocado (muestra un puente de glúteos
--    unilateral, no un fire hydrant). Se revierte el nombre; el GIF
--    queda pendiente de reemplazo por uno correcto (no se tocó, no hay
--    imagen correcta disponible todavía).
update public.exercise_definitions
  set nombre = 'Patada de glúteo cruzada Fire Hydrant'
  where id = 107;

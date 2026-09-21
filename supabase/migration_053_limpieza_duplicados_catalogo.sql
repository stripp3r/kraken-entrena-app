-- Migración 053: limpieza de 15 pares de ejercicios duplicados en el
-- catálogo, detectados comparando el GIF de los 126 ejercicios por hash
-- (no por nombre) -- 11 eran el mismo ejercicio con dos nombres (se
-- fusionan), y separado se corrigen 4 GIFs que eran de un ejercicio
-- distinto compartido por error + 1 GIF roto (Hack Squat, ya resuelto
-- subiendo de nuevo el archivo con el mismo nombre, no necesita UPDATE).
--
-- Cada fusión redirige routine_exercises y workout_logs del id que se
-- borra hacia el id que se mantiene, para no perder ni el uso en rutinas
-- ni el historial de nadie.
--
-- Correr en el SQL Editor de Supabase después de la migración 052 y de
-- subir los 5 GIFs de reemplazo al bucket `ejercicios` (ya subidos en
-- esta sesión: hack-squat.gif, giro-ruso.gif, giro-oblicuo-acostado.gif,
-- crunch-reverso.gif, patada-de-gluteo-con-banda.gif).

-- 1. Elevación lateral en máquina (15) <- Elevaciones laterales en máquina (119)
update routine_exercises set exercise_definition_id = 15 where exercise_definition_id = 119;
update workout_logs set exercise_definition_id = 15 where exercise_definition_id = 119;
delete from exercise_definitions where id = 119;
update exercise_definitions set nombre = 'Elevación lateral en máquina' where id = 15;

-- 2. Curl de bíceps en banco Scott (1, se renombra para mayor claridad) <- dup (120)
update routine_exercises set exercise_definition_id = 1 where exercise_definition_id = 120;
update workout_logs set exercise_definition_id = 1 where exercise_definition_id = 120;
delete from exercise_definitions where id = 120;
update exercise_definitions set nombre = 'Curl de bíceps en banco Scott' where id = 1;

-- 3. Press militar con mancuernas (36) <- Press de hombro con mancuernas (114)
update routine_exercises set exercise_definition_id = 36 where exercise_definition_id = 114;
update workout_logs set exercise_definition_id = 36 where exercise_definition_id = 114;
delete from exercise_definitions where id = 114;

-- 4. Dorsales en polea alta (65) <- Jalón al pecho en polea alta (113)
update routine_exercises set exercise_definition_id = 65 where exercise_definition_id = 113;
update workout_logs set exercise_definition_id = 65 where exercise_definition_id = 113;
delete from exercise_definitions where id = 113;

-- 5. Remo sentado agarre cerrado (66) <- Remo en polea sentado (118)
update routine_exercises set exercise_definition_id = 66 where exercise_definition_id = 118;
update workout_logs set exercise_definition_id = 66 where exercise_definition_id = 118;
delete from exercise_definitions where id = 118;

-- 6. Curl de bíceps con mancuerna parado (3) <- Curl de bíceps con mancuernas (126)
update routine_exercises set exercise_definition_id = 3 where exercise_definition_id = 126;
update workout_logs set exercise_definition_id = 3 where exercise_definition_id = 126;
delete from exercise_definitions where id = 126;

-- 7. Elevación de talón parado (11) <- Elevación de talón de pie en máquina (128)
update routine_exercises set exercise_definition_id = 11 where exercise_definition_id = 128;
update workout_logs set exercise_definition_id = 11 where exercise_definition_id = 128;
delete from exercise_definitions where id = 128;

-- 8. Estocada búlgara en el banco (18) <- Sentadilla búlgara con mancuernas (110)
update routine_exercises set exercise_definition_id = 18 where exercise_definition_id = 110;
update workout_logs set exercise_definition_id = 18 where exercise_definition_id = 110;
delete from exercise_definitions where id = 110;

-- 9. Empuje de caderas (64) <- Hip thrust con barra (117) -- "empuje de
-- caderas" es la traducción de "hip thrust", mismo ejercicio.
update routine_exercises set exercise_definition_id = 64 where exercise_definition_id = 117;
update workout_logs set exercise_definition_id = 64 where exercise_definition_id = 117;
delete from exercise_definitions where id = 117;

-- 10. Press de hombro en maquina Smith (34) <- duplicado con tilde (122)
update routine_exercises set exercise_definition_id = 34 where exercise_definition_id = 122;
update workout_logs set exercise_definition_id = 34 where exercise_definition_id = 122;
delete from exercise_definitions where id = 122;

-- 11. Vuelo posterior con mancuernas de pie (102) <- Pájaro con mancuernas (137)
-- -- "pájaro" es el nombre coloquial del mismo movimiento.
update routine_exercises set exercise_definition_id = 102 where exercise_definition_id = 137;
update workout_logs set exercise_definition_id = 102 where exercise_definition_id = 137;
delete from exercise_definitions where id = 137;

-- ============================================================
-- GIFs corregidos: estos 4 pares NO se fusionan -- son ejercicios
-- biomecánicamente distintos que compartían por error el mismo archivo.
-- Ahora cada uno tiene su imagen real de la biblioteca de referencia.
-- ============================================================
update exercise_definitions set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/giro-ruso.gif'
where nombre = 'Giro ruso';

update exercise_definitions set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/giro-oblicuo-acostado.gif'
where nombre = 'Giro oblicuo acostado';

update exercise_definitions set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/crunch-reverso.gif'
where nombre = 'Crunch inverso';

update exercise_definitions set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/patada-de-gluteo-con-banda.gif'
where nombre = 'Patada de glúteo con banda de resistencia';

-- Hack Squat: el archivo hack-squat.gif referenciado en la base había sido
-- borrado del bucket (404) -- se volvió a subir con el mismo nombre en
-- esta sesión, no hace falta ningún UPDATE acá.

-- PENDIENTE (sin resolver en esta migración, falta imagen fuente real):
-- "Elevación de rodillas sentado con apoyo de manos" sigue compartiendo el
-- GIF de "Elevación de piernas sentado con apoyo de manos" (pierna recta) --
-- no se encontró en la biblioteca de referencia una variante sentada con
-- rodilla flexionada. Queda con la imagen equivocada hasta conseguir una.

-- Migración 056: segunda ronda de deduplicación del catálogo.
--
-- La migración 053 deduplicó los 126 ejercicios originales comparando GIFs
-- por hash exacto. La migración 054 (65 ejercicios nuevos, sacados de la
-- Hoja2 del Excel) se hizo DESPUÉS y nunca se comparó contra el catálogo ya
-- existente -- solo se chequeó que los 65 nuevos no se repitieran entre sí.
-- Resultado: 7 de los 65 nuevos son, en realidad, el mismo GIF (misma
-- animación, frame por frame) que un ejercicio que ya estaba en el catálogo
-- desde antes, con un nombre apenas distinto.
--
-- Detectados descargando los 180 GIFs y comparando su contenido real
-- (perceptual hash de varios frames de cada animación, no el nombre ni el
-- hash exacto del archivo -- dos re-exports del mismo GIF casi nunca son
-- bit-a-bit idénticos, por eso el chequeo de la 053/054 no los agarró).
--
-- Mismo patrón que la 053: redirigir routine_exercises y workout_logs del
-- id que se borra hacia el id que se mantiene, y recién ahí borrar la fila.

-- 1. Estocadas (19) <- Estocadas para glúteos (201, ronda nueva)
update routine_exercises set exercise_definition_id = 19 where exercise_definition_id = 201;
update workout_logs set exercise_definition_id = 19 where exercise_definition_id = 201;
delete from exercise_definitions where id = 201;

-- 2. Tríceps en polea alta a un brazo (22, se renombra -- el GIF real es a
-- un brazo, "Extensión de tríceps en polea" a secas era impreciso)
-- <- Tríceps en polea alta a un brazo (164, ronda nueva)
update routine_exercises set exercise_definition_id = 22 where exercise_definition_id = 164;
update workout_logs set exercise_definition_id = 22 where exercise_definition_id = 164;
delete from exercise_definitions where id = 164;
update exercise_definitions set nombre = 'Tríceps en polea alta a un brazo' where id = 22;

-- 3. Press de banco con mancuernas (33) <- Press de banca con mancuernas
-- (131, ronda nueva -- "banco"/"banca" es el mismo ejercicio con sinónimo)
update routine_exercises set exercise_definition_id = 33 where exercise_definition_id = 131;
update workout_logs set exercise_definition_id = 33 where exercise_definition_id = 131;
delete from exercise_definitions where id = 131;

-- 4. Sentadilla en máquina Smith (43) <- Sentadilla Smith (189, ronda nueva)
update routine_exercises set exercise_definition_id = 43 where exercise_definition_id = 189;
update workout_logs set exercise_definition_id = 43 where exercise_definition_id = 189;
delete from exercise_definitions where id = 189;

-- 5. Elevación de talón sentado en máquina (79) <- Elevación de talones
-- sentado (127, ronda nueva)
update routine_exercises set exercise_definition_id = 79 where exercise_definition_id = 127;
update workout_logs set exercise_definition_id = 79 where exercise_definition_id = 127;
delete from exercise_definitions where id = 127;

-- 6. Sentadilla Goblet (83, se renombra -- el GIF real es agarre goblet,
-- una mancuerna al pecho, no mancuernas a los costados)
-- <- Sentadilla Goblet (184, ronda nueva, mismo GIF)
update routine_exercises set exercise_definition_id = 83 where exercise_definition_id = 184;
update workout_logs set exercise_definition_id = 83 where exercise_definition_id = 184;
delete from exercise_definitions where id = 184;
update exercise_definitions set nombre = 'Sentadilla Goblet' where id = 83;

-- 7. Crunch inverso (96, ya tenía su GIF real y correcto desde la 053)
-- <- Elevación de rodillas al pecho (92, del catálogo original -- quedó sin
-- detectar en la 053 porque en ese momento se comparó por hash exacto de
-- archivo, y estos dos nunca fueron bit-a-bit idénticos aunque muestren la
-- misma animación)
update routine_exercises set exercise_definition_id = 96 where exercise_definition_id = 92;
update workout_logs set exercise_definition_id = 96 where exercise_definition_id = 92;
delete from exercise_definitions where id = 92;

-- PENDIENTE, sin tocar en esta migración (ya documentado en la 053):
-- "Elevación de rodillas sentado con apoyo de manos" (93) sigue compartiendo
-- el GIF de "Elevación de piernas sentado con apoyo de manos" (91) a
-- propósito -- no se encontró en la biblioteca de referencia una variante
-- sentada con rodilla flexionada real.

-- Migración 059: el pentágono/volumen por grupo va a pasar a repartir
-- crédito por ejercicio (músculo principal = serie completa, secundario =
-- media serie, ver src/lib/pentagono.ts). Para que eso funcione, el ORDEN
-- de `grupos_musculares` pasa a importar: el primero de la lista es el
-- músculo objetivo/principal, el resto son secundarios.
--
-- Se revisaron los 40 ejercicios con más de un grupo. La enorme mayoría ya
-- tenía el orden correcto (ej. dominadas: Espalda antes que Bíceps). Dos
-- quedaron al revés: el press de banca cerrado es, por definición, un
-- ejercicio para enfatizar tríceps (por eso se hace agarre cerrado) -- el
-- pecho es secundario, no al revés.

update exercise_definitions set grupos_musculares = ARRAY['Tríceps','Pecho']
where id = 160; -- Press de banca cerrado con mancuernas

update exercise_definitions set grupos_musculares = ARRAY['Tríceps','Pecho']
where id = 162; -- Press de banca agarre cerrado supino

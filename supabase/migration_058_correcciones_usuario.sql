-- Migración 058: 3 correcciones que el usuario encontró probando "Crea tu
-- rutina" después de la 057.

-- 1. "Abducción de cadera en polea" (76) y "Abductores externos en polea"
-- (181) son el mismo ejercicio -- el GIF de la 181 es el mismo movimiento
-- filmado con una modelo mujer en vez de un hombre. El usuario pidió
-- quedarse con la versión del hombre (76).
update routine_exercises set exercise_definition_id = 76 where exercise_definition_id = 181;
update workout_logs set exercise_definition_id = 76 where exercise_definition_id = 181;
delete from exercise_definitions where id = 181;

-- 2. "Peso muerto rumano" (31) tenía cargado por error el mismo GIF de
-- "Peso muerto" (59) filmado desde otro ángulo -- ambos mostraban el
-- peso muerto convencional (barra arranca del piso), no el rumano (bisagra
-- de cadera, la barra no baja hasta el piso). Causa: mala clasificación
-- original desde la carpeta FEMORALES. El usuario encontró un GIF real de
-- peso muerto rumano (con mancuernas) en esa misma carpeta -- confirmó que
-- la biomecánica es idéntica a la variante con barra, así que un solo GIF
-- alcanza para representar ambas variantes; por eso el nombre se deja
-- genérico, sin especificar implemento.
update exercise_definitions
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/peso-muerto-rumano-v2.gif'
where id = 31;

-- 3. "Sentadilla con barra" (123) y "Sentadillas" (46) son el mismo
-- ejercicio (sentadilla trasera con barra) con dos ilustraciones distintas.
-- Se mantiene "Sentadilla con barra" (más descriptivo, consistente con el
-- resto del catálogo) y se borra "Sentadillas".
update routine_exercises set exercise_definition_id = 123 where exercise_definition_id = 46;
update workout_logs set exercise_definition_id = 123 where exercise_definition_id = 46;
delete from exercise_definitions where id = 46;

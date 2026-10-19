-- Migración 103: modalidad de carga por ejercicio.
--
-- No todos los ejercicios se cargan con "peso": en abdominales, hiperextensiones,
-- dominadas o flexiones el peso a ingresar es absurdo (es el propio cuerpo), y en
-- los de banda elástica no hay peso medible. Cada ejercicio pasa a tener una
-- modalidad:
--   con_peso       peso + repeticiones (como siempre)
--   peso_corporal  repeticiones + "lastre" opcional (kg extra: chaleco, disco)
--   banda          solo repeticiones (sin color ni nivel)
--   tiempo         segundos (soportado; todavía sin ejercicios asignados)
--
-- workout_logs gana:
--   lastre             kg extra en ejercicios de peso corporal
--   segundos           duración en ejercicios por tiempo
--   peso_corporal_ref  peso del usuario (Medidas) al registrar la serie, para
--                      calcular la carga efectiva sin depender de mediciones futuras
-- Aditiva: no cambia ni borra ningún dato existente. Los registros viejos de
-- ejercicios de peso corporal que tienen el peso del cuerpo cargado como "peso"
-- se limpian en una migración aparte, después de revisarlos con el dueño.

alter table public.exercise_definitions
  add column if not exists modalidad_carga text not null default 'con_peso';

alter table public.exercise_definitions
  drop constraint if exists exercise_definitions_modalidad_carga_check;
alter table public.exercise_definitions
  add constraint exercise_definitions_modalidad_carga_check
  check (modalidad_carga in ('con_peso','peso_corporal','banda','tiempo'));

alter table public.workout_logs add column if not exists lastre numeric;
alter table public.workout_logs add column if not exists segundos integer;
alter table public.workout_logs add column if not exists peso_corporal_ref numeric;

update public.exercise_definitions set modalidad_carga = 'peso_corporal'
  where id in (11, 12, 26, 27, 28, 29, 44, 57, 58, 62, 67, 68, 84, 85, 86, 87, 88, 89, 90, 91, 93, 94, 95, 96, 97, 98, 99, 106, 107, 116, 135, 138, 140, 141, 153, 154, 166, 187, 188, 190, 192, 194, 195, 197, 212, 213, 214, 215, 227, 233, 247, 260, 264, 265, 266, 268, 287);
update public.exercise_definitions set modalidad_carga = 'banda'
  where id in (104, 105, 139, 200, 222, 234, 255, 256, 257, 258, 259, 275, 289, 290, 291);

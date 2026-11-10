-- Rollback de la migración 115: borra la rutina KRAKEN GYM (sus ejercicios y accesos caen en cascada).
-- No toca el historial de entrenamientos (workout_logs va por ejercicio y usuario, no por rutina).
-- Si algún perfil la tiene activa, se le quita la rutina activa antes de borrarla.
update public.profiles set routine_id = null where routine_id = (select id from public.routines where nombre = 'KRAKEN GYM');
delete from public.routines where nombre = 'KRAKEN GYM';

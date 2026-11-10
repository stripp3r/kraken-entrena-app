-- Rollback de la migración 116: vuelve Legs A de KRAKEN GYM a como lo dejó la 115 y borra los dos ejercicios nuevos.
-- OJO: borrar un ejercicio borra su historial (workout_logs). Si ya se registraron series en pendular/belt squat, no correr esto.
do $$
declare rid bigint;
begin
  select id into rid from public.routines where nombre = 'KRAKEN GYM';
  delete from public.routine_exercises where routine_id = rid and dia = 'C';
  insert into public.routine_exercises
    (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo, bloque, bloque_titulo, bloque_descanso_entre_s, bloque_descanso_final_s)
  values
    (rid, 'C', 1, 10,  '4 x 10-15', 1, 1, 'Gemelos', 75, 90),
    (rid, 'C', 2, 79,  '4 x 12-20', 1, 1, 'Gemelos', 75, 90),
    (rid, 'C', 3, 81,  '3 x 6-10',  1, null, null, null, null),
    (rid, 'C', 4, 111, '3 x 10-15', 1, null, null, null, null),
    (rid, 'C', 5, 20,  '3 x 12-15', 1, null, null, null, null),
    (rid, 'C', 6, 7,   '3 x 10-12', 1, null, null, null, null),
    (rid, 'C', 7, 82,  '3 x 12-15', 1, null, null, null, null),
    (rid, 'C', 8, 182, '3 x 12-15', 1, null, null, null, null);
  delete from public.exercise_definitions where nombre in ('Sentadilla pendular', 'Belt squat');
end
$$;

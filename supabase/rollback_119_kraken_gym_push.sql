-- Rollback de la migración 119: Push A y Push B de KRAKEN GYM vuelven a los de KRAKEN DEFINITIVA (migración 113 / 115).
do $$
declare rid bigint;
begin
  select id into rid from public.routines where nombre = 'KRAKEN GYM';
  delete from public.routine_exercises where routine_id = rid and dia in ('A', 'D');
  insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo) values
    (rid, 'A', 1, 35,  '3 x 6-10',  1),
    (rid, 'A', 2, 14,  '4 x 12-15', 1),
    (rid, 'A', 3, 22,  '3 x 10-15', 1),
    (rid, 'A', 4, 28,  '3 x 8-12',  1),
    (rid, 'A', 5, 294, '3 x 10-15', 1),
    (rid, 'D', 1, 36,  '3 x 6-10',  1),
    (rid, 'D', 2, 61,  '3 x 8-12',  1),
    (rid, 'D', 3, 14,  '4 x 12-20', 1),
    (rid, 'D', 4, 28,  '3 x 8-12',  1),
    (rid, 'D', 5, 292, '3 x 10-15', 1);
end
$$;

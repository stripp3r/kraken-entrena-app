-- Migración 117: KRAKEN GYM — la Belt squat pasa de Legs A a Legs B (Legs A tenía demasiado cuádriceps).
-- Legs A (C): gemelos biserie, pendular, hack squat, extensión de cuádriceps, curl femoral sentado, abductores, aductores.
-- Legs B (F): gemelos biserie, peso muerto, belt squat, empuje de caderas, curl femoral, prensa 45°, abductores, aductores.
do $$
declare
  rid bigint;
  belt bigint;
  filas int;
begin
  select id into rid from public.routines where nombre = 'KRAKEN GYM';
  select id into belt from public.exercise_definitions where nombre = 'Belt squat';
  if rid is null or belt is null then raise exception 'Falta KRAKEN GYM o Belt squat'; end if;

  delete from public.routine_exercises where routine_id = rid and dia in ('C', 'F');

  insert into public.routine_exercises
    (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo, bloque, bloque_titulo, bloque_descanso_entre_s, bloque_descanso_final_s)
  select rid, v.dia, v.orden, v.ej, v.sr, v.rir, v.bloque, v.titulo, v.entre, v.fin
  from (values
    ('C', 1, 10::bigint, '4 x 10-15', 1, 1,         'Gemelos', 75, 90),
    ('C', 2, 79,         '4 x 12-20', 1, 1,         'Gemelos', 75, 90),
    ('C', 3, 295,        '4 x 6-10',  1, null::int, null::text, null::int, null::int),
    ('C', 4, 81,         '3 x 8-12',  1, null, null, null, null),
    ('C', 5, 20,         '3 x 12-15', 1, null, null, null, null),
    ('C', 6, 7,          '3 x 10-12', 1, null, null, null, null),
    ('C', 7, 82,         '3 x 12-15', 1, null, null, null, null),
    ('C', 8, 182,        '3 x 12-15', 1, null, null, null, null),
    ('F', 1, 10,         '4 x 10-15', 1, 1,         'Gemelos', 75, 90),
    ('F', 2, 79,         '4 x 12-20', 1, 1,         'Gemelos', 75, 90),
    ('F', 3, 59,         '3 x 5-8',   1, null, null, null, null),
    ('F', 4, belt,       '3 x 8-12',  1, null, null, null, null),
    ('F', 5, 64,         '3 x 8-12',  1, null, null, null, null),
    ('F', 6, 6,          '3 x 8-12',  1, null, null, null, null),
    ('F', 7, 111,        '3 x 10-15', 1, null, null, null, null),
    ('F', 8, 82,         '3 x 15-20', 1, null, null, null, null),
    ('F', 9, 182,        '3 x 15-20', 1, null, null, null, null)
  ) as v(dia, orden, ej, sr, rir, bloque, titulo, entre, fin);
  get diagnostics filas = row_count;
  if filas <> 17 then raise exception 'Se esperaban 17 ejercicios y se cargaron %', filas; end if;
end
$$;

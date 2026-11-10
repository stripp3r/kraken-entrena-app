-- Migración 118: imágenes reales de Sentadilla pendular y Belt squat + ajustes de KRAKEN GYM.
--   * Pendular: animación de 2 posiciones (arriba/abajo) armada con las 2 imágenes que pasó el coach (webp/sentadilla-pendular-599f3757.webp).
--   * Belt squat: GIF animado que pasó el coach, convertido a WebP (webp/belt-squat-8dd6e3ed.webp). Reemplaza la ilustración fija.
--   * Legs A: se suma Empuje de caderas (hip thrust con el ejercicio que ya existe).
--   * Legs B: el Peso muerto sale y entran las Hiperextensiones (id 29).
do $$
declare rid bigint; filas int;
begin
  select id into rid from public.routines where nombre = 'KRAKEN GYM';
  if rid is null then raise exception 'No existe KRAKEN GYM'; end if;

  update public.exercise_definitions set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/webp/sentadilla-pendular-599f3757.webp' where nombre = 'Sentadilla pendular';
  get diagnostics filas = row_count; if filas <> 1 then raise exception 'Pendular: % filas', filas; end if;
  update public.exercise_definitions set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/webp/belt-squat-8dd6e3ed.webp' where nombre = 'Belt squat';
  get diagnostics filas = row_count; if filas <> 1 then raise exception 'Belt squat: % filas', filas; end if;

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
    ('C', 6, 64,         '3 x 8-12',  1, null, null, null, null),
    ('C', 7, 7,          '3 x 10-12', 1, null, null, null, null),
    ('C', 8, 82,         '3 x 12-15', 1, null, null, null, null),
    ('C', 9, 182,        '3 x 12-15', 1, null, null, null, null),
    ('F', 1, 10,         '4 x 10-15', 1, 1,         'Gemelos', 75, 90),
    ('F', 2, 79,         '4 x 12-20', 1, 1,         'Gemelos', 75, 90),
    ('F', 3, 296,        '3 x 8-12',  1, null, null, null, null),
    ('F', 4, 29,         '3 x 10-15', 1, null, null, null, null),
    ('F', 5, 64,         '3 x 8-12',  1, null, null, null, null),
    ('F', 6, 6,          '3 x 8-12',  1, null, null, null, null),
    ('F', 7, 111,        '3 x 10-15', 1, null, null, null, null),
    ('F', 8, 82,         '3 x 15-20', 1, null, null, null, null),
    ('F', 9, 182,        '3 x 15-20', 1, null, null, null, null)
  ) as v(dia, orden, ej, sr, rir, bloque, titulo, entre, fin);
  get diagnostics filas = row_count;
  if filas <> 18 then raise exception 'Se esperaban 18 ejercicios y se cargaron %', filas; end if;
end
$$;

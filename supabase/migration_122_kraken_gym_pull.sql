-- Migración 122: KRAKEN GYM — Pull A (día B) y Pull B (día E) según la lista del coach para el gimnasio comercial.
-- Pull A: jalón unilateral (polea a un brazo), remo T con pecho apoyado, remo sentado en polea, encogimiento en máquina (nuevo),
--   curl predicador (banco Scott), curl sentado con mancuernas.
-- Pull B: vuelo posterior en máquina (nuevo, pec deck inverso), remo en máquina, remo T con pecho apoyado, biserie dominadas +
--   jalón al pecho en polea (pull-down), curl martillo unilateral parado, curl sentado con mancuernas.
-- Ya no llevan la biserie de abdominales de KRAKEN DEFINITIVA (no estaba en la lista).
do $$
declare rid bigint; enc bigint; vp bigint; filas int;
begin
  select id into rid from public.routines where nombre = 'KRAKEN GYM';
  if rid is null then raise exception 'No existe KRAKEN GYM'; end if;

  select id into enc from public.exercise_definitions where nombre = 'Encogimiento de hombros en máquina';
  if enc is null then
    insert into public.exercise_definitions (nombre, categoria, imagen_url, tipo_esfuerzo, unilateral, grupos_musculares, modalidad_carga, alternativa_id, como_hacerlo)
    values ('Encogimiento de hombros en máquina', 'Pull',
      'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/webp/encogimiento-maquina-361a42a6.webp',
      'aislado', false, array['Trapecios'], 'con_peso', 17,
      E'Paso inicial: Ajustá la altura de la máquina y cargá el peso. Agarrá las manijas con los brazos estirados a los costados.\n\nPosición inicial: Torso erguido, hombros relajados hacia abajo, mirada al frente.\n\nMovimiento: Subí los hombros en línea recta hacia las orejas lo más alto posible, pausa de 1 segundo arriba, y bajá controlado (2-3 segundos) hasta estirar el trapecio.\n\nConsejos: No rotes los hombros ni flexiones los codos; el movimiento es solo de subir y bajar.')
    returning id into enc;
  end if;

  select id into vp from public.exercise_definitions where nombre = 'Vuelo posterior en máquina';
  if vp is null then
    insert into public.exercise_definitions (nombre, categoria, imagen_url, tipo_esfuerzo, unilateral, grupos_musculares, modalidad_carga, alternativa_id, como_hacerlo)
    values ('Vuelo posterior en máquina', 'Pull',
      'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/webp/vuelo-posterior-maquina-50ee1c81.webp',
      'aislado', false, array['Hombros'], 'con_peso', 8,
      E'Paso inicial: Sentate mirando el respaldo de la máquina (pec deck inverso) con el pecho apoyado y ajustá el asiento para que las manijas queden a la altura de los hombros.\n\nPosición inicial: Brazos adelante, casi estirados, codos apenas flexionados, agarre en las manijas.\n\nMovimiento: Abrí los brazos hacia atrás y afuera, llevando los codos hacia atrás hasta alinearlos con el torso, y apretá la parte de atrás del hombro 1 segundo. Volvé controlado (2-3 segundos).\n\nConsejos: Pensá en mover los codos, no las manos, y no encojas los hombros hacia las orejas.')
    returning id into vp;
  end if;

  delete from public.routine_exercises where routine_id = rid and dia in ('B', 'E');
  insert into public.routine_exercises
    (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo, bloque, bloque_titulo, bloque_descanso_entre_s, bloque_descanso_final_s)
  select rid, v.dia, v.orden, v.ej, v.sr, v.rir, v.bloque, v.titulo, v.entre, v.fin
  from (values
    ('B', 1, 30::bigint, '3 x 8-12',  1, null::int, null::text, null::int, null::int),
    ('B', 2, 235,        '4 x 6-10',  1, null, null, null, null),
    ('B', 3, 66,         '3 x 8-12',  1, null, null, null, null),
    ('B', 4, enc,        '3 x 10-15', 1, null, null, null, null),
    ('B', 5, 1,          '3 x 8-12',  1, null, null, null, null),
    ('B', 6, 175,        '3 x 10-12', 1, null, null, null, null),
    ('E', 1, vp,         '4 x 12-15', 1, null, null, null, null),
    ('E', 2, 40,         '3 x 8-12',  1, null, null, null, null),
    ('E', 3, 235,        '3 x 8-12',  1, null, null, null, null),
    ('E', 4, 141,        '3 x 6-10',  1, 1,    'Dorsales', 75, 120),
    ('E', 5, 65,         '3 x 10-15', 1, 1,    'Dorsales', 75, 120),
    ('E', 6, 109,        '3 x 8-12',  1, null, null, null, null),
    ('E', 7, 175,        '3 x 10-12', 1, null, null, null, null)
  ) as v(dia, orden, ej, sr, rir, bloque, titulo, entre, fin);
  get diagnostics filas = row_count;
  if filas <> 13 then raise exception 'Se esperaban 13 ejercicios y se cargaron %', filas; end if;
end
$$;

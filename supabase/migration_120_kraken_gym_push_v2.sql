-- Migración 120: KRAKEN GYM — Push A y Push B según lo pedido por el coach (reemplaza la 119) + alternativas máquina/mancuernas.
-- Push A: press inclinado en máquina (alt. mancuernas), cruce de poleas, press militar en máquina (alt. mancuernas), vuelo lateral con
--   mancuernas, extensión de tríceps unilateral, fondos en máquina asistida (alt. fondos con lastre).
-- Push B: press de pecho plano en máquina (alt. inclinado en máquina), cruce de poleas sentado (ejercicio nuevo), press militar con
--   mancuernas, vuelo lateral en polea, tríceps katana (se deja aunque hoy le duele el codo), fondos en paralelas con lastre.
-- Alternativas: se usa exercise_definitions.alternativa_id (la app la muestra en cada ejercicio). Es global por ejercicio: 157 -> 61,
--   254 -> 36, 154 -> 28, 112 -> 157 (solo se completan las que estaban vacías).
-- Ejercicio nuevo "Cruce de poleas sentado": GIF PROVISORIO (cruce de pecho superior de la biblioteca de GIFs); reemplazar por el de la máquina real.
do $$
declare rid bigint; cruce bigint; filas int;
begin
  select id into rid from public.routines where nombre = 'KRAKEN GYM';
  if rid is null then raise exception 'No existe KRAKEN GYM'; end if;

  select id into cruce from public.exercise_definitions where nombre = 'Cruce de poleas sentado';
  if cruce is null then
    insert into public.exercise_definitions (nombre, categoria, imagen_url, tipo_esfuerzo, unilateral, grupos_musculares, modalidad_carga, como_hacerlo)
    values ('Cruce de poleas sentado', 'Push',
      'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/webp/cruce-poleas-sentado-08372c84.webp',
      'aislado', false, array['Pecho'], 'con_peso',
      E'Paso inicial: Sentate en el banco de la estación de poleas, con la espalda apoyada, y agarrá una manija en cada mano con las poleas a la altura de los hombros o algo más abajo.\n\nPosición inicial: Brazos abiertos a los costados con los codos levemente flexionados, pecho adelante y omóplatos juntos, sintiendo el estiramiento del pecho.\n\nMovimiento: Cerrá los brazos en arco hacia el centro, a la altura del pecho, y apretá el pecho 1 segundo. Volvé abriendo de forma controlada (2-3 segundos) hasta sentir el estiramiento, sin perder el apoyo de la espalda.\n\nConsejos: Si las poleas están bajas y cerrás hacia arriba, cargás más la parte superior del pecho. Mantené los codos con la misma flexión todo el recorrido.')
    returning id into cruce;
  end if;

  update public.exercise_definitions set alternativa_id = 61  where id = 157 and alternativa_id is null;
  update public.exercise_definitions set alternativa_id = 36  where id = 254 and alternativa_id is null;
  update public.exercise_definitions set alternativa_id = 28  where id = 154 and alternativa_id is null;
  update public.exercise_definitions set alternativa_id = 157 where id = 112 and alternativa_id is null;

  delete from public.routine_exercises where routine_id = rid and dia in ('A', 'D');
  insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
  select rid, v.dia, v.orden, v.ej, v.sr, v.rir
  from (values
    ('A', 1, 157::bigint, '4 x 6-10',  1),
    ('A', 2, 152,         '3 x 12-15', 1),
    ('A', 3, 254,         '3 x 8-12',  1),
    ('A', 4, 14,          '4 x 12-15', 1),
    ('A', 5, 22,          '3 x 10-15', 1),
    ('A', 6, 154,         '3 x 8-12',  1),
    ('D', 1, 112,         '4 x 8-12',  1),
    ('D', 2, cruce,       '3 x 12-15', 1),
    ('D', 3, 36,          '3 x 8-12',  1),
    ('D', 4, 48,          '4 x 12-15', 1),
    ('D', 5, 292,         '3 x 10-15', 1),
    ('D', 6, 28,          '3 x 6-10',  1)
  ) as v(dia, orden, ej, sr, rir);
  get diagnostics filas = row_count;
  if filas <> 12 then raise exception 'Se esperaban 12 ejercicios y se cargaron %', filas; end if;
end
$$;

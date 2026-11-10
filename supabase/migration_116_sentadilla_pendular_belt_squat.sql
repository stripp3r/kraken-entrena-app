-- Migración 116: ejercicios nuevos "Sentadilla pendular" y "Belt squat" + Legs A de KRAKEN GYM con ambos.
--
-- IMÁGENES (provisorias, a reemplazar por GIF/video propio cuando el coach grabe las máquinas del gimnasio):
--   * Belt squat: ilustración 3D de la biblioteca del coach (CUADRICEPS/Belt_Squat_-_3-d_illustration...webp), subida al bucket
--     público "ejercicios" (webp/belt-squat-a3c8e22a.webp). Es una imagen estática con posición inicial y final.
--   * Sentadilla pendular: no existe GIF en la biblioteca ni en fitcron; se usa el de Hack Squat (ejercicio hermano más parecido).
--
-- Legs A de KRAKEN GYM queda: gemelos de pie + sentado (biserie), pendular, belt squat, hack squat, extensión de cuádriceps,
-- curl femoral sentado, abductores y aductores (la prensa 45° queda solo en Legs B).

do $$
declare
  rid bigint;
  pendular bigint;
  belt bigint;
  img_hack text;
  filas int;
begin
  select id into rid from public.routines where nombre = 'KRAKEN GYM';
  if rid is null then raise exception 'No existe KRAKEN GYM'; end if;
  select imagen_url into img_hack from public.exercise_definitions where id = 81;
  if img_hack is null then raise exception 'Hack Squat no tiene imagen'; end if;

  select id into pendular from public.exercise_definitions where nombre = 'Sentadilla pendular';
  if pendular is null then
    insert into public.exercise_definitions
      (nombre, categoria, imagen_url, tipo_esfuerzo, unilateral, grupos_musculares, modalidad_carga, como_hacerlo)
    values (
      'Sentadilla pendular', 'Legs', img_hack, 'compuesto', false, array['Cuádriceps', 'Glúteos'], 'con_peso',
      E'Paso inicial: Ajustá los hombros bajo las almohadillas de la máquina pendular y apoyá los pies en la plataforma, a la altura de los hombros o algo más adelante, con las puntas levemente abiertas. Soltá los seguros.\n\nPosición inicial: Cuerpo erguido, espalda apoyada y piernas casi extendidas, sin bloquear las rodillas.\n\nMovimiento: Bajá flexionando rodillas y cadera de forma controlada; el brazo de la máquina se mueve en arco, así que la plataforma se desplaza hacia atrás. Bajá hasta que los muslos pasen la paralela, sin despegar la espalda ni los talones. Empujá con todo el pie para volver arriba.\n\nConsejos: Controlá la bajada (2-3 segundos). Más separación de pies o pies más adelantados cargan más glúteo; pies más juntos y bajos, más cuádriceps.'
    ) returning id into pendular;
  end if;

  select id into belt from public.exercise_definitions where nombre = 'Belt squat';
  if belt is null then
    insert into public.exercise_definitions
      (nombre, categoria, imagen_url, tipo_esfuerzo, unilateral, grupos_musculares, modalidad_carga, como_hacerlo)
    values (
      'Belt squat', 'Legs',
      'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/webp/belt-squat-a3c8e22a.webp',
      'compuesto', false, array['Cuádriceps', 'Glúteos'], 'con_peso',
      E'Paso inicial: Colocate el cinturón en la cadera, enganchalo a la palanca de carga y subite a las plataformas con los pies a la altura de los hombros o un poco más. Agarrate de las manijas del frente para mantener el equilibrio.\n\nPosición inicial: De pie, erguido, con el peso colgando del cinturón y las rodillas levemente flexionadas.\n\nMovimiento: Bajá flexionando rodillas y cadera, con el torso vertical, hasta que los muslos queden paralelos al suelo o más abajo. Empujá con todo el pie para volver a la posición inicial.\n\nConsejos: No cargás la columna, así que podés usar mucho peso sin castigar la espalda baja. Usá las manos solo para equilibrarte, no para ayudarte a subir.'
    ) returning id into belt;
  end if;

  -- Legs A de KRAKEN GYM: se rehace completo.
  delete from public.routine_exercises where routine_id = rid and dia = 'C';

  insert into public.routine_exercises
    (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo, bloque, bloque_titulo, bloque_descanso_entre_s, bloque_descanso_final_s)
  select rid, v.dia, v.orden, v.ej, v.sr, v.rir, v.bloque, v.titulo, v.entre, v.fin
  from (values
    ('C', 1, 10::bigint,  '4 x 10-15', 1, 1,         'Gemelos', 75, 90),
    ('C', 2, 79,          '4 x 12-20', 1, 1,         'Gemelos', 75, 90),
    ('C', 3, pendular,    '4 x 6-10',  1, null::int, null::text, null::int, null::int),
    ('C', 4, belt,        '3 x 8-12',  1, null, null, null, null),
    ('C', 5, 81,          '3 x 8-12',  1, null, null, null, null),
    ('C', 6, 20,          '3 x 12-15', 1, null, null, null, null),
    ('C', 7, 7,           '3 x 10-12', 1, null, null, null, null),
    ('C', 8, 82,          '3 x 12-15', 1, null, null, null, null),
    ('C', 9, 182,         '3 x 12-15', 1, null, null, null, null)
  ) as v(dia, orden, ej, sr, rir, bloque, titulo, entre, fin);
  get diagnostics filas = row_count;
  if filas <> 9 then raise exception 'Se esperaban 9 ejercicios en Legs A y se cargaron %', filas; end if;
end
$$;

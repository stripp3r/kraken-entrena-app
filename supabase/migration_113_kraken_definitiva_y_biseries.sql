-- Migración 113: rutina "KRAKEN DEFINITIVA" (Push/Pull/Legs, 6 días) + bloques de ejercicios (biseries).
--
-- BLOQUES (aditivo, nullable: todas las rutinas existentes quedan igual): dos o más filas consecutivas de un mismo día con el
-- mismo `bloque` se hacen seguidas, como una ronda. La pantalla del día las agrupa bajo "BISERIE n — TÍTULO", pasa sola de
-- un ejercicio al siguiente con `bloque_descanso_entre_s` y descansa `bloque_descanso_final_s` al cerrar la ronda. Cada
-- ejercicio conserva sus propias series en workout_logs (no cambia nada del registro ni del progreso).
--
-- RUTINA: privada, con acceso solo para ezequiel.arce@outlook.com y SIN activar (sigue activa la que ya tenía).
-- Días: A=Push A, B=Pull A, C=Legs A, D=Push B, E=Pull B, F=Legs B (lunes a sábado; la app no modela días de la semana).
-- Interpretaciones (el coach no dio series/repeticiones: criterio propio, se ajustan desde la rutina):
--   Gemelos de pie = Elevación de talón en máquina Smith (10); sentado = en máquina (79); curl femoral tumbado = 6;
--   tríceps unilateral en polea = 22; remo unilateral en polea = 42; curl predicador unilateral = 5 (polea);
--   jalón al pecho en máquina = Dorsales en máquina (9).
--   El drop set de Pull A pasa a ser una BISERIE (dominadas lastradas + jalón): la fase de dominadas sin lastre se registra
--   en las dominadas lastradas con lastre 0.
--   Pull A y Pull B llevan el circuito de abdominales actual (banco declinado + elevación de piernas colgado) como biserie.
-- Ejercicio nuevo: "Aperturas de pecho en anillas" (GIF de la biblioteca de calistenia, `Crucifixo com TRX.gif`).

alter table public.routine_exercises
  add column if not exists bloque smallint check (bloque is null or bloque > 0),
  add column if not exists bloque_titulo text,
  add column if not exists bloque_descanso_entre_s integer check (bloque_descanso_entre_s is null or bloque_descanso_entre_s between 0 and 600),
  add column if not exists bloque_descanso_final_s integer check (bloque_descanso_final_s is null or bloque_descanso_final_s between 0 and 600);

do $$
declare
  rid bigint;
  nuevo bigint;
  uid uuid;
  filas int;
begin
  if exists (select 1 from public.routines where nombre = 'KRAKEN DEFINITIVA') then
    raise exception 'La rutina KRAKEN DEFINITIVA ya existe';
  end if;
  select id into uid from auth.users where lower(email) = 'ezequiel.arce@outlook.com';
  if uid is null then raise exception 'No se encontró la cuenta del coach'; end if;

  select id into nuevo from public.exercise_definitions where nombre = 'Aperturas de pecho en anillas';
  if nuevo is null then
    insert into public.exercise_definitions
      (nombre, categoria, imagen_url, tipo_esfuerzo, unilateral, grupos_musculares, modalidad_carga, como_hacerlo)
    values (
      'Aperturas de pecho en anillas', 'Torso',
      'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/webp/aperturas-anillas-fe2c9bc0.webp',
      'aislado', false, array['Pecho'], 'peso_corporal',
      E'Paso inicial: Colgá las anillas a una altura que te permita inclinarte hacia adelante, agarralas con las palmas enfrentadas y apoyá el cuerpo en posición de flexión inclinada, recto de cabeza a talones.\n\nPosición inicial: Brazos extendidos al frente con una leve flexión de codos, anillas juntas bajo el pecho, core activado.\n\nMovimiento: Inhalá y abrí los brazos hacia los costados bajando el pecho entre las anillas, con los codos en una flexión leve y fija.\n\nContracción: Exhalá y juntá las anillas llevando los brazos hacia adelante, apretando el pecho al cerrar.\n\nRegreso: Controlá la apertura en cada repetición, sin hundir la cadera.\n\nConsejo como Entrenador:\n\nCuanto más inclinado estés, más difícil es: ajustá la inclinación del cuerpo para regular la dificultad y no abras más de lo que tu hombro tolera.'
    ) returning id into nuevo;
  end if;

  insert into public.routines (nombre, descripcion, dias, es_privada, creada_por_usuario)
  values ('KRAKEN DEFINITIVA',
          'Push Pull Legs de 6 días (A=Push A, B=Pull A, C=Legs A, D=Push B, E=Pull B, F=Legs B). Biseries de gemelos en Legs, dominadas + jalón en Pull A y circuito de abdominales en Pull.',
          6, true, false)
  returning id into rid;

  insert into public.routine_exercises
    (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo, bloque, bloque_titulo, bloque_descanso_entre_s, bloque_descanso_final_s)
  select rid, v.dia, v.orden, coalesce(v.ej, nuevo), v.sr, v.rir, v.bloque, v.titulo, v.entre, v.fin
  from (values
    -- A: Push A
    ('A', 1, 35,   '3 x 6-10',  1, null::int, null::text, null::int, null::int),
    ('A', 2, 14,   '4 x 12-15', 1, null, null, null, null),
    ('A', 3, 22,   '3 x 10-15', 1, null, null, null, null),
    ('A', 4, 28,   '3 x 8-12',  1, null, null, null, null),
    ('A', 5, null, '3 x 10-15', 1, null, null, null, null),
    -- B: Pull A
    ('B', 1, 68,   '3 x 5-8',   1, 1, 'Dominadas', 20, 150),
    ('B', 2, 9,    '3 x 8-12',  0, 1, 'Dominadas', 20, 150),
    ('B', 3, 42,   '3 x 8-12',  1, null, null, null, null),
    ('B', 4, 38,   '3 x 6-10',  1, null, null, null, null),
    ('B', 5, 69,   '3 x 8-12',  1, null, null, null, null),
    ('B', 6, 4,    '3 x 10-12', 1, null, null, null, null),
    ('B', 7, 58,   '3 x 12-15', 1, 2, 'Abdominales', 20, 60),
    ('B', 8, 57,   '3 x 10-15', 1, 2, 'Abdominales', 20, 60),
    -- C: Legs A
    ('C', 1, 10,   '4 x 10-15', 1, 1, 'Gemelos', 75, 90),
    ('C', 2, 79,   '4 x 12-20', 1, 1, 'Gemelos', 75, 90),
    ('C', 3, 111,  '3 x 8-12',  1, null, null, null, null),
    ('C', 4, 18,   '3 x 8-10',  1, null, null, null, null),
    ('C', 5, 20,   '3 x 10-15', 1, null, null, null, null),
    ('C', 6, 6,    '3 x 10-12', 1, null, null, null, null),
    -- D: Push B
    ('D', 1, 36,   '3 x 6-10',  1, null, null, null, null),
    ('D', 2, 61,   '3 x 8-12',  1, null, null, null, null),
    ('D', 3, 14,   '4 x 12-20', 1, null, null, null, null),
    ('D', 4, 28,   '3 x 8-12',  1, null, null, null, null),
    ('D', 5, 292,  '3 x 10-15', 1, null, null, null, null),
    -- E: Pull B
    ('E', 1, 287,  '3 x 6-10',  1, null, null, null, null),
    ('E', 2, 17,   '3 x 10-15', 1, null, null, null, null),
    ('E', 3, 39,   '3 x 8-12',  1, null, null, null, null),
    ('E', 4, 5,    '3 x 8-12',  1, null, null, null, null),
    ('E', 5, 109,  '3 x 8-12',  1, null, null, null, null),
    ('E', 6, 58,   '3 x 12-15', 1, 1, 'Abdominales', 20, 60),
    ('E', 7, 57,   '3 x 10-15', 1, 1, 'Abdominales', 20, 60),
    -- F: Legs B
    ('F', 1, 10,   '4 x 10-15', 1, 1, 'Gemelos', 75, 90),
    ('F', 2, 79,   '4 x 12-20', 1, 1, 'Gemelos', 75, 90),
    ('F', 3, 59,   '3 x 5-8',   1, null, null, null, null),
    ('F', 4, 111,  '3 x 10-15', 1, null, null, null, null),
    ('F', 5, 6,    '3 x 8-12',  1, null, null, null, null),
    ('F', 6, 20,   '3 x 12-15', 1, null, null, null, null)
  ) as v(dia, orden, ej, sr, rir, bloque, titulo, entre, fin);

  get diagnostics filas = row_count;
  if filas <> 37 then raise exception 'Se esperaban 37 ejercicios y se cargaron %', filas; end if;

  insert into public.profile_routine_access (user_id, routine_id) values (uid, rid);

  if (select count(*) from public.routine_exercises where routine_id = rid and exercise_definition_id is null) <> 0 then
    raise exception 'Quedó un ejercicio sin definición';
  end if;
end
$$;

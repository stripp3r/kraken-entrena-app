-- Migración 112: ejercicios duplicados del catálogo (diagnóstico del 2026-10-30).
--
-- Se comparó el catálogo entero por contenido de imagen (hash exacto del archivo + hash perceptual de 4 cuadros) y se
-- miró cada par a ojo, además de rastrear de qué archivo de la biblioteca salió cada imagen. Criterio del coach
-- (CLAUDE.md, "Auditoría del catálogo"): agarre o implemento distinto SIEMPRE es un ejercicio separado. Solo se fusiona
-- lo que es el MISMO ejercicio (mismo movimiento, implemento y lateralidad) y no contradice una decisión ya tomada.
--
-- A) Fusión de 9 duplicados (duplicado -> canónico). Por cada uno, en este orden:
--   1) respaldo completo del duplicado y del canónico en public.ejercicios_fusion_112 (para poder deshacer),
--   2) el canónico hereda lo que le falte (video, video femenino, ejercicio alternativo),
--   3) rutinas, historial de series, sesiones de la cámara y alternativas que apuntaban al duplicado pasan al canónico,
--   4) recién ahí se borra el duplicado. Las claves foráneas son ON DELETE SET NULL: si se borrara antes de re-apuntar,
--      el historial de los usuarios quedaría sin ejercicio. Por eso el orden importa.
-- B) "Press de banca con barra (pies en el banco)" (271) tenía la MISMA animación que "Press banco plano con barra"
--    (32): se le pone la imagen correcta de la biblioteca (BENCH-PRESS-FEET-UP). El ejercicio se mantiene.
-- C) Errata de tilde en "Elevación lateral con mancuernas" (14).
-- Al final la migración se verifica sola: si cambia la cantidad de series registradas, de filas de rutinas o queda
-- alguna referencia en NULL, lanza una excepción y se revierte todo.
-- Deshacer: supabase/rollback_112_fusion_ejercicios.sql (NO se corre sola).
--
-- A propósito NO se fusionó (decisiones previas del coach o variantes reales; ver CLAUDE.md):
--   91 / 93 / 214  comparten animación (elevación de rodillas sentado); el coach confirmó el 93 y el 214 está en
--                  "Kraken Standard M" -> pendiente de que el coach elija el nombre único.
--   162 / 283      el coach corrigió (migración 078): el ancho de agarre distingue variantes de press de banca.
--   41 / 240       evaluados como variante real (manija en T vs barra directa).
--   190 / 44       la pelota es un implemento distinto.   22 / 278   el coach lo dio por ejercicio genuino (077).

create table if not exists public.ejercicios_fusion_112 (
  id_duplicado          bigint primary key,
  id_canonico           bigint not null,
  fila_duplicado        jsonb not null,
  fila_canonico_antes   jsonb not null,
  routine_exercises_ids bigint[] not null default '{}',
  workout_logs_ids      bigint[] not null default '{}',
  pose_sesiones_ids     bigint[] not null default '{}',
  alternativa_de_ids    bigint[] not null default '{}',
  fusionado_en          timestamptz not null default now()
);
alter table public.ejercicios_fusion_112 enable row level security;
comment on table public.ejercicios_fusion_112 is
  'Respaldo de la migración 112 (ejercicios duplicados fusionados). Solo para deshacerla (rollback_112_fusion_ejercicios.sql). RLS sin políticas: solo service role.';

do $$
declare
  -- (duplicado, canónico)
  mapa constant bigint[] := array[
    [276, 292], -- Extensión de tríceps sobre la cabeza en polea a un brazo = Tríceps katana (mismo archivo de la biblioteca)
    [86, 85],   -- Crunch básico = Crunch abdominal
    [143, 136], -- Dorsales en polea alta agarre supino = Jalón al pecho en polea alta agarre supino
    [145, 30],  -- Pulldown a un brazo en polea alta = Jalón lateral con polea a un brazo
    [168, 34],  -- Press militar en máquina Smith = Press de hombro en máquina Smith
    [146, 240], -- Remo parado con barra agarre cerrado = Remo landmine con barra (dos ilustraciones del mismo ejercicio)
    [273, 73],  -- Aperturas con mancuernas en el piso con rodillo = Aperturas con mancuernas (la animación era la misma)
    [2, 111],   -- Cuádriceps en prensa = Prensa de piernas 45°
    [88, 96]    -- Elevación de cadera con rodillas flexionadas = Crunch inverso
  ];
  n int := array_length(mapa, 1);
  i int;
  dup bigint;
  can bigint;
  logs_antes bigint;
  rutinas_antes bigint;
  pose_antes bigint;
  catalogo_antes bigint;
  imagen_271_antes constant text := 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/webp/271-84ae0efa.webp';
  imagen_271_nueva constant text := 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/webp/271-dc749fdd.webp';
begin
  select count(*) into logs_antes from public.workout_logs;
  select count(*) into rutinas_antes from public.routine_exercises;
  select count(*) into pose_antes from public.pose_sesiones_prueba;
  select count(*) into catalogo_antes from public.exercise_definitions;

  -- Precondiciones: existen todos y ningún canónico es a la vez duplicado de otro.
  for i in 1 .. n loop
    dup := mapa[i][1];
    can := mapa[i][2];
    if not exists (select 1 from public.exercise_definitions where id = dup) then
      raise exception 'El ejercicio duplicado % no existe', dup;
    end if;
    if not exists (select 1 from public.exercise_definitions where id = can) then
      raise exception 'El ejercicio canónico % no existe', can;
    end if;
    if exists (select 1 from generate_series(1, n) j where mapa[j][1] = can) then
      raise exception 'El canónico % figura también como duplicado', can;
    end if;
  end loop;

  -- 1) Respaldo de todo, antes de tocar nada (el canónico se guarda como estaba al empezar).
  for i in 1 .. n loop
    dup := mapa[i][1];
    can := mapa[i][2];
    insert into public.ejercicios_fusion_112
      (id_duplicado, id_canonico, fila_duplicado, fila_canonico_antes,
       routine_exercises_ids, workout_logs_ids, pose_sesiones_ids, alternativa_de_ids)
    select dup, can, to_jsonb(d), to_jsonb(c),
      coalesce((select array_agg(x.id order by x.id) from public.routine_exercises x where x.exercise_definition_id = dup), '{}'),
      coalesce((select array_agg(x.id order by x.id) from public.workout_logs x where x.exercise_definition_id = dup), '{}'),
      coalesce((select array_agg(x.id order by x.id) from public.pose_sesiones_prueba x where x.exercise_definition_id = dup), '{}'),
      coalesce((select array_agg(x.id order by x.id) from public.exercise_definitions x where x.alternativa_id = dup), '{}')
    from public.exercise_definitions d, public.exercise_definitions c
    where d.id = dup and c.id = can;
  end loop;

  -- 2) y 3) y 4) Fusión.
  for i in 1 .. n loop
    dup := mapa[i][1];
    can := mapa[i][2];

    update public.exercise_definitions c
       set video_url      = coalesce(c.video_url, d.video_url),
           video_url_fem  = coalesce(c.video_url_fem, d.video_url_fem),
           alternativa_id = coalesce(c.alternativa_id, case when d.alternativa_id in (c.id, d.id) then null else d.alternativa_id end)
      from public.exercise_definitions d
     where c.id = can and d.id = dup;

    update public.routine_exercises set exercise_definition_id = can where exercise_definition_id = dup;
    update public.workout_logs set exercise_definition_id = can where exercise_definition_id = dup;
    update public.pose_sesiones_prueba set exercise_definition_id = can where exercise_definition_id = dup;
    update public.exercise_definitions set alternativa_id = can where alternativa_id = dup;
    update public.exercise_definitions set alternativa_id = null where id = can and alternativa_id = can;

    delete from public.exercise_definitions where id = dup;
  end loop;

  -- Nombres definitivos de los canónicos que lo necesitaban (y una errata de tilde).
  update public.exercise_definitions set nombre = 'Tríceps katana (extensión sobre la cabeza en polea a un brazo)' where id = 292;
  update public.exercise_definitions set nombre = 'Press militar en máquina Smith' where id = 34;
  update public.exercise_definitions set nombre = 'Elevación lateral con mancuernas' where id = 14;

  -- B) Imagen correcta para "Press de banca con barra (pies en el banco)": solo si sigue con la imagen de antes.
  update public.exercise_definitions
     set imagen_url = imagen_271_nueva
   where id = 271 and imagen_url = imagen_271_antes;
  if not found then
    raise exception 'No se pudo cambiar la imagen del ejercicio 271 (ya no tiene la imagen esperada)';
  end if;

  -- Verificación: no se perdió ni quedó colgado nada. Cualquier falla revierte la migración entera.
  if (select count(*) from public.workout_logs) <> logs_antes then
    raise exception 'Cambió la cantidad de series registradas';
  end if;
  if (select count(*) from public.routine_exercises) <> rutinas_antes then
    raise exception 'Cambió la cantidad de filas de rutinas';
  end if;
  if (select count(*) from public.pose_sesiones_prueba) <> pose_antes then
    raise exception 'Cambió la cantidad de sesiones de la cámara';
  end if;
  if (select count(*) from public.exercise_definitions) <> catalogo_antes - n then
    raise exception 'La cantidad de ejercicios del catálogo no es la esperada';
  end if;
  if exists (select 1 from public.workout_logs where exercise_definition_id is null)
     or exists (select 1 from public.routine_exercises where exercise_definition_id is null) then
    raise exception 'Quedaron filas sin ejercicio';
  end if;
  if exists (select 1 from public.exercise_definitions where alternativa_id = id) then
    raise exception 'Quedó un ejercicio que es alternativa de sí mismo';
  end if;
  if (select count(*) from public.exercise_definitions where id in (292, 34, 14)) <> 3 then
    raise exception 'Falta alguno de los ejercicios a renombrar';
  end if;
end
$$;

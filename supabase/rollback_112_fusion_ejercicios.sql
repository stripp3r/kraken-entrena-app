-- ROLLBACK de la migración 112 (NO se corre sola): recrea los ejercicios duplicados con sus mismos ids y vuelve a
-- apuntarles lo que tenían (filas de rutinas, series registradas, sesiones de la cámara y alternativas).
-- Se apoya en public.ejercicios_fusion_112, el respaldo que dejó la migración.
-- Límite: lo que se registró DESPUÉS de la migración con un ejercicio canónico se queda en el canónico.

do $$
begin
  if not exists (select 1 from public.ejercicios_fusion_112) then
    raise exception 'No hay respaldo de la migración 112 para deshacer';
  end if;

  -- Recrear los duplicados tal cual eran (alternativa_id se restaura después, para no chocar con la clave foránea).
  -- "id" es una columna de identidad: hace falta OVERRIDING SYSTEM VALUE para conservar el id original.
  insert into public.exercise_definitions
  overriding system value
  select (jsonb_populate_record(null::public.exercise_definitions, f.fila_duplicado || jsonb_build_object('alternativa_id', null))).*
  from public.ejercicios_fusion_112 f;

  update public.routine_exercises r
     set exercise_definition_id = f.id_duplicado
    from public.ejercicios_fusion_112 f
   where r.id = any (f.routine_exercises_ids);

  update public.workout_logs w
     set exercise_definition_id = f.id_duplicado
    from public.ejercicios_fusion_112 f
   where w.id = any (f.workout_logs_ids);

  update public.pose_sesiones_prueba p
     set exercise_definition_id = f.id_duplicado
    from public.ejercicios_fusion_112 f
   where p.id = any (f.pose_sesiones_ids);

  update public.exercise_definitions d
     set alternativa_id = (f.fila_duplicado ->> 'alternativa_id')::bigint
    from public.ejercicios_fusion_112 f
   where d.id = f.id_duplicado;

  update public.exercise_definitions d
     set alternativa_id = f.id_duplicado
    from public.ejercicios_fusion_112 f
   where d.id = any (f.alternativa_de_ids);

  -- Los canónicos vuelven a su nombre, videos y alternativa de antes.
  update public.exercise_definitions c
     set nombre         = f.fila_canonico_antes ->> 'nombre',
         video_url      = f.fila_canonico_antes ->> 'video_url',
         video_url_fem  = f.fila_canonico_antes ->> 'video_url_fem',
         como_hacerlo   = f.fila_canonico_antes ->> 'como_hacerlo',
         alternativa_id = (f.fila_canonico_antes ->> 'alternativa_id')::bigint
    from public.ejercicios_fusion_112 f
   where c.id = f.id_canonico;

  -- Lo que la migración cambió fuera de las fusiones: errata de tilde del 14 e imagen del 271.
  update public.exercise_definitions set nombre = 'Elevacion lateral con mancuernas' where id = 14;
  update public.exercise_definitions
     set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/webp/271-84ae0efa.webp'
   where id = 271;
end
$$;

-- Cuando ya no haga falta el respaldo:
--   drop table public.ejercicios_fusion_112;
-- (el archivo webp/271-dc749fdd.webp queda en el bucket; no estorba y se puede borrar a mano si se quiere)

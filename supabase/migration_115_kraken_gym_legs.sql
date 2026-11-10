-- Migración 115: rutina "KRAKEN GYM" (borrador para el gimnasio comercial, Push/Pull/Legs 6 días).
--
-- Copia los días de KRAKEN DEFINITIVA (A, B, D, E sin cambios por ahora) y REEMPLAZA Legs A (C) y Legs B (F) con las
-- máquinas del gimnasio. Se mantiene la BISERIE de gemelos (de pie 10 + sentado 79) en ambos días de piernas.
-- Privada, solo para ezequiel.arce@outlook.com y SIN activar. KRAKEN DEFINITIVA no se toca.
--
-- Legs A (cuádriceps): gemelos biserie, hack squat, prensa 45°, extensión de cuádriceps, curl femoral sentado, abductores, aductores.
-- Legs B (posterior/glúteo): gemelos biserie, peso muerto, empuje de caderas, curl femoral tumbado, prensa 45°, abductores, aductores.
-- PENDIENTE (faltan en el catálogo y no tienen GIF; se agregan cuando el coach confirme las máquinas): sentadilla pendular,
-- belt squat, hip thrust en máquina. Cuando estén, reemplazan a prensa/empuje de caderas en el día que corresponda.

do $$
declare
  base bigint;
  rid bigint;
  uid uuid;
  filas int;
begin
  if exists (select 1 from public.routines where nombre = 'KRAKEN GYM') then
    raise exception 'La rutina KRAKEN GYM ya existe';
  end if;
  select id into base from public.routines where nombre = 'KRAKEN DEFINITIVA';
  if base is null then raise exception 'No existe KRAKEN DEFINITIVA'; end if;
  select id into uid from auth.users where lower(email) = 'ezequiel.arce@outlook.com';
  if uid is null then raise exception 'No se encontró la cuenta del coach'; end if;

  insert into public.routines (nombre, descripcion, dias, es_privada, creada_por_usuario)
  values ('KRAKEN GYM',
          'Push Pull Legs de 6 días para gimnasio comercial (A=Push A, B=Pull A, C=Legs A, D=Push B, E=Pull B, F=Legs B). Legs con máquinas; biserie de gemelos. Borrador: faltan pendular, belt squat y hip thrust en máquina.',
          6, true, false)
  returning id into rid;

  -- Días sin cambios (copia exacta, incluidos los bloques/biseries).
  insert into public.routine_exercises
    (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo, bloque, bloque_titulo, bloque_descanso_entre_s, bloque_descanso_final_s)
  select rid, dia, orden, exercise_definition_id, series_reps, rir_objetivo, bloque, bloque_titulo, bloque_descanso_entre_s, bloque_descanso_final_s
  from public.routine_exercises where routine_id = base and dia in ('A', 'B', 'D', 'E');
  get diagnostics filas = row_count;
  if filas <> 25 then raise exception 'Se esperaban 25 ejercicios copiados y se copiaron %', filas; end if;

  insert into public.routine_exercises
    (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo, bloque, bloque_titulo, bloque_descanso_entre_s, bloque_descanso_final_s)
  select rid, v.dia, v.orden, v.ej, v.sr, v.rir, v.bloque, v.titulo, v.entre, v.fin
  from (values
    -- C: Legs A
    ('C', 1, 10,  '4 x 10-15', 1, 1,           'Gemelos', 75, 90),
    ('C', 2, 79,  '4 x 12-20', 1, 1,           'Gemelos', 75, 90),
    ('C', 3, 81,  '3 x 6-10',  1, null::int,   null::text, null::int, null::int),
    ('C', 4, 111, '3 x 10-15', 1, null, null, null, null),
    ('C', 5, 20,  '3 x 12-15', 1, null, null, null, null),
    ('C', 6, 7,   '3 x 10-12', 1, null, null, null, null),
    ('C', 7, 82,  '3 x 12-15', 1, null, null, null, null),
    ('C', 8, 182, '3 x 12-15', 1, null, null, null, null),
    -- F: Legs B
    ('F', 1, 10,  '4 x 10-15', 1, 1,           'Gemelos', 75, 90),
    ('F', 2, 79,  '4 x 12-20', 1, 1,           'Gemelos', 75, 90),
    ('F', 3, 59,  '3 x 5-8',   1, null, null, null, null),
    ('F', 4, 64,  '3 x 8-12',  1, null, null, null, null),
    ('F', 5, 6,   '3 x 8-12',  1, null, null, null, null),
    ('F', 6, 111, '3 x 10-15', 1, null, null, null, null),
    ('F', 7, 82,  '3 x 15-20', 1, null, null, null, null),
    ('F', 8, 182, '3 x 15-20', 1, null, null, null, null)
  ) as v(dia, orden, ej, sr, rir, bloque, titulo, entre, fin);
  get diagnostics filas = row_count;
  if filas <> 16 then raise exception 'Se esperaban 16 ejercicios de piernas y se cargaron %', filas; end if;

  insert into public.profile_routine_access (user_id, routine_id) values (uid, rid);

  if exists (select 1 from public.routine_exercises where routine_id = rid and exercise_definition_id is null) then
    raise exception 'Quedó un ejercicio sin definición';
  end if;
end
$$;

-- Migración 123: plan autoguiado "Mínimo Letal" (producto 7, slug 'minimalista'). Rutina nueva privada, desvinculada de la vieja
-- "Minimalista" (rutina 11, que NO se borra). Fuente: la carpeta PDFS/PLAN MINIMALISTA (rutina_minimo_letal.json).
-- 3 entrenamientos full body A/B/C de 6 ejercicios que se rotan en 2 sesiones por semana; el acceso de 90 días lo da la compra.
-- Cada ejercicio apunta a su exercise_definition del catálogo (todos con imagen). El producto NO se activa acá.
do $$
declare rid bigint; filas int;
begin
  if exists (select 1 from public.routines where nombre = 'Mínimo Letal') then raise exception 'La rutina Mínimo Letal ya existe'; end if;
  insert into public.routines (nombre, descripcion, dias, es_privada, creada_por_usuario)
  values ('Mínimo Letal',
    'Plan Mínimo Letal (90 días). 3 entrenamientos full body (A, B, C) de 6 ejercicios que se rotan en 2 sesiones por semana (semana 1: A,B · semana 2: C,A · semana 3: B,C). Cada ejercicio: 1 serie de aproximación + 2 efectivas en los 3 principales o 1 efectiva en los 3 accesorios (RIR 0-1, 8-15 repeticiones; al llegar a 15 con técnica limpia, subí el peso). El cardio (150 min semanales de actividad moderada) va por fuera de la rutina.',
    3, true, false)
  returning id into rid;

  insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
  select rid, v.dia, v.orden, v.ej, v.sr, v.rir
  from (values
    ('A', 1, 111, '3 x 8-15 (1 de aproximación + 2 efectivas, RIR 0-1)', 0.5), -- Prensa 45°
    ('A', 2, 61, '3 x 8-15 (1 de aproximación + 2 efectivas, RIR 0-1)', 0.5), -- Press inclinado con mancuernas
    ('A', 3, 65, '3 x 8-15 (1 de aproximación + 2 efectivas, RIR 0-1)', 0.5), -- Jalón al pecho
    ('A', 4, 6, '2 x 8-15 (1 de aproximación + 1 efectiva, RIR 0-1)', 0.5), -- Curl femoral tumbado
    ('A', 5, 14, '2 x 8-15 (1 de aproximación + 1 efectiva, RIR 0-1)', 0.5), -- Elevaciones laterales
    ('A', 6, 284, '2 x 8-15 (1 de aproximación + 1 efectiva, RIR 0-1)', 0.5), -- Extensión de tríceps en polea
    ('B', 1, 81, '3 x 8-15 (1 de aproximación + 2 efectivas, RIR 0-1)', 0.5), -- Hack squat
    ('B', 2, 254, '3 x 8-15 (1 de aproximación + 2 efectivas, RIR 0-1)', 0.5), -- Press de hombros en máquina
    ('B', 3, 66, '3 x 8-15 (1 de aproximación + 2 efectivas, RIR 0-1)', 0.5), -- Remo sentado en polea
    ('B', 4, 31, '2 x 8-15 (1 de aproximación + 1 efectiva, RIR 0-1)', 0.5), -- Peso muerto rumano
    ('B', 5, 69, '2 x 8-15 (1 de aproximación + 1 efectiva, RIR 0-1)', 0.5), -- Curl de bíceps con barra EZ
    ('B', 6, 11, '2 x 8-15 (1 de aproximación + 1 efectiva, RIR 0-1)', 0.5), -- Gemelos de pie
    ('C', 1, 64, '3 x 8-15 (1 de aproximación + 2 efectivas, RIR 0-1)', 0.5), -- Hip thrust
    ('C', 2, 112, '3 x 8-15 (1 de aproximación + 2 efectivas, RIR 0-1)', 0.5), -- Press de pecho en máquina
    ('C', 3, 235, '3 x 8-15 (1 de aproximación + 2 efectivas, RIR 0-1)', 0.5), -- Remo en T o con mancuerna
    ('C', 4, 20, '2 x 8-15 (1 de aproximación + 1 efectiva, RIR 0-1)', 0.5), -- Extensión de cuádriceps
    ('C', 5, 102, '2 x 8-15 (1 de aproximación + 1 efectiva, RIR 0-1)', 0.5), -- Pájaros (hombro posterior)
    ('C', 6, 211, '2 x 8-15 (1 de aproximación + 1 efectiva, RIR 0-1)', 0.5) -- Crunch en polea
  ) as v(dia, orden, ej, sr, rir);
  get diagnostics filas = row_count;
  if filas <> 18 then raise exception 'Se esperaban 18 ejercicios y se cargaron %', filas; end if;

  delete from public.producto_rutinas where producto_id = 7;
  insert into public.producto_rutinas (producto_id, routine_id) values (7, rid);
  update public.productos set nombre = 'KRAKEN Mínimo Letal' where id = 7 and slug = 'minimalista';
end
$$;

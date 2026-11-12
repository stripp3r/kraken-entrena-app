-- Migración 119: KRAKEN GYM — Push A (día A) y Push B (día D) rehechos con las máquinas del gimnasio comercial.
-- Criterio (basado en la fase 1 "Base Hypertrophy" del Push de Jeff Nippard, PPL 6x): prioridad en pecho SUPERIOR, máquinas de press
-- plano/inclinado y de hombro, cruce de poleas y fondos; elevaciones laterales en polea/mancuerna (no hay máquina) y tríceps en polea
-- (no hay máquina). 6 ejercicios por día; el pecho se entrena 2 veces por semana (~20 series) y los deltoides laterales 2 veces.
-- Push A (pesado, máquinas): press inclinado en máquina, press plano en máquina, press de hombro en máquina, apertura en polea en
--   banco inclinado, vuelo lateral en polea, extensión de tríceps sobre la cabeza en polea.
-- Push B (volumen y estiramiento): press inclinado con mancuernas, fondos en paralelas, press militar con mancuernas, cruce en polea,
--   elevación lateral con mancuernas, tríceps en polea.
do $$
declare rid bigint; filas int;
begin
  select id into rid from public.routines where nombre = 'KRAKEN GYM';
  if rid is null then raise exception 'No existe KRAKEN GYM'; end if;

  delete from public.routine_exercises where routine_id = rid and dia in ('A', 'D');
  insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
  select rid, v.dia, v.orden, v.ej, v.sr, v.rir
  from (values
    ('A', 1, 157, '4 x 6-10',  1),
    ('A', 2, 112, '3 x 8-12',  1),
    ('A', 3, 254, '3 x 8-12',  1),
    ('A', 4, 286, '3 x 10-15', 1),
    ('A', 5, 48,  '4 x 12-15', 1),
    ('A', 6, 77,  '3 x 10-12', 1),
    ('D', 1, 61,  '4 x 8-12',  1),
    ('D', 2, 28,  '3 x 8-12',  1),
    ('D', 3, 36,  '3 x 8-12',  1),
    ('D', 4, 152, '3 x 12-15', 1),
    ('D', 5, 14,  '4 x 12-20', 1),
    ('D', 6, 22,  '3 x 10-15', 1)
  ) as v(dia, orden, ej, sr, rir);
  get diagnostics filas = row_count;
  if filas <> 12 then raise exception 'Se esperaban 12 ejercicios y se cargaron %', filas; end if;
end
$$;

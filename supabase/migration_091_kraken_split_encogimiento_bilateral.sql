-- Migración 091: Kraken Split, Día B #4 -- el encogimiento de hombros pasa
-- de unilateral (Gittleson) a bilateral parado con mancuernas, a pedido del
-- coach (2026-10-07).
--
-- YA APLICADA directo vía API el 2026-10-07 (es una sola fila de la rutina
-- personal del coach, id 7) -- este archivo queda solo por registro y es
-- idempotente: no hace falta correrla en el SQL Editor, pero correrla no
-- rompe nada.

update public.routine_exercises
set exercise_definition_id = (
      select id from public.exercise_definitions
      where nombre = 'Encogimiento de hombros con mancuernas'
    ),
    series_reps = '3 x 10-15'
where routine_id = (select id from public.routines where nombre = 'Kraken Split')
  and dia = 'B'
  and orden = 4;

-- Migración 106: carga la rutina del plan autoguiado "Grasa Sub-0" (reemplaza el contenido de la vieja "Grasa Sub-Cero").
--
-- Fuente autoritativa: D:\PROYECTO FITNESS\PDFS\PLAN GRASA SUB-0\rutina_grasa_sub0.json (generado desde el libro).
-- La rutina (id 8) no tenía compradores ni perfiles con acceso (producto grasa-sub-cero inactivo), así que se
-- reemplaza sin tocar historiales. Sigue siendo PRIVADA (es_privada = true): solo la ve quien compra el plan, vía
-- producto_rutinas -> profile_routine_access. Cada ejercicio apunta a su exercise_definition de la biblioteca
-- (con imagen); el texto "cómo hacerlo" es el del catálogo.
-- Días: A Torso 1, B Pierna 1, C Torso 2, D Pierna 2, E opcional (8 ejercicios para elegir 4 o 5).
-- El producto sigue INACTIVO (activo = false): la venta se activa aparte, con el PDF aprobado y los precios.

update public.routines
set nombre = 'Grasa Sub-0',
    descripcion = 'Plan Grasa Sub-0 (90 días). Día A: Torso 1 · Día B: Pierna 1 · Día C: Torso 2 · Día D: Pierna 2 · Día E (opcional): elegí 4 o 5 de los 8 ejercicios. 2 series efectivas por ejercicio (RIR 0-1); el primer ejercicio de cada músculo suma 2 series de aproximación. El cardio (60 min diarios de caminata rápida o bici, ligera los días de pierna) va por fuera de la rutina.',
    dias = 5,
    es_privada = true
where nombre = 'Grasa Sub-Cero';

delete from public.routine_exercises
where routine_id = (select id from public.routines where nombre = 'Grasa Sub-0');

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo)
values
  ((select id from public.routines where nombre = 'Grasa Sub-0'), 'A', 1, 61, '4 x 6-10 (2 de aproximación + 2 efectivas, RIR 0-1)', 0.5), -- Press inclinado con mancuernas
  ((select id from public.routines where nombre = 'Grasa Sub-0'), 'A', 2, 65, '4 x 6-10 (2 de aproximación + 2 efectivas, RIR 0-1)', 0.5), -- Jalón al pecho
  ((select id from public.routines where nombre = 'Grasa Sub-0'), 'A', 3, 112, '2 x 6-10 (RIR 0-1)', 0.5), -- Press de pecho en máquina
  ((select id from public.routines where nombre = 'Grasa Sub-0'), 'A', 4, 66, '2 x 6-10 (RIR 0-1)', 0.5), -- Remo sentado en polea
  ((select id from public.routines where nombre = 'Grasa Sub-0'), 'A', 5, 14, '4 x 10-15 (2 de aproximación + 2 efectivas, RIR 0-1)', 0.5), -- Elevaciones laterales
  ((select id from public.routines where nombre = 'Grasa Sub-0'), 'A', 6, 284, '4 x 10-15 (2 de aproximación + 2 efectivas, RIR 0-1)', 0.5), -- Extensión de tríceps en polea
  ((select id from public.routines where nombre = 'Grasa Sub-0'), 'B', 1, 123, '4 x 10-15 (2 de aproximación + 2 efectivas, RIR 0-1)', 0.5), -- Sentadilla
  ((select id from public.routines where nombre = 'Grasa Sub-0'), 'B', 2, 31, '4 x 10-15 (2 de aproximación + 2 efectivas, RIR 0-1)', 0.5), -- Peso muerto rumano
  ((select id from public.routines where nombre = 'Grasa Sub-0'), 'B', 3, 124, '2 x 10-15 (RIR 0-1)', 0.5), -- Prensa
  ((select id from public.routines where nombre = 'Grasa Sub-0'), 'B', 4, 6, '2 x 10-15 (RIR 0-1)', 0.5), -- Curl femoral tumbado
  ((select id from public.routines where nombre = 'Grasa Sub-0'), 'B', 5, 11, '4 x 10-15 (2 de aproximación + 2 efectivas, RIR 0-1)', 0.5), -- Gemelos de pie
  ((select id from public.routines where nombre = 'Grasa Sub-0'), 'B', 6, 211, '4 x 10-15 (2 de aproximación + 2 efectivas, RIR 0-1)', 0.5), -- Crunch en polea
  ((select id from public.routines where nombre = 'Grasa Sub-0'), 'C', 1, 235, '4 x 6-10 (2 de aproximación + 2 efectivas, RIR 0-1)', 0.5), -- Remo en T o con mancuerna
  ((select id from public.routines where nombre = 'Grasa Sub-0'), 'C', 2, 36, '4 x 6-10 (2 de aproximación + 2 efectivas, RIR 0-1)', 0.5), -- Press militar con mancuernas
  ((select id from public.routines where nombre = 'Grasa Sub-0'), 'C', 3, 152, '4 x 10-15 (2 de aproximación + 2 efectivas, RIR 0-1)', 0.5), -- Aperturas en polea
  ((select id from public.routines where nombre = 'Grasa Sub-0'), 'C', 4, 142, '2 x 6-10 (RIR 0-1)', 0.5), -- Jalón con agarre neutro
  ((select id from public.routines where nombre = 'Grasa Sub-0'), 'C', 5, 4, '4 x 10-15 (2 de aproximación + 2 efectivas, RIR 0-1)', 0.5), -- Curl de bíceps inclinado
  ((select id from public.routines where nombre = 'Grasa Sub-0'), 'C', 6, 132, '4 x 10-15 (2 de aproximación + 2 efectivas, RIR 0-1)', 0.5), -- Press francés
  ((select id from public.routines where nombre = 'Grasa Sub-0'), 'D', 1, 111, '4 x 10-15 (2 de aproximación + 2 efectivas, RIR 0-1)', 0.5), -- Prensa 45°
  ((select id from public.routines where nombre = 'Grasa Sub-0'), 'D', 2, 7, '4 x 10-15 (2 de aproximación + 2 efectivas, RIR 0-1)', 0.5), -- Curl femoral sentado
  ((select id from public.routines where nombre = 'Grasa Sub-0'), 'D', 3, 64, '4 x 10-15 (2 de aproximación + 2 efectivas, RIR 0-1)', 0.5), -- Hip thrust
  ((select id from public.routines where nombre = 'Grasa Sub-0'), 'D', 4, 20, '2 x 10-15 (RIR 0-1)', 0.5), -- Extensión de cuádriceps
  ((select id from public.routines where nombre = 'Grasa Sub-0'), 'D', 5, 79, '4 x 10-15 (2 de aproximación + 2 efectivas, RIR 0-1)', 0.5), -- Gemelos sentado
  ((select id from public.routines where nombre = 'Grasa Sub-0'), 'D', 6, 90, '4 x 10-15 (2 de aproximación + 2 efectivas, RIR 0-1)', 0.5), -- Elevación de piernas
  ((select id from public.routines where nombre = 'Grasa Sub-0'), 'E', 1, 109, '4 x 10-15 (2 de aproximación + 2 efectivas, RIR 0-1)', 0.5), -- Curl martillo
  ((select id from public.routines where nombre = 'Grasa Sub-0'), 'E', 2, 174, '2 x 10-15 (RIR 0-1)', 0.5), -- Curl de bíceps en polea
  ((select id from public.routines where nombre = 'Grasa Sub-0'), 'E', 3, 77, '4 x 10-15 (2 de aproximación + 2 efectivas, RIR 0-1)', 0.5), -- Extensión de tríceps sobre la cabeza
  ((select id from public.routines where nombre = 'Grasa Sub-0'), 'E', 4, 14, '4 x 10-15 (2 de aproximación + 2 efectivas, RIR 0-1)', 0.5), -- Elevaciones laterales
  ((select id from public.routines where nombre = 'Grasa Sub-0'), 'E', 5, 102, '4 x 10-15 (2 de aproximación + 2 efectivas, RIR 0-1)', 0.5), -- Pájaros (hombro posterior)
  ((select id from public.routines where nombre = 'Grasa Sub-0'), 'E', 6, 57, '4 x 10-15 (2 de aproximación + 2 efectivas, RIR 0-1)', 0.5), -- Elevación de piernas colgado
  ((select id from public.routines where nombre = 'Grasa Sub-0'), 'E', 7, 211, '2 x 10-15 (RIR 0-1)', 0.5), -- Crunch o rueda abdominal
  ((select id from public.routines where nombre = 'Grasa Sub-0'), 'E', 8, 245, '4 x 10-15 (2 de aproximación + 2 efectivas, RIR 0-1)', 0.5); -- Gemelos en prensa

update public.productos set nombre = 'KRAKEN Grasa Sub-0' where slug = 'grasa-sub-cero';

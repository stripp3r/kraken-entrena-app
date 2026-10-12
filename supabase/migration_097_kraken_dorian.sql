-- Migración 097: rutina nueva "Kraken Dorian" (en honor a Dorian Yates), la
-- rutina personal del coach desde el 2026-10-12. Igual que "Kraken Split":
-- PRIVADA y con acceso solo para ezequiel.arce@outlook.com, y se deja activa
-- para esa cuenta (empieza hoy). Agregar otra cuenta propia = una fila más en
-- profile_routine_access (ver el final).
--
-- Programa de 5 días (A-E). Lunes A, martes B, jueves C, viernes D, sábado E;
-- miércoles y domingo descanso (la app no modela días de la semana, solo A-E).
-- Volumen bajo/moderado: 2 a 3 series por ejercicio, TODAS al fallo (RIR 0).
-- Los ejercicios marcados "(dropset)" por el coach se hacen como 2 series
-- normales al fallo + 1 a 2 series con drop set de 2 bajadas (ver
-- series_reps: "2 x al fallo (RIR 0) + 1-2 x drop set (2 bajadas)"; la app
-- los registra con la migración 096, que hay que correr ANTES de esta).
--
-- Interpretaciones sobre nombres coloquiales (avisarle si alguna no es la que
-- tenía en mente):
--   "Vuelo lateral con mancuernas"            -> Elevacion lateral con mancuernas (14)
--   "Extensión de tríceps en polea bilateral" -> Tríceps en polea alta con barra V (284)
--   "Extensión de tríceps unilateral en polea, codo pegado al torso"
--                                             -> Tríceps en polea alta a un brazo (22)
--   "Elevación de hombros con mancuernas"     -> Encogimiento de hombros con mancuernas (17)
--   "Remo con barra"                          -> Remo con barra parado (38)
--   "Curl de bíceps sentado con mancuernas"   -> Curl de bíceps en banco inclinado con mancuernas (4)
--   "Gemelos de pie"                          -> Elevación de talón en máquina Smith (10), el mismo
--                                                que usa en Kraken Split
--   "Gemelos sentado"                         -> Elevación de talón sentado en máquina (79)
--   "Dominadas cerradas lastradas"            -> Dominadas cerradas con agarre neutro (287)
--   "Pullover en polea"                       -> Pull over en polea (147)
--   "Curl de bíceps parado en polea"          -> Curl bíceps con barra en polea baja (174)
--   "Curl martillo con mancuerna"             -> Curl martillo parado (109)
--   "Sentadilla búlgara"                      -> Estocada búlgara en el banco (18)
--   "Curl femoral acostado"                   -> Curl femoral (6, la variante tumbada)
--   "Circuito de abdominales (el mismo de mi Kraken split)" -> los dos
--     ejercicios de abdominales de Kraken Split: Abdominales en banco declinado
--     (58) + Elevación de piernas colgado (57), como dos filas consecutivas.
--
-- Correr en el SQL Editor de Supabase después de la migración 096.

-- ============ RUTINA ============
insert into public.routines (nombre, descripcion, dias, es_privada)
select 'Kraken Dorian',
  'Rutina personal de 5 días, volumen bajo/moderado, todas las series al fallo, con drop sets en ejercicios puntuales -- en honor a Dorian Yates. Lunes A, martes B, jueves C, viernes D, sábado E; miércoles y domingo descanso.',
  5,
  true
where not exists (select 1 from public.routines where nombre = 'Kraken Dorian');

-- Por si se vuelve a correr: se reescriben los ejercicios desde cero.
delete from public.routine_exercises
where routine_id = (select id from public.routines where nombre = 'Kraken Dorian');

-- Texto de series_reps usado abajo:
--   normal : '2-3 x al fallo (RIR 0)'
--   drop   : '2 x al fallo (RIR 0) + 1-2 x drop set (2 bajadas)'
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Kraken Dorian'), v.dia, v.orden, v.ex, v.sr
from (values
  -- ============ DÍA A (lunes) ============
  ('A', 1, 35,  '2-3 x al fallo (RIR 0)'),                                       -- Press inclinado en máquina Smith
  ('A', 2, 61,  '2-3 x al fallo (RIR 0)'),                                       -- Press inclinado con mancuernas
  ('A', 3, 73,  '2-3 x al fallo (RIR 0)'),                                       -- Aperturas con mancuernas
  ('A', 4, 14,  '2 x al fallo (RIR 0) + 1-2 x drop set (2 bajadas)'),            -- Elevacion lateral con mancuernas
  ('A', 5, 284, '2 x al fallo (RIR 0) + 1-2 x drop set (2 bajadas)'),            -- Tríceps en polea alta con barra V
  ('A', 6, 58,  '2-3 x al fallo (RIR 0) (circuito de abdominales)'),             -- Abdominales en banco declinado
  ('A', 7, 57,  '2-3 x al fallo (RIR 0) (circuito de abdominales)'),             -- Elevación de piernas colgado
  -- ============ DÍA B (martes) ============
  ('B', 1, 59,  '2-3 x al fallo (RIR 0)'),                                       -- Peso muerto
  ('B', 2, 38,  '2-3 x al fallo (RIR 0)'),                                       -- Remo con barra parado
  ('B', 3, 17,  '2-3 x al fallo (RIR 0)'),                                       -- Encogimiento de hombros con mancuernas
  ('B', 4, 29,  '2-3 x al fallo (RIR 0)'),                                       -- Hiperextensiones
  ('B', 5, 4,   '2 x al fallo (RIR 0) + 1-2 x drop set (2 bajadas)'),            -- Curl de bíceps en banco inclinado con mancuernas
  ('B', 6, 10,  '2 x al fallo (RIR 0) + 1-2 x drop set (2 bajadas)'),            -- Elevación de talón en máquina Smith
  -- ============ DÍA C (jueves) ============
  ('C', 1, 14,  '2 x al fallo (RIR 0) + 1-2 x drop set (2 bajadas)'),            -- Elevacion lateral con mancuernas
  ('C', 2, 36,  '2-3 x al fallo (RIR 0)'),                                       -- Press militar con mancuernas
  ('C', 3, 28,  '2-3 x al fallo (RIR 0)'),                                       -- Fondos en paralelas
  ('C', 4, 22,  '2-3 x al fallo (RIR 0) por lado'),                              -- Tríceps en polea alta a un brazo
  ('C', 5, 284, '2 x al fallo (RIR 0) + 1-2 x drop set (2 bajadas)'),            -- Tríceps en polea alta con barra V
  ('C', 6, 58,  '2-3 x al fallo (RIR 0) (circuito de abdominales)'),             -- Abdominales en banco declinado
  ('C', 7, 57,  '2-3 x al fallo (RIR 0) (circuito de abdominales)'),             -- Elevación de piernas colgado
  -- ============ DÍA D (viernes) ============
  ('D', 1, 68,  '2-3 x al fallo (RIR 0)'),                                       -- Dominadas lastradas
  ('D', 2, 287, '2-3 x al fallo (RIR 0)'),                                       -- Dominadas cerradas con agarre neutro
  ('D', 3, 39,  '2-3 x al fallo (RIR 0) por lado'),                              -- Remo con mancuerna a un brazo
  ('D', 4, 147, '2-3 x al fallo (RIR 0)'),                                       -- Pull over en polea
  ('D', 5, 174, '2 x al fallo (RIR 0) + 1-2 x drop set (2 bajadas)'),            -- Curl bíceps con barra en polea baja
  ('D', 6, 109, '2-3 x al fallo (RIR 0) por lado'),                              -- Curl martillo parado
  -- ============ DÍA E (sábado) ============
  ('E', 1, 123, '2-3 x al fallo (RIR 0)'),                                       -- Sentadilla con barra
  ('E', 2, 18,  '2-3 x al fallo (RIR 0) por pierna'),                            -- Estocada búlgara en el banco
  ('E', 3, 20,  '2 x al fallo (RIR 0) + 1-2 x drop set (2 bajadas)'),            -- Extensión de cuádriceps
  ('E', 4, 6,   '2-3 x al fallo (RIR 0)'),                                       -- Curl femoral
  ('E', 5, 79,  '2 x al fallo (RIR 0) + 1-2 x drop set (2 bajadas)'),            -- Elevación de talón sentado en máquina
  ('E', 6, 45,  '2-3 x al fallo (RIR 0) (finisher)')                             -- Sentadilla sissy
) as v(dia, orden, ex, sr);

-- ============ ACCESO Y ACTIVACIÓN (solo la cuenta del coach) ============
insert into public.profile_routine_access (user_id, routine_id)
select u.id, r.id
from auth.users u, public.routines r
where lower(u.email) = lower('ezequiel.arce@outlook.com') and r.nombre = 'Kraken Dorian'
on conflict (user_id, routine_id) do nothing;

-- Cierra la rutina activa anterior (si había una abierta) y abre "Kraken
-- Dorian" -- mismo criterio que cambiarRutinaActiva() en la app.
update public.profile_routine_history
set fecha_fin = current_date
where user_id = (select id from auth.users where lower(email) = lower('ezequiel.arce@outlook.com'))
  and fecha_fin is null
  and routine_id is distinct from (select id from public.routines where nombre = 'Kraken Dorian');

insert into public.profile_routine_history (user_id, routine_id, fecha_inicio)
select u.id, r.id, current_date
from auth.users u, public.routines r
where lower(u.email) = lower('ezequiel.arce@outlook.com') and r.nombre = 'Kraken Dorian'
  and not exists (
    select 1 from public.profile_routine_history h
    where h.user_id = u.id and h.routine_id = r.id and h.fecha_fin is null
  );

update public.profiles
set routine_id = (select id from public.routines where nombre = 'Kraken Dorian'),
    updated_at = now()
where id = (select id from auth.users where lower(email) = lower('ezequiel.arce@outlook.com'));

-- Para darle acceso a otra cuenta propia (ej. la de iOS), mismo insert con su
-- email:
--   insert into public.profile_routine_access (user_id, routine_id)
--   select u.id, r.id from auth.users u, public.routines r
--   where lower(u.email) = lower('ar.cs@hotmail.es') and r.nombre = 'Kraken Dorian'
--   on conflict (user_id, routine_id) do nothing;

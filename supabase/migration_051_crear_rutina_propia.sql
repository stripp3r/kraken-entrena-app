-- Migración 051: soporte de base para "Crea tu rutina" (el usuario arma su
-- propio split dentro de Entrenar). 100% aditivo, no toca nada existente.
--
-- Correr en el SQL Editor de Supabase después de la migración 050.

-- RIR objetivo por ejercicio dentro de una rutina -- hoy `series_reps` es
-- texto libre ("4 x 8-12") sin RIR como dato separado. Se necesita como
-- columna propia (no meterlo en el texto) para poder calcular el eje
-- "Intensidad" del pentágono comparativo.
alter table public.routine_exercises
  add column if not exists rir_objetivo numeric;

-- Qué grupos musculares toca cada día de una rutina -- lo marca el usuario
-- con checkboxes al armar su split (NO se infiere de la categoría de los
-- ejercicios: "Torso" mezcla push y pull, no sirve como fuente de verdad
-- para esto). Se usa para calcular Frecuencia y Recuperación.
create table if not exists public.routine_dias (
  id bigint generated always as identity primary key,
  routine_id bigint not null references public.routines (id) on delete cascade,
  dia text not null,
  grupos_musculares text[] not null default '{}',
  unique (routine_id, dia)
);

alter table public.routine_dias enable row level security;

create policy "usuarios logueados leen grupos musculares por dia"
  on public.routine_dias for select
  to authenticated
  using (true);

-- Distingue una rutina armada por el usuario mismo (vía "Crea tu rutina")
-- de una rutina que le armó el coach -- sirve para no mezclarlas en
-- pantallas futuras (ej. un admin que liste rutinas de coach nada más).
alter table public.routines
  add column if not exists creada_por_usuario boolean not null default false;

-- El insert/update de routine_dias y de routines con creada_por_usuario lo
-- hace el server action de "Crea tu rutina" con el cliente admin (service
-- role, en src/lib/supabase/admin.ts) -- a propósito no hay policy de
-- insert/update para "authenticated" en ninguna tabla nueva, mismo patrón
-- que profile_routine_access (migración 021): el usuario nunca escribe
-- directo, siempre a través de una acción de servidor que valida y arma
-- todo (routine + routine_exercises + routine_dias + profile_routine_access
-- + profiles.routine_id) de forma atómica.

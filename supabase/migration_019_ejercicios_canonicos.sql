-- Migración 019: ejercicios canónicos + historial de rutinas.
-- Separa la identidad de cada ejercicio (nombre, GIF, cómo hacerlo, tipo de
-- esfuerzo) de su ubicación dentro de una rutina/día, para que el progreso
-- de un movimiento (ej. "Sentadillas") no se corte si el usuario cambia de
-- rutina, y para que las futuras rutinas de 3/5 días puedan reutilizar los
-- mismos ejercicios en vez de duplicarlos. Ver plan
-- ~/.claude/plans/synthetic-scribbling-badger.md, sección "Arquitectura:
-- ejercicios canónicos + historial de rutinas".
--
-- 100% aditiva: no borra ni pisa ninguna columna existente. La tabla
-- `exercises` se renombra a `routine_exercises` (mismo id, mismas filas,
-- mismas políticas RLS -- Postgres las conserva al renombrar) pero conserva
-- también sus columnas viejas por ahora; se limpian en una migración
-- posterior separada, una vez confirmado que todo funciona bien.
-- Correr en el SQL Editor de Supabase después de las migraciones anteriores.

-- ============ EXERCISE_DEFINITIONS ============
-- Ejercicio canónico, reutilizable entre rutinas.
create table if not exists public.exercise_definitions (
  id bigint generated always as identity primary key,
  nombre text not null,
  categoria text,
  imagen_url text,
  video_url text,
  como_hacerlo text,
  tipo_esfuerzo text not null default 'compuesto'
    check (tipo_esfuerzo in ('compuesto', 'aislado')),
  unilateral boolean not null default false,
  alternativa_id bigint references public.exercise_definitions (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.exercise_definitions enable row level security;

drop policy if exists "usuarios logueados leen ejercicios canonicos" on public.exercise_definitions;
create policy "usuarios logueados leen ejercicios canonicos"
  on public.exercise_definitions for select
  to authenticated
  using (true);

-- backfill: una fila canónica por cada nombre distinto ya cargado (guardado
-- contra correr esto dos veces: si ya hay filas, no vuelve a insertar).
insert into public.exercise_definitions
  (nombre, categoria, imagen_url, video_url, como_hacerlo, tipo_esfuerzo, unilateral)
select distinct on (nombre)
  nombre, categoria, imagen_url, video_url, como_hacerlo, tipo_esfuerzo, unilateral
from public.exercises
where not exists (select 1 from public.exercise_definitions)
order by nombre, id;

-- ============ EXERCISES -> ROUTINE_EXERCISES ============
alter table if exists public.exercises rename to routine_exercises;

alter table public.routine_exercises
  add column if not exists exercise_definition_id bigint references public.exercise_definitions (id) on delete set null;

update public.routine_exercises re
set exercise_definition_id = ed.id
from public.exercise_definitions ed
where re.exercise_definition_id is null
  and ed.nombre = re.nombre;

-- backfill de alternativas canónicas, ahora que cada fila tiene su
-- exercise_definition_id (la alternativa se resuelve por nombre-a-nombre).
update public.exercise_definitions ed
set alternativa_id = ed_alt.id
from public.routine_exercises re
join public.routine_exercises re_alt on re_alt.id = re.alternativa_id
join public.exercise_definitions ed_alt on ed_alt.nombre = re_alt.nombre
where ed.nombre = re.nombre
  and ed.alternativa_id is null;

-- ============ WORKOUT_LOGS ============
-- de acá en más la app graba y lee por exercise_definition_id, no por
-- exercise_id (que queda intacto, sin usarse, para no arriesgar los datos
-- ya cargados repunteando su FK in-place).
alter table public.workout_logs
  add column if not exists exercise_definition_id bigint references public.exercise_definitions (id) on delete set null;

update public.workout_logs wl
set exercise_definition_id = re.exercise_definition_id
from public.routine_exercises re
where wl.exercise_definition_id is null
  and wl.exercise_id = re.id;

-- la app deja de mandar exercise_id en los inserts nuevos.
alter table public.workout_logs
  alter column exercise_id drop not null;

-- ============ PROFILE_ROUTINE_HISTORY ============
-- qué rutina tuvo activa cada usuario y cuándo (fecha_fin null = activa).
create table if not exists public.profile_routine_history (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  routine_id bigint references public.routines (id) on delete set null,
  fecha_inicio date not null default current_date,
  fecha_fin date,
  created_at timestamptz not null default now()
);

alter table public.profile_routine_history enable row level security;

drop policy if exists "usuarios ven su propio historial de rutinas" on public.profile_routine_history;
create policy "usuarios ven su propio historial de rutinas"
  on public.profile_routine_history for select
  using (auth.uid() = user_id);

drop policy if exists "usuarios crean su propio historial de rutinas" on public.profile_routine_history;
create policy "usuarios crean su propio historial de rutinas"
  on public.profile_routine_history for insert
  with check (auth.uid() = user_id);

drop policy if exists "usuarios cierran su propio historial de rutinas" on public.profile_routine_history;
create policy "usuarios cierran su propio historial de rutinas"
  on public.profile_routine_history for update
  using (auth.uid() = user_id);

-- como mucho una fila "activa" (fecha_fin null) por usuario.
create unique index if not exists profile_routine_history_activa_idx
  on public.profile_routine_history (user_id)
  where fecha_fin is null;

-- backfill: una fila activa por cada perfil que ya tiene rutina elegida.
insert into public.profile_routine_history (user_id, routine_id, fecha_inicio)
select p.id, p.routine_id, p.created_at::date
from public.profiles p
where p.routine_id is not null
  and not exists (
    select 1 from public.profile_routine_history h where h.user_id = p.id
  );

-- KRAKEN Entrena — esquema inicial
-- Correr una sola vez en el SQL Editor del proyecto de Supabase.
-- Mapea el modelo de datos del plan (ver ~/.claude/plans/synthetic-scribbling-badger.md)

-- ============ PROFILES ============
-- Datos de USUARIO/PERFIL del Excel. Un perfil por usuario autenticado.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'client' check (role in ('client', 'coach')),
  nombre text,
  apellido text,
  sexo text check (sexo in ('femenino', 'masculino')),
  edad integer,
  objetivo text check (objetivo in ('superavit', 'mantenimiento', 'definicion')),
  actividad_fisica text check (
    actividad_fisica in ('poca_o_nula', 'ligera', 'moderada', 'muy_activo', 'extremo')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "usuarios ven su propio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "usuarios crean su propio perfil"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "usuarios editan su propio perfil"
  on public.profiles for update
  using (auth.uid() = id);

-- crea el perfil automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ TECHNIQUES ============
-- De TECNICAS/TECNICAS2: biblioteca global, lectura pública para logueados.
create table if not exists public.techniques (
  id bigint generated always as identity primary key,
  nombre text not null,
  descripcion text,
  created_at timestamptz not null default now()
);

alter table public.techniques enable row level security;

create policy "usuarios logueados leen tecnicas"
  on public.techniques for select
  to authenticated
  using (true);

-- ============ EXERCISES ============
-- De BASE DE DATOS + Hoja2: ejercicios globales por día de rutina.
create table if not exists public.exercises (
  id bigint generated always as identity primary key,
  nombre text not null,
  dia text not null check (dia in ('A', 'B', 'C', 'D')),
  categoria text,
  orden integer not null default 0,
  imagen_url text,
  video_url text,
  technique_id bigint references public.techniques (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.exercises enable row level security;

create policy "usuarios logueados leen ejercicios"
  on public.exercises for select
  to authenticated
  using (true);

-- ============ WORKOUT_LOGS ============
-- Reemplaza los bloques "SEMANA 1..12" de BASE DE DATOS: una fila por set.
create table if not exists public.workout_logs (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  exercise_id bigint not null references public.exercises (id) on delete cascade,
  fecha date not null default current_date,
  peso numeric,
  reps integer,
  rir numeric,
  tut integer,
  created_at timestamptz not null default now()
);

alter table public.workout_logs enable row level security;

create policy "usuarios ven sus propios registros"
  on public.workout_logs for select
  using (auth.uid() = user_id);

create policy "usuarios crean sus propios registros"
  on public.workout_logs for insert
  with check (auth.uid() = user_id);

create policy "usuarios editan sus propios registros"
  on public.workout_logs for update
  using (auth.uid() = user_id);

create policy "usuarios borran sus propios registros"
  on public.workout_logs for delete
  using (auth.uid() = user_id);

create index if not exists workout_logs_user_exercise_idx
  on public.workout_logs (user_id, exercise_id, fecha);

-- ============ BODY_MEASUREMENTS ============
-- De PERFIL/EVOLUCION.
create table if not exists public.body_measurements (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  fecha date not null default current_date,
  peso numeric,
  altura numeric,
  cuello numeric,
  hombros numeric,
  pecho numeric,
  brazo numeric,
  cintura numeric,
  caderas numeric,
  muslos numeric,
  created_at timestamptz not null default now()
);

alter table public.body_measurements enable row level security;

create policy "usuarios ven sus propias medidas"
  on public.body_measurements for select
  using (auth.uid() = user_id);

create policy "usuarios crean sus propias medidas"
  on public.body_measurements for insert
  with check (auth.uid() = user_id);

create policy "usuarios editan sus propias medidas"
  on public.body_measurements for update
  using (auth.uid() = user_id);

-- ============ PROGRESS_PHOTOS ============
-- Fotos de evolución, archivo va en Supabase Storage (bucket "progress-photos").
create table if not exists public.progress_photos (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  fecha date not null default current_date,
  storage_path text not null,
  created_at timestamptz not null default now()
);

alter table public.progress_photos enable row level security;

create policy "usuarios ven sus propias fotos"
  on public.progress_photos for select
  using (auth.uid() = user_id);

create policy "usuarios suben sus propias fotos"
  on public.progress_photos for insert
  with check (auth.uid() = user_id);

create policy "usuarios borran sus propias fotos"
  on public.progress_photos for delete
  using (auth.uid() = user_id);

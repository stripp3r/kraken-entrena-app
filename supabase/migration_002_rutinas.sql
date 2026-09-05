-- Migración 002: rutinas múltiples + que el cliente elija la suya.
-- Correr en el SQL Editor de Supabase (una consulta nueva), después de schema.sql y seed_dev.sql.

create table if not exists public.routines (
  id bigint generated always as identity primary key,
  nombre text not null,
  descripcion text,
  dias integer not null check (dias between 1 and 7),
  created_at timestamptz not null default now()
);

alter table public.routines enable row level security;

create policy "usuarios logueados leen rutinas"
  on public.routines for select
  to authenticated
  using (true);

-- cada ejercicio pasa a pertenecer a una rutina
alter table public.exercises
  add column if not exists routine_id bigint references public.routines (id) on delete cascade;

-- cada perfil elige su rutina activa
alter table public.profiles
  add column if not exists routine_id bigint references public.routines (id) on delete set null;

-- migra los ejercicios de prueba existentes a una rutina "4 días" por defecto
insert into public.routines (nombre, descripcion, dias)
select 'Entreno 4 días', 'Split de 4 días (Push/Pull/Piernas/Full)', 4
where not exists (select 1 from public.routines where nombre = 'Entreno 4 días');

update public.exercises
set routine_id = (select id from public.routines where nombre = 'Entreno 4 días')
where routine_id is null;

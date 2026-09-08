-- Migración 021: qué rutinas tiene desbloqueadas cada usuario.
-- Primer paso del hub de Entrenar rediseñado (rutina activa + otras rutinas
-- bloqueadas/desbloqueadas con botón "Adquirir"). El desbloqueo automático
-- al pagar (Mercado Pago u otra pasarela) queda como proyecto aparte -- por
-- ahora el desbloqueo lo hace el coach a mano, corriendo un insert acá mismo
-- en el SQL Editor cuando un cliente compra una rutina nueva.
--
-- Correr en el SQL Editor de Supabase después de las migraciones anteriores.

create table if not exists public.profile_routine_access (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  routine_id bigint not null references public.routines (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, routine_id)
);

alter table public.profile_routine_access enable row level security;

drop policy if exists "usuarios ven su propio acceso a rutinas" on public.profile_routine_access;
create policy "usuarios ven su propio acceso a rutinas"
  on public.profile_routine_access for select
  using (auth.uid() = user_id);

-- a propósito no hay policy de insert/update para el rol "authenticated":
-- el desbloqueo lo hace el coach directamente en el SQL Editor (corre como
-- owner de la base, no como un usuario logueado, así que no lo bloquea el RLS).

-- backfill: nadie pierde acceso a lo que ya tiene activo hoy...
insert into public.profile_routine_access (user_id, routine_id)
select distinct p.id, p.routine_id
from public.profiles p
where p.routine_id is not null
on conflict (user_id, routine_id) do nothing;

-- ...ni a lo que ya usó en el pasado (Historial).
insert into public.profile_routine_access (user_id, routine_id)
select distinct h.user_id, h.routine_id
from public.profile_routine_history h
where h.routine_id is not null
on conflict (user_id, routine_id) do nothing;

-- Ejemplo para desbloquear una rutina nueva a un cliente puntual (correr a
-- mano, reemplazando el email y el nombre de la rutina):
--
-- insert into public.profile_routine_access (user_id, routine_id)
-- select u.id, r.id
-- from auth.users u, public.routines r
-- where u.email = 'cliente@ejemplo.com' and r.nombre = 'Nombre de la rutina'
-- on conflict (user_id, routine_id) do nothing;

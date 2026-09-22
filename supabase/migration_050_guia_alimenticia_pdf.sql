-- Migración 050: entrega de la Guía Alimenticia como PDF por cuenta.
--
-- Nueva forma de trabajo para clientes de Mentoría/entrenamiento privado
-- (2026-09-20): el PDF combinado de antes (entrenamiento + alimentación)
-- queda discontinuado para quienes tienen cuenta en la app. Ahora:
--   - El entrenamiento vive en una rutina privada armada a medida
--     (routines.es_privada, ver migración 035 -- "Kraken Split" es el
--     ejemplo ya existente), con acceso otorgado vía profile_routine_access.
--   - El PDF por cliente pasa a contener SOLO la guía alimenticia (mismo
--     estilo/formato que se venía usando: disclaimer, tabla de comidas con
--     macros, pesos en crudo, etc.), sin la parte de entrenamiento.
-- Esta migración agrega el mecanismo para que ese PDF quede disponible
-- adentro de la pantalla Alimentación → Guía Alimenticia (que hasta ahora
-- era un placeholder fijo: "Tu coach te la va a cargar acá").
--
-- Correr en el SQL Editor de Supabase después de la migración 049.

-- Bucket privado para las guías -- igual que `productos`, nadie lo lee
-- directo; se accede solo vía URL firmada generada por el server action
-- (service role). Los PDFs se suben a mano desde el Storage del dashboard.
insert into storage.buckets (id, name, public)
values ('guias-alimenticias', 'guias-alimenticias', false)
on conflict (id) do nothing;

create table if not exists public.guias_alimenticias (
  user_id uuid primary key references auth.users (id) on delete cascade,
  pdf_storage_path text not null,
  actualizada_at timestamptz not null default now()
);

alter table public.guias_alimenticias enable row level security;

-- Solo lectura de la propia fila. A propósito no hay policy de insert/update
-- para "authenticated" -- la carga la hace el coach a mano (Storage +
-- SQL Editor), mismo patrón que profile_routine_access.
drop policy if exists "usuarios leen su propia guia" on public.guias_alimenticias;
create policy "usuarios leen su propia guia"
  on public.guias_alimenticias for select
  to authenticated
  using (auth.uid() = user_id);

-- ============ EJEMPLO: alta completa de un cliente de Mentoría ============
-- 1) Subir el PDF (solo guía alimenticia) a mano al bucket
--    `guias-alimenticias` del Dashboard de Supabase, ej. como
--    "nombre-apellido.pdf" (sin tildes en el nombre de archivo -- ver el
--    bug de Storage documentado en CLAUDE.md).
-- 2) Marcar la cuenta como Mentoría (premium_origen + premium_hasta; sin
--    esto esMentoria() da false y la pantalla ni siquiera muestra la guía):
--
-- update public.profiles
-- set premium_origen = 'mentoria', premium_hasta = '2027-09-20'
-- where id = (select id from auth.users where lower(email) = lower('cliente@ejemplo.com'));
--
-- 3) Linkear el PDF a esa cuenta:
--
-- insert into public.guias_alimenticias (user_id, pdf_storage_path)
-- select id, 'nombre-apellido.pdf' from auth.users where lower(email) = lower('cliente@ejemplo.com')
-- on conflict (user_id) do update
--   set pdf_storage_path = excluded.pdf_storage_path, actualizada_at = now();
--
-- 4) Si el cliente también tiene una rutina privada a medida, otorgar el
--    acceso como en la migración 021 (profile_routine_access por email +
--    nombre de rutina).

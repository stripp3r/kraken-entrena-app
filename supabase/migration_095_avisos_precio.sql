-- Migración 095: aviso de cambio de precio de una suscripción, con pop-up que
-- cada suscriptor tiene que confirmar que leyó/aceptó (tarea legal
-- 2026-10-08, ver "Cumplimiento legal" en CLAUDE.md).
--
-- CÓMO CREA UN AVISO EL COACH (SQL Editor de Supabase). Un INSERT; el pop-up
-- le aparece, al abrir la app, a cada usuario con una suscripción ACTIVA o
-- pausada de ese producto que todavía no lo confirmó. NO cambia ningún precio:
-- el precio real se cambia aparte en Mercado Pago / PayPal.
--
--   insert into public.avisos_precio
--     (titulo, cuerpo, producto_slug, precio_nuevo, moneda, vigente_desde)
--   values (
--     'Cambio de precio de Golden mensual',
--     'A partir del 01/12/2026 tu suscripción Golden mensual pasa a costar ARS 12.000. ...',
--     'golden-mensual',      -- golden-mensual | golden-anual | mentoria-online-basic | mentoria-online-vip
--     12000, 'ARS', '2026-12-01'
--   );
--
-- Para retirar un aviso: delete from public.avisos_precio where id = <id>;
--
-- RLS: avisos_precio es de solo lectura para usuarios logueados (los crea el
-- coach desde el SQL Editor, que no pasa por RLS). Cada usuario lee e inserta
-- solo SUS confirmaciones.
--
-- También agrega suscripciones.producto_slug, para saber de qué producto es
-- cada suscripción (sobre todo Mentoría Online Basic vs VIP); lo completan los
-- webhooks al activarse. Las anteriores quedan en null y se infieren.
--
-- Correr en el SQL Editor de Supabase después de la migración 094.

create table if not exists public.avisos_precio (
  id bigint generated always as identity primary key,
  titulo text not null,
  cuerpo text not null,
  producto_slug text not null,
  precio_nuevo numeric,
  moneda text,
  vigente_desde date,
  creado_at timestamptz not null default now()
);

alter table public.avisos_precio enable row level security;

drop policy if exists "usuarios logueados leen avisos de precio" on public.avisos_precio;
create policy "usuarios logueados leen avisos de precio"
  on public.avisos_precio for select
  to authenticated
  using (true);

create table if not exists public.avisos_precio_confirmaciones (
  user_id uuid not null references auth.users (id) on delete cascade,
  aviso_id bigint not null references public.avisos_precio (id) on delete cascade,
  confirmado_at timestamptz not null default now(),
  primary key (user_id, aviso_id)
);

alter table public.avisos_precio_confirmaciones enable row level security;

drop policy if exists "usuarios ven sus confirmaciones de aviso" on public.avisos_precio_confirmaciones;
create policy "usuarios ven sus confirmaciones de aviso"
  on public.avisos_precio_confirmaciones for select
  using (auth.uid() = user_id);

drop policy if exists "usuarios confirman sus propios avisos" on public.avisos_precio_confirmaciones;
create policy "usuarios confirman sus propios avisos"
  on public.avisos_precio_confirmaciones for insert
  with check (auth.uid() = user_id);

alter table public.suscripciones
  add column if not exists producto_slug text;

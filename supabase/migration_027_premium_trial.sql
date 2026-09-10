-- Migración 027: modelo de acceso free-trial + Golden.
--
-- Regla única: la app entera se chequea contra profiles.premium_hasta.
--   - Al registrarse: premium_hasta = hoy + 30 (prueba gratis de un mes).
--   - Cada pago de Golden lo empuja +1 año (eso lo hará el webhook, fase B/C).
--   - golden_perpetuo = true -> acceso total para siempre (cuenta del coach).
-- Cuando premium_hasta vence y no hay Golden, el middleware manda todo a
-- /golden salvo Perfil. Las compras sueltas (Anti-Flakardo) mantienen su PDF
-- y su rutina por separado (compras / profile_routine_access), no dependen
-- de premium_hasta.
--
-- Correr en el SQL Editor de Supabase después de la migración 026.

-- ============ PROFILES: premium_hasta + golden_perpetuo ============
alter table public.profiles
  add column if not exists premium_hasta date,
  add column if not exists golden_perpetuo boolean not null default false;

-- Backfill: todos los perfiles actuales arrancan con 30 días de prueba
-- desde hoy (mano nueva para los que ya estaban registrados).
update public.profiles
set premium_hasta = current_date + 30
where premium_hasta is null;

-- Cuenta del coach -> Golden perpetuo.
update public.profiles
set golden_perpetuo = true
where id = (select id from auth.users where email = 'ezequiel.arce@outlook.com');

-- ============ handle_new_user: sumar los 30 días de prueba ============
-- Se reescribe entera para conservar lo que ya hacía (crear el profile y
-- reclamar compras pendientes por email).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  compra record;
begin
  insert into public.profiles (id, premium_hasta)
  values (new.id, current_date + 30);

  for compra in
    select c.id as compra_id, c.producto_id
    from public.compras c
    where c.email_comprador = new.email
      and c.user_id is null
      and c.estado = 'aprobado'
  loop
    insert into public.profile_routine_access (user_id, routine_id)
    select new.id, pr.routine_id
    from public.producto_rutinas pr
    where pr.producto_id = compra.producto_id
    on conflict (user_id, routine_id) do nothing;

    update public.compras set user_id = new.id where id = compra.compra_id;
  end loop;

  return new;
end;
$$;

-- ============ SUSCRIPCIONES ============
-- Registro/estado de cada suscripción Golden. La escriben los webhooks
-- (service role); el usuario solo lee la suya.
create table if not exists public.suscripciones (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  proveedor text not null check (proveedor in ('mercadopago', 'paypal')),
  proveedor_sub_id text not null,
  estado text not null default 'activa'
    check (estado in ('activa', 'pausada', 'cancelada', 'vencida')),
  precio numeric,
  moneda text,
  inicio date not null default current_date,
  proximo_cobro date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (proveedor, proveedor_sub_id)
);

alter table public.suscripciones enable row level security;

drop policy if exists "usuarios ven su propia suscripcion" on public.suscripciones;
create policy "usuarios ven su propia suscripcion"
  on public.suscripciones for select
  using (auth.uid() = user_id);

-- ============ PRODUCTO: Golden (precio en las dos monedas) ============
-- Se reutiliza la tabla productos solo para llevar el precio (no desbloquea
-- rutinas). activo = false hasta que se carguen precios reales:
--   update public.productos
--   set precio_ars = <ars>, precio_usd = <usd>, activo = true
--   where slug = 'golden-anual';
insert into public.productos (nombre, slug, activo)
select 'KRAKEN Golden (suscripción anual)', 'golden-anual', false
where not exists (select 1 from public.productos where slug = 'golden-anual');

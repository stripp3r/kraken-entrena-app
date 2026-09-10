-- Migración 028: suscripciones Golden reales (Mercado Pago + PayPal) +
-- origen del acceso premium.
--
-- Correr en el SQL Editor de Supabase después de la migración 027.

-- ============ premium_origen ============
-- Distingue de dónde viene el acceso vigente, para el badge de Perfil y
-- para saber si un vencimiento hay que ofrecer Golden o re-comprar.
alter table public.profiles
  add column if not exists premium_origen text
    check (premium_origen in ('trial', 'compra', 'golden'));

update public.profiles
set premium_origen = 'trial'
where premium_origen is null
  and golden_perpetuo = false
  and premium_hasta is not null;

-- handle_new_user: marcar el origen como 'trial' en el alta.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  compra record;
begin
  insert into public.profiles (id, premium_hasta, premium_origen)
  values (new.id, current_date + 30, 'trial');

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

-- ============ productos.paypal_plan_id ============
-- El plan de facturación de PayPal se crea una sola vez (lazy, en el primer
-- checkout) y su id se guarda acá.
alter table public.productos
  add column if not exists paypal_plan_id text;

-- ============ suscripciones: cancelación + dedupe de cobros ============
alter table public.suscripciones
  add column if not exists cancelada_al date,
  -- id del último cobro ya acreditado (para no sumar el año dos veces si el
  -- webhook se reintenta o llegan dos eventos por el mismo cobro).
  add column if not exists ultimo_cobro_id text;

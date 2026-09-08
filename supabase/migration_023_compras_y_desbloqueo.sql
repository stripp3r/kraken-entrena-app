-- Migración 023: catálogo de productos + registro de compras + desbloqueo
-- automático de rutinas al pagar (Mercado Pago propio + PayHip). Ver plan
-- ~/.claude/plans/synthetic-scribbling-badger.md, sección "Cobros y
-- desbloqueo automático".
--
-- Estas tres tablas nuevas NO tienen policies para "authenticated": las
-- toca únicamente el código server-only de checkout/webhooks (con
-- SUPABASE_SERVICE_ROLE_KEY, que bypassea RLS) y el coach desde el SQL
-- Editor. Un usuario logueado normal no puede leerlas ni escribirlas.
--
-- Correr en el SQL Editor de Supabase después de la migración 021.

-- Bucket privado para los PDFs vendidos -- nadie lo lee directo, solo se
-- accede vía URL firmada generada por el código del webhook (service role).
-- Los archivos se suben a mano desde el Storage del dashboard de Supabase
-- (esa consola corre como owner del proyecto, no le aplica RLS).
insert into storage.buckets (id, name, public)
values ('productos', 'productos', false)
on conflict (id) do nothing;

create table if not exists public.productos (
  id bigint generated always as identity primary key,
  nombre text not null,
  slug text not null unique,
  precio_ars numeric,
  precio_usd numeric,
  -- el "product_id" que PayHip manda en su webhook (item.product_id) --
  -- se completa a mano una vez creado el producto ahí, no hay forma de
  -- adivinarlo de antemano.
  payhip_product_id text unique,
  pdf_storage_path text,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.productos enable row level security;

create table if not exists public.producto_rutinas (
  producto_id bigint not null references public.productos (id) on delete cascade,
  routine_id bigint not null references public.routines (id) on delete cascade,
  primary key (producto_id, routine_id)
);

alter table public.producto_rutinas enable row level security;

create table if not exists public.compras (
  id bigint generated always as identity primary key,
  proveedor text not null check (proveedor in ('mercadopago', 'payhip')),
  proveedor_payment_id text not null,
  producto_id bigint references public.productos (id) on delete set null,
  email_comprador text not null,
  monto numeric,
  moneda text,
  estado text not null default 'aprobado',
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (proveedor, proveedor_payment_id)
);

alter table public.compras enable row level security;

-- ============ PRODUCTO: Anti-Flakardo ============
-- Un solo pago desbloquea las dos rutinas que incluye según la página de
-- ventas: Full Body 3 días + Torso/Pierna 4 días.
-- precio_ars queda en null a propósito -- no se adivina un valor con plata
-- real de por medio. Antes de activar el checkout de Mercado Pago, cargar
-- el precio real en pesos:
--   update public.productos set precio_ars = <valor> where slug = 'anti-flakardo';
insert into public.productos (nombre, slug, precio_usd)
select 'KRAKEN Anti-Flakardo', 'anti-flakardo', 29.99
where not exists (select 1 from public.productos where slug = 'anti-flakardo');

insert into public.producto_rutinas (producto_id, routine_id)
select p.id, r.id
from public.productos p, public.routines r
where p.slug = 'anti-flakardo' and r.nombre = '3 días - Fullbody'
on conflict (producto_id, routine_id) do nothing;

insert into public.producto_rutinas (producto_id, routine_id)
select p.id, r.id
from public.productos p, public.routines r
where p.slug = 'anti-flakardo' and r.nombre = 'Entreno 4 días'
on conflict (producto_id, routine_id) do nothing;

-- ============ BUSCAR USUARIO POR EMAIL ============
-- El API de administración de Supabase no tiene un "buscar por email"
-- directo (solo lista paginada) y la tabla auth.users no está expuesta por
-- REST. Esta función sí puede leerla (security definer) y devuelve
-- únicamente el id -- nada más de auth.users queda expuesto.
create or replace function public.buscar_usuario_por_email(p_email text)
returns uuid
language sql
security definer set search_path = public
as $$
  select id from auth.users where email = p_email limit 1;
$$;

-- ============ RECLAMO AUTOMÁTICO AL REGISTRARSE ============
-- Si alguien paga antes de tener cuenta, la compra queda en `compras` con
-- user_id null. Cuando se registra con el MISMO email, este trigger (que ya
-- existía para crear el profile) también revisa si tiene compras
-- pendientes y le da el acceso ya mismo, sin que nadie tenga que hacer nada.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  compra record;
begin
  insert into public.profiles (id) values (new.id);

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

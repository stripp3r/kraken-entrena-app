-- Migración 093: registro de solicitudes del BOTÓN DE ARREPENTIMIENTO y del
-- BOTÓN DE BAJA DE SERVICIO (Disposición 954/2025) + datos para poder
-- revertir el acceso que dio una compra suelta cuando se revoca.
--
-- 1) solicitudes_baja_arrepentimiento: el registro que la norma exige llevar
--    (fecha, hora, medio, código de identificación) y que el coach/automatización
--    de WhatsApp completa con registrarSolicitud() (src/lib/solicitudes.ts).
--    RLS activado SIN policies: solo la service role (código server-only)
--    la lee/escribe. Un usuario logueado no la ve.
-- 2) compras: columnas para deshacer el premium que dio la compra al revocarla
--    (revocarCompra) -- ver src/lib/compras.ts.
--
-- Correr en el SQL Editor de Supabase después de la migración 092.

-- ============ 1) Solicitudes ============
create table if not exists public.solicitudes_baja_arrepentimiento (
  id bigint generated always as identity primary key,
  -- Legible y único: ARR-2026-000123 / BAJ-2026-000123 (lo arma el trigger).
  codigo text not null unique,
  tipo text not null check (tipo in ('arrepentimiento', 'baja')),
  medio text not null check (medio in ('whatsapp', 'email', 'app')),
  -- Teléfono o email desde donde llegó el pedido.
  contacto text,
  -- Email de la cuenta/compra a la que se refiere (puede diferir del contacto).
  email_cuenta text,
  producto_slug text,
  recibida_at timestamptz not null default now(),
  -- Cuándo se le informó el código a la persona (la norma pide <= 24 h).
  codigo_informado_at timestamptz,
  estado text not null default 'recibida'
    check (estado in ('recibida', 'codigo_enviado', 'procesada', 'rechazada')),
  resuelta_at timestamptz,
  notas text
);

alter table public.solicitudes_baja_arrepentimiento enable row level security;

create or replace function public.asignar_codigo_solicitud()
returns trigger
language plpgsql
as $$
begin
  if new.codigo is null or new.codigo = '' then
    new.codigo :=
      case new.tipo when 'arrepentimiento' then 'ARR' else 'BAJ' end
      || '-'
      || to_char(now() at time zone 'America/Argentina/Buenos_Aires', 'YYYY')
      || '-'
      || lpad(new.id::text, 6, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists asignar_codigo_solicitud on public.solicitudes_baja_arrepentimiento;
create trigger asignar_codigo_solicitud
  before insert on public.solicitudes_baja_arrepentimiento
  for each row execute function public.asignar_codigo_solicitud();

-- ============ 2) compras: poder revertir el acceso ============
alter table public.compras
  -- true si ESTA compra fue la que movió premium_hasta/premium_origen del perfil.
  add column if not exists premium_aplicado boolean not null default false,
  -- Cómo estaba el perfil justo antes de aplicar esta compra.
  add column if not exists premium_previo_hasta date,
  add column if not exists premium_previo_origen text,
  add column if not exists revocada_at timestamptz;

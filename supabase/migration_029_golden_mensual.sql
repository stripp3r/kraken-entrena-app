-- Migración 029: Golden con dos frecuencias (anual y mensual) + precios reales.
--
-- El mensual sale ~33% más caro por mes que el anual (99 * 1.33 / 12) para
-- empujar a la suscripción anual, que es la que de verdad interesa retener.
--
-- Correr en el SQL Editor de Supabase después de la migración 028.

alter table public.suscripciones
  add column if not exists frecuencia text check (frecuencia in ('mensual', 'anual'));

-- Producto nuevo: Golden mensual (mismo patrón que golden-anual, sin
-- desbloquear rutinas -- solo lleva el precio).
insert into public.productos (nombre, slug, activo)
select 'KRAKEN Golden (suscripción mensual)', 'golden-mensual', false
where not exists (select 1 from public.productos where slug = 'golden-mensual');

-- Precios reales (podés reajustar el de ARS más adelante por la inflación,
-- el de USD podés dejarlo fijo).
update public.productos set precio_usd = 99, precio_ars = 150000, activo = true
where slug = 'golden-anual';

update public.productos set precio_usd = 10.99, precio_ars = 16500, activo = true
where slug = 'golden-mensual';

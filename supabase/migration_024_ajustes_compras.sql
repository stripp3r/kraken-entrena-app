-- Migración 024: ajustes chicos sobre la 023.
-- 1) renombra la columna para guardar el "product_key" de PayHip (el código
--    corto del link de venta, payhip.com/b/<esto>) en vez del product_id
--    interno -- es lo que el usuario puede ver a simple vista.
-- 2) carga el precio real en ARS y el product_key de Anti-Flakardo.

alter table public.productos rename column payhip_product_id to payhip_product_key;

update public.productos
set precio_ars = 45000, payhip_product_key = 'RmTit'
where slug = 'anti-flakardo';

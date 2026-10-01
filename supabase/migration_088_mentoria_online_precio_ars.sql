-- Migración 088: precio en ARS de Mentoría Online, para habilitar el
-- checkout de Mercado Pago (migración 087 solo había cargado precio_usd).
--
-- Valores dados por el coach 2026-10-01: Basic $58.500 ARS, VIP $150.000 ARS.
--
-- Correr en el SQL Editor de Supabase.

update public.productos set precio_ars = 58500 where slug = 'mentoria-online-basic';
update public.productos set precio_ars = 150000 where slug = 'mentoria-online-vip';

-- Migración 087: productos de Mentoría Online (débito automático mensual).
--
-- Definido con el coach 2026-09-30/10-01: cobro mensual recurrente vía
-- PayPal (igual mecanismo que Golden, código separado -- ver
-- src/lib/suscripciones.ts), sin puesta en marcha aparte para simplificar.
-- Precios bajados un poco de lo que dice hoy el sitio (Basic US$39/mes ya
-- coincide, VIP se simplifica a US$99/mes en vez de US$149 + US$100) --
-- "no generemos fricciones innecesarias por poco dinero", palabras del
-- coach. Si el sitio web todavía muestra la puesta en marcha, hay que
-- actualizarlo para que coincida con esto.
--
-- Solo USD/PayPal por ahora -- no se carga precio_ars, así que el checkout
-- de Mercado Pago para esto queda sin armar hasta que se pida.
--
-- Correr en el SQL Editor de Supabase.

insert into public.productos (nombre, slug, precio_usd, activo)
select 'KRAKEN Mentoría Online Basic', 'mentoria-online-basic', 39, true
where not exists (select 1 from public.productos where slug = 'mentoria-online-basic');

insert into public.productos (nombre, slug, precio_usd, activo)
select 'KRAKEN Mentoría Online VIP', 'mentoria-online-vip', 99, true
where not exists (select 1 from public.productos where slug = 'mentoria-online-vip');

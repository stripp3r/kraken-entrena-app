-- Migración 025: reemplazo de PayHip por una pasarela propia con PayPal
-- (misma lógica que ya existe para Mercado Pago: checkout propio + webhook
-- propio, ambos llamando a la misma procesarCompraAprobada). A diferencia de
-- PayHip, PayPal no necesita ninguna columna de mapeo de producto -- el
-- checkout propio manda directamente nuestro slug como referencia, así que
-- no hace falta una columna "paypal_product_..." como pasaba con PayHip.

alter table public.compras drop constraint if exists compras_proveedor_check;

alter table public.compras
  add constraint compras_proveedor_check check (proveedor in ('mercadopago', 'payhip', 'paypal'));

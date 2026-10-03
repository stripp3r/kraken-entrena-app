-- Migración 089: Anti-Flakardo Fullbody / Torso Pierna pasan a ser rutinas
-- privadas (es_privada = true).
--
-- Bug real encontrado al revisar con el coach el acceso de Golden
-- (2026-10-02): estas dos rutinas nacieron como "3 días - Fullbody" y
-- "Entreno 4 días" (públicas, es_privada = false) y fueron renombradas y
-- su contenido reemplazado por el plan autoguiado real en las migraciones
-- 061/062 -- pero nadie les puso es_privada = true en ese momento. Mismo
-- caso ya corregido para "Grasa Sub-Cero", "Híbrido", "En Casa" y
-- "Minimalista" en la migración 046, que a estas dos nunca les llegó.
--
-- Efecto del bug: cualquier cuenta con `permisos().catalogoCompleto = true`
-- (Golden mensual/anual) veía estas dos rutinas como parte del catálogo
-- general y podía cambiarse a ellas sin haber comprado el plan autoguiado
-- Anti-Flakardo -- exactamente la misma categoría de bug que el de Vane
-- Capuano (acceso de pago filtrándose a quien no pagó por ese producto
-- puntual), solo que del lado de Golden en vez de mentoría.
--
-- Compra Suelta de Anti-Flakardo sigue funcionando igual después de este
-- cambio: su acceso siempre pasó por `profile_routine_access` explícito
-- (ver procesarCompraAprobada/compras.ts), nunca por catalogoCompleto --
-- ver cuenta de prueba `prueba.compra.kraken@gmail.com`, que ya tiene esas
-- filas cargadas. El RLS de rutinas privadas (migración 035/081) ya sabe
-- respetar es_privada de forma genérica, no hace falta tocar código.
--
-- Correr en el SQL Editor de Supabase.

update public.routines
set es_privada = true
where nombre in ('Anti-Flakardo Fullbody', 'Anti-Flakardo Torso Pierna');

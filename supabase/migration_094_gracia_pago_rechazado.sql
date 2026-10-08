-- Migración 094: 48 horas de gracia cuando falla el cobro de una renovación
-- (Golden o Mentoría Online). Ver "Cumplimiento legal" -> "48 h de gracia" en
-- CLAUDE.md y pausarGolden() en src/lib/suscripciones.ts.
--
-- Mecánica: al rechazarse una renovación se corre profiles.premium_hasta 2
-- días hacia adelante (así TODA la app, que ya lee premium_hasta, respeta la
-- gracia sin tocar cada pantalla) y se guarda acá el vencimiento ORIGINAL.
-- Con ese dato: si el cobro se regulariza, el nuevo período se calcula desde
-- el vencimiento original (no se regalan los 2 días); si la suscripción se
-- cancela, se vuelve al vencimiento original (las canceladas no tienen
-- gracia); si no se regulariza, el acceso se corta solo al vencer.
--
-- Correr en el SQL Editor de Supabase después de la migración 093.

alter table public.suscripciones
  add column if not exists gracia_premium_original date;

-- Migración 044: aceptación obligatoria de disclaimer para Alimentación.
--
-- El usuario pidió que antes de ver la Calculadora o la Guía alimenticia,
-- cada cuenta tenga que leer el disclaimer legal y confirmar "sí, entiendo"
-- una vez -- no alcanza con mostrar el texto en la pantalla, tiene que
-- haber una acción explícita registrada por usuario. Se guarda por
-- separado para cada beneficio porque el texto de cada uno es distinto
-- (la calculadora no habla de alimentación, la guía sí).
--
-- Correr en el SQL Editor de Supabase después de la migración 043.

alter table public.profiles
  add column if not exists disclaimer_calculadora_aceptado_at timestamptz,
  add column if not exists disclaimer_guia_aceptado_at timestamptz;

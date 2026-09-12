-- Migración 031: suma "Gemelos" a las medidas corporales.
alter table public.body_measurements
  add column if not exists gemelos numeric;

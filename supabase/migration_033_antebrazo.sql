-- Migración 033: suma "Antebrazo" a las medidas corporales (seguimiento de
-- progreso, igual que Brazo/Muslos/Gemelos -- no interviene en ningún
-- cálculo de Salud).
alter table public.body_measurements
  add column if not exists antebrazo numeric;

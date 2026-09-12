-- Migración 032: suma "Muñeca" a las medidas corporales. Se usa para
-- calcular la contextura ósea (chica/mediana/grande) y un rango de peso
-- ideal aproximado -- no afecta ninguno de los cálculos de Salud existentes
-- (IMC, % grasa, masa magra, índice de grasa visceral), que ya tienen todo
-- lo que necesitan sin esta columna.
alter table public.body_measurements
  add column if not exists muneca numeric;

-- Migración 096: soporte para registrar DROP SETS.
--
-- Un drop set es una serie al fallo seguida, sin descanso, de una o más
-- "bajadas" (se baja el peso y se sigue al fallo): ej. 30 kg al fallo -> 25 kg
-- al fallo -> 20 kg al fallo, todo como UNA serie.
--
-- Cómo se guarda (ver src/lib/dropset.ts): una fila por cada tramo en
-- workout_logs.
--   tipo_serie = 'normal'  -> serie común (todas las filas que ya existen)
--   tipo_serie = 'dropset' -> la serie PRINCIPAL de un drop set (el tramo
--                             pesado, el primero)
--   tipo_serie = 'drop'    -> una BAJADA; drop_de apunta a la fila principal
-- Borrar la fila principal borra sus bajadas (on delete cascade).
--
-- Las bajadas NO cuentan como series ni entran al cálculo de top set / 1RM
-- estimado / sugerencia de peso (peso más liviano a propósito y fatigado);
-- sí se ven en el registro del día y en el historial.
--
-- Aditiva y retrocompatible: las filas existentes quedan como 'normal' y el
-- código viejo sigue funcionando igual. Correr ANTES de desplegar el código
-- que lee estas columnas.
--
-- Correr en el SQL Editor de Supabase después de la migración 095.

alter table public.workout_logs
  add column if not exists tipo_serie text not null default 'normal'
    check (tipo_serie in ('normal', 'dropset', 'drop')),
  add column if not exists drop_de bigint
    references public.workout_logs (id) on delete cascade;

create index if not exists workout_logs_drop_de_idx
  on public.workout_logs (drop_de)
  where drop_de is not null;

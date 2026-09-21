-- Migración 052: grupo(s) muscular(es) real(es) de cada ejercicio del
-- catálogo. Reemplaza `categoria` (Legs/Pull/Push/Torso) como filtro del
-- buscador de "Crea tu rutina" -- el usuario marcó esa categoría como
-- conceptualmente rota ("Torso" mezcla ejercicios de empuje y de
-- tracción, "es como que una cosa incluye la otra"). `categoria` NO se
-- borra (la sigue usando el scheduling viejo de rutinas), esto es aditivo.
--
-- Usa la misma lista fija que `routine_dias.grupos_musculares`
-- (src/lib/grupos-musculares.ts): Pecho, Espalda, Hombros, Bíceps,
-- Tríceps, Cuádriceps, Isquiotibiales, Glúteos, Pantorrillas, Abdominales.
-- Un ejercicio puede tener más de uno (ej. "Fondos en paralelas" ->
-- Pecho + Tríceps).
--
-- Correr en el SQL Editor de Supabase después de la migración 051.
--
-- PENDIENTE: esta columna arranca vacía para los 126 ejercicios
-- existentes -- catalogarlos uno por uno queda para la sesión que
-- mantiene el catálogo de ejercicios (contenido, no código).

alter table public.exercise_definitions
  add column if not exists grupos_musculares text[] not null default '{}';

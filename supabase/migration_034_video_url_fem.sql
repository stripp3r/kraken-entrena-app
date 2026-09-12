-- Migración 034: variante de video explicativo para usuarias mujeres.
-- Mismo ejercicio, misma explicación, pero interpretado por una mujer —
-- se muestra en vez de video_url cuando profiles.sexo = 'femenino'.
alter table public.exercise_definitions
  add column if not exists video_url_fem text;

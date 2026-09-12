-- Migración 030: fecha de nacimiento en vez de edad fija.
-- Guardar un número de "edad" queda desactualizado con el tiempo (a los 12
-- meses la persona ya no tiene esa edad). La columna vieja `edad` se deja
-- intacta como respaldo para quien todavía no volvió a guardar sus datos
-- personales -- la UI la usa como fallback si fecha_nacimiento es null.
alter table public.profiles
  add column if not exists fecha_nacimiento date;

-- Migración 007: distingue foto frontal de lateral en la evolución,
-- y permite reemplazar la foto de una fecha+tipo en vez de duplicarla.
alter table public.progress_photos
  add column if not exists tipo text check (tipo in ('frontal', 'lateral'));

alter table public.progress_photos
  add constraint progress_photos_user_fecha_tipo_key unique (user_id, fecha, tipo);

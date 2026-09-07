-- Migración 012: suma la foto trasera a las opciones de tipo en Evolución.
alter table public.progress_photos
  drop constraint if exists progress_photos_tipo_check;

alter table public.progress_photos
  add constraint progress_photos_tipo_check check (tipo in ('frontal', 'lateral', 'trasera'));

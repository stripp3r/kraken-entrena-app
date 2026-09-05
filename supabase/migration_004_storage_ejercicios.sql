-- Migración 004: bucket de Storage para los GIFs/imágenes de ejercicios.
-- Público de lectura (son imágenes de catálogo, no datos privados de usuarios),
-- solo usuarios logueados pueden subir (para cuando migremos los 358 reales).

insert into storage.buckets (id, name, public)
values ('ejercicios', 'ejercicios', true)
on conflict (id) do nothing;

create policy "lectura publica de ejercicios"
on storage.objects for select
to public
using (bucket_id = 'ejercicios');

create policy "usuarios logueados suben ejercicios"
on storage.objects for insert
to authenticated
with check (bucket_id = 'ejercicios');

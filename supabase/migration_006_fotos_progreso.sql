-- Migración 006: bucket privado para las fotos de evolución (frontal/lateral).
-- A diferencia de "ejercicios" (público), estas son fotos personales del
-- usuario: cada quien solo puede ver/subir/borrar dentro de su propia carpeta
-- (nombrada con su propio user_id).

insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', false)
on conflict (id) do nothing;

create policy "usuarios ven sus propias fotos de progreso"
on storage.objects for select
to authenticated
using (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "usuarios suben sus propias fotos de progreso"
on storage.objects for insert
to authenticated
with check (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "usuarios borran sus propias fotos de progreso"
on storage.objects for delete
to authenticated
using (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);

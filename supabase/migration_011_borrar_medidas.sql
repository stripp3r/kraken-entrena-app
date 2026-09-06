-- Migración 011: faltaba el permiso para borrar mediciones propias
-- (por eso el botón "Borrar" del historial de Medidas no funcionaba).
create policy "usuarios borran sus propias medidas"
on public.body_measurements for delete
using (auth.uid() = user_id);

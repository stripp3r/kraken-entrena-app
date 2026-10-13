-- Migración 101: el coach puede LEER los formularios de ingreso de las
-- mentorías (tabla creada en la migración 100). Cada cliente sigue viendo y
-- editando solo el suyo. Usa es_coach() (migración 080), que evita la
-- recursión de RLS sobre profiles.

drop policy if exists "coach lee formularios de ingreso" on public.formularios_ingreso;
create policy "coach lee formularios de ingreso"
  on public.formularios_ingreso for select
  using (public.es_coach());

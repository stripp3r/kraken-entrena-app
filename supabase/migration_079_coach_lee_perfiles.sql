-- Migración 079: RLS para la vista de coach (solo lectura).
--
-- Hoy `profiles` solo permite `select` de la propia fila
-- (`using (auth.uid() = id)`), así que un coach no puede listar a sus
-- clientes ni leer su `routine_id`/`sexo` con el cliente normal
-- (sesión). Se agrega una policy PERMISSIVE adicional: Postgres evalúa
-- todas las policies permissive de un mismo comando con OR, así que
-- esto no cambia nada para un cliente normal (sigue viendo solo su
-- propia fila) pero además deja pasar cualquier fila cuando quien
-- pregunta (auth.uid()) tiene role='coach' en su propio perfil.
--
-- La columna `role` existe desde el schema original (schema.sql) pero
-- no se usaba en ningún lado del código hasta esta migración -- es la
-- primera vez que se lee.

create policy "coach lee todos los perfiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid() and p2.role = 'coach'
    )
  );

-- Migración 102: dos agujeros de permisos detectados en el diagnóstico del
-- 2026-10-15.
--
-- 1) routine_exercises tenía DOS policies de lectura para usuarios logueados:
--    "usuarios logueados leen ejercicios" (using true) y la estricta
--    "usuarios logueados leen ejercicios de rutina" (respeta es_privada, el
--    acceso comprado y el coach). Las policies de un mismo comando se SUMAN
--    (OR), así que la abierta anulaba a la estricta: cualquier cuenta, aun
--    gratuita, podía leer por la API los ejercicios, series y repeticiones de
--    los planes autoguiados y de las rutinas privadas de mentoría.
--    Se borra la abierta. Antes de aplicarla se simuló con las 23 cuentas
--    reales dentro de una transacción que se deshizo: hoy las 23 veían las 502
--    filas; sin la abierta cada cuenta ve exactamente las filas de las rutinas
--    que ya le corresponden (las mismas que deja ver `routines`), sin perder
--    nada legítimo.
--
-- 2) Storage: "usuarios logueados suben ejercicios" dejaba a CUALQUIER cuenta
--    subir archivos al bucket público `ejercicios` (alojar contenido ajeno en
--    el dominio de la app o gastar el cupo). Ningún código sube ahí con la
--    sesión de un usuario (los scripts usan la service role, que no pasa por
--    RLS). Se restringe al coach (es_coach(), migración 080).
--
-- No destructiva: solo cambia policies. Reversible: ver el contenido de las
-- migraciones que crearon cada policy original.

drop policy if exists "usuarios logueados leen ejercicios" on public.routine_exercises;

drop policy if exists "usuarios logueados suben ejercicios" on storage.objects;
create policy "el coach sube ejercicios"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'ejercicios' and public.es_coach());

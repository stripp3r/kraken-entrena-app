-- Migración 109: seguridad de funciones (diagnóstico del 2026-10-22).
--
-- 1) public.buscar_usuario_por_email(text) era ejecutable por el rol anónimo (y por cualquier usuario logueado) a
--    través de la API pública: con la clave pública de la app se podía averiguar si un correo está registrado y
--    obtener su id (enumeración de usuarios). Solo la usa el servidor con la clave de administrador
--    (src/lib/compras.ts, src/lib/solicitudes.ts, scripts/alta-cliente.js), así que se le quita el permiso a
--    PUBLIC / anon / authenticated. service_role conserva su permiso explícito.
-- 2) public.handle_new_user() es una función de trigger: no tiene por qué poder llamarse por la API.
-- 3) Tres funciones sin search_path fijo (riesgo de que un esquema ajeno intercepte nombres): se fija a public.
-- es_coach() se deja ejecutable: la usan las políticas de seguridad (RLS).

revoke execute on function public.buscar_usuario_por_email(text) from public, anon, authenticated;
grant execute on function public.buscar_usuario_por_email(text) to service_role;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

alter function public.asignar_codigo_solicitud() set search_path = public;
alter function public.normalizar_email_comprador() set search_path = public;
alter function public.completar_plazos_compra() set search_path = public;

-- Las tres son funciones de trigger: tampoco deben poder llamarse por la API pública.
revoke execute on function public.asignar_codigo_solicitud() from public, anon, authenticated;
revoke execute on function public.normalizar_email_comprador() from public, anon, authenticated;
revoke execute on function public.completar_plazos_compra() from public, anon, authenticated;

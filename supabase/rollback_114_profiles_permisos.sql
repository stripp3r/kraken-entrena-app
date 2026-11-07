-- ROLLBACK de la migración 114 (NO se corre sola): vuelve a los permisos que tenía public.profiles antes
-- (authenticated y anon con permisos completos de tabla; lo que se puede hacer lo limita solo RLS).
-- OJO: esto REABRE el problema de seguridad (cualquier usuario puede editar su role y su plan por la API). Usarlo solo
-- si la 114 rompió algo en la app y mientras se corrige, y volver a aplicar la 114 enseguida.

revoke update on table public.profiles from authenticated, anon;
grant insert, update, delete, truncate, references, trigger on table public.profiles to authenticated, anon;

-- Migración 114: los usuarios ya NO pueden editar por la API de Supabase los campos de acceso, plan y privilegios de su perfil.
--
-- PROBLEMA (hallazgo de seguridad): la política RLS "usuarios editan su propio perfil" (schema.sql, mantenida en la 111)
-- solo decide QUÉ FILA se puede editar (auth.uid() = id), no qué COLUMNAS. Y `authenticated` tenía UPDATE sobre las 20
-- columnas. Con su propia sesión y la clave pública, cualquier usuario podía hacer, por ejemplo,
--   PATCH /rest/v1/profiles?id=eq.<su id>   {"role": "coach"}   o   {"premium_hasta": "2099-12-31"}
-- y `role = 'coach'` habilita es_coach() (leer todos los perfiles, rutinas privadas, etc.).
--
-- SOLUCIÓN ELEGIDA: permisos por columna (lista blanca) en vez de un trigger que rechace cambios.
--   * Lo decide Postgres antes de mirar RLS, no se puede esquivar desde la API REST ni desde una Server Action mal escrita.
--   * Es una lista BLANCA: una columna nueva que se agregue a `profiles` nace protegida y hay que habilitarla a propósito
--     (con un trigger tipo lista negra, una columna sensible nueva quedaría editable por olvido).
--   * No toca a service_role (webhooks, pagos, scripts), a postgres (SQL Editor del coach) ni a las funciones SECURITY
--     DEFINER (handle_new_user crea el perfil al registrarse, es_coach), que no dependen de los permisos de `authenticated`.
--
-- COLUMNAS QUE EL USUARIO SÍ PUEDE EDITAR (todas las escrituras de la app con su sesión, revisadas en src/):
--   nombre, apellido, sexo, edad, objetivo, actividad_fisica, fecha_nacimiento   -> perfil/datos/actions.ts
--   routine_id, updated_at                                                        -> entrenamiento/actions.ts (cambiar rutina)
--   disclaimer_calculadora_aceptado_at, disclaimer_guia_aceptado_at               -> alimentacion/actions.ts
--   tiene_rutinas_nuevas, tiene_pdfs_nuevos                                       -> distintivos que el usuario apaga
--
-- COLUMNAS PROTEGIDAS (solo service_role / postgres): id, created_at, role, premium_hasta, golden_perpetuo, premium_origen,
-- modalidad_mentoria (y cualquier columna futura que no se habilite).
--
-- Además se quitan permisos de más: INSERT (los perfiles los crea el trigger handle_new_user; con la política de INSERT
-- propia un usuario sin fila de perfil podía crearse uno con role='coach'), DELETE, TRUNCATE (TRUNCATE no pasa por RLS),
-- REFERENCES y TRIGGER, tanto a `authenticated` como a `anon`. SELECT no se toca.
--
-- NOTA sobre routine_id: sigue editable porque así lo usa la app. No concede acceso a contenido privado (las políticas de
-- routines/routine_exercises miran es_privada y profile_routine_access, no profiles.routine_id); lo único que un usuario
-- podría hacer es activarse una rutina PÚBLICA que su plan no incluya (límite de plan que hoy solo valida la Server Action).
--
-- Si más adelante una columna nueva de profiles tiene que ser editable por el usuario:
--   grant update (<columna>) on public.profiles to authenticated;
--
-- Verificación: supabase/verificacion_114_profiles_permisos.sql (se corre a mano, todo dentro de una transacción que se revierte).
-- Deshacer: supabase/rollback_114_profiles_permisos.sql (NO se corre sola).

revoke insert, update, delete, truncate, references, trigger on table public.profiles from anon, authenticated;

grant update (
  nombre, apellido, sexo, edad, objetivo, actividad_fisica, fecha_nacimiento,
  routine_id, updated_at,
  disclaimer_calculadora_aceptado_at, disclaimer_guia_aceptado_at,
  tiene_rutinas_nuevas, tiene_pdfs_nuevos
) on public.profiles to authenticated;

-- Comprobación dentro de la misma migración: si algo quedó distinto de lo esperado, se revierte todo.
do $$
declare
  protegida text;
  editable text;
begin
  foreach protegida in array array['id', 'created_at', 'role', 'premium_hasta', 'golden_perpetuo', 'premium_origen', 'modalidad_mentoria'] loop
    if has_column_privilege('authenticated', 'public.profiles', protegida, 'UPDATE')
       or has_column_privilege('anon', 'public.profiles', protegida, 'UPDATE') then
      raise exception 'La columna % sigue siendo editable por authenticated/anon', protegida;
    end if;
  end loop;

  foreach editable in array array['nombre', 'apellido', 'sexo', 'edad', 'objetivo', 'actividad_fisica', 'fecha_nacimiento',
                                  'routine_id', 'updated_at', 'disclaimer_calculadora_aceptado_at', 'disclaimer_guia_aceptado_at',
                                  'tiene_rutinas_nuevas', 'tiene_pdfs_nuevos'] loop
    if not has_column_privilege('authenticated', 'public.profiles', editable, 'UPDATE') then
      raise exception 'La columna % tendría que seguir siendo editable por el usuario', editable;
    end if;
  end loop;

  if has_table_privilege('authenticated', 'public.profiles', 'INSERT')
     or has_table_privilege('anon', 'public.profiles', 'INSERT')
     or has_table_privilege('authenticated', 'public.profiles', 'DELETE')
     or has_table_privilege('authenticated', 'public.profiles', 'TRUNCATE') then
    raise exception 'authenticated/anon conservan permisos de escritura de tabla sobre profiles';
  end if;

  if not (has_table_privilege('service_role', 'public.profiles', 'UPDATE') and has_table_privilege('service_role', 'public.profiles', 'INSERT')) then
    raise exception 'service_role perdió permisos sobre profiles';
  end if;

  -- Si aparece una columna nueva sin clasificar, que alguien la clasifique a propósito.
  if exists (
    select 1 from information_schema.columns c
    where c.table_schema = 'public' and c.table_name = 'profiles'
      and c.column_name <> all (array['id', 'created_at', 'role', 'premium_hasta', 'golden_perpetuo', 'premium_origen', 'modalidad_mentoria',
                                      'nombre', 'apellido', 'sexo', 'edad', 'objetivo', 'actividad_fisica', 'fecha_nacimiento',
                                      'routine_id', 'updated_at', 'disclaimer_calculadora_aceptado_at', 'disclaimer_guia_aceptado_at',
                                      'tiene_rutinas_nuevas', 'tiene_pdfs_nuevos'])
  ) then
    raise exception 'profiles tiene una columna que esta migración no clasificó: revisar si es editable por el usuario';
  end if;
end
$$;

-- Verificación de la migración 114 (se corre A MANO en el SQL Editor de Supabase DESPUÉS de aplicarla).
-- Todo ocurre dentro de una transacción que termina en ROLLBACK: no deja ningún cambio. Usa el primer usuario de auth.users.
-- Resultado esperado: una fila por prueba con ok = true. Si alguna sale false, no dar por buena la migración.

begin;

create temp table resultado_114 (prueba text, ok boolean, detalle text) on commit drop;
grant all on resultado_114 to authenticated, service_role;

do $$
declare
  uid uuid;
  filas int;
begin
  select id into uid from auth.users order by created_at limit 1;
  if uid is null then raise exception 'No hay usuarios para probar'; end if;
  if not exists (select 1 from public.profiles where id = uid) then raise exception 'El usuario % no tiene perfil', uid; end if;

  -- Sesión de un usuario normal (rol authenticated + su JWT), como llega por la API REST.
  perform set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', uid::text, true);
  set local role authenticated;

  -- 1) Datos personales: tiene que andar.
  update public.profiles set nombre = nombre, apellido = apellido, sexo = sexo, edad = edad, objetivo = objetivo,
         actividad_fisica = actividad_fisica, fecha_nacimiento = fecha_nacimiento, updated_at = now() where id = uid;
  get diagnostics filas = row_count;
  insert into resultado_114 values ('usuario edita sus datos personales', filas = 1, 'filas=' || filas);

  update public.profiles set routine_id = routine_id where id = uid;
  get diagnostics filas = row_count;
  insert into resultado_114 values ('usuario cambia routine_id', filas = 1, 'filas=' || filas);

  update public.profiles set tiene_rutinas_nuevas = tiene_rutinas_nuevas, tiene_pdfs_nuevos = tiene_pdfs_nuevos,
         disclaimer_calculadora_aceptado_at = disclaimer_calculadora_aceptado_at,
         disclaimer_guia_aceptado_at = disclaimer_guia_aceptado_at where id = uid;
  get diagnostics filas = row_count;
  insert into resultado_114 values ('usuario apaga distintivos y acepta disclaimers', filas = 1, 'filas=' || filas);

  -- 2) Campos sensibles: tienen que fallar con "permission denied" (42501), uno por uno.
  declare col text; begin
    foreach col in array array['role', 'premium_hasta', 'golden_perpetuo', 'premium_origen', 'modalidad_mentoria', 'id', 'created_at'] loop
      begin
        execute format('update public.profiles set %I = %I where id = $1', col, col) using uid;
        insert into resultado_114 values ('usuario NO puede editar ' || col, false, 'el UPDATE se permitió');
      exception when insufficient_privilege then
        insert into resultado_114 values ('usuario NO puede editar ' || col, true, 'permission denied');
      end;
    end loop;
  end;

  begin
    insert into public.profiles (id, role) values (gen_random_uuid(), 'coach');
    insert into resultado_114 values ('usuario NO puede insertar perfiles', false, 'el INSERT se permitió');
  exception when insufficient_privilege then
    insert into resultado_114 values ('usuario NO puede insertar perfiles', true, 'permission denied');
  end;

  -- 3) service_role (webhooks, pagos, scripts): tiene que poder cambiar el plan.
  reset role;
  set local role service_role;
  update public.profiles set premium_hasta = premium_hasta, premium_origen = premium_origen,
         golden_perpetuo = golden_perpetuo, modalidad_mentoria = modalidad_mentoria where id = uid;
  get diagnostics filas = row_count;
  insert into resultado_114 values ('service_role cambia campos de plan', filas = 1, 'filas=' || filas);
  reset role;
end
$$;

select * from resultado_114 order by prueba;

rollback;

-- Migración 099: emails de compradores SIEMPRE normalizados (lower + trim).
--
-- Bug (diagnóstico del sitio, 2026-10-12): handle_new_user() y
-- buscar_usuario_por_email() comparaban el email con `=` a secas. Si alguien
-- paga con "Juan@Gmail.com" y se registra con "juan@gmail.com", la compra no se
-- le enlazaba y quedaba sin acceso.
--
-- Qué hace:
-- 1) buscar_usuario_por_email compara lower(trim()) de los dos lados.
-- 2) Un trigger BEFORE INSERT/UPDATE en compras guarda email_comprador ya
--    normalizado (así ningún camino de código futuro puede romperlo).
-- 3) Normaliza los registros existentes (hoy hay 0 con mayúsculas/espacios).
-- 4) handle_new_user compara lower(trim()) de los dos lados. El resto de la
--    función es idéntico a la migración 045.
--
-- Backfill de compras sin reclamar cuyo email coincida ignorando mayúsculas con
-- un usuario existente: verificado el 2026-10-13, hay 0 casos (la única compra
-- aprobada sin usuario, id 2, no coincide con ninguna cuenta). No hace falta
-- reclamar nada retroactivamente.
--
-- Aditiva y retrocompatible.

-- 1) Búsqueda de usuario por email, sin distinguir mayúsculas ni espacios.
create or replace function public.buscar_usuario_por_email(p_email text)
returns uuid
language sql
security definer set search_path = public
as $$
  select id from auth.users where lower(trim(email)) = lower(trim(p_email)) limit 1;
$$;

-- 2) Normalización automática en compras.
create or replace function public.normalizar_email_comprador()
returns trigger
language plpgsql
as $$
begin
  if new.email_comprador is not null then
    new.email_comprador := lower(trim(new.email_comprador));
  end if;
  return new;
end;
$$;

drop trigger if exists normalizar_email_comprador on public.compras;
create trigger normalizar_email_comprador
  before insert or update of email_comprador on public.compras
  for each row execute function public.normalizar_email_comprador();

-- 3) Registros existentes.
update public.compras
set email_comprador = lower(trim(email_comprador))
where email_comprador is not null
  and email_comprador <> lower(trim(email_comprador));

-- 4) handle_new_user: igual a la migración 045 salvo la comparación de email.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  compra record;
  vencimiento date := current_date + 14;
  hubo_compra boolean := false;
begin
  insert into public.profiles (id, premium_hasta, premium_origen)
  values (new.id, vencimiento, 'trial');

  for compra in
    select c.id as compra_id, c.producto_id
    from public.compras c
    where lower(trim(c.email_comprador)) = lower(trim(new.email))
      and c.user_id is null
      and c.estado = 'aprobado'
  loop
    insert into public.profile_routine_access (user_id, routine_id)
    select new.id, pr.routine_id
    from public.producto_rutinas pr
    where pr.producto_id = compra.producto_id
    on conflict (user_id, routine_id) do nothing;

    update public.compras set user_id = new.id where id = compra.compra_id;

    -- Mismos 3 meses que procesarCompraAprobada() (src/lib/compras.ts).
    vencimiento := (greatest(vencimiento, current_date) + interval '3 months')::date;
    hubo_compra := true;
  end loop;

  if hubo_compra then
    update public.profiles
    set premium_hasta = vencimiento,
        premium_origen = 'compra'
    where id = new.id;
  end if;

  return new;
end;
$$;

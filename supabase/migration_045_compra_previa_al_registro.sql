-- Migración 045: cuando alguien compra un plan ANTES de registrarse y
-- después crea su cuenta con el mismo email, handle_new_user() ya le
-- reclamaba las rutinas compradas (profile_routine_access) pero seguía
-- dejándolo con el trial de 14 días -- no con los 3 meses de acceso que
-- procesarCompraAprobada() le da a un comprador que YA tenía cuenta al
-- pagar. Se corrige para que ambos caminos (compra antes o después del
-- registro) terminen dando el mismo acceso.
--
-- No edita ninguna migración existente -- reemplaza handle_new_user() por
-- completo, como ya se hizo en la migración 041.
--
-- Correr en el SQL Editor de Supabase después de la migración 044.

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
    where c.email_comprador = new.email
      and c.user_id is null
      and c.estado = 'aprobado'
  loop
    insert into public.profile_routine_access (user_id, routine_id)
    select new.id, pr.routine_id
    from public.producto_rutinas pr
    where pr.producto_id = compra.producto_id
    on conflict (user_id, routine_id) do nothing;

    update public.compras set user_id = new.id where id = compra.compra_id;

    -- Mismos 3 meses que procesarCompraAprobada() (src/lib/compras.ts) le
    -- suma a un comprador que ya tenía cuenta -- acá se replica porque la
    -- compra llegó antes del registro, así que quien la reclama es este
    -- trigger en vez del webhook.
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

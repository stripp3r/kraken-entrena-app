-- Migración 041: acorta el free trial de 30 a 14 días antes de lanzar la
-- campaña de ventas. Decisión del usuario: 7 días es muy poco para que se
-- vea progresión comparando entrenamientos; 14 alcanza para eso sin regalar
-- tanto tiempo gratis.
--
-- Solo cambia el alta de cuentas NUEVAS (handle_new_user) -- no toca
-- premium_hasta de nadie que ya se haya registrado.
--
-- Correr en el SQL Editor después de la migración 040.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  compra record;
begin
  insert into public.profiles (id, premium_hasta, premium_origen)
  values (new.id, current_date + 14, 'trial');

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
  end loop;

  return new;
end;
$$;

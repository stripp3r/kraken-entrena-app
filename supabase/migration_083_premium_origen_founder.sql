-- Migración 083: agrega 'founder' como valor válido de premium_origen.
--
-- BUG REAL encontrado por una clienta de mentoría (Vane Capuano,
-- 2026-09-28): con `esPremium`/`esGoldenTier`, cualquier cuenta de
-- mentoría (golden_perpetuo=true, premium_origen='mentoria') veía TODO
-- el catálogo de rutinas públicas como desbloqueado y podía cambiarse a
-- cualquiera -- incluido "Anti-Flakardo Fullbody" sin haberlo comprado.
-- El server action `cambiarRutinaActiva` lo permitía de verdad, no era
-- solo un bug visual. Se agregó `tieneCatalogoCompleto()` en
-- lib/premium.ts, más estricto: solo Founder o Golden real (pago o
-- trial) navega el catálogo libre; mentoría y compras sueltas solo ven
-- SU/S rutina/s vía `profile_routine_access`.
--
-- El problema al armar ese fix: las 2 cuentas del dueño del negocio
-- (Golden Founder) no tenían ninguna marca distintiva -- una tenía
-- premium_origen='trial', la otra 'mentoria' (la misma cuenta que
-- también es role='coach') -- no había forma de darles acceso total sin
-- also dárselo a cualquier mentoreado. `founder` identifica
-- explícitamente a esas 2 cuentas.
--
-- Correr en el SQL Editor de Supabase después de la migración 082.

do $$
declare
  con_name text;
begin
  select conname into con_name
  from pg_constraint
  where conrelid = 'public.profiles'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) ilike '%premium_origen%';
  if con_name is not null then
    execute format('alter table public.profiles drop constraint %I', con_name);
  end if;
end $$;

alter table public.profiles
  add constraint profiles_premium_origen_check
    check (premium_origen in ('trial', 'compra', 'golden', 'mentoria', 'founder'));

-- Marca las 2 cuentas Founder por email (ar.cs y ezequiel.arce).
update public.profiles
set premium_origen = 'founder'
where id in (
  select id from auth.users where email in ('ar.cs@hotmail.es', 'ezequiel.arce@outlook.com')
);

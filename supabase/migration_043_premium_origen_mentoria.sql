-- Migración 043: agrega 'mentoria' como valor válido de premium_origen.
--
-- Hasta ahora la Mentoría otorgaba acceso marcando premium_origen = 'golden'
-- a mano, igual que un Golden otorgado sin mentoría -- indistinguibles en la
-- base. Eso rompe la Guía alimenticia, que el usuario confirmó que es
-- exclusiva de Mentoría (no de Golden en general): hace falta poder
-- diferenciar a un mentoreado de un Golden suelto. `esGoldenTier()` en
-- src/lib/premium.ts sigue tratando a ambos como "nivel Golden" (rutinas,
-- calculadora); `esMentoria()` es la nueva verificación estricta.
--
-- Correr en el SQL Editor de Supabase después de la migración 042.

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
    check (premium_origen in ('trial', 'compra', 'golden', 'mentoria'));

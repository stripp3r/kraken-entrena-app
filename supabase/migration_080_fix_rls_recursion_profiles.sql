-- Migración 080: URGENTE -- revierte y corrige el bug de la migración
-- 079.
--
-- La policy de la migración 079 hacía un subquery a `public.profiles`
-- DENTRO de una policy de `public.profiles`. Postgres evalúa RLS de
-- forma recursiva: para resolver la policy necesita volver a consultar
-- la misma tabla protegida por la misma policy -- esto dispara
-- "infinite recursion detected in policy for relation profiles" (o,
-- según el caso, hace que la fila deje de resolverse). El resultado:
-- CUALQUIER select simple a `profiles` (incluido el chequeo de
-- Golden/premium que corre en el middleware en cada request) empezó a
-- fallar para TODOS los usuarios, no solo para el coach -- por eso el
-- founder vio la pantalla de "Kraken Golden" pese a tener
-- golden_perpetuo=true.
--
-- Paso 1: sacar la policy rota.
drop policy if exists "coach lee todos los perfiles" on public.profiles;

-- Paso 2: función SECURITY DEFINER. Corre con los privilegios de quien
-- la creó (no del usuario que hace el select), así que su propia
-- consulta a `profiles` NO vuelve a pasar por RLS -- rompe el ciclo de
-- recursión. Es el patrón estándar recomendado por Supabase para
-- "¿este usuario tiene tal rol?" dentro de una policy de la misma
-- tabla.
create or replace function public.es_coach()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'coach'
  );
$$;

-- Paso 3: la policy nueva, ahora usando la función en vez de un
-- subquery directo a la tabla.
create policy "coach lee todos los perfiles"
  on public.profiles for select
  using (public.es_coach());

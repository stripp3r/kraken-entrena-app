-- Migración 086: distingue Mentoría Privada de Mentoría Online.
--
-- Definido con el coach 2026-09-30: dan el MISMO acceso en la app (no
-- toca permisos() en premium.ts), pero la etiqueta de "Tu plan" tiene que
-- decir cuál es -- "privada" es gente que entrena cara a cara en el
-- gimnasio del coach, "online" se autoadministra la rutina a distancia.
-- Esto además es la base necesaria para cuando se defina el mecanismo de
-- vencimiento/cobro de la mentoría online (pendiente, no resuelto todavía
-- -- ver CLAUDE.md, "Mentoría 1:1").
--
-- Correr en el SQL Editor de Supabase.

alter table public.profiles
  add column if not exists modalidad_mentoria text
    check (modalidad_mentoria in ('online', 'presencial'));

-- Backfill de los clientes de mentoría reales ya dados de alta (ver
-- "Categorías de acceso de usuario" en CLAUDE.md): Santiago Pelotti es el
-- único online confirmado, el resto de las cuentas de mentoría actuales
-- son presenciales/privadas.
update public.profiles
set modalidad_mentoria = 'online'
where premium_origen = 'mentoria'
  and id in (
    select id from auth.users where lower(email) = lower('santiagoismaelpelotti@gmail.com')
  );

update public.profiles
set modalidad_mentoria = 'presencial'
where premium_origen = 'mentoria'
  and modalidad_mentoria is null;

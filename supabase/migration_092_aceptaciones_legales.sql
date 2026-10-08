-- Migración 092: registro de aceptación de Términos y Condiciones + Política
-- de Privacidad (tarea legal 2026-10-08, ver "Cumplimiento legal" en
-- CLAUDE.md).
--
-- Una fila por (usuario, tipo, versión). La versión vigente es la constante
-- VERSION_LEGAL de src/lib/aceptacion-legal.ts: si se cambia, todos vuelven a
-- ver la pantalla de aceptación en su próximo ingreso.
--
-- RLS: el usuario solo LEE sus propias filas (lo necesita el proxy para saber
-- si ya aceptó). Nadie escribe con su sesión: las altas las hace el servidor
-- con la service role (así user_agent/ip no los pone el cliente).
--
-- IMPORTANTE: correr ANTES de desplegar el código que usa la tabla. Si la
-- tabla no existe el proxy no bloquea a nadie (falla abierto y loguea), pero
-- las aceptaciones no se guardarían.
--
-- Correr en el SQL Editor de Supabase después de la migración 091.

create table if not exists public.aceptaciones_legales (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  tipo text not null default 'terminos_privacidad',
  version text not null,
  aceptado_at timestamptz not null default now(),
  user_agent text,
  ip text,
  unique (user_id, tipo, version)
);

alter table public.aceptaciones_legales enable row level security;

drop policy if exists "usuarios ven sus propias aceptaciones" on public.aceptaciones_legales;
create policy "usuarios ven sus propias aceptaciones"
  on public.aceptaciones_legales for select
  using (auth.uid() = user_id);

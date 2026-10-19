-- Migración 104: registro de series del PROTOTIPO de conteo con cámara.
--
-- Guarda, por cada serie que se cuenta con la cámara, SOLO NÚMEROS: las señales del
-- cuerpo (ángulos de codos, rodillas, cadera, brazos y altura) muestreadas ~10 veces
-- por segundo, lo que contó el algoritmo y lo que el usuario dejó al corregir. No hay
-- video ni imágenes. Sirve para repetir la serie en una computadora y ajustar el
-- conteo con datos reales, en lugar de adivinar.
-- Solo lo escribe (y lo lee) la propia cuenta; la app lo usa únicamente con las cuentas
-- de prototipos (lib/prototipos.ts). Aditiva: no toca ninguna tabla existente.

create table if not exists public.pose_sesiones_prueba (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  exercise_definition_id bigint references public.exercise_definitions (id) on delete set null,
  created_at timestamptz not null default now(),
  camara text,
  fps numeric,
  contado integer,
  final integer,
  senal text,
  senales jsonb not null default '{}'::jsonb
);

alter table public.pose_sesiones_prueba enable row level security;

create policy "usuarios ven sus sesiones de pose"
  on public.pose_sesiones_prueba for select
  using (auth.uid() = user_id);

create policy "usuarios crean sus sesiones de pose"
  on public.pose_sesiones_prueba for insert
  with check (auth.uid() = user_id);

create policy "usuarios borran sus sesiones de pose"
  on public.pose_sesiones_prueba for delete
  using (auth.uid() = user_id);

create index if not exists pose_sesiones_prueba_user_idx
  on public.pose_sesiones_prueba (user_id, created_at desc);

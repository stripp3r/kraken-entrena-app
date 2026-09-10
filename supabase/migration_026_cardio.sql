-- Migración 026: registro manual de cardio dentro de Entrenamiento.
-- El usuario carga "actividad + minutos (+ km opcional)" y la app le
-- devuelve una estimación aproximada de calorías (fórmula MET x peso x
-- tiempo, con el peso de su última medición). Es informativo, no medición
-- real -- no hay integración con smartwatch/GPS por ahora.
--
-- Correr en el SQL Editor de Supabase después de la migración 025.

create table if not exists public.cardio_logs (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  fecha date not null default current_date,
  actividad text not null,
  duracion_min integer not null check (duracion_min > 0),
  distancia_km numeric check (distancia_km >= 0),
  calorias_estimadas integer,
  created_at timestamptz not null default now()
);

alter table public.cardio_logs enable row level security;

drop policy if exists "usuarios ven su propio cardio" on public.cardio_logs;
create policy "usuarios ven su propio cardio"
  on public.cardio_logs for select
  using (auth.uid() = user_id);

drop policy if exists "usuarios cargan su propio cardio" on public.cardio_logs;
create policy "usuarios cargan su propio cardio"
  on public.cardio_logs for insert
  with check (auth.uid() = user_id);

drop policy if exists "usuarios editan su propio cardio" on public.cardio_logs;
create policy "usuarios editan su propio cardio"
  on public.cardio_logs for update
  using (auth.uid() = user_id);

drop policy if exists "usuarios borran su propio cardio" on public.cardio_logs;
create policy "usuarios borran su propio cardio"
  on public.cardio_logs for delete
  using (auth.uid() = user_id);

create index if not exists cardio_logs_user_fecha_idx
  on public.cardio_logs (user_id, fecha desc);

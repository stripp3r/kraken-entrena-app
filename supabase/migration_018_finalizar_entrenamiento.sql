-- Migración 018: al finalizar un entrenamiento del día queda un registro
-- permanente de que ese día+rutina ya fue finalizado -- una vez finalizado,
-- ese día no se puede volver a iniciar ni editar (el usuario deja de tener
-- forma de acceder al formulario de carga/edición de esa fecha).

create table if not exists public.entrenamientos_finalizados (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  routine_id bigint references public.routines (id) on delete set null,
  dia text not null,
  fecha date not null,
  created_at timestamptz not null default now(),
  unique (user_id, dia, fecha)
);

alter table public.entrenamientos_finalizados enable row level security;

create policy "usuarios ven sus propias finalizaciones"
  on public.entrenamientos_finalizados for select
  using (auth.uid() = user_id);

create policy "usuarios crean sus propias finalizaciones"
  on public.entrenamientos_finalizados for insert
  with check (auth.uid() = user_id);

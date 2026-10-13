-- Migración 100: base de datos para el trabajo de cumplimiento y compras del
-- 2026-10-13 (diagnóstico de compras + adenda legal del chat del sitio web).
-- Todo ADITIVO: tablas y columnas nuevas, ningún dato existente se borra.
--
-- 1) emails_salientes: bandeja de salida de TODOS los emails que manda la app
--    (comprobantes, constancias de arrepentimiento/baja, avisos al coach,
--    códigos de verificación). Sirve de evidencia ("constancia fehaciente") y de
--    cola idempotente: unique (tipo, ref) => un mismo aviso no se manda dos
--    veces aunque el webhook reintente. Si no hay proveedor de email
--    configurado queda en 'pendiente' y se puede reenviar después.
-- 2) tareas_reembolso: devoluciones que hay que hacer a mano (la app no
--    reembolsa por API). Se genera sola, p. ej., si se cobra una renovación
--    después de una baja recibida a tiempo.
-- 3) solicitudes_baja_arrepentimiento: columnas del registro completo que pide
--    la adenda (compra/suscripción asociada, verificación, constancia,
--    responsable, datos del reembolso) y el medio 'web' (formulario público).
-- 4) compras: versión de los términos aceptada + plazo legal (10 días) y
--    comercial (14 días) de arrepentimiento + datos del reembolso.
-- 5) reclamos_compra: "¿Ya compraste y no ves tu plan?" (código de 6 dígitos
--    enviado al email de la compra; se guarda solo el hash).
-- 6) formularios_ingreso: formulario de ingreso de las mentorías (con
--    consentimiento de datos de salud versionado).
-- 7) avisos_precio_confirmaciones.decision: acepta / rechaza el precio nuevo;
--    avisos_precio.sin_aceptar_procesado_at: ya se canceló a quien no aceptó.
-- 8) limites_publicos: contador para limitar el endpoint público de solicitudes.
--
-- Todas las tablas nuevas tienen RLS activado SIN policies (solo las lee/escribe
-- el servidor con la service role), salvo formularios_ingreso, donde cada
-- usuario ve y edita solo el suyo.

-- ============ 1) Bandeja de salida de emails ============
create table if not exists public.emails_salientes (
  id bigint generated always as identity primary key,
  tipo text not null,
  ref text not null,
  para text not null,
  asunto text not null,
  html text not null,
  texto text,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'enviado', 'error')),
  proveedor_id text,
  error text,
  intentos int not null default 0,
  creado_at timestamptz not null default now(),
  enviado_at timestamptz,
  unique (tipo, ref)
);
alter table public.emails_salientes enable row level security;

-- ============ 2) Tareas de reembolso manual ============
create table if not exists public.tareas_reembolso (
  id bigint generated always as identity primary key,
  -- Clave natural para no duplicar la tarea si el webhook reintenta.
  origen_ref text not null unique,
  motivo text not null,
  proveedor text,
  proveedor_payment_id text,
  user_id uuid references auth.users (id) on delete set null,
  email text,
  monto numeric,
  moneda text,
  solicitud_codigo text,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'hecha', 'descartada')),
  creada_at timestamptz not null default now(),
  resuelta_at timestamptz,
  notas text
);
alter table public.tareas_reembolso enable row level security;

-- ============ 3) Solicitudes de arrepentimiento / baja: registro completo ============
alter table public.solicitudes_baja_arrepentimiento
  add column if not exists compra_id bigint,
  add column if not exists suscripcion_id bigint,
  add column if not exists verificacion text not null default 'no_verificada'
    check (verificacion in ('no_verificada', 'email_coincide', 'manual')),
  add column if not exists ip_hash text,
  add column if not exists numero_operacion text,
  add column if not exists constancia_enviada_at timestamptz,
  add column if not exists responsable text,
  add column if not exists reembolso_fecha date,
  add column if not exists reembolso_importe numeric,
  add column if not exists reembolso_moneda text,
  add column if not exists reembolso_referencia text;

alter table public.solicitudes_baja_arrepentimiento
  drop constraint if exists solicitudes_baja_arrepentimiento_medio_check;
alter table public.solicitudes_baja_arrepentimiento
  add constraint solicitudes_baja_arrepentimiento_medio_check
  check (medio in ('whatsapp', 'email', 'app', 'web'));

-- ============ 4) compras: términos aceptados, plazos y reembolso ============
alter table public.compras
  add column if not exists terminos_version text,
  add column if not exists plazo_legal_vence date,
  add column if not exists plazo_comercial_vence date,
  add column if not exists reembolsada_at timestamptz,
  add column if not exists reembolso_referencia text;

create or replace function public.completar_plazos_compra()
returns trigger
language plpgsql
as $$
declare
  dia date := (coalesce(new.created_at, now()) at time zone 'America/Argentina/Buenos_Aires')::date;
begin
  if new.plazo_legal_vence is null then new.plazo_legal_vence := dia + 10; end if;
  if new.plazo_comercial_vence is null then new.plazo_comercial_vence := dia + 14; end if;
  return new;
end;
$$;

drop trigger if exists completar_plazos_compra on public.compras;
create trigger completar_plazos_compra
  before insert on public.compras
  for each row execute function public.completar_plazos_compra();

-- Compras ya existentes: plazos calculados desde su fecha de compra.
update public.compras
set plazo_legal_vence = (created_at at time zone 'America/Argentina/Buenos_Aires')::date + 10,
    plazo_comercial_vence = (created_at at time zone 'America/Argentina/Buenos_Aires')::date + 14
where plazo_legal_vence is null;

-- ============ 5) Reclamo de compra por email distinto ============
create table if not exists public.reclamos_compra (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  email_compra text not null,
  codigo_hash text not null,
  expira_at timestamptz not null,
  intentos int not null default 0,
  usado_at timestamptz,
  creado_at timestamptz not null default now()
);
create index if not exists reclamos_compra_user_idx on public.reclamos_compra (user_id, creado_at desc);
alter table public.reclamos_compra enable row level security;

-- ============ 6) Formulario de ingreso de mentoría ============
create table if not exists public.formularios_ingreso (
  id bigint generated always as identity primary key,
  user_id uuid not null unique references auth.users (id) on delete cascade,
  objetivo text,
  experiencia text,
  dias_por_semana smallint check (dias_por_semana between 1 and 7),
  minutos_por_sesion smallint check (minutos_por_sesion between 15 and 240),
  lugar text check (lugar in ('gimnasio', 'casa', 'ambos')),
  equipamiento text,
  disponibilidad text,
  -- Opcionales (datos de salud): solo lo relevante para entrenar, no diagnósticos.
  restricciones text,
  habitos text,
  comentarios text,
  consentimiento_salud_version text,
  completado_at timestamptz,
  creado_at timestamptz not null default now(),
  actualizado_at timestamptz not null default now()
);
alter table public.formularios_ingreso enable row level security;

drop policy if exists "usuarios ven su formulario de ingreso" on public.formularios_ingreso;
create policy "usuarios ven su formulario de ingreso"
  on public.formularios_ingreso for select
  using (auth.uid() = user_id);

drop policy if exists "usuarios crean su formulario de ingreso" on public.formularios_ingreso;
create policy "usuarios crean su formulario de ingreso"
  on public.formularios_ingreso for insert
  with check (auth.uid() = user_id);

drop policy if exists "usuarios editan su formulario de ingreso" on public.formularios_ingreso;
create policy "usuarios editan su formulario de ingreso"
  on public.formularios_ingreso for update
  using (auth.uid() = user_id);

-- ============ 7) Precio nuevo: aceptar o rechazar ============
alter table public.avisos_precio_confirmaciones
  add column if not exists decision text not null default 'acepta'
    check (decision in ('acepta', 'rechaza'));

alter table public.avisos_precio
  add column if not exists sin_aceptar_procesado_at timestamptz;

-- ============ 8) Límite del endpoint público ============
create table if not exists public.limites_publicos (
  id bigint generated always as identity primary key,
  clave text not null,
  creado_at timestamptz not null default now()
);
create index if not exists limites_publicos_idx on public.limites_publicos (clave, creado_at desc);
alter table public.limites_publicos enable row level security;

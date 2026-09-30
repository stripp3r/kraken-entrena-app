-- Migración 085: distintivo de "hay novedades" en Rutinas adquiridas y Mis
-- PDFs, para cuando una compra le agrega algo nuevo a un usuario que ya
-- tenía cuenta -- definido con el coach 2026-09-30: "es como un pequeño
-- aviso de che se te agregaron nuevas rutinas... si no es poco friendly".
--
-- Booleanos simples (no timestamp) porque solo importa "hay algo nuevo sin
-- ver, sí o no" -- se prenden cuando procesarCompraAprobada() otorga acceso
-- (src/lib/compras.ts) y se apagan solos la primera vez que el usuario
-- entra a esa pantalla (entrenamiento/rutinas y perfil/recursos).
--
-- Correr en el SQL Editor de Supabase.

alter table public.profiles
  add column if not exists tiene_rutinas_nuevas boolean not null default false,
  add column if not exists tiene_pdfs_nuevos boolean not null default false;

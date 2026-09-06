-- Migración 008: cada ejercicio puede tener un ejercicio alternativo
-- (por ejemplo, si no tenés la máquina o el equipo disponible).
alter table public.exercises
  add column if not exists alternativa_id bigint references public.exercises (id) on delete set null;

-- Ejemplo con los ejercicios de prueba: las dos variantes de vuelo lateral
-- son alternativas razonables entre sí (polea vs. mancuerna).
update public.exercises
set alternativa_id = (select id from public.exercises where nombre = 'Vuelo lateral con mancuerna a un brazo')
where nombre = 'Vuelo lateral con polea';

update public.exercises
set alternativa_id = (select id from public.exercises where nombre = 'Vuelo lateral con polea')
where nombre = 'Vuelo lateral con mancuerna a un brazo';

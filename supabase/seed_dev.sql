-- Datos de prueba para la pantalla de Entrenamiento (Fase 3).
-- Ejercicios reales del día A ("PUSH") tomados de la EntrenaOptimo original.
-- Se reemplazan por la migración completa (358 ejercicios) más adelante.

insert into public.techniques (nombre, descripcion) values
  ('Pausa descanso', 'Al llegar al fallo, descansá 10-15 segundos respirando profundo y segui sumando repeticiones con el mismo peso.')
on conflict do nothing;

insert into public.exercises (nombre, dia, categoria, orden, technique_id) values
  ('Press militar con mancuernas', 'A', 'Push', 1, null),
  ('Vuelo lateral con polea', 'A', 'Push', 2, null),
  ('Vuelo lateral con mancuerna a un brazo', 'A', 'Push', 3,
    (select id from public.techniques where nombre = 'Pausa descanso')),
  ('Fondos en paralelas', 'A', 'Push', 4, null);

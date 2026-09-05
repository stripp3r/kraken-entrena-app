-- Migración 003: sacamos "Técnicas" (decisión: muy avanzado para el usuario real,
-- mejor como contenido aparte) y sumamos "cómo hacer el ejercicio" integrado a
-- cada ejercicio en vez de ser una pantalla separada.

alter table public.exercises drop column if exists technique_id;
drop table if exists public.techniques cascade;

alter table public.exercises add column if not exists como_hacerlo text;

-- Texto de ejemplo para los 4 ejercicios de prueba (se reemplaza por el
-- contenido real del Excel cuando migremos los 358 ejercicios).
update public.exercises set como_hacerlo =
  'Posición inicial: parado, mancuernas a la altura de los hombros, palmas hacia adelante.
Ejecución: empujá las mancuernas hacia arriba hasta extender los codos sin bloquearlos, y bajá controlado a la posición inicial.
Consejo: mantené el core firme para no arquear la zona lumbar.'
where nombre = 'Press militar con mancuernas';

update public.exercises set como_hacerlo =
  'Posición inicial: de costado a la máquina, agarrá el mango de la polea baja con la mano más alejada de la máquina, brazo pegado al cuerpo.
Ejecución: elevá el brazo hacia el costado hasta la altura del hombro, liderando con el codo, y bajá controlado.
Consejo: evitá usar impulso del torso, el movimiento lo hace el hombro.'
where nombre = 'Vuelo lateral con polea';

update public.exercises set como_hacerlo =
  'Posición inicial: parado, mancuerna en una mano, brazo levemente flexionado.
Ejecución: elevá el brazo hacia el costado hasta la altura del hombro, y bajá controlado. Al llegar al fallo, aplicá la técnica de pausa-descanso: descansá 10-15 segundos y sumá repeticiones extra con el mismo peso.
Consejo: priorizá el control por sobre el peso usado.'
where nombre = 'Vuelo lateral con mancuerna a un brazo';

update public.exercises set como_hacerlo =
  'Posición inicial: sostenido en las paralelas, brazos extendidos, torso levemente inclinado hacia adelante.
Ejecución: bajá flexionando los codos hasta sentir estiramiento en el pecho/tríceps, y empujá hacia arriba hasta extender los brazos.
Consejo: no bajes de más si sentís molestia en el hombro.'
where nombre = 'Fondos en paralelas';

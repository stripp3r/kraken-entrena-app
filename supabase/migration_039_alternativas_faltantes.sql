-- Migración 039: completa las alternativas faltantes de los ejercicios de
-- Kraken Split. 17 de 18 reutilizan un ejercicio que ya existe en el
-- catálogo (mismo criterio de siempre: no inventar de más si ya hay algo
-- que sirve); solo "Abducción de cadera en máquina" es nuevo.
--
-- Todas las alternativas quedan en los dos sentidos -- si A tiene a B como
-- alternativa, B también tiene a A (solo se completa el sentido inverso si
-- ese ejercicio no tenía ya una alternativa propia cargada, para no pisar
-- nada existente).
--
-- Correr en el SQL Editor después de subir
-- gifs-kraken-split/abduccion-cadera-en-maquina.gif al bucket `ejercicios`.

-- ============ ÚNICO EJERCICIO NUEVO ============
insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'Abducción de cadera en máquina', 'Legs',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/abduccion-cadera-en-maquina.gif',
  'Paso inicial: Sentate en la máquina de abductor, con la espalda apoyada en el respaldo y las piernas dentro de las almohadillas laterales.

Posición inicial: Ajustá el rango de la máquina para que las piernas arranquen juntas, con las almohadillas apoyadas contra la parte externa de los muslos.

Movimiento: Exhalá y empujá las piernas hacia afuera, separándolas contra la resistencia de la máquina.

Contracción: Apretá el glúteo medio un instante en la posición de máxima apertura.

Regreso: Inhalá y volvé las piernas a la posición inicial de forma controlada, sin dejar que el peso caiga de golpe.

Consejo como Entrenador:

Mantené la espalda apoyada contra el respaldo durante todo el movimiento, sin usar impulso del torso.

Es un buen reemplazo cuando la polea de cadera está ocupada -- trabaja el mismo grupo muscular con otro equipo.

No hace falta cargar mucho peso, es un ejercicio de aislamiento.',
  'aislado', false
where not exists (select 1 from public.exercise_definitions where nombre = 'Abducción de cadera en máquina');

-- ============ ALTERNATIVAS (ida + vuelta cuando el otro esté libre) ============

update exercise_definitions set alternativa_id = (select id from exercise_definitions where nombre = 'Remo con mancuerna a un brazo') where nombre = 'Remo con barra parado';
update exercise_definitions set alternativa_id = (select id from exercise_definitions where nombre = 'Remo con barra parado') where nombre = 'Remo con mancuerna a un brazo' and alternativa_id is null;

update exercise_definitions set alternativa_id = (select id from exercise_definitions where nombre = 'Press militar con mancuernas') where nombre = 'Press de hombro en maquina Smith';
update exercise_definitions set alternativa_id = (select id from exercise_definitions where nombre = 'Press de hombro en maquina Smith') where nombre = 'Press militar con mancuernas' and alternativa_id is null;

update exercise_definitions set alternativa_id = (select id from exercise_definitions where nombre = 'Dorsales en polea alta') where nombre = 'Dominadas lastradas';
update exercise_definitions set alternativa_id = (select id from exercise_definitions where nombre = 'Dominadas lastradas') where nombre = 'Dorsales en polea alta' and alternativa_id is null;

update exercise_definitions set alternativa_id = (select id from exercise_definitions where nombre = 'Curl de bíceps con mancuerna parado') where nombre = 'Curl con barra EZ';
update exercise_definitions set alternativa_id = (select id from exercise_definitions where nombre = 'Curl con barra EZ') where nombre = 'Curl de bíceps con mancuerna parado' and alternativa_id is null;

update exercise_definitions set alternativa_id = (select id from exercise_definitions where nombre = 'Elevación de talón parado a una pierna') where nombre = 'Elevación de talón sentado en máquina';
update exercise_definitions set alternativa_id = (select id from exercise_definitions where nombre = 'Elevación de talón sentado en máquina') where nombre = 'Elevación de talón parado a una pierna' and alternativa_id is null;

update exercise_definitions set alternativa_id = (select id from exercise_definitions where nombre = 'Abdominales en banco declinado') where nombre = 'Elevación de piernas colgado';
update exercise_definitions set alternativa_id = (select id from exercise_definitions where nombre = 'Elevación de piernas colgado') where nombre = 'Abdominales en banco declinado' and alternativa_id is null;

update exercise_definitions set alternativa_id = (select id from exercise_definitions where nombre = 'Press banco plano con barra') where nombre = 'Press banca en Smith';
update exercise_definitions set alternativa_id = (select id from exercise_definitions where nombre = 'Press banca en Smith') where nombre = 'Press banco plano con barra' and alternativa_id is null;

update exercise_definitions set alternativa_id = (select id from exercise_definitions where nombre = 'Press de banco con mancuernas') where nombre = 'Aperturas con mancuernas';
update exercise_definitions set alternativa_id = (select id from exercise_definitions where nombre = 'Aperturas con mancuernas') where nombre = 'Press de banco con mancuernas' and alternativa_id is null;

update exercise_definitions set alternativa_id = (select id from exercise_definitions where nombre = 'Vuelo lateral con polea') where nombre = 'Elevacion lateral con mancuernas';
update exercise_definitions set alternativa_id = (select id from exercise_definitions where nombre = 'Elevacion lateral con mancuernas') where nombre = 'Vuelo lateral con polea' and alternativa_id is null;

update exercise_definitions set alternativa_id = (select id from exercise_definitions where nombre = 'Extensión de tríceps en polea') where nombre = 'Press francés con barra EZ';
update exercise_definitions set alternativa_id = (select id from exercise_definitions where nombre = 'Press francés con barra EZ') where nombre = 'Extensión de tríceps en polea' and alternativa_id is null;

update exercise_definitions set alternativa_id = (select id from exercise_definitions where nombre = 'Deltoides posteriores en banco inclinado con mancuernas') where nombre = 'Pájaro con polea unilateral';
update exercise_definitions set alternativa_id = (select id from exercise_definitions where nombre = 'Pájaro con polea unilateral') where nombre = 'Deltoides posteriores en banco inclinado con mancuernas' and alternativa_id is null;

update exercise_definitions set alternativa_id = (select id from exercise_definitions where nombre = 'Peso muerto rumano') where nombre = 'Empuje de caderas';
update exercise_definitions set alternativa_id = (select id from exercise_definitions where nombre = 'Empuje de caderas') where nombre = 'Peso muerto rumano' and alternativa_id is null;

update exercise_definitions set alternativa_id = (select id from exercise_definitions where nombre = 'Curl femoral sentado') where nombre = 'Curl femoral unilateral en polea';
update exercise_definitions set alternativa_id = (select id from exercise_definitions where nombre = 'Curl femoral unilateral en polea') where nombre = 'Curl femoral sentado' and alternativa_id is null;

update exercise_definitions set alternativa_id = (select id from exercise_definitions where nombre = 'Abducción de cadera en máquina') where nombre = 'Abducción de cadera en polea';
update exercise_definitions set alternativa_id = (select id from exercise_definitions where nombre = 'Abducción de cadera en polea') where nombre = 'Abducción de cadera en máquina' and alternativa_id is null;

update exercise_definitions set alternativa_id = (select id from exercise_definitions where nombre = 'Remo con mancuerna a un brazo') where nombre = 'Meadows Row' and alternativa_id is null;

update exercise_definitions set alternativa_id = (select id from exercise_definitions where nombre = 'Curl con barra EZ') where nombre = 'Curl martillo con mancuernas sentado' and alternativa_id is null;

update exercise_definitions set alternativa_id = (select id from exercise_definitions where nombre = 'Press francés con barra EZ') where nombre = 'Extensión de tríceps sobre la cabeza en polea' and alternativa_id is null;

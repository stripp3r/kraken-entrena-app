-- Migración 022: rutina '3 días - Fullbody', construida sobre la
-- arquitectura de ejercicios canónicos. 15 de sus 18 ejercicios ya existen en
-- la app (se reutiliza el mismo exercise_definitions por nombre); solo 3 son
-- nuevos. 'ABS CIRCUITO' de la Hoja2 se separó otra vez en 'Elevación de
-- piernas colgado' + 'Abdominales en banco declinado' (ya creados para la
-- rutina de 5 días) -- por eso los 3 días tienen 7 ejercicios en vez de 6.
--
-- Correr en el SQL Editor de Supabase después de la migración 021.

insert into public.routines (nombre, descripcion, dias)
select '3 días - Fullbody', 'Split de 3 días fullbody', 3
where not exists (select 1 from public.routines where nombre = '3 días - Fullbody');

-- ============ EJERCICIOS NUEVOS ============
insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'Dorsales en polea alta', 'Pull',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/dorsales-polea-alta.gif',
  'Paso inicial: Colócate frente a la máquina de poleas con una barra conectada a la polea alta. Asegúrate de ajustar el peso de la máquina según tu nivel de fuerza y habilidad.

Posición corporal: Agarra la barra con un agarre pronador (palmas mirando hacia el frente) y separa las manos utilizando un agarre amplio y siéntate en la máquina.

Movimiento: Manteniendo la espalda recta y los abdominales contraídos, tira de la barra hacia tu cuerpo a la altura de los pectorales, llevando los codos hacia atrás y apretando los omóplatos. El objetivo es enfocarse en la contracción de los músculos de la espalda mientras realizas el movimiento.

Regreso: De manera controlada, permite que la barra se mueva hacia arriba y estire los brazos nuevamente hasta alcanzar la posición inicial. Evita dejar que los hombros se desplacen hacia adelante al regresar

Consejo como Entrenador:

Asegúrate de mantener una buena técnica durante todo el ejercicio. Evita utilizar el impulso del cuerpo para realizar el movimiento y concéntrate en la contracción de los músculos de la espalda.

Ajusta el peso de la máquina según tus capacidades y realizar el movimiento de forma suave y controlada.',
  'compuesto', false
where not exists (select 1 from public.exercise_definitions where nombre = 'Dorsales en polea alta');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'Remo sentado agarre cerrado', 'Pull',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/remo-sentado-agarre-cerrado.gif',
  'Paso inicial: Colócate frente a una máquina de poleas con la polea ajustada a una altura baja. Coloca el triángulo en la polea y sostén las dos empuñaduras con un agarre neutro (palmas enfrentadas). Da un paso hacia atrás para tensar la polea y mantener una postura estable.

Posición corporal: Mantén una postura erguida con los pies separados al ancho de los hombros. Flexiona ligeramente las rodillas y mantén la espalda recta. Inclínate hacia adelante desde las caderas, manteniendo el torso paralelo al suelo. Mantén los brazos extendidos y los hombros hacia abajo y hacia atrás.

Movimiento: Inicia el movimiento al flexionar los codos y llevar el triángulo hacia tu cuerpo. Mantén los codos cerca de los costados y los hombros estables durante todo el movimiento. Siente la contracción en los músculos de la espalda baja mientras tiras del triángulo hacia tu abdomen.

Contracción: Cuando el triángulo esté cerca de tu abdomen, contrae los músculos de la espalda baja y siente la tensión en la zona. Mantén la posición durante un segundo para maximizar la contracción muscular.

Regreso: De manera controlada, estira los brazos lentamente y vuelve a la posición inicial, permitiendo que los músculos de la espalda se estiren ligeramente. Evita dejar caer el peso o perder el control durante el movimiento de regreso.

Consejo como Entrenador:

Evita arquear la espalda o usar un peso excesivo que pueda comprometer tu técnica.

Mantén el control en todo momento y concéntrate en contraer los músculos de la espalda, en lugar de simplemente tirar del peso hacia tu cuerpo.

Lleva los codos hacia atrás y el peso hacia el abdomen.

Puedes balancear ligeramente el tronco hacia atrás si es necesario, pero no lo hagas de forma excesiva.',
  'compuesto', false
where not exists (select 1 from public.exercise_definitions where nombre = 'Remo sentado agarre cerrado');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'Chin up agarre abierto', 'Pull',
  'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/chin-up-agarre-abierto.gif',
  'Paso inicial: Encuentra una barra de dominadas o pull-up que te permita ajustar tu agarre a una distancia mayor que el ancho de tus hombros.

Posición corporal: Colócate debajo de la barra de dominadas. Párate con los pies juntos y los brazos extendidos hacia arriba, agarrando la barra con las palmas de las manos mirando hacia ti (supinadas) y con un agarre más ancho que tus hombros.
Mantén el cuerpo recto y los codos extendidos.

Movimiento: Comienza el movimiento con los brazos completamente extendidos.
Inhala y luego exhala mientras doblas los codos para levantar tu cuerpo hacia la barra. Asegúrate de que los codos se mantengan ligeramente hacia los lados, no completamente alineados con el cuerpo.
Dirige tu mirada hacia arriba y lleva tu mentón sobre la barra.

Empuje: Continúa elevándote hasta que tu barbilla esté por encima de la barra. Mantén la contracción en la parte superior durante un breve segundo para maximizar la activación muscular.

Regreso: Inhala mientras desciendes lentamente tu cuerpo de regreso a la posición inicial. Asegúrate de mantener el control mientras bajas y evita balancearte.
Extiende completamente los brazos al llegar a la posición inicial.

Consejo como Entrenador:

Mantén el control adecuado del movimiento en todo momento para evitar lesiones.

Asegúrate de que tus codos estén ligeramente hacia los lados durante el ascenso para centrar el trabajo en tus músculos de la espalda y los brazos.

Controla la velocidad de descenso para evitar lesiones en los tendones y músculos.

Si eres principiante o tienes dificultades con este ejercicio, considera usar una banda de resistencia o recibir la asistencia de un compañero de entrenamiento.',
  'compuesto', false
where not exists (select 1 from public.exercise_definitions where nombre = 'Chin up agarre abierto');

-- ============ RUTINA: SCHEDULING POR DÍA ============
-- ---- DÍA A ----
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '3 días - Fullbody'), 'A', 1,
  (select id from public.exercise_definitions where nombre = 'Sentadillas')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '3 días - Fullbody' and re.dia = 'A' and re.orden = 1
);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '3 días - Fullbody'), 'A', 2,
  (select id from public.exercise_definitions where nombre = 'Press banco plano con barra')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '3 días - Fullbody' and re.dia = 'A' and re.orden = 2
);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '3 días - Fullbody'), 'A', 3,
  (select id from public.exercise_definitions where nombre = 'Dorsales en polea alta')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '3 días - Fullbody' and re.dia = 'A' and re.orden = 3
);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '3 días - Fullbody'), 'A', 4,
  (select id from public.exercise_definitions where nombre = 'Press militar con mancuernas')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '3 días - Fullbody' and re.dia = 'A' and re.orden = 4
);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '3 días - Fullbody'), 'A', 5,
  (select id from public.exercise_definitions where nombre = 'Hiperextensiones')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '3 días - Fullbody' and re.dia = 'A' and re.orden = 5
);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '3 días - Fullbody'), 'A', 6,
  (select id from public.exercise_definitions where nombre = 'Elevación de piernas colgado')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '3 días - Fullbody' and re.dia = 'A' and re.orden = 6
);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '3 días - Fullbody'), 'A', 7,
  (select id from public.exercise_definitions where nombre = 'Abdominales en banco declinado')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '3 días - Fullbody' and re.dia = 'A' and re.orden = 7
);

-- ---- DÍA B ----
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '3 días - Fullbody'), 'B', 1,
  (select id from public.exercise_definitions where nombre = 'Fondos en paralelas')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '3 días - Fullbody' and re.dia = 'B' and re.orden = 1
);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '3 días - Fullbody'), 'B', 2,
  (select id from public.exercise_definitions where nombre = 'Peso muerto')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '3 días - Fullbody' and re.dia = 'B' and re.orden = 2
);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '3 días - Fullbody'), 'B', 3,
  (select id from public.exercise_definitions where nombre = 'Cuádriceps en prensa')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '3 días - Fullbody' and re.dia = 'B' and re.orden = 3
);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '3 días - Fullbody'), 'B', 4,
  (select id from public.exercise_definitions where nombre = 'Remo sentado agarre cerrado')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '3 días - Fullbody' and re.dia = 'B' and re.orden = 4
);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '3 días - Fullbody'), 'B', 5,
  (select id from public.exercise_definitions where nombre = 'Vuelo lateral con polea')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '3 días - Fullbody' and re.dia = 'B' and re.orden = 5
);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '3 días - Fullbody'), 'B', 6,
  (select id from public.exercise_definitions where nombre = 'Elevación de piernas colgado')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '3 días - Fullbody' and re.dia = 'B' and re.orden = 6
);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '3 días - Fullbody'), 'B', 7,
  (select id from public.exercise_definitions where nombre = 'Abdominales en banco declinado')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '3 días - Fullbody' and re.dia = 'B' and re.orden = 7
);

-- ---- DÍA C ----
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '3 días - Fullbody'), 'C', 1,
  (select id from public.exercise_definitions where nombre = 'Cuádriceps en prensa')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '3 días - Fullbody' and re.dia = 'C' and re.orden = 1
);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '3 días - Fullbody'), 'C', 2,
  (select id from public.exercise_definitions where nombre = 'Press inclinado en máquina Smith')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '3 días - Fullbody' and re.dia = 'C' and re.orden = 2
);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '3 días - Fullbody'), 'C', 3,
  (select id from public.exercise_definitions where nombre = 'Chin up agarre abierto')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '3 días - Fullbody' and re.dia = 'C' and re.orden = 3
);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '3 días - Fullbody'), 'C', 4,
  (select id from public.exercise_definitions where nombre = 'Press militar con mancuernas')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '3 días - Fullbody' and re.dia = 'C' and re.orden = 4
);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '3 días - Fullbody'), 'C', 5,
  (select id from public.exercise_definitions where nombre = 'Hiperextensiones')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '3 días - Fullbody' and re.dia = 'C' and re.orden = 5
);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '3 días - Fullbody'), 'C', 6,
  (select id from public.exercise_definitions where nombre = 'Elevación de piernas colgado')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '3 días - Fullbody' and re.dia = 'C' and re.orden = 6
);
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id)
select (select id from public.routines where nombre = '3 días - Fullbody'), 'C', 7,
  (select id from public.exercise_definitions where nombre = 'Abdominales en banco declinado')
where not exists (
  select 1 from public.routine_exercises re
  join public.routines r on r.id = re.routine_id
  where r.nombre = '3 días - Fullbody' and re.dia = 'C' and re.orden = 7
);

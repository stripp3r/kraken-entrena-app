-- Migración 035: rutina "Kraken Split" (privada, exclusiva de la cuenta del
-- coach) + soporte de series/repeticiones sugeridas por ejercicio.
--
-- Dos features nuevas:
--
-- 1) Rutinas privadas: se agrega `routines.es_privada`. Una rutina privada
--    NUNCA aparece para nadie salvo que tenga una fila explícita en
--    `profile_routine_access` -- ni siquiera para cuentas Golden/en prueba
--    (que hoy desbloquean automáticamente TODAS las rutinas públicas). Esto
--    se hace a nivel de RLS (policy de select en `routines`), así que
--    cualquier pantalla que ya lista rutinas queda protegida sin tocar
--    código de la app. `cambiarRutinaActiva` (entrenamiento/actions.ts) se
--    actualizó aparte para exigir acceso explícito a una rutina privada
--    incluso si el usuario es premium (si no, alguien con Golden podría
--    adivinar el id y cambiarse a una rutina que no le pertenece).
--
-- 2) `routine_exercises.series_reps`: texto libre opcional (ej. "4 x 5-8")
--    que se muestra como un dato chico debajo del nombre del ejercicio en
--    la pantalla de Entrenar. No aplica a las rutinas existentes (quedan
--    en null, sin cambio visual), pero permite que rutinas nuevas como esta
--    carguen la recomendación de series/reps del programa original.
--
-- Correr en el SQL Editor de Supabase después de la migración 034.

-- ============ RUTINAS PRIVADAS ============
alter table public.routines
  add column if not exists es_privada boolean not null default false;

drop policy if exists "usuarios logueados leen rutinas" on public.routines;
create policy "usuarios logueados leen rutinas"
  on public.routines for select
  to authenticated
  using (
    not es_privada
    or exists (
      select 1 from public.profile_routine_access pra
      where pra.user_id = auth.uid() and pra.routine_id = routines.id
    )
  );

-- ============ SERIES / REPS SUGERIDAS ============
alter table public.routine_exercises
  add column if not exists series_reps text;

-- ============ EJERCICIOS NUEVOS ============
-- (los que no tenían equivalente exacto en el catálogo existente)

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'Dominadas lastradas', 'Pull', null,
  'Paso inicial: Colgate una cadena o cinturón con el peso extra alrededor de la cintura y agarrate a la barra de dominadas con las palmas hacia adelante (agarre pronado), un poco más abierto que el ancho de los hombros.

Posición inicial: Colgate con los brazos completamente extendidos, el core activado y el cuerpo lo más quieto posible, sin balancearte.

Movimiento: Inhalá y tirá de tu cuerpo hacia arriba llevando el pecho hacia la barra, manteniendo los codos apuntando hacia abajo y ligeramente hacia adelante.

Contracción: Al llegar arriba (mentón por encima de la barra), apretá bien la espalda un instante antes de empezar a bajar.

Regreso: Exhalá y bajá de forma controlada hasta la extensión completa de los brazos, sin soltar tensión de golpe.

Consejo como Entrenador:

Sumá el peso extra recién cuando puedas hacer dominadas estrictas sin lastre con buena técnica.

Evitá el impulso de piernas o el balanceo del cuerpo -- cuanto más lento y controlado, mejor estímulo.

Si perdés la forma antes de terminar la serie, es mejor bajar el peso extra que completar reps con mala técnica.',
  'compuesto', false
where not exists (select 1 from public.exercise_definitions where nombre = 'Dominadas lastradas');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'Curl con barra EZ', 'Pull', null,
  'Paso inicial: Parate derecho con los pies al ancho de los hombros y tomá la barra EZ con un agarre semi-supinado en las zonas anguladas de la barra.

Posición inicial: Dejá los brazos extendidos frente a tu cuerpo, con los codos pegados al torso.

Movimiento: Inhalá y flexioná los codos llevando la barra hacia los hombros, sin mover los codos hacia adelante ni balancear el torso.

Contracción: Apretá el bíceps un instante en la parte alta del movimiento.

Regreso: Exhalá y bajá la barra de forma controlada hasta la extensión completa.

Consejo como Entrenador:

La barra EZ es más amigable para la muñeca que una barra recta -- mantené las muñecas firmes y alineadas con el antebrazo.

Evitá usar el impulso de la cadera para "ayudar" a subir la barra.

Controlá especialmente la fase de bajada, es donde más se construye el músculo.',
  'aislado', false
where not exists (select 1 from public.exercise_definitions where nombre = 'Curl con barra EZ');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'Curl femoral tumbado unilateral', 'Pull', null,
  'Paso inicial: Acostate boca abajo en la máquina de curl femoral, con las rodillas justo en el borde del banco y el rodillo apoyado por encima del talón de una sola pierna.

Posición inicial: Dejá la pierna que no trabaja apoyada o levemente flexionada, y la pierna activa completamente extendida, sosteniendo las agarraderas del banco.

Movimiento: Exhalá y flexioná la rodilla de la pierna activa, llevando el talón hacia el glúteo.

Contracción: Apretá el isquiotibial un instante en la posición de máxima flexión.

Regreso: Inhalá y volvé a extender la pierna de forma controlada, sin que el peso caiga de golpe.

Consejo como Entrenador:

Trabajar una pierna a la vez ayuda a parejar diferencias de fuerza entre ambos lados.

Evitá levantar la cadera del banco para "ayudar" el movimiento -- la cadera se mantiene pegada al banco todo el tiempo.

Completá las repeticiones de una pierna antes de cambiar a la otra.',
  'aislado', true
where not exists (select 1 from public.exercise_definitions where nombre = 'Curl femoral tumbado unilateral');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'Plancha con lastre', 'Core', null,
  'Paso inicial: Apoyá los antebrazos en el suelo, con los codos justo debajo de los hombros, y pedile a alguien que te coloque el disco o placa sobre la zona media/baja de la espalda (o usá un chaleco con lastre).

Posición inicial: Extendé las piernas hacia atrás, apoyado en las puntas de los pies, formando una línea recta desde la cabeza hasta los talones.

Movimiento: Mantené esa posición sin que la cadera caiga ni se eleve, respirando de forma constante durante todo el tiempo indicado.

Contracción: Mantené el core y los glúteos apretados durante todo el ejercicio -- es un ejercicio isométrico, no hay fase de "subida y bajada".

Regreso: Al terminar el tiempo, apoyá las rodillas en el piso antes de sacarte el peso de la espalda.

Consejo como Entrenador:

Empezá siempre sin lastre hasta dominar mantener la cadera alineada sin que se hunda ni se levante.

Sumá el peso de a poco -- unos pocos kilos ya cambian bastante la dificultad de una plancha.

Si sentís que la zona lumbar se arquea, bajá el peso o el tiempo objetivo.',
  'aislado', false
where not exists (select 1 from public.exercise_definitions where nombre = 'Plancha con lastre');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'Press banca en Smith', 'Torso', null,
  'Paso inicial: Acostate en un banco plano centrado debajo de la barra de la máquina Smith y tomala con un agarre un poco más ancho que los hombros.

Posición inicial: Desenganchá la barra, bajala hasta que quede justo por encima del pecho, con los pies firmes en el piso y los omóplatos retraídos contra el banco.

Movimiento: Inhalá y bajá la barra de forma controlada hasta rozar la parte media del pecho.

Contracción: Exhalá y empujá la barra hacia arriba hasta extender los brazos, sin trabar los codos con violencia.

Regreso: Repetí el descenso controlado para la siguiente repetición.

Consejo como Entrenador:

La ventaja de la máquina Smith es que la barra se mueve en un solo plano -- aprovechalo para enfocarte en sentir el pecho trabajar, no en estabilizar el peso.

Enganchá siempre la barra en el soporte al terminar la serie.

Ajustá la altura del banco para que la barra quede justo sobre la línea del pecho al desengancharla.',
  'compuesto', false
where not exists (select 1 from public.exercise_definitions where nombre = 'Press banca en Smith');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'Aperturas con mancuernas', 'Torso', null,
  'Paso inicial: Acostate en un banco plano con una mancuerna en cada mano, sosteniéndolas por encima del pecho con los brazos casi extendidos y una ligera flexión en los codos.

Posición inicial: Esa flexión leve de codo se mantiene fija durante todo el ejercicio -- no es un press.

Movimiento: Inhalá y abrí los brazos hacia los costados en forma de arco, bajando las mancuernas hasta sentir un buen estiramiento en el pecho.

Contracción: Exhalá y volvé a juntar las mancuernas arriba, apretando el pecho en la parte alta.

Regreso: Repetí el movimiento de apertura y cierre de forma controlada.

Consejo como Entrenador:

Mantené siempre la misma flexión de codo -- si el codo se flexiona y extiende durante el movimiento, se convierte en un press y pierde el enfoque en el pecho.

No bajes más de lo que tu hombro tolere sin dolor -- el punto de máximo estiramiento varía según cada persona.

Usá un peso moderado, este ejercicio es más de sentir la contracción que de mover mucha carga.',
  'aislado', false
where not exists (select 1 from public.exercise_definitions where nombre = 'Aperturas con mancuernas');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'Press francés con barra EZ', 'Push', null,
  'Paso inicial: Acostate en un banco plano con una barra EZ, sosteniéndola con un agarre cerrado por encima del pecho, brazos extendidos.

Posición inicial: Esa es tu posición de partida -- brazos extendidos hacia el techo.

Movimiento: Inhalá y flexioná los codos bajando la barra hacia la frente o detrás de la cabeza, manteniendo los codos apuntando hacia el techo y quietos.

Contracción: Sentí el estiramiento del tríceps en la parte baja del movimiento.

Regreso: Exhalá y extendé los codos volviendo a la posición inicial, sin mover los hombros.

Consejo como Entrenador:

Los codos se mantienen fijos y apuntando al techo durante todo el movimiento -- solo se mueve el antebrazo.

Empezá con poco peso hasta controlar bien la trayectoria de la barra cerca de la cabeza.

Si sentís molestia en el codo, probá bajar la barra detrás de la cabeza en vez de hacia la frente, o reducí el rango de movimiento.',
  'aislado', false
where not exists (select 1 from public.exercise_definitions where nombre = 'Press francés con barra EZ');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'Pájaro con polea unilateral', 'Torso', null,
  'Paso inicial: Parate al lado de una polea baja, tomá la manija con la mano contraria al lado de la polea (cruzando el brazo por delante del cuerpo).

Posición inicial: Inclina levemente el torso hacia adelante, con el brazo extendido y una ligera flexión de codo.

Movimiento: Exhalá y llevá el brazo hacia atrás y hacia afuera, en forma de arco, hasta la altura del hombro, sintiendo el trabajo en la parte posterior del hombro.

Contracción: Apretá el deltoides posterior un instante en el punto más alto.

Regreso: Inhalá y volvé el brazo a la posición inicial de forma controlada.

Consejo como Entrenador:

Mantené el codo con la misma flexión leve durante todo el movimiento, sin convertirlo en un remo.

Usá un peso liviano -- es un ejercicio de aislamiento para una zona chica del hombro.

Completá las repeticiones de un brazo antes de cambiar al otro lado.',
  'aislado', true
where not exists (select 1 from public.exercise_definitions where nombre = 'Pájaro con polea unilateral');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'Abducción de cadera en polea', 'Legs', null,
  'Paso inicial: Enganchá un cabestrillo para tobillo a una polea baja y colocátelo en el tobillo de la pierna que va a trabajar. Parate de costado a la máquina, sosteniéndote del marco para mantener el equilibrio.

Posición inicial: Parate erguido, con el core activado y el peso apoyado en la pierna que no trabaja.

Movimiento: Exhalá y llevá la pierna enganchada hacia afuera, alejándola del cuerpo, sin inclinar el torso para "ayudar" el movimiento.

Contracción: Apretá el glúteo medio un instante en el punto más alto del movimiento.

Regreso: Inhalá y volvé la pierna a la posición inicial de forma controlada, sin dejar que el peso tire de golpe.

Consejo como Entrenador:

Mantené el torso lo más quieto posible -- el movimiento tiene que salir de la cadera, no de una inclinación del cuerpo.

Es un ejercicio de aislamiento, no hace falta mucho peso para sentirlo bien.

Completá las repeticiones de una pierna antes de cambiar de lado.',
  'aislado', true
where not exists (select 1 from public.exercise_definitions where nombre = 'Abducción de cadera en polea');

insert into public.exercise_definitions
  (nombre, categoria, imagen_url, como_hacerlo, tipo_esfuerzo, unilateral)
select 'Extensión de tríceps sobre la cabeza en polea', 'Push', null,
  'Paso inicial: Colocá una cuerda en una polea alta y dale la espalda a la máquina, dando un paso adelante para generar tensión en el cable.

Posición inicial: Sostené la cuerda con ambas manos detrás de la cabeza, con los codos flexionados apuntando hacia el techo.

Movimiento: Exhalá y extendé los codos llevando la cuerda hacia adelante y arriba, sin mover los hombros ni los codos de su posición.

Contracción: Apretá el tríceps un instante en la extensión completa.

Regreso: Inhalá y volvé a flexionar los codos de forma controlada, dejando que la cuerda baje detrás de la cabeza.

Consejo como Entrenador:

Los codos se mantienen fijos y apuntando hacia arriba durante todo el ejercicio -- solo se mueve el antebrazo.

Dar un paso adelante ayuda a mantener tensión constante en el cable durante todo el recorrido.

Si sentís que se te abren los codos hacia los costados, bajá el peso.',
  'aislado', false
where not exists (select 1 from public.exercise_definitions where nombre = 'Extensión de tríceps sobre la cabeza en polea');

-- ============ RUTINA: KRAKEN SPLIT (privada) ============
insert into public.routines (nombre, descripcion, dias, es_privada)
select 'Kraken Split', 'Upper/Lower de 5 días con bloque de énfasis de hombros y brazos -- rutina personal', 5, true
where not exists (select 1 from public.routines where nombre = 'Kraken Split');

-- ---- DÍA A: Upper A (pesado) ----
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Kraken Split'), 'A', 1,
  (select id from public.exercise_definitions where nombre = 'Press inclinado en máquina Smith'), '4 x 5-8'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Kraken Split' and re.dia = 'A' and re.orden = 1);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Kraken Split'), 'A', 2,
  (select id from public.exercise_definitions where nombre = 'Remo con barra parado'), '4 x 6-8'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Kraken Split' and re.dia = 'A' and re.orden = 2);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Kraken Split'), 'A', 3,
  (select id from public.exercise_definitions where nombre = 'Press de hombro en maquina Smith'), '3 x 6-10'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Kraken Split' and re.dia = 'A' and re.orden = 3);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Kraken Split'), 'A', 4,
  (select id from public.exercise_definitions where nombre = 'Dominadas lastradas'), '3 x 6-10'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Kraken Split' and re.dia = 'A' and re.orden = 4);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Kraken Split'), 'A', 5,
  (select id from public.exercise_definitions where nombre = 'Curl con barra EZ'), '3 x 8-12'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Kraken Split' and re.dia = 'A' and re.orden = 5);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Kraken Split'), 'A', 6,
  (select id from public.exercise_definitions where nombre = 'Extensión de tríceps en polea'), '3 x 10-15'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Kraken Split' and re.dia = 'A' and re.orden = 6);

-- ---- DÍA B: Lower A (pesado) ----
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Kraken Split'), 'B', 1,
  (select id from public.exercise_definitions where nombre = 'Sentadillas'), '4 x 5-8'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Kraken Split' and re.dia = 'B' and re.orden = 1);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Kraken Split'), 'B', 2,
  (select id from public.exercise_definitions where nombre = 'Hiperextensiones'), '3 x 10-15'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Kraken Split' and re.dia = 'B' and re.orden = 2);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Kraken Split'), 'B', 3,
  (select id from public.exercise_definitions where nombre = 'Cuádriceps en prensa'), '3 x 10-15'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Kraken Split' and re.dia = 'B' and re.orden = 3);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Kraken Split'), 'B', 4,
  (select id from public.exercise_definitions where nombre = 'Curl femoral tumbado unilateral'), '3 x 10-15 por pierna'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Kraken Split' and re.dia = 'B' and re.orden = 4);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Kraken Split'), 'B', 5,
  (select id from public.exercise_definitions where nombre = 'Elevación de talón sentado con mancuerna'), '4 x 10-15'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Kraken Split' and re.dia = 'B' and re.orden = 5);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Kraken Split'), 'B', 6,
  (select id from public.exercise_definitions where nombre = 'Plancha con lastre'), '3 x 30-45 seg'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Kraken Split' and re.dia = 'B' and re.orden = 6);

-- ---- DÍA C: Upper B (volumen/estiramiento) ----
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Kraken Split'), 'C', 1,
  (select id from public.exercise_definitions where nombre = 'Press banca en Smith'), '4 x 8-12'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Kraken Split' and re.dia = 'C' and re.orden = 1);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Kraken Split'), 'C', 2,
  (select id from public.exercise_definitions where nombre = 'Jalón lateral con polea a un brazo'), '4 x 10-15'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Kraken Split' and re.dia = 'C' and re.orden = 2);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Kraken Split'), 'C', 3,
  (select id from public.exercise_definitions where nombre = 'Aperturas con mancuernas'), '3 x 12-20'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Kraken Split' and re.dia = 'C' and re.orden = 3);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Kraken Split'), 'C', 4,
  (select id from public.exercise_definitions where nombre = 'Elevacion lateral con mancuernas'), '4 x 12-20 + dropset final'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Kraken Split' and re.dia = 'C' and re.orden = 4);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Kraken Split'), 'C', 5,
  (select id from public.exercise_definitions where nombre = 'Curl de bíceps en banco inclinado con mancuernas'), '3 x 10-15'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Kraken Split' and re.dia = 'C' and re.orden = 5);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Kraken Split'), 'C', 6,
  (select id from public.exercise_definitions where nombre = 'Press francés con barra EZ'), '3 x 10-15'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Kraken Split' and re.dia = 'C' and re.orden = 6);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Kraken Split'), 'C', 7,
  (select id from public.exercise_definitions where nombre = 'Pájaro con polea unilateral'), '3 x 15-20'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Kraken Split' and re.dia = 'C' and re.orden = 7);

-- ---- DÍA D: Lower B (volumen) ----
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Kraken Split'), 'D', 1,
  (select id from public.exercise_definitions where nombre = 'Estocada búlgara en el banco'), '3-4 x 8-12 por pierna'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Kraken Split' and re.dia = 'D' and re.orden = 1);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Kraken Split'), 'D', 2,
  (select id from public.exercise_definitions where nombre = 'Empuje de caderas'), '3 x 8-12'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Kraken Split' and re.dia = 'D' and re.orden = 2);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Kraken Split'), 'D', 3,
  (select id from public.exercise_definitions where nombre = 'Extensión de cuádriceps'), '3 x 12-20 (parciales en estiramiento al final)'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Kraken Split' and re.dia = 'D' and re.orden = 3);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Kraken Split'), 'D', 4,
  (select id from public.exercise_definitions where nombre = 'Curl femoral tumbado unilateral'), '3 x 12-15 por pierna'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Kraken Split' and re.dia = 'D' and re.orden = 4);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Kraken Split'), 'D', 5,
  (select id from public.exercise_definitions where nombre = 'Elevación de talón en máquina Smith'), '4 x 12-20'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Kraken Split' and re.dia = 'D' and re.orden = 5);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Kraken Split'), 'D', 6,
  (select id from public.exercise_definitions where nombre = 'Abducción de cadera en polea'), '3 x 15-25'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Kraken Split' and re.dia = 'D' and re.orden = 6);

-- ---- DÍA E: Hombros + Brazos (bloque de énfasis) ----
insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Kraken Split'), 'E', 1,
  (select id from public.exercise_definitions where nombre = 'Elevacion lateral con mancuernas'), '4 x 12-20'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Kraken Split' and re.dia = 'E' and re.orden = 1);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Kraken Split'), 'E', 2,
  (select id from public.exercise_definitions where nombre = 'Press militar con mancuernas'), '3 x 8-12'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Kraken Split' and re.dia = 'E' and re.orden = 2);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Kraken Split'), 'E', 3,
  (select id from public.exercise_definitions where nombre = 'Pájaro con polea unilateral'), '4 x 15-25'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Kraken Split' and re.dia = 'E' and re.orden = 3);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Kraken Split'), 'E', 4,
  (select id from public.exercise_definitions where nombre = 'Curl martillo con mancuernas sentado'), '3 x 10-15'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Kraken Split' and re.dia = 'E' and re.orden = 4);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Kraken Split'), 'E', 5,
  (select id from public.exercise_definitions where nombre = 'Curl en polea a un brazo en banco Scott'), '3 x 10-15'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Kraken Split' and re.dia = 'E' and re.orden = 5);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Kraken Split'), 'E', 6,
  (select id from public.exercise_definitions where nombre = 'Fondos en paralelas'), '3 x 8-12'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Kraken Split' and re.dia = 'E' and re.orden = 6);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Kraken Split'), 'E', 7,
  (select id from public.exercise_definitions where nombre = 'Extensión de tríceps sobre la cabeza en polea'), '3 x 12-20'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Kraken Split' and re.dia = 'E' and re.orden = 7);

insert into public.routine_exercises (routine_id, dia, orden, exercise_definition_id, series_reps)
select (select id from public.routines where nombre = 'Kraken Split'), 'E', 8,
  (select id from public.exercise_definitions where nombre = 'Encogimiento de hombros con barra'), '3 x 10-15'
where not exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where r.nombre = 'Kraken Split' and re.dia = 'E' and re.orden = 8);

-- ============ ACCESO EXCLUSIVO A LA CUENTA DEL COACH ============
insert into public.profile_routine_access (user_id, routine_id)
select u.id, r.id
from auth.users u, public.routines r
where u.email = 'ezequiel.arce@outlook.com' and r.nombre = 'Kraken Split'
on conflict (user_id, routine_id) do nothing;

-- cierra la rutina activa anterior (si había una abierta) y abre "Kraken Split".
update public.profile_routine_history
set fecha_fin = current_date
where user_id = (select id from auth.users where email = 'ezequiel.arce@outlook.com')
  and fecha_fin is null;

insert into public.profile_routine_history (user_id, routine_id, fecha_inicio)
select u.id, r.id, current_date
from auth.users u, public.routines r
where u.email = 'ezequiel.arce@outlook.com' and r.nombre = 'Kraken Split'
on conflict do nothing;

update public.profiles
set routine_id = (select id from public.routines where nombre = 'Kraken Split')
where id = (select id from auth.users where email = 'ezequiel.arce@outlook.com');

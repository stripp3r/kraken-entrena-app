-- Migración 040: presta el video de un ejercicio "hermano" a otro que no
-- tiene uno propio, cuando el patrón de movimiento es prácticamente el
-- mismo y solo cambia el equipo (ej. barra vs. máquina Smith). No es un
-- match perfecto, pero la explicación técnica de fondo sigue siendo válida
-- -- decisión explícita del usuario de preferir esto a dejarlo sin nada.
--
-- No pisa ningún video_url ya cargado (por las dudas).

update exercise_definitions target
set video_url = (select video_url from exercise_definitions where nombre = 'Press banco plano con barra'),
    video_url_fem = (select video_url_fem from exercise_definitions where nombre = 'Press banco plano con barra')
where target.nombre = 'Press banca en Smith' and target.video_url is null;

update exercise_definitions target
set video_url = (select video_url from exercise_definitions where nombre = 'Chin up agarre abierto'),
    video_url_fem = (select video_url_fem from exercise_definitions where nombre = 'Chin up agarre abierto')
where target.nombre = 'Dominadas lastradas' and target.video_url is null;

update exercise_definitions target
set video_url = (select video_url from exercise_definitions where nombre = 'Curl de bíceps con mancuerna parado'),
    video_url_fem = (select video_url_fem from exercise_definitions where nombre = 'Curl de bíceps con mancuerna parado')
where target.nombre = 'Curl con barra EZ' and target.video_url is null;

update exercise_definitions target
set video_url = (select video_url from exercise_definitions where nombre = 'Extensión de tríceps inclinada con barra EZ'),
    video_url_fem = (select video_url_fem from exercise_definitions where nombre = 'Extensión de tríceps inclinada con barra EZ')
where target.nombre = 'Press francés con barra EZ' and target.video_url is null;

update exercise_definitions target
set video_url = (select video_url from exercise_definitions where nombre = 'Curl femoral'),
    video_url_fem = (select video_url_fem from exercise_definitions where nombre = 'Curl femoral')
where target.nombre = 'Curl femoral unilateral en polea' and target.video_url is null;

update exercise_definitions target
set video_url = (select video_url from exercise_definitions where nombre = 'Elevación de talón parado'),
    video_url_fem = (select video_url_fem from exercise_definitions where nombre = 'Elevación de talón parado')
where target.nombre = 'Elevación de talón parado a una pierna' and target.video_url is null;

update exercise_definitions target
set video_url = (select video_url from exercise_definitions where nombre = 'Remo con mancuerna a un brazo'),
    video_url_fem = (select video_url_fem from exercise_definitions where nombre = 'Remo con mancuerna a un brazo')
where target.nombre = 'Meadows Row' and target.video_url is null;

update exercise_definitions target
set video_url = (select video_url from exercise_definitions where nombre = 'Extensión de tríceps en polea'),
    video_url_fem = (select video_url_fem from exercise_definitions where nombre = 'Extensión de tríceps en polea')
where target.nombre = 'Extensión de tríceps sobre la cabeza en polea' and target.video_url is null;

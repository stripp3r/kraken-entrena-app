-- Migración 098: corregir el ejercicio id 107.
--
-- El GIF (imagen_url) de este ejercicio muestra un PUENTE DE GLÚTEOS con una
-- pierna elevada (acostado boca arriba, una pierna estirada hacia el techo,
-- cadera arriba), no un "Fire Hydrant". El coach lo confirmó el 2026-10-13 y
-- pidió renombrarlo a lo que muestra el GIF (target: glúteo). El texto
-- `como_hacerlo` se reescribe para que coincida con el GIF.
--
-- NO se toca `video_url`: hoy apunta a un video de una patada de glúteo en
-- cuadrupedia con banda, que tampoco coincide con el GIF; queda pendiente
-- reemplazarlo cuando haya un video del puente con pierna elevada.
--
-- El id 107 no está en ninguna rutina (routine_exercises) al 2026-10-13.
-- Es un UPDATE con WHERE por id: no destructivo.

update public.exercise_definitions
set
  nombre = 'Puente de glúteos con una pierna elevada',
  como_hacerlo = E'Paso inicial: Acostate boca arriba con las rodillas flexionadas y los pies apoyados en el piso, a la altura de la cadera. Los brazos quedan a los costados del cuerpo, con las palmas hacia abajo.\r\n\r\nPosición inicial: Estirá una pierna y llevala hacia el techo, manteniéndola recta. La otra pierna queda con el pie firme en el piso: es la que va a trabajar.\r\n\r\nMovimiento: Exhalá, empujá el talón del pie apoyado contra el piso y subí la cadera hasta que el cuerpo forme una línea recta desde los hombros hasta la rodilla de la pierna apoyada.\r\n\r\nContracción: Apretá el glúteo de la pierna apoyada un instante en el punto más alto, sin arquear la espalda baja.\r\n\r\nRegreso: Inhalá y bajá la cadera de forma controlada, sin apoyar del todo en el piso antes de la siguiente repetición.\r\n\r\nConsejo como Entrenador:\r\n\r\nLa pierna elevada no tiene que ayudar: mantené la cadera nivelada, sin que se caiga hacia el lado de la pierna que está en el aire.\r\n\r\nSi sentís el trabajo en la parte baja de la espalda o en el isquiotibial, acercá un poco el pie a la cadera y concentrate en empujar con el talón.\r\n\r\nCompletá todas las repeticiones de una pierna antes de cambiar a la otra.'
where id = 107;

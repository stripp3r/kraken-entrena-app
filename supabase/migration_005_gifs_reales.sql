-- Migracion 005: conecta los 4 ejercicios de prueba con su GIF real
-- (subido a Supabase Storage) y el texto real de 'como hacerlo'
-- (extraido de la carpeta TECNICAS DE EJERCICIOS del usuario).

update public.exercises set
  imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/oie_mcSLHgAKN3NO.gif',
  como_hacerlo = 'Paso Inicial: Coloca un banco ajustable en posición vertical y asegúrate de que esté bien firme. Ajusta el respaldo a una posición casi vertical, dale un poco de ángulo.

Posición Corporal: Siéntate en el banco con la espalda bien apoyada contra el respaldo y los pies planos en el suelo, separados al ancho de los hombros.

Movimiento y Empuje: Sujeta una mancuerna en cada mano. Mantén los codos doblados en un ángulo de 90 grados, de manera que las mancuernas estén alineadas con tus hombros y orejas, y las palmas de las manos mirando hacia adelante. Contrae los músculos de los hombros y presiona las mancuernas hacia arriba, extendiendo completamente los brazos sin bloquear las articulaciones. Mantén una buena postura y asegúrate de que tus manos queden directamente sobre tus hombros.

Regreso: Lentamente, baja las mancuernas de vuelta a la posición inicial, doblando los codos. Controla el movimiento y evita que las mancuernas choquen en la parte superior de tu pecho.

Consejo como Entrenador:

Mantén una técnica adecuada y evita arquear la espalda o balancear el cuerpo para ayudarte a levantar las mancuernas. Utiliza la fuerza de tus hombros para realizar el movimiento.

Ajusta el peso de las mancuernas de acuerdo a tu nivel de fuerza y capacidad. Comienza con un peso que puedas manejar cómodamente y aumenta gradualmente a medida que te vuelvas más fuerte.

Realiza el ejercicio de manera controlada y evita hacer movimientos bruscos o impulsivos que puedan causar lesiones.

Respira de manera constante: exhala al empujar las mancuernas hacia arriba y inhala al bajarlas.

Este ejercicio puede ser parte de una rutina de entrenamiento de hombros más amplia. Asegúrate de calentar adecuadamente antes de comenzar y estirar después para evitar lesiones y mejorar la flexibilidad de los hombros.'
where nombre = 'Press militar con mancuernas';

update public.exercises set
  imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/oie_fOcomy0tNqAR.gif',
  como_hacerlo = 'Paso Inicial: Comienza de pie y de costado frente a una polea baja con un mango de cable en una mano.

Posición Corporal: Separa los pies a la altura de los hombros para mantener el equilibrio. Mantén la espalda recta y los abdominales contraídos. La mano que sostiene el mango debe estar en el costado del cuerpo, y el brazo ligeramente flexionado.

Movimiento: Levanta el brazo con el mango hacia el lado, manteniendo el codo ligeramente flexionado. El movimiento debe ser lateral, no hacia adelante ni hacia atrás. Levanta el brazo hasta que esté paralelo al suelo o a la altura de los hombros. Mantén la muñeca en una posición neutra (recta) durante todo el movimiento.

Regreso: Baja el brazo de manera controlada a la posición inicial.

Consejo como entrenador:

Controla el peso y evita usar un peso excesivo que te haga perder la forma adecuada.

Mantén el movimiento suave y controlado en lugar de hacerlo rápido.

No hagas trampa inclinando el cuerpo en exceso; trata de mantenerlo en posición vertical.

Exhala mientras levantas el peso y mantén una respiración constante.'
where nombre = 'Vuelo lateral con polea';

update public.exercises set
  imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/oie_IyAHEbFZx2KO.gif',
  como_hacerlo = 'Paso inicial: Comienza de pie con los pies a la altura de los hombros y una mancuerna en una mano. La otra mano debe descansar en tu cadera.

Posición corporal: Mantén la espalda recta y los hombros relajados.

Movimiento: Con la mancuerna en la mano, levanta el brazo hacia el lado. El movimiento debe ser lateral, de manera que el brazo esté paralelo al suelo. Mantén el brazo ligeramente flexionado en el codo.

Empuje: Eleva la mancuerna utilizando principalmente la fuerza de tu hombro. Debes sentir cómo trabajan los músculos del hombro para elevar el brazo.

Regreso: Luego, baja el brazo de manera controlada, volviendo a la posición inicial.

Consejo como Entrenador:

Controla el movimiento en todo momento para evitar balanceos o movimientos bruscos. Mantén un ritmo constante y concéntrate en sentir la tensión en los músculos del hombro durante todo el ejercicio.

No utilices una mancuerna demasiado pesada al principio. Es importante dominar la técnica antes de aumentar el peso.

Realiza el ejercicio de manera simétrica, trabajando ambos lados de manera equitativa.'
where nombre = 'Vuelo lateral con mancuerna a un brazo';

update public.exercises set
  imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/oie_6XNNBnRjlp0Y.gif',
  como_hacerlo = 'Paso inicial: Colócate entre las barras paralelas con las manos agarrando cada barra, los brazos extendidos y los pies ligeramente separados.

Posición corporal: Mantén el cuerpo erguido, las piernas estiradas hacia adelante y los pies cruzados. Inclina ligeramente el torso hacia adelante para enfocar el trabajo en los tríceps.

Movimiento: Flexiona los brazos lentamente y baja el cuerpo hacia abajo manteniendo los codos cerca del cuerpo. Desciende hasta que tus brazos estén paralelos al suelo o un poco más abajo.

Empuje: Desde la posición más baja, empuja el cuerpo hacia arriba extendiendo los brazos y volviendo a la posición inicial. Mantén los músculos de los tríceps activos durante todo el movimiento.

Consejo como entrenador:

Asegúrate de mantener una técnica adecuada durante todo el ejercicio.

Evita balancear el cuerpo o arquear la espalda. Mantén una respiración controlada y no bloquees los codos al extender los brazos.'
where nombre = 'Fondos en paralelas';

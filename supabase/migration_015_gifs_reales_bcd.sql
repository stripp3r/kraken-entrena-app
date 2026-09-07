-- Migracion 015: reemplaza las imagenes estaticas (inicio/fin) de la migracion
-- 014 por los GIFs animados reales y correctos de cada ejercicio de los dias
-- B, C y D, verificados visualmente contra la imagen de referencia del Excel
-- por dos agentes de revision independientes (uno para A/B, otro para C/D).
-- Dia A no se toca: sus 8 GIFs (4 principales + 4 alternativas) ya existentes
-- fueron re-verificados y confirmados correctos, sin necesidad de cambios.
--
-- 3 excepciones que no existian como GIF en la libreria de recursos y que el
-- usuario consiguio/agrego el mismo (Press inclinado en Smith, Elevacion de
-- talon en Smith, Encogimiento de hombros con mancuernas) tambien se resuelven
-- aca con los GIFs que agrego.
--
-- El GIF de Press inclinado en Smith que agrego el usuario era de menor
-- resolucion (180x180) que el resto (360x360+); se reescalo a 360x360 con
-- filtro Lanczos preservando los 12 frames y el timing original antes de
-- subirlo, para que no se note mas chico/pixelado que los demas.

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/gif-remo-polea-baja-un-brazo-sentado.gif'
where nombre = 'Remo en polea baja a un brazo sentado';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/gif-remo-maquina-sentado.gif'
where nombre = 'Remo en máquina sentado';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/gif-jalon-lateral-polea-un-brazo.gif'
where nombre = 'Jalón lateral con polea a un brazo';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/gif-dorsales-maquina.gif'
where nombre = 'Dorsales en máquina';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/gif-curl-femoral.gif'
where nombre = 'Curl femoral';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/gif-curl-femoral-sentado.gif'
where nombre = 'Curl femoral sentado';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/gif-hiperextensiones.gif'
where nombre = 'Hiperextensiones';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/gif-peso-muerto-rumano.gif'
where nombre = 'Peso muerto rumano';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/gif-curl-biceps-banco-inclinado-mancuernas.gif'
where nombre = 'Curl de bíceps en banco inclinado con mancuernas';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/gif-curl-biceps-mancuerna-parado.gif'
where nombre = 'Curl de bíceps con mancuerna parado';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/gif-curl-polea-un-brazo-banco-scott.gif'
where nombre = 'Curl en polea a un brazo en banco Scott';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/gif-biceps-banco-scott.gif'
where nombre = 'Bíceps en banco Scott';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/gif-press-inclinado-smith-v2.gif'
where nombre = 'Press inclinado en máquina Smith';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/gif-flexiones-de-brazos.gif'
where nombre = 'Flexiones de brazos';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/gif-press-banco-mancuernas.gif'
where nombre = 'Press de banco con mancuernas';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/gif-encogimiento-hombros-mancuernas.gif'
where nombre = 'Encogimiento de hombros con mancuernas';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/gif-encogimiento-hombros-barra.gif'
where nombre = 'Encogimiento de hombros con barra';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/gif-remo-maquina-t.gif'
where nombre = 'Remo en máquina T (landmine)';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/gif-remo-barra-parado.gif'
where nombre = 'Remo con barra parado';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/gif-remo-mancuerna-un-brazo.gif'
where nombre = 'Remo con mancuerna a un brazo';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/gif-remo-arrodillado-polea-alta.gif'
where nombre = 'Remo arrodillado en polea alta';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/gif-face-pull.gif'
where nombre = 'Face pull';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/gif-deltoides-posteriores-banco-inclinado-mancuernas.gif'
where nombre = 'Deltoides posteriores en banco inclinado con mancuernas';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/gif-press-banco-plano-barra.gif'
where nombre = 'Press banco plano con barra';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/gif-extension-cuadriceps.gif'
where nombre = 'Extensión de cuádriceps';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/gif-cuadriceps-prensa.gif'
where nombre = 'Cuádriceps en prensa';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/gif-sentadillas.gif'
where nombre = 'Sentadillas';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/gif-sentadilla-smith.gif'
where nombre = 'Sentadilla en máquina Smith';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/gif-estocada-bulgara-banco.gif'
where nombre = 'Estocada búlgara en el banco';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/gif-estocadas.gif'
where nombre = 'Estocadas';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/gif-sentadilla-sissy.gif'
where nombre = 'Sentadilla sissy';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/gif-sentadilla-isometrica.gif'
where nombre = 'Sentadilla isométrica';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/gif-elevacion-talon-smith.gif'
where nombre = 'Elevación de talón en máquina Smith';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/gif-elevacion-talon-parado.gif'
where nombre = 'Elevación de talón parado';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/gif-elevacion-talon-parado-1-pierna.gif'
where nombre = 'Elevación de talón parado a una pierna';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/gif-elevacion-talon-sentado-mancuerna.gif'
where nombre = 'Elevación de talón sentado con mancuerna';

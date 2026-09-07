-- Migracion 014: reemplaza las imagenes de los dias B/C/D por las imagenes
-- reales y correctas extraidas directamente del Excel original (hoja Hoja2,
-- columnas INICIO/FIN con rich-data image-in-cell), compuestas en una sola
-- imagen inicio+fin por ejercicio. Corrige errores de la migracion 013, donde
-- algunos GIFs se habian elegido por coincidencia de nombre de carpeta y no
-- coincidian con el ejercicio real (ej: jalon lateral, press inclinado en Smith).

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/remo-polea-baja-un-brazo-sentado-real.png'
where nombre = 'Remo en polea baja a un brazo sentado';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/remo-maquina-sentado-real.png'
where nombre = 'Remo en máquina sentado';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/jalon-lateral-polea-un-brazo-real.png'
where nombre = 'Jalón lateral con polea a un brazo';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/dorsales-maquina-real.png'
where nombre = 'Dorsales en máquina';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/curl-femoral-real.png'
where nombre = 'Curl femoral';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/curl-femoral-sentado-real.png'
where nombre = 'Curl femoral sentado';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/hiperextensiones-real.png'
where nombre = 'Hiperextensiones';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/peso-muerto-rumano-real.png'
where nombre = 'Peso muerto rumano';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/curl-biceps-banco-inclinado-mancuernas-real.png'
where nombre = 'Curl de bíceps en banco inclinado con mancuernas';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/curl-biceps-mancuerna-parado-real.png'
where nombre = 'Curl de bíceps con mancuerna parado';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/curl-polea-un-brazo-banco-scott-real.png'
where nombre = 'Curl en polea a un brazo en banco Scott';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/biceps-banco-scott-real.png'
where nombre = 'Bíceps en banco Scott';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/press-inclinado-smith-real.png'
where nombre = 'Press inclinado en máquina Smith';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/press-banco-plano-barra-real.png'
where nombre = 'Press banco plano con barra';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/flexiones-de-brazos-real.png'
where nombre = 'Flexiones de brazos';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/press-banco-mancuernas-real.png'
where nombre = 'Press de banco con mancuernas';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/encogimiento-hombros-mancuernas-real.png'
where nombre = 'Encogimiento de hombros con mancuernas';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/encogimiento-hombros-barra-real.png'
where nombre = 'Encogimiento de hombros con barra';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/remo-maquina-t-real.png'
where nombre = 'Remo en máquina T (landmine)';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/remo-barra-parado-real.png'
where nombre = 'Remo con barra parado';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/remo-mancuerna-un-brazo-real.png'
where nombre = 'Remo con mancuerna a un brazo';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/remo-arrodillado-polea-alta-real.png'
where nombre = 'Remo arrodillado en polea alta';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/face-pull-real.png'
where nombre = 'Face pull';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/deltoides-posteriores-banco-inclinado-mancuernas-real.png'
where nombre = 'Deltoides posteriores en banco inclinado con mancuernas';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/extension-cuadriceps-real.png'
where nombre = 'Extensión de cuádriceps';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/cuadriceps-prensa-real.png'
where nombre = 'Cuádriceps en prensa';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/sentadillas-real.png'
where nombre = 'Sentadillas';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/sentadilla-smith-real.png'
where nombre = 'Sentadilla en máquina Smith';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/estocada-bulgara-banco-real.png'
where nombre = 'Estocada búlgara en el banco';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/estocadas-real.png'
where nombre = 'Estocadas';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/sentadilla-sissy-real.png'
where nombre = 'Sentadilla sissy';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/sentadilla-isometrica-real.png'
where nombre = 'Sentadilla isométrica';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/elevacion-talon-smith-real.png'
where nombre = 'Elevación de talón en máquina Smith';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/elevacion-talon-parado-real.png'
where nombre = 'Elevación de talón parado';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/elevacion-talon-parado-1-pierna-real.png'
where nombre = 'Elevación de talón parado a una pierna';

update public.exercises
set imagen_url = 'https://wqwbnxrzcwxytjnanmwz.supabase.co/storage/v1/object/public/ejercicios/elevacion-talon-sentado-mancuerna-real.png'
where nombre = 'Elevación de talón sentado con mancuerna';

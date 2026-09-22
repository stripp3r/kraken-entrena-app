@AGENTS.md

# KRAKEN Entrena — memoria del proyecto

Este archivo se carga solo al empezar cada sesión acá. Es la fuente de
verdad sobre decisiones ya tomadas y convenciones establecidas -- no
"corregir" nada de lo que sigue sin preguntarle antes al usuario (el coach,
Ezequiel). Si algo de esto queda desactualizado, avisar y actualizar este
archivo, no solo arreglarlo una vez y dejar que se repita el error.

## Regla fija: mantener este documento actualizado, siempre, en el momento

El usuario pidió explícitamente que este archivo funcione como reglamento
vivo del proyecto -- la base para no repetir errores ni perder criterios
ya definidos, pase lo que pase con la memoria de la conversación.

**Cada vez que pase algo de esto, hay que sumarlo (o corregirlo) ACÁ
MISMO, en el momento, no "después" ni "si me acuerdo":**
- El usuario corrige algo que hice mal, o rechaza un enfoque.
- El usuario confirma/define un criterio, convención o decisión de negocio
  nueva (aunque sea chica).
- Se descubre un bug o una limitación real de una herramienta/plataforma
  (ej. el bug de tildes en Supabase Storage, las limitaciones de PWA en
  iOS/Samsung Internet) -- documentarlo apenas se confirma, no al final de
  la sesión.
- Se toma una decisión de arquitectura o se establece un patrón de código
  nuevo que otras pantallas/features deberían seguir.

No hace falta preguntarle al usuario si hay que anotarlo -- se anota
directo, como parte natural de resolver lo que sea que esté pasando en ese
momento. Preferir agregarlo bajo la sección que ya existe más parecida
(Modelo de datos / Decisiones de negocio / Convenciones de código / Qué NO
hacer) antes que crear una sección nueva suelta.

## Qué es esto

PWA (Progressive Web App) de entrenamiento -- reemplaza un Excel
(`EntrenaOptimo`) que el coach usaba para dar rutinas online. Clientes
reales ya la están usando.

- **Repo**: `D:\PROYECTO FITNESS\APP\kraken-entrena-app`
- **Deploy**: Vercel, producción en `https://kraken-entrena-app.vercel.app`
- **Stack**: Next.js 16 (App Router) + TypeScript + Tailwind CSS,
  Supabase (Postgres + Auth + Storage), rutas API de Next
  (`src/app/api/...`) para checkout/webhooks -- sin backend propio aparte.
- **Proyecto hermano** (repo distinto, no tocar desde acá salvo que se pida
  explícitamente): sitio de marketing en
  `D:\PROYECTO FITNESS\WEB SITE\NUEVO SITIO WEB` (HTML/CSS/JS estático,
  Vercel aparte), vende los mismos planes/Golden/mentoría por fuera de la
  app.
- Hay una sesión de **Codex** corriendo diagnósticos en paralelo sobre este
  mismo repo. `CODEX_BRIEFING.md` (raíz del repo, NO commiteado a propósito)
  es el handoff que el usuario le comparte a mano -- mantenerlo actualizado
  cuando cambien cosas importantes.
- **División de trabajo entre chats (aclarado 2026-09-21)**: hay OTRO chat
  de Claude Code, separado de este, que el usuario usa exclusivamente para
  dar de alta clientes de mentoría puntuales (le pasa un PDF/texto y ese
  chat le carga la rutina + el PDF de guía alimenticia a ESE cliente). Todo
  lo demás -- construir la app, mantener el catálogo de `exercise_definitions`
  (deduplicar, completar, corregir GIFs), features nuevas -- se hace ACÁ.
  No asumir que "cargar contenido" es trabajo del otro chat sin preguntar
  primero; el otro chat es específicamente para eso, nada más.

## Estructura de carpetas relevante

```
src/
  app/                      -- rutas (App Router). Cada carpeta = una pantalla.
    entrenamiento/          -- hub de entrenar, rutinas, cardio
    progreso/               -- analíticas (entrenamiento, medidas, salud, historial)
    perfil/                 -- datos personales, recursos (PDFs)
    alimentacion/           -- calculadora de calorías (Golden) + guía (Mentoría)
    golden/                 -- venta de Golden
    api/checkout/           -- Mercado Pago / PayPal (Golden + productos sueltos)
    api/webhooks/           -- confirman pagos, acreditan acceso
  components/               -- componentes de UI, casi todos "use client"
  lib/                      -- lógica pura sin UI: fecha.ts, premium.ts, analytics.ts,
                               salud.ts, contextura.ts, nutricion.ts, mercadopago.ts,
                               paypal.ts, compras.ts, sonido.ts, sesion-entrenamiento.ts,
                               ultima-pantalla.ts
supabase/
  schema.sql                -- esquema base original
  migration_001..048.sql    -- TODAS las migraciones desde el inicio, en orden.
                               NO se aplican solas. El coach las corre a mano en
                               el SQL Editor de Supabase, una por una, en orden
                               numérico. Un cambio de esquema nuevo SIEMPRE sale
                               como un migration_0XX.sql nuevo (siguiente número
                               libre), nunca editando uno viejo ya corrido.
public/section-icons/        -- íconos de cada sección/hub, PNG 160x160 transparentes
```

Carpetas sueltas en la raíz del repo tipo `gifs-*/`, `videos-*/` son
**staging temporal** para que el coach suba archivos a Supabase Storage a
mano vía Dashboard -- no son parte del código, no hace falta commitearlas
(y de hecho no están en git), se pueden borrar una vez subido su contenido.

## Modelo de datos (lo esencial)

- `profiles`: datos del usuario + acceso. Campos clave: `premium_hasta`
  (fecha), `golden_perpetuo` (bool), `premium_origen`
  ('trial'|'compra'|'golden'|'mentoria'). **`src/lib/premium.ts` es la
  única fuente de verdad para esto** -- nunca reimplementar esta lógica
  inline en una pantalla:
  - `esPremium(p)`: acceso vigente a la app (cualquier origen).
  - `esGoldenTier(p)`: Golden en sentido amplio -- golden_perpetuo O
    premium_origen golden/mentoria. Usar para gates "todo lo que da
    Golden" (rutinas públicas, calculadora de calorías).
  - `esMentoria(p)`: SOLO premium_origen = 'mentoria'. Más estricto que
    esGoldenTier -- usar solo para beneficios exclusivos de mentoría (ej.
    Guía alimenticia). Un Golden comprado normal NO pasa este check.
  - `diasRestantesTrial(p)`, `obtenerSuscripcion(p, sub)`: para mostrar el
    badge de estado en Inicio/Perfil.
- `exercise_definitions`: ejercicio canónico y reutilizable (nombre,
  categoria, imagen_url, video_url, video_url_fem, como_hacerlo,
  tipo_esfuerzo, unilateral, alternativa_id). Un mismo ejercicio (ej.
  "Sentadillas") se reutiliza entre rutinas distintas para no cortar el
  historial de fuerza de ese movimiento. Categorías usadas: Legs, Pull,
  Push, Torso (así, sin categoría separada para abdominales/glúteos --
  van dentro de Legs).
- `routine_exercises`: la fila de "scheduling" (qué ejercicio, qué día,
  en qué orden, con qué `series_reps` sugeridas tipo "4 x 8-12") dentro de
  una rutina. Apunta a `exercise_definitions` por FK.
- `routines`: puede ser pública o **privada** (`es_privada = true`). Una
  rutina privada exige una fila en `profile_routine_access` SIN IMPORTAR
  si la cuenta es premium -- así se protegen tanto rutinas a medida
  (mentoría, ej. "Kraken Split") como planes pagos específicos (ej.
  "Grasa Sub-Cero") que no deben quedar gratis para cualquier Golden.
  Rutinas públicas genéricas (los splits de 3/4/5 días del catálogo
  general) se activan libremente con solo tener `esPremium`.
- `workout_logs`: cada serie registrada (peso, reps, rir, lado, fecha) --
  keyed por `exercise_definition_id`, no por rutina, para que el progreso
  de un movimiento no se corte al cambiar de rutina.
- `profile_routine_history`: qué rutina tuvo activa cada usuario y cuándo
  (fecha_inicio/fecha_fin). El análisis de Progreso se scopea a la fecha
  de inicio del stint ACTIVO, no a toda la vida del ejercicio.
- `productos` / `compras` / `producto_rutinas`: planes sueltos (PDF +
  rutina + `MESES_ACCESO_POR_COMPRA` = 3 meses de acceso). El checkout y
  el webhook que acredita el acceso (`procesarCompraAprobada` en
  `src/lib/compras.ts`) son **100% genéricos** -- agregar un producto
  nuevo es una fila en `productos`, no código nuevo. `handle_new_user()`
  (trigger de Postgres) también reclama compras hechas ANTES de
  registrarse, dando los mismos 3 meses.
- `suscripciones`: pagos recurrentes reales de Golden (Mercado Pago o
  PayPal). Un Golden/mentoría otorgado a mano NO tiene fila acá.
- `guias_alimenticias` (migración 050): `user_id` (PK, 1 fila por usuario) +
  `pdf_storage_path` -- el PDF de guía alimenticia de un cliente de Mentoría,
  cargado a mano por el coach en el bucket privado `guias-alimenticias` y
  linkeado acá por email. Sin policy de insert/update para `authenticated`
  (mismo patrón que `profile_routine_access`). La pantalla Alimentación →
  Guía (`/alimentacion/guia`) muestra el botón de descarga si existe fila,
  si no repite el placeholder "tu coach te la va a cargar acá".

## "Crea tu rutina" (en construcción, arrancado 2026-09-21)

Feature nueva dentro de Entrenar (debajo de "Cardio", ícono
`crear-rutina.png`): el usuario arma su propio split -- días por semana (1
a 7, letras A-G), qué grupos musculares toca cada día, qué ejercicios hace,
series/reps/RIR objetivo -- y queda guardado como una rutina más que puede
activar y entrenar igual que cualquiera armada por el coach.

- **Migración 051**: agrega `routine_exercises.rir_objetivo` (numeric) y la
  tabla `routine_dias` (`routine_id`, `dia`, `grupos_musculares text[]`) +
  `routines.creada_por_usuario` (bool). 100% aditivo.
- **Grupos musculares** (`src/lib/grupos-musculares.ts`): lista fija de 10
  (Pecho, Espalda, Hombros, Bíceps, Tríceps, Cuádriceps, Isquiotibiales,
  Glúteos, Pantorrillas, Abdominales), marcados por el usuario con
  checkboxes por día. **A propósito NO se infiere de
  `exercise_definitions.categoria`** -- esa categoría (Legs/Pull/Push/
  Torso) es de scheduling, no de anatomía real ("Torso" mezcla empuje y
  tracción), el usuario mismo lo identificó como un error conceptual y no
  sirve como fuente de verdad para calcular frecuencia/recuperación.
- **Patrón de escritura**: igual que `profile_routine_access` (migración
  021) -- ninguna tabla nueva tiene policy de insert/update para
  `authenticated`. El usuario nunca escribe estas tablas directo; todo pasa
  por el server action `guardarRutinaCreada`
  (`src/app/entrenamiento/crear-rutina/actions.ts`), que arma routine +
  routine_exercises + routine_dias + profile_routine_access con el cliente
  admin (`src/lib/supabase/admin.ts`, service role) y después llama a
  `cambiarRutinaActiva()` (la función que YA existe, no una nueva) para
  activarla -- así también queda reflejada en `profile_routine_history`
  como cualquier cambio de rutina.
- **Pentágono comparativo** (`src/lib/pentagono.ts`) -- ver la sección
  **"Analizador de rutinas y pentágono (2026-09-22)"** más abajo, que
  reemplaza por completo esta descripción original (el cálculo de Volumen e
  Intensidad se reescribió, y el comparador contra otras rutinas -- que acá
  decía "descartado por ahora" -- se construyó y ya funciona).
- **Buscador de ejercicios del Paso 3**: ya no depende de que el usuario
  escriba el nombre exacto (el usuario lo marcó como algo que "va a
  fracasar" -- la mayoría no sabe qué ejercicio buscar). Es una grilla
  navegable con imágenes; la búsqueda por texto es un filtro opcional
  encima. **Ya NO filtra por `categoria`** (Legs/Pull/Push/Torso) -- el
  usuario marcó esa categoría como conceptualmente rota para este uso
  ("Torso" mezcla empuje y tracción, "una cosa incluye la otra"). Filtra
  por `exercise_definitions.grupos_musculares` (migración 052, mismo tipo
  que `routine_dias.grupos_musculares`), que **arranca vacío**. Mientras no
  esté cargado, los tabs de grupo muscular van a devolver resultados
  vacíos y solo "Todos" muestra algo -- es esperado, no un bug.

## Auditoría del catálogo de ejercicios (2026-09-21) -- en curso

Al usar "Crea tu rutina" por primera vez el usuario encontró ejercicios
duplicados y GIFs rotos/mal asignados. Se hizo una auditoría real, no a
ojo:

- **Método**: descargar el `imagen_url` de los 126 ejercicios y comparar
  por **hash MD5** (no por nombre) -- así se encuentran duplicados exactos
  sin depender de que alguien los note a simple vista. Repetible: bajar
  todos los gifs a un directorio, `md5sum *.gif`, agrupar por hash.
- **Resultado**: 15 pares con el mismo archivo exacto. 11 eran el mismo
  ejercicio con dos nombres (se fusionaron en `migration_053`, redirigiendo
  `routine_exercises`/`workout_logs` del id que se borra al que queda). Los
  otros 4 eran ejercicios DISTINTOS que compartían el gif por error (ej.
  "Giro ruso" y "Giro oblicuo acostado" tenían el mismo GIF de crunch
  genérico, no el de ninguno de los dos) -- se les buscó una imagen real y
  distinta en la biblioteca de referencia
  (`D:\PROYECTO FITNESS\VIDEOS\RECURSOS\TECNICAS DE EJERCICIOS\EJERCICIOS\<GRUPO
  MUSCULAR>\`). Además "Hack Squat" apuntaba a un archivo borrado del
  bucket (404) -- se volvió a subir.
- **Pendiente sin resolver**: "Elevación de rodillas sentado con apoyo de
  manos" sigue con el GIF de la variante de pierna recta -- no se encontró
  en la biblioteca una imagen de la variante con rodilla flexionada.
- **Fuente de verdad para qué ejercicios TIENEN que existir**: el Excel
  original `EntrenaOptimo 4 días - DEFINITIVA.xlsx`, hoja `Hoja2`
  (`G:\Mi unidad\PROGRAMA SOULVANZ\1 FISICOCULTURISMO\Ejercitacion en el
  GYM\EntrenaOptimo\Excel App\4 dias\`). El usuario fue explícito: todo lo
  que está ahí "sin excepción" tiene que estar en el catálogo. Esa hoja usa
  **imágenes incrustadas en la celda** (Excel "image in cell" / rich value,
  no un `<drawing>` clásico) -- para extraerlas hace falta parsear
  `xl/metadata.xml` (atributo `vm` de la celda → índice en
  `futureMetadata`) → `xl/richData/rdrichvalue.xml` (→ índice en
  richValueRel) → `xl/richData/richValueRel.xml` + su `.rels` (→ archivo en
  `xl/media/`). Ya se extrajeron así **145 ejercicios con nombre completo +
  imagen** de Hoja2 (columnas C=código corto, F=nombre completo, D/E=
  imágenes).

  **Regla reforzada explícitamente por el usuario (2026-09-21), no
  "protocolo nuevo" -- ya regía desde antes y no hay que volver a
  preguntarla**: del Excel **SOLO se usan los NOMBRES** (qué ejercicios
  tienen que existir). **Nunca subir las imágenes incrustadas del Excel** --
  son capturas estáticas sacadas de los mismos GIF de la biblioteca de
  referencia en su momento (el Excel es "un boceto", no una fuente de
  imágenes; de hecho esas imágenes de Excel no se usan en ningún lado de la
  app). La imagen de CUALQUIER ejercicio nuevo sale siempre de
  `D:\PROYECTO FITNESS\VIDEOS\RECURSOS\TECNICAS DE EJERCICIOS\EJERCICIOS\
  <GRUPO MUSCULAR>\` (el GIF ilustrado blanco y negro), nunca de un video,
  nunca de una captura de Excel, nunca de otra fuente -- ver también la
  sección "GIF vs VIDEO" más arriba.

  Comparado el listado de 145 nombres contra los 126 de la base, la
  mayoría de las coincidencias por similitud de texto son FALSAS (ej.
  "Sentadilla Goblet" no es "Sentadilla isométrica") -- el criterio final
  que dio el usuario: **agarre distinto o implemento distinto (barra vs.
  mancuerna vs. polea vs. máquina) SIEMPRE es un ejercicio separado**,
  aunque el movimiento se parezca.
- **Migración 054 (2026-09-21)**: 65 ejercicios nuevos agregados con este
  criterio, cada uno con su GIF real de la biblioteca de referencia
  (varios encontrados en subcarpetas de la biblioteca que ya estaban
  nombradas casi igual que el Excel -- ej. `PECTORALES\PRESS DE PECHO
  INCLINADO EN MÁQUINA HAMMER\`). Confirmados SIN GIF real disponible
  (quedaron afuera a propósito, no hay reemplazo inventado): Sentadilla
  con cinturón (belt squat -- solo había una ilustración 3D genérica),
  Curl femoral con mancuerna, Estocadas para glúteos landmine, Sentadilla
  asistida (solo existía una foto estática `.jfif`, no un GIF real).
  **Regla confirmada por el usuario sin excepción**: la imagen final
  SIEMPRE tiene que ser un `.gif` -- si la biblioteca solo tiene un
  `.webp` animado, convertirlo a `.gif` (con PIL, `ImageSequence` +
  `save_all`) antes de subirlo, nunca subir el `.webp` ni una foto
  estática como reemplazo.
- **Bug encontrado 2026-09-22 y migración 055**: la migración 054 solo le
  puso `grupos_musculares` a los 65 ejercicios NUEVOS -- los 115 que ya
  existían antes se quedaron con el array vacío, sin nadie darse cuenta
  hasta que el usuario probó "Crea tu rutina" y vio Abdominales/Gemelos/
  Cuádriceps casi vacíos aunque el catálogo sí tenía esos ejercicios.
  Corregido clasificando los 115 uno por uno. **Regla del usuario, sin
  excepción**: el grupo muscular de un ejercicio es SIEMPRE el nombre de
  la carpeta de la que salió su GIF en la biblioteca de referencia -- la
  lista fija (`GRUPOS_MUSCULARES` en `src/lib/grupos-musculares.ts`) tiene
  que calcar 1 a 1 esas carpetas. Se amplió de 10 a 14 grupos agregando
  **Trapecio, Abductores, Antebrazos, Cuello** (existían como carpetas
  reales -- `CARDIO` se excluye a propósito, no es un grupo muscular). De
  paso se corrigieron 5 ejercicios de la migración 054 que habían quedado
  mal clasificados por no tener estos 4 grupos todavía (encogimientos de
  hombros iban a Espalda en vez de Trapecio; las 3 abducciones iban a
  Glúteos en vez de Abductores).
  **Cuando se agregue cualquier ejercicio nuevo de acá en adelante, poner
  el grupo muscular en el mismo momento -- no dejarlo para después.**
- **Bug encontrado 2026-09-22 y migración 056 -- segunda ronda de
  duplicados**: el usuario encontró en "Crea tu rutina" que "sentadilla con
  barra y sentadilla" (y variantes similares) seguían apareciendo repetidas
  pese a la limpieza de la 053. Causa real: la 053 comparó los 126
  ejercicios originales por hash exacto de archivo; la 054 agregó 65
  ejercicios nuevos DESPUÉS de esa limpieza y nunca se los comparó contra
  el catálogo ya existente (solo se chequeó que no se repitieran entre
  ellos) -- así volvieron a entrar, con nombre distinto, 7 GIFs que eran el
  mismo ejercicio que uno ya existente: Estocadas/Estocadas para glúteos,
  Extensión de tríceps en polea/Tríceps en polea alta a un brazo, Press de
  banco/banca con mancuernas, Sentadilla en máquina Smith/Sentadilla Smith,
  Elevación de talón sentado en máquina/de talones sentado, Sentadilla con
  mancuerna/Sentadilla Goblet, Elevación de rodillas al pecho/Crunch
  inverso. Detectados esta vez con **perceptual hash de varios frames de la
  animación** (no MD5 de archivo exacto -- dos re-exports del mismo GIF casi
  nunca son bit-a-bit idénticos, por eso el método de la 053 no alcanzaba
  para esta ronda) -- descargar todos los GIFs, comparar frame por frame
  con `PIL.ImageSequence`, distancia de Hamming ~0 en todos los frames
  muestreados = mismo GIF. Corregido en `migration_056_deduplicar_catalogo_
  ronda2.sql`, mismo patrón de redirect+delete que la 053.
  **Regla de proceso nueva, para no repetir esto una tercera vez: cualquier
  ejercicio que se agregue al catálogo de acá en adelante (uno solo o en
  tanda) se compara por contenido de imagen contra TODO el catálogo
  existente en ese momento, no solo contra los que se están agregando en la
  misma tanda.**
- **Migración 057 (2026-09-22)**: Antebrazos y Cuello eran los únicos 2
  grupos de `GRUPOS_MUSCULARES` con 0 ejercicios (no por bug -- simplemente
  no existía ninguno todavía). A pedido del usuario se cargaron 4 básicos
  de cada uno (no el listado completo), cada GIF comparado por contenido
  contra los 188 ya existentes antes de subirlo (regla de la 056, ya
  aplicada). Antebrazos: Curl de muñeca con barra, Curl de muñeca invertida
  con mancuernas, Curl con barra agarre invertido, Prensión manual. Cuello:
  Extensión/Flexión de cuello acostado con peso, Extensión/Flexión de
  cuello en polea con arnés.
- **Migración 058 (2026-09-22)**: 3 correcciones más encontradas por el
  usuario probando "Crea tu rutina":
  1. "Abducción de cadera en polea" y "Abductores externos en polea" eran
     el mismo ejercicio con el mismo GIF filmado con dos modelos distintos
     (hombre / mujer) -- se fusionaron, queda la versión con el hombre.
  2. "Peso muerto rumano" tenía cargado por error el mismo GIF de "Peso
     muerto" (peso muerto convencional, no rumano) filmado desde otro
     ángulo -- mala clasificación original desde la carpeta FEMORALES de la
     biblioteca. Se reemplazó por un GIF real de peso muerto rumano (con
     mancuernas en la biblioteca, pero el usuario confirmó que la
     biomecánica es idéntica a la variante con barra) -- **por eso el
     nombre de un ejercicio de este tipo no debe especificar el implemento
     cuando el movimiento es el mismo con barra o mancuernas: un solo GIF
     alcanza para representar ambas variantes.**
  3. "Sentadilla con barra" y "Sentadillas" eran el mismo ejercicio
     (sentadilla trasera con barra) con dos ilustraciones -- se fusionaron,
     queda "Sentadilla con barra" (nombre más descriptivo).
- **Selector de grupos musculares por día**: pasó de chips sueltos a un
  desplegable (pedido explícito del usuario) -- se abre/cierra con
  `gruposAbierto`, y cambiar de día (`irADia`) lo cierra automáticamente.
- **Pendiente de decidir**: gate de acceso (¿esto es para cualquier Golden,
  o exclusivo de algún tier?) -- no asumido, preguntar antes de gatear.
- **Bug encontrado y corregido en el primer test real (2026-09-21)**: al
  guardar con "Crea tu rutina" la nueva rutina se activa sola (sin opción
  de solo guardar sin usar) -- y el botón para volver a cambiar de rutina
  ("Cambiar a esta rutina") vivía SOLO dentro de `/rutinas/[id]/[dia]`
  (un día puntual), no en `/rutinas/[id]` (la pantalla de la rutina). Un
  usuario que crea una rutina de prueba quedaba sin forma visible de volver
  a la anterior. Corregido moviendo el botón también a `/rutinas/[id]`.

## Nuevo protocolo para clientes de Mentoría / entrenamiento privado (2026-09-20)

Antes se armaba UN SOLO PDF combinado (entrenamiento + alimentación) por
cliente. **Ya no.** El nuevo protocolo, para toda mentoría 1:1 de acá en
adelante:

- **Entrenamiento**: vive exclusivamente en la app, como una rutina privada
  armada a medida para ese cliente puntual (`routines.es_privada = true`,
  ver migración 035 -- "Kraken Split" es el ejemplo ya existente, aunque esa
  es la rutina personal del propio coach, no de un cliente). El PDF **ya no
  lleva la parte de entrenamiento** para estos clientes.
- **Alimentación**: sigue siendo un PDF (mismo estilo/formato ya establecido:
  disclaimer, tabla de comidas con macros, pesos en crudo, proteínas
  rotativas -- ver la memoria de Claude `client_training_pdf_workflow.md`
  fuera de este repo, en la sesión de asesorías), pero ahora es **solo**
  guía alimenticia, sin entrenamiento, y se entrega adentro de la cuenta del
  cliente vía `guias_alimenticias` (ver arriba) en vez de mandarse suelto.
- Para que la pantalla de Guía Alimenticia sea visible hace falta además
  marcar la cuenta como Mentoría: `profiles.premium_origen = 'mentoria'`.
  Con clientes de mentoría/entrenamiento privado el coach directamente les da
  el "golden pass" perpetuo (`golden_perpetuo = true`), no un `premium_hasta`
  con vencimiento -- son cuentas que el coach gestiona a mano mientras dure
  la relación comercial, no una suscripción con fecha de corte automática.

### Alta de un cliente nuevo = UN SOLO COMANDO, no una migración por cliente

**No escala pedirle al coach que suba GIFs por el Dashboard y el PDF al
bucket a mano por cada cliente** (confirmado explícitamente por el coach
2026-09-20, con 10+ clientes esperando) -- eso quedó reemplazado por
`scripts/alta-cliente.js`:

```
node scripts/alta-cliente.js "clientes/nombre-cliente.json"
```

Ese único comando hace TODO: reusa ejercicios existentes por nombre o los
crea (subiendo su GIF si `gif_local_path` viene en el JSON), crea/reusa la
rutina privada y sus `routine_exercises`, otorga el golden pass +
`profile_routine_access` por email, y sube + linkea la guía alimenticia en
PDF -- todo con `SUPABASE_SERVICE_ROLE_KEY` (una sola vez en `.env.local`,
nunca por chat, igual que `asignar-gifs.js`).

- El formato del JSON de un cliente está documentado en
  `clientes/EJEMPLO.json`. `clientes/*.json` y `gifs-*/` NO se commitean
  (datos personales de clientes) -- ver `.gitignore`.
- El flujo de contenido/aprobación **no cambia**: el coach pasa el
  formulario ("Puesta en Marcha — Asesoría Online", Google Forms) + su
  propio criterio, Claude arma el plan (entrenamiento + PDF de guía
  alimenticia) como siempre, el coach lo aprueba por chat -- lo único nuevo
  es que, aprobado, la carga a la base pasa por este script en vez de
  Dashboard + SQL Editor a mano.
- **La guía alimenticia se carga SIEMPRE por default, para todo cliente
  nuevo** (confirmado explícitamente 2026-09-20: "lo extraño sería que yo no
  lo pida") -- no esperar a que el coach la pida cada vez. La única
  excepción es que él diga explícitamente que este cliente puntual NO lleva
  guía (pasó una vez, con Rocío Pace, por ser un caso de solo-entrenamiento).
  Si el cliente no tiene un plan de alimentación propio armado todavía,
  preguntarle antes de omitir la guía -- no asumir que no la quiere.
- El email del cliente SIEMPRE se compara case-insensitive (`buscar_usuario_por_email`
  ya lo hace con `.toLowerCase()` desde el script) -- ver el bug documentado
  más abajo.
- Si el cliente todavía no se registró en la app con ese email, el script
  avisa y no hace nada -- hay que esperar a que se registre y volver a
  correrlo (no hay reclamo automático como sí existe para `compras`).
- **No reusar un ejercicio existente "parecido" solo porque el nombre pega
  aproximadamente -- verificar el agarre/variante exacta antes de asumir.**
  (2026-09-21, caso Lorena Tobares): reusé "Jalón al pecho en polea alta"
  (agarre prono/ancho) para unos "chin-ups en polea" que el cliente pidió
  con agarre SUPINO. Tardé TRES intentos en llegar al GIF correcto --
  primero un supino ancho (mal, el coach quería cerrado), después un chin-up
  con AGARRE cerrado pero de **peso corporal** (mal, tiene que ser en polea/
  máquina), y recién el tercero fue el correcto:
  `ESPALDA\chin ups en polea.gif` (en la raíz de la carpeta ESPALDA, no en
  ninguna subcarpeta -- ojo con eso, es fácil asumir que el archivo relevante
  está en una subcarpeta con nombre parecido y no está). Mismo tipo de error
  con "pájaro con mancuernas" (asumí el ejercicio con pecho apoyado en banco
  inclinado, cuando el pájaro real es de pie/inclinado sin banco --
  `03801301-Dumbbell-Rear-Lateral-Raise_Shoulders_720.gif`, confirmado por
  el coach). **Regla: cuando el nombre del ejercicio que pide el coach
  incluye un agarre/variante/equipo específico (supino, prono, cerrado,
  unilateral, con banco, sin banco, en polea vs. peso corporal, etc.),
  buscar esa combinación EXACTA en la biblioteca -- incluyendo la raíz de la
  carpeta del grupo muscular, no solo las subcarpetas -- antes de reusar el
  ejercicio genérico más parecido. Si no aparece ninguna coincidencia
  exacta, preguntarle al coach en vez de asumir; no dar por buena la primera
  coincidencia parcial que aparezca.**
- **Para términos de ejercicio no estándar/coloquiales que no aparecen en la
  biblioteca local, investigar (búsqueda web) antes de inventar una
  interpretación -- pero la búsqueda web tampoco es infalible, confirmar
  con el coach apenas sea posible.** "Caminata lunar" pasó por DOS
  interpretaciones equivocadas antes de la correcta: primero caminata
  lateral con banda (mal), después caminar hacia atrás en línea recta /
  "retro walking" según una búsqueda web (también mal). **Es en realidad
  zancadas caminando (walking lunges)** -- el coach mismo encontró y señaló
  el GIF correcto: `EJERCICIOS EXPLICATIVOS\FUNCIONAL - HIIT\caminata
  lunar.gif` (2026-09-21). Cuando el coach señala un archivo puntual, usar
  ESE archivo tal cual -- aunque no sea del estilo ilustrado blanco y negro
  de la biblioteca `TECNICAS DE EJERCICIOS\EJERCICIOS` (la preferencia por
  ese estilo es el criterio por defecto cuando Claude elige solo, no una
  regla que pese más que una instrucción explícita del coach sobre un
  archivo específico).
- **Si el coach no tiene el email a mano, se puede buscar la cuenta por
  nombre/apellido** directo en `profiles` (con la service_role key ya
  configurada) y resolver el email con `auth.admin.getUserById()` -- más
  simple que pedirle el email de nuevo. `profiles.nombre` es solo el primer
  nombre; `apellido` es una columna aparte (ver nota vieja sobre este mismo
  gotcha en el historial de "3 días - Fullbody").
- **Pendiente, evaluar cuando haya tiempo**: migrar de una vez TODA la
  biblioteca de `TECNICAS DE EJERCICIOS` al catálogo de `exercise_definitions`
  (no por cliente) para que la enorme mayoría de altas futuras reusen
  ejercicios ya existentes y casi nunca necesiten `gif_local_path` -- es la
  optimización de fondo que más reduce el trabajo por cliente a largo plazo.

## GIF vs VIDEO de un ejercicio -- dos cosas DISTINTAS, no confundir

Esto se prestó a confusión real en esta sesión (después de una
compactación de contexto) -- por eso queda anotado bien explícito:

- **`imagen_url` (gif)**: la miniatura que se ve SIEMPRE, sin tocar nada
  -- en la grilla de ejercicios del día, en las tarjetas compactas de
  "Rutinas adquiridas", como imagen del ejercicio activo. Es el "vistazo
  rápido". Biblioteca de gifs de referencia (estilo ilustrado
  anatómico, blanco y negro, YA HECHOS): `D:\PROYECTO FITNESS\VIDEOS\
  RECURSOS\TECNICAS DE EJERCICIOS\EJERCICIOS\<GRUPO MUSCULAR>\`. El
  usuario prefiere fuerte este estilo ilustrado -- NO usar un gif armado a
  partir de un video real/Instagram salvo que no haya ningún ejercicio
  parecido en esa biblioteca (y en ese caso, avisar que es un fallback).
- **`video_url` / `video_url_fem`**: NO se ve solo -- recién aparece si el
  usuario toca **"¿Cómo hacerlo?"** dentro de la tarjeta del ejercicio
  activo, junto con el texto de técnica. Fuente: carpeta separada
  `D:\PROYECTO FITNESS\VIDEOS\RECURSOS\TECNICAS DE EJERCICIOS\
  EJERCICIOS EXPLICATIVOS\` (ojo, nombre parecido a la de arriba pero es
  OTRA carpeta, con clips reales de video, no gifs ilustrados).
- Regla vieja que sigue vigente: **nunca dejar `imagen_url`/`video_url` en
  null**. Si no existe el archivo exacto para un ejercicio nuevo, buscar
  primero en la biblioteca de gifs un ejercicio hermano lo bastante
  parecido antes de dejarlo vacío o de generar uno desde un video.

## Bug/gotcha: comparar email en SQL nunca a secas, siempre con `lower()`

**Confirmado 2026-09-20**: `auth.users.email` no es case-insensitive a nivel
de comparación con `=` en SQL directo (ni en la función
`buscar_usuario_por_email`, que usa `where email = p_email`). El coach pasó
el email de un cliente con la primera letra en mayúscula
("Santiagoismaelpelotti@gmail.com") mientras la cuenta real estaba guardada
en minúsculas ("santiagoismaelpelotti@gmail.com") -- la comparación exacta
dio falso negativo ("no existe cuenta"), cuando la cuenta sí existía.

**Regla**: cualquier WHERE o subquery que compare por email en una migración
(alta de cliente, `profile_routine_access`, `guias_alimenticias`,
`profiles.premium_origen`, etc.) tiene que usar
`lower(email) = lower('email-que-pasó-el-coach')`, nunca `email = '...'` a
secas. Ver `migration_051_santiago_pelotti.sql` como ejemplo ya corregido.

## Bug de Supabase Storage: nombres de archivo con tilde

**Cualquier nombre de archivo con tilde (á, é, í, ó, ú) falla al subirlo
por el Dashboard de Supabase** con el error "File name is invalid" --
pasa con .gif y con .mp4 por igual, subiendo de a uno o en lote. No es un
problema de tamaño de lote ni de codificación (se verificó UTF-8 NFC
correcto). Por eso los ejercicios viejos ya usaban nombres de archivo sin
tilde (`cuadriceps-prensa.gif`, `curl-biceps-banco-inclinado-mancuernas.gif`).

**Regla**: el nombre del ARCHIVO en Storage nunca lleva tilde (sacarla,
sin reemplazar por nada), pero el `nombre` de la columna en
`exercise_definitions` sigue con tilde, como corresponde en español
correcto -- solo cambia el nombre de archivo, nunca lo que se le muestra
al usuario. Si se sube por `scripts/asignar-gifs.js` (que usa la
`SUPABASE_SERVICE_ROLE_KEY`, no el Dashboard) este problema no aparece --
pero el Dashboard es el método que usa el coach normalmente.

## Convenciones para migraciones que reasignan ejercicios de una rutina

- Si una migración reemplaza el `exercise_definition_id` de una fila de
  `routine_exercises` (por un cambio de rutina pedido por el cliente) Y
  además hay que borrar el historial de `workout_logs` de esa rutina, el
  DELETE va **antes** del/de los UPDATE que reasignan, no después. Motivo:
  `workout_logs` no tiene columna de rutina -- el único join posible para
  "todos los logs de esta rutina" es a través de `routine_exercises`, y si
  el ejercicio viejo ya fue reemplazado por el nuevo en esa fila, el join
  ya no lo encuentra y ese historial queda sin borrar (huérfano). Ver
  `migration_049_kraken_split_rediseno.sql` como ejemplo del orden correcto
  (paso 0: DELETE con el estado viejo, después los UPDATE).
- Cuando un ejercicio cambia de postura pero no de movimiento biomecánico
  (ej. elevación lateral con mancuernas parada vs. sentada, curl martillo
  sentado vs. parado) **no siempre** hace falta un `exercise_definition_id`
  nuevo: si la rutina solo necesita anotar la postura para ese día
  puntual, alcanza con anotarlo en el texto de `series_reps` de esa fila
  de `routine_exercises` (ej. `'... (sentado)'`), reutilizando el mismo
  ejercicio canónico. Un `exercise_definition_id` nuevo se justifica solo
  cuando el equipo/movimiento cambia de verdad (ej. mancuerna -> polea).
- "Vuelo lateral con polea" ya existe en el catálogo como elevación
  lateral **unilateral** en polea (`unilateral = true`) -- no crear un
  ejercicio nuevo para "elevación lateral unilateral en polea", ya es este.

## Categorías de acceso de usuario (premisa 2026-09-21, todavía por refinar)

El usuario planteó explícitamente que hace falta poder diferenciar y
reportar en qué categoría está cada cliente. Todavía no hay una pantalla
para esto (se puede pedir más adelante), pero la categorización sale de
columnas que ya existen, sin cambiar el esquema:

- **Golden Founder** (`golden_perpetuo = true`): SOLO las 2 cuentas propias
  del coach (Android e iOS) -- `ezequiel.arce@outlook.com` y
  `ar.cs@hotmail.es`. Nunca ponerle esto a un cliente real, aunque tenga
  acceso completo -- se detectó y corrigió un error donde 4 cuentas de
  mentoría tenían este flag de más (ver más abajo).
- **Mentoría 1 a 1** (`premium_origen = 'mentoria'`): alguien que compra
  mentoría (se vende en el sitio web). Incluye TODO lo de Golden más
  beneficios exclusivos (`esMentoria()`, ej. Guía alimenticia). Tiene dos
  variantes de trato, **no representadas todavía en una columna propia**:
  - **Online**: coaching a distancia. Ej. Santiago
    (`santiagoismaelpelotti@gmail.com`) -- se le dio acceso manual hasta
    fin de este año (2026-12-31).
  - **Privada/presencial**: entrena físicamente con el coach (ver
    [[trainer_private_gym_equipment]] en la memoria). El resto de los
    clientes de mentoría actuales son de este tipo -- se les dio acceso
    manual por 1 año desde hoy (2027-09-21) como solución temporal.
  - **Pendiente de diseño**: un sistema "automatizable y fehaciente" para
    llevar el registro de quién renueva mes a mes -- hoy la renovación es
    100% manual (el coach empuja `premium_hasta` a mano cuando el cliente
    le paga, fuera de Mercado Pago/PayPal). El usuario fue explícito en que
    esto se resuelve más adelante, no ahora -- no proponer un sistema
    automático sin que él lo pida.
- **Golden Anual / Golden Mensual**: alguien que NO compra mentoría --
  se autogestiona su propia rutina (ej. compró Anti-Flakardo, Grasa
  Sub-Cero u otro plan suelto) con acceso de un año o de un mes. **Todavía
  sin discriminar con precisión** contra `premium_origen = 'compra'`
  (planes sueltos, 3 meses) vs. `'golden'` con `suscripciones.frecuencia`
  ('anual'/'mensual') -- el usuario lo dejó pendiente a propósito ("son
  cosas que tenemos que empezar a ver y discriminar"), no forzar una
  respuesta definitiva sin que él la dé.
- **Free Trial** (`premium_origen = 'trial'`): se registró para probar la
  app, acceso limitado por unos días.
- **Cuentas de testeo del coach** (`kraken.test.qa@gmail.com`,
  `kraken.test.qa2@gmail.com`): no son clientes, excluir de cualquier
  reporte/categorización de clientes reales.
- **Bug corregido 2026-09-21**: 4 cuentas de mentoría (Lorena Tobares,
  Santiago, tallernoc, belu122806) tenían `golden_perpetuo = true` puesto
  a mano por error al darlas de alta -- causaba que la app les mostrara
  "Golden · Founder" en vez de "Mentoría · hasta [fecha]"
  (`obtenerSuscripcion()` en `premium.ts` chequea `golden_perpetuo`
  primero). Se corrigió a `false` en las 4. Si se da de alta un cliente de
  mentoría nuevo, el acceso se da con `premium_origen = 'mentoria'` +
  `premium_hasta`, **nunca** con `golden_perpetuo`.
- **Idea a futuro, explícitamente pausada**: que un usuario pueda armarse
  su propia rutina desde la app (autogestión total). El usuario la
  mencionó como algo que "sería fascinante" pero pidió dejarla para más
  adelante -- no es parte del alcance actual.

## Decisiones de negocio ya tomadas a propósito (no "corregir" sin preguntar)

- **Colores de los botones de pago**: Mercado Pago = amarillo, PayPal =
  celeste -- es lo OPUESTO a los colores de marca reales de cada uno. El
  usuario lo pidió así explícitamente, dos veces.
- **PWA, no app nativa (todavía)**: decisión consciente por velocidad/costo.
  Limitaciones reales ya identificadas:
  - iOS Safari **nunca** implementó bloqueo de orientación -- resuelto con
    overlay CSS que tapa la pantalla en landscape
    (`src/components/orientation-guard.tsx`).
  - Instalar la PWA vía **Samsung Internet** puede disparar un bloqueo de
    Play Protect ("app insegura") por cómo ese navegador arma el WebAPK --
    Chrome no tiene ese problema. Workaround: instalar desde Chrome.
  - **"KRAKEN Entrena requiere la siguiente app: Chrome"** (cartel con
    botones Cerrar/Instalar, en loop, aunque Chrome ya esté actualizado):
    confirmado en producción (cuenta del coach) el 2026-09-19. NO es un
    bug de nuestro manifest/service worker (se revisaron los dos, están
    bien) -- es que el WebAPK que arma Android para la PWA queda atado a
    la versión de Chrome que lo generó, y una actualización de Chrome en
    segundo plano puede romper esa asociación interna. Es un bug conocido
    de Android/WebAPK, no exclusivo de esta app. **Arreglo confirmado que
    funcionó**: reiniciar el celular. Si no alcanza: Ajustes → Apps →
    Chrome → Almacenamiento → Borrar caché (NO "Borrar datos"); si sigue,
    desinstalar el ícono de KRAKEN Entrena y volver a instalarlo desde
    Chrome; como último recurso, desinstalar las actualizaciones de Chrome
    y dejar que Play Store la reinstale. Es un arreglo que hay que repetir
    cada vez que reaparece (no hay forma de prevenirlo desde el código de
    la app) -- la única forma de eliminarlo de raíz es publicar como app
    nativa real en Play Store, no como PWA/WebAPK.
  - `-webkit-touch-callout: none` (en `globals.css`) es Safari/iOS-only --
    en Android/Chrome hace falta además cancelar el evento `contextmenu`
    (ver `register-sw.tsx`) para evitar el menú nativo de "mantener
    presionado" sobre un link.
  - Pasar a Play Store/App Store (Capacitor) resolvería esto de raíz, pero
    es un proyecto aparte, no urgente (~1-2 semanas Android vía TWA, ~3-5
    semanas iOS vía Capacitor, necesita Mac).
- **Alimentación**: calculadora de calorías = beneficio Golden O Mentoría
  (`esGoldenTier`). Guía alimenticia = beneficio EXCLUSIVO de Mentoría
  (`esMentoria`, más estricto). Ambas pantallas exigen un pop-up de
  disclaimer legal con "Sí, entiendo" antes de mostrar contenido, guardado
  por usuario (`profiles.disclaimer_calculadora_aceptado_at` /
  `disclaimer_guia_aceptado_at`) -- ver `src/components/disclaimer-gate.tsx`.
  No mostrar nunca estas pantallas sin ese gate.
- **Rutinas multi-día nuevas (Sayayin, variantes de 3 días)**: **rechazadas
  explícitamente, "no las quiero hasta nuevo aviso"** -- no proponerlas de
  nuevo salvo que el usuario las pida.
- **Planes autoguiados** (Grasa Sub-Cero, Híbrido, En Casa, Minimalista):
  rutinas `es_privada = true`, exclusivas de quien compró ese producto
  puntual -- NO deben quedar accesibles para Golden/trial en general.
- **Diferenciación de funciones entre trial / Golden mensual / Golden
  anual**: pendiente a propósito, el usuario todavía no lo definió --
  esperar a que traiga specifics concretos, no adelantarse.
- **Login con Google/Facebook**: prioridad reconocida por el usuario, pero
  bloqueado hasta que él cree las cuentas de desarrollador (Google Cloud /
  Facebook Developer) -- no hay código que hacer todavía.
- **Recuperar contraseña**: falta implementar el flujo de
  `resetPasswordForEmail` de Supabase Auth (mail automático al correo
  registrado) -- pedido explícito del usuario, no construido aún.

## Convenciones de código a respetar

- Español en nombres de variables/funciones/columnas de negocio, inglés
  solo en lo genérico de React/Next.
- Sin comentarios explicando "qué hace" el código -- solo comentarios que
  expliquen un "por qué" no obvio.
- Fechas: **siempre** en huso horario Argentina, usando los helpers de
  `src/lib/fecha.ts` (`hoyISO`, `fechaISO`, `inicioDelDiaArgentinaUTC`,
  `calcularEdad`) -- nunca `new Date().toISOString()` a secas, porque el
  servidor corre en UTC.
- No usar `<input type="date">` ni ningún `<select>` nativo del navegador
  para nada visible al usuario -- usar `SelectNativo`
  (`src/components/select-nativo.tsx`) para que se vea igual en iOS/Android.
- Estado de navegación "dónde estaba el usuario" (sesión de entrenamiento
  en curso, última pantalla de cada hub) se guarda en `sessionStorage` del
  lado del cliente (`src/lib/sesion-entrenamiento.ts`,
  `src/lib/ultima-pantalla.ts`), NO en la base de datos -- es conveniencia
  de UI por dispositivo, no un dato que haya que persistir server-side.

## Bug corregido: registro duplicado del mismo lado en ejercicios unilaterales

**Síntoma (reportado 2026-09-19)**: en un ejercicio unilateral, el usuario
cargaba el lado derecho dos veces seguidas (mismo peso/reps/RIR, ~2 minutos
de diferencia) antes de que apareciera el izquierdo.

**Causa real**: `descansoHasta`/`etiquetaDescanso` (el cronómetro de
"Descanso entre lados") vivían solo en el estado de React de
`entrenamiento-dia-cliente.tsx`, nunca se guardaban en `sessionStorage` via
`sesion-entrenamiento.ts` -- a diferencia de `dia`/`activoId`/`lado`, que sí
se restauran. Si la pestaña de la PWA se descarga o se cierra durante ese
descanso (frecuente en Android en segundo plano) y el usuario vuelve, la
sesión restaura el lado correcto ("derecho") pero el cronómetro se perdió
-- así que en vez de mostrar el timer, `ExerciseCard` vuelve a mostrar el
formulario de carga para ese mismo lado, y `avanzarLado()` nunca se llegó a
disparar.

**Fix aplicado**: `SesionGuardada` ahora también persiste `descansoHasta` y
`etiquetaDescanso`. Al restaurar: si el descanso restaurado todavía no
venció, se restaura el timer tal cual (es un timestamp absoluto, no una
duración, así que sigue contando bien). Si ya venció mientras la app
estaba cerrada, se trata como si hubiese terminado normalmente -- si era
"Descanso entre lados" se avanza el lado igual, para no dejar la puerta
abierta a repetir el mismo lado.

## Analizador de rutinas y pentágono (2026-09-22)

El pentágono dejó de ser solo parte del wizard de "Crea tu rutina" -- ahora
también compara rutinas YA EXISTENTES entre sí, estilo comparador de
jugadores de un videojuego de fútbol (varios polígonos superpuestos, cada
uno con su color).

- **`/entrenamiento/analizador`** (`src/components/analizador-cliente.tsx`):
  el usuario elige hasta 3 rutinas de las que tiene adquiridas, se
  superponen sus pentágonos (cada uno con su color: verde/celeste/naranja)
  y debajo hay una tabla "series por semana, por grupo muscular" comparando
  las rutinas lado a lado. **El número más alto de cada fila se pinta del
  color de esa rutina** (empate = los dos quedan blancos) -- así se ve a
  simple vista quién gana cada grupo sin comparar número por número.
- **`src/lib/analisis-rutina.ts`** (`calcularAnalisisRutina`): función
  compartida que arma el pentágono de una rutina EXISTENTE del coach
  (Kraken Split, Torso-Pierna, etc.) leyendo `routine_exercises` real de la
  base. Estas rutinas guardan `series_reps` como texto libre ("3 x 10-12
  (RIR 1)"), no columnas numéricas -- se parsea con mejor esfuerzo
  (`src/lib/parsear-series-reps.ts`, probado contra los ~50 formatos reales
  que hay en la base) y cae a defaults razonables si el texto falla o no
  existe. El grupo muscular de cada ejercicio sale siempre del catálogo
  real, nunca del texto, así que ese dato es exacto sin importar qué tan
  prolijo esté el `series_reps`.
- **`src/lib/pentagono.ts` -- fórmulas actuales de los 5 ejes** (reescritas
  varias veces esta sesión, esto es lo que hay HOY, no lo que decía la
  sección vieja de "Crea tu rutina" más arriba):
  - **Volumen**: cada grupo muscular tiene su propia banda MEV-MAV (Minimum
    Effective Volume / Maximum Adaptive Volume, framework de Renaissance
    Periodization -- `src/lib/volumen-landmarks.ts`, fuentes citadas ahí).
    **NO usa MRV como techo** -- eso se probó primero y quedó mal (MRV es
    el límite de recuperación, muy individual, y para la mayoría de los
    naturales acercarse a eso ya es sobreentrenamiento, no la zona óptima).
    Score piecewise por grupo: 0..MEV → 0..50, MEV..MAV → 50..100, ≥MAV →
    100 tope (pasarse no suma ni resta en este eje). Se promedia el score
    entre los grupos que la rutina toca.
  - **Frecuencia**: promedio de veces/semana por grupo muscular (sin
    cambios).
  - **Recuperación**: los días de la rutina (Día A, B, C...) se reparten
    parejo en una semana de 7 días (separación = 7/N) para convertir
    "posición en la lista" en "días de descanso reales" -- sin esto,
    cualquier Full Body daba 0 en este eje (interpretaba "todos los días de
    la lista" como "todos los días de la semana sin descanso").
  - **Intensidad**: **solo RIR objetivo**, ya NO promedia con rango de
    reps. Mezclar reps ahí confundía intensidad de ESFUERZO (RIR, lo que
    maneja el estímulo de hipertrofia) con intensidad de CARGA (%1RM) --
    reps bajas no dan más hipertrofia que reps altas a esfuerzo igual.
    `repsMin`/`repsMax` se mantienen en el modelo de datos (se usan para
    mostrar la rutina), solo dejaron de influir en este score.
  - **Sostenibilidad**: sin cambios (días/semana + duración estimada).
  - Cada grupo pesa según sea principal (primer elemento de
    `grupos_musculares`, crédito completo) o secundario (el resto, media
    serie) -- ver `PESO_PRINCIPAL`/`PESO_SECUNDARIO` en `pentagono.ts`, sin
    tocar en ninguna de estas revisiones.
- **`src/components/pentagono-chart.tsx`**: acepta una LISTA de series
  (`{label, color, scores}[]`), no un solo `scores` -- con una sola serie
  se comporta como el pentágono clásico (sigla + valor en cada eje: V/F/R/
  I/S, con la referencia completa abajo alineada a la izquierda); con dos o
  más, solo la sigla (el valor no tiene sentido con varias rutinas
  superpuestas) más una leyenda de colores debajo del gráfico.

## Borrado de rutinas (2026-09-22)

Solo se pueden borrar rutinas con `routines.creada_por_usuario = true` (las
armadas por un usuario en "Crea tu rutina") -- las públicas del coach
(Kraken Split, Full Body, Torso-Pierna, Push Pull Legs, etc.) y las de un
plan comprado quedan fijas, sin botón de borrar. `src/app/entrenamiento/
rutinas/actions.ts` (`borrarRutinaCreada`) revalida esto server-side
(dueño vía `profile_routine_access`, no es la rutina activa del usuario) y
borra con el admin client -- `routine_exercises`/`routine_dias`/
`profile_routine_access` tienen `on delete cascade` sobre `routine_id`,
`profiles.routine_id` y `profile_routine_history.routine_id` tienen `on
delete set null` (no rompen, pero dejan al usuario sin rutina activa si
borra la que tiene puesta -- por eso se bloquea ese caso explícitamente en
vez de confiar en el `set null`). Botón en `src/components/borrar-rutina-
boton.tsx`, mismo patrón de confirmación en dos pasos que `CambiarAEsta
RutinaBoton`.

**Antes de borrar CUALQUIER rutina "vieja"/sospechosa de estar vacía,
chequear primero si está enganchada a un producto** (`producto_rutinas`) o
tiene cuentas activas (`profiles.routine_id`) -- "Entreno 4 días" y "3 días
- Fullbody" parecían basura (poca o ninguna `series_reps` cargada) pero
las dos están enganchadas al producto real **KRAKEN Anti-Flakardo**
(`producto_rutinas.producto_id` → slug `anti-flakardo`). El usuario no lo
sabía hasta que se lo marcamos -- decidió dejarlas intactas (sin borrar, sin
renombrar todavía) hasta confirmarlo él mismo. "5 días - hipertrofia" sí
era genuinamente huérfana (0 cuentas, 0 productos) y se borró
(`migration_060`... en realidad se borró antes, por SQL directo, no quedó
en una migración archivada -- si hace falta reproducir: `delete from
routines where nombre = '5 días - hipertrofia';`).

## Rutinas nuevas: Torso-Pierna y Push Pull Legs (migración 060)

Dos rutinas públicas armadas por Claude a pedido explícito del usuario
("las tres más famosas, a tu consideración") para completar el catálogo
junto con Full Body y Kraken Split. Todos los ejercicios son los ya
existentes en `exercise_definitions` (no se creó ninguno nuevo).
`series_reps` con rango + RIR recomendado en el mismo texto (mismo estilo
que Kraken Split) y también en la columna `rir_objetivo`.

- **Torso-Pierna** (4 días): A/C = torso (empuje horizontal+tracción
  vertical / empuje vertical+tracción horizontal), B/D = pierna
  (cuádriceps dominante / isquios-glúteo dominante).
- **Push Pull Legs** (6 días): A/D = push (énfasis pecho / énfasis
  hombro), B/E = pull (énfasis espalda ancho / espalda grosor+trapecio),
  C/F = legs (piernas completo / glúteo-isquios+pantorrilla), doble
  frecuencia por grupo en la semana.

## Qué NO hacer sin preguntarle antes al usuario

- No correr ninguna migración SQL contra la base de producción -- se
  puede escribir el archivo `migration_0XX.sql`, pero el coach es quien la
  corre a mano en el SQL Editor.
- No tocar `.env.local` ni pedir la `SUPABASE_SERVICE_ROLE_KEY` por chat.
- No hacer `git push --force`, no reescribir historial.
- No sacar ni modificar ningún disclaimer legal (Alimentación, Medidas).
- No retomar rutinas multi-día nuevas sin que el usuario lo pida él mismo.

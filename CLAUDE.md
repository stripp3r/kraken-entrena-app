@AGENTS.md

# KRAKEN Entrena — memoria del proyecto

Este archivo se carga solo al empezar cada sesión acá. Junto con docs/BITACORA.md es la fuente de
verdad sobre decisiones ya tomadas y convenciones establecidas -- no
"corregir" nada de lo que sigue sin preguntarle antes al usuario (el coach,
Ezequiel). Si algo de esto queda desactualizado, avisar y actualizar este
archivo, no solo arreglarlo una vez y dejar que se repita el error.

## Regla fija: dos documentos, cada cosa en su lugar (desde 2026-11-03)

Este archivo se carga entero en CADA sesión, así que tiene que ser corto: solo reglas, convenciones y datos
que sirven siempre. Antes medía 257 KB y cada tarea gastaba ~100k tokens solo en leerlo.

- **Reglas, convenciones y gotchas** (sirven siempre) → acá, en la sección más parecida. Corto.
- **Historia, decisiones detalladas, diagnósticos y features** → `docs/BITACORA.md`. No se carga sola:
  **antes de tocar una feature, buscá su sección ahí** (grep por tema). Al terminar algo importante, sumá ahí lo que pasó.
- Cuando el usuario corrige algo o define un criterio, anotalo en el momento, sin preguntar, en el lugar que corresponde.
- Antes de "corregir" una decisión de negocio, buscá en la bitácora la sección "Decisiones de negocio ya tomadas a propósito".

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
  ('trial'|'compra'|'golden'|'mentoria'|'founder', el último desde
  migración 083). **`src/lib/premium.ts` es la única fuente de verdad
  para esto** -- nunca reimplementar esta lógica inline en una pantalla:
  - `esPremium(p)`: acceso vigente a la app (cualquier origen).
  - `permisos(p)`: **la única fuente de verdad de qué incluye cada
    categoría** -- devuelve un objeto (`catalogoCompleto`, `cardio`,
    `limiteRutinasCreadas`, `historial`, `evolucion`, `misPdfs`,
    `calculadora`, `guiaAlimenticia`) con la matriz completa por plan
    (Founder/Mentoría/Golden/Compra/Trial). Para gatear CUALQUIER feature
    que dependa del plan del usuario, usar esto -- nunca reimplementar el
    chequeo inline ni agregar una función booleana suelta nueva (ese
    patrón ya causó varios bugs reales, ver "Categorías de acceso de
    usuario" más abajo).
  - `rutinaIncluidaEnPlan(p, rutina)`: "¿esta rutina PUNTUAL está incluida
    en el plan de este perfil?" -- combina `permisos(p).catalogoCompleto`
    con las 3 rutinas del Free Trial. Usar esto para cualquier chequeo
    sobre una rutina específica, no `permisos(p).catalogoCompleto` solo.
  - `esGoldenTier(p)`: SOLO para decidir si mostrar un upsell de "pasate a
    Golden" (Inicio, la página de venta de Golden) -- golden_perpetuo O
    premium_origen golden/mentoria. **NUNCA usarla para gatear una
    feature puntual**, para eso `permisos()`.
  - `esMentoria(p)`: SOLO premium_origen = 'mentoria'. Usar solo para
    beneficios exclusivos de mentoría fuera de `permisos()` (ej. el texto
    condicional dentro de `/alimentacion/guia`).
  - `diasRestantesTrial(p)`: SOLO Free Trial (lista positiva,
    `premium_origen === 'trial'`) -- nunca la uses para saber si a alguien
    "le quedan días" en sentido amplio, Compra suelta también tiene
    `premium_hasta` pero no es trial.
  - `obtenerSuscripcion(p, sub)`: para mostrar el badge de estado en
    Inicio/Perfil.
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

## Aplicar migraciones desde la terminal (HECHO 2026-10-12: `scripts/migrar.mjs`)

**Estado actual**: el script existe y funciona. Uso:
`node scripts/migrar.mjs supabase/migration_NNN_x.sql [--dry] [--permitir-destructivo] [--forzar] [--solo-registrar]`.
Manda el archivo entero en una sola consulta (transacción implícita: todo o
nada), hace backup antes y registra en `public.migraciones_aplicadas`. La 096 y
la 097 ya están registradas (`--solo-registrar`). Lo que sigue es el diseño
original (ya implementado; los puntos "Pendiente" quedaron resueltos).

El coach quiere que Claude corra las migraciones en vez de pegarlas a mano en el
SQL Editor. Estado al 2026-10-12:
- **Hecho**: hay un token personal de Supabase de vida corta en `.env.local` como
  `SUPABASE_ACCESS_TOKEN` (git lo ignora; NO copiarlo a ningún otro lado ni al
  chat) y se verificó con una consulta de solo lectura contra
  `https://api.supabase.com/v1/projects/<ref>/database/query` (`<ref>` sale de
  `NEXT_PUBLIC_SUPABASE_URL`). Cuando venza, el coach crea otro en
  `supabase.com/dashboard/account/tokens` y lo pega él en `.env.local`.
- ~~**Pendiente**~~ (HECHO 2026-10-12, ya existe): crear `scripts/migrar.mjs`. La herramienta de seguridad bloqueó
  la primera escritura del archivo (clasificador del modo automático, sin motivo);
  no se esquivó. En la sesión nueva: pedir el archivo de nuevo y, si se vuelve a
  bloquear, el coach tiene que agregar una regla de permiso para escribir
  `scripts/migrar.mjs` desde la configuración de Claude Code.
- **Diseño del script** (a respetar): acepta solo `supabase/migration_NNN_*.sql`
  dentro de este repo; parte el SQL en sentencias (respetando comentarios,
  strings y cuerpos `$$`), muestra qué tablas/sentencias toca y se niega a seguir
  ante DROP TABLE/SCHEMA/COLUMN, TRUNCATE, DELETE o UPDATE sin WHERE salvo
  `--permitir-destructivo`; `--dry` solo analiza; hace
  `node scripts/backup-supabase.mjs --forzar` ANTES y si falla no migra; registra
  cada migración en `public.migraciones_aplicadas` (nombre, huella, fecha; RLS sin
  policies) y no la re-aplica salvo `--forzar`; `--solo-registrar` anota las que
  el coach corrió a mano (096 y 097 ya están aplicadas en producción, anotarlas).
- **Reglas de uso** una vez creado: Claude solo corre migraciones que armó en la
  sesión y que el coach pidió; cualquier operación destructiva se confirma con él
  antes; después de aplicar se verifica el resultado contra la base (como se hizo
  con la 096/097).
- **AUTORIZADO por el coach el 2026-10-12** ("quiero que vos corras las
  migraciones"): esto REEMPLAZA la regla vieja de "No correr ninguna migración SQL
  contra producción" de la sección "Qué NO hacer". El script NO es condición para
  empezar: cuando el coach pide aplicar una migración, Claude la corre directo
  contra la API con `SUPABASE_ACCESS_TOKEN` haciendo a mano las mismas
  precauciones (backup con `node scripts/backup-supabase.mjs --forzar`, mostrar
  qué toca, confirmar antes si hay algo destructivo, verificar después). Si la
  herramienta de seguridad bloquea la ejecución, no esquivarla: avisarle al coach
  que tiene que habilitar el permiso.

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

## Reglas de producto (traídas de la memoria de Claude, 2026-11-03)

- Botones de cobro: **Mercado Pago amarillo, PayPal celeste** (al revés de las marcas; lo corrigió dos veces).
- Todo se cobra en el sitio web; la app es gratis y no habla de precios. Nunca Google Play Billing ni Apple IAP
  (cero comisiones). Publicar en tiendas está postergado: ver bitácora antes de retomarlo.
- Cada ejercicio nuevo lleva GIF (`imagen_url`) y video: buscar en la librería de GIFs; si no está el exacto,
  usar el de un ejercicio hermano. Nunca dejarlo vacío. Antes de sumar uno, correr
  `node scripts/detectar-ejercicios-duplicados.mjs --candidato` (agarre o implemento distinto = ejercicio aparte).
- Cámara: lo primero es que **cuente bien las repeticiones**; corregir técnica es secundario. Medir siempre contra
  series reales guardadas (`pose_sesiones_prueba`).
- Después de guardar un dato, mostrar lo guardado ahí mismo (refresco en el lugar), no solo un cartel.
- Día extra o cambios de rutina para un cliente de mentoría: si la rutina es compartida (ej. "Kraken Standard M"),
  NUNCA editarla: crear copia privada del cliente, darle acceso, dejarla activa y reapuntar su
  `profile_routine_history` abierto a la copia (no abrir tramo nuevo). Verificar leyendo la base que la original
  quedó intacta. Ejemplo: día C de Walter (rutina 14) → Coco (27), Rahim (28).

## Qué NO hacer sin preguntarle antes al usuario

- (Actualizado 2026-10-12) Las migraciones SQL contra producción SÍ las corre
  Claude cuando el coach lo pide, **siempre con `scripts/migrar.mjs`** (primero
  `--dry`; no pegar SQL suelto a la API); nunca por iniciativa propia, y
  `--permitir-destructivo` solo después de confirmar con el coach.
- No tocar `.env.local` ni pedir la `SUPABASE_SERVICE_ROLE_KEY` por chat.
- No hacer `git push --force`, no reescribir historial.
- No sacar ni modificar ningún disclaimer legal (Alimentación, Medidas).
- No retomar rutinas multi-día nuevas sin que el usuario lo pida él mismo.

## Índice de docs/BITACORA.md (buscar ahí antes de tocar estas cosas)

- "Crea tu rutina" (en construcción, arrancado 2026-09-21)
- Auditoría del catálogo de ejercicios (2026-09-21) -- en curso
- Nuevo protocolo para clientes de Mentoría / entrenamiento privado (2026-09-20)
- Categorías de acceso de usuario (premisa 2026-09-21, todavía por refinar)
- Decisiones de negocio ya tomadas a propósito (no "corregir" sin preguntar)
- Dominio propio + Resend (2026-10-03)
- Backups gratuitos a Google Drive (2026-10-07)
- Rutina "Kraken Split" reescrita completa (2026-10-05, migración 090)
- Cumplimiento legal (tanda del 2026-10-08)
- Cobros: qué se probó con plata REAL en producción (registro, 2026-10-08)
- Rutina "Kraken Dorian" y registro de drop sets (2026-10-12, migraciones 096 y 097)
- Bug corregido: registro duplicado del mismo lado en ejercicios unilaterales
- Gráficos por fecha: escala monocromática de naranjas (2026-10-07)
- Analizador de rutinas y pentágono (2026-09-22)
- Ejercicios repetidos en varios días de la misma rutina: salvaguarda preventiva (2026-09-23)
- Volumen: curva de 3 tramos (MEV-MAV-MRV) y Frecuencia: curva de 2 tramos (2026-09-24)
- Volumen: verificación en producción del denominador fijo + Terciario (2026-09-24)
- Borrado de rutinas (2026-09-22)
- Total semanal en Sostenibilidad (2026-09-24)
- Revisión del catálogo músculo por músculo (2026-09-24, en curso)
- Edición de rutinas creadas por el usuario (2026-09-24)
- Rutinas nuevas: Torso-Pierna y Push Pull Legs (migración 060)
- Anti-Flakardo: nombres reales y corrección del Torso Pierna (2026-09-22)
- Vista de coach, solo lectura (2026-09-26, migración 079)
- Bug: historial "desaparecido" al reactivar la misma rutina (2026-09-27)
- Ajustes a Kraken Split pedidos por el usuario (2026-09-28, migración 082)
- Rutinas estandarizadas (proceso durable, 2026-09-28)
- Análisis de lo ejecutado (PENDIENTE, fuera del despliegue desde 2026-10-14)
- Cumplimiento y compras: diagnóstico del sitio + adenda legal (tanda del 2026-10-13)
- Diagnóstico de seguridad y correcciones (2026-10-15)
- Cámara: análisis de movimiento en tiempo real (PROTOTIPO, 2026-10-16)
- Pagos fuera de la app (decisión del coach, 2026-10-17)
- Modalidad de carga por ejercicio (migración 103, en construcción 2026-10-19)
- Contador universal de repeticiones con cámara (prototipo, 2026-10-20)
- Panel global de progreso (prototipo, 2026-10-20)
- Diagnóstico de velocidad y seguridad (2026-10-22)
- Potencial muscular estimado (2026-10-26)
- Diagnóstico general, catálogo duplicado y "Crea tu rutina" (2026-10-30, migración 112)
- Rutina "KRAKEN DEFINITIVA" y bloques de ejercicios / biseries (2026-11-02, migración 113)

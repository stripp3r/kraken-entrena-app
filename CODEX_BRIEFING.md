# Briefing para Codex — KRAKEN Entrena

Este documento es para poner al día a otra IA (Codex/ChatGPT) que corre
diagnósticos sobre este proyecto en paralelo. El desarrollo del día a día
sigue en Claude Code -- esto es para que Codex tenga contexto real y no
proponga cosas que ya se decidieron a propósito de otra manera, ni
duplique trabajo ya hecho.

**Nota**: el contenido de este archivo está duplicado (con algunos
detalles extra pensados solo para Claude) en `CLAUDE.md` en la raíz del
repo -- ese es el que Claude Code lee automáticamente en cada sesión acá.
Si encontrás algo para corregir/sumar, decíselo al usuario para que lo
actualice en los dos lados, o pedile que le pase este mismo archivo a
Claude para que lo actualice.

## Qué es esto

**KRAKEN Entrena**: PWA (Progressive Web App) de entrenamiento — reemplaza
un Excel (`EntrenaOptimo`) que el coach (Ezequiel) usaba para dar rutinas
online. Clientes reales ya la están usando.

- **Repo**: `D:\PROYECTO FITNESS\APP\kraken-entrena-app`
- **Deploy**: Vercel, producción en `https://kraken-entrena-app.vercel.app`
- **Stack**: Next.js 16 (App Router) + TypeScript + Tailwind CSS,
  Supabase (Postgres + Auth + Storage), sin backend propio aparte de rutas
  API de Next (`src/app/api/...`) para checkout/webhooks.
- **Proyecto hermano** (repo distinto, no tocar desde acá salvo que se pida
  explícitamente): sitio de marketing en
  `D:\PROYECTO FITNESS\WEB SITE\NUEVO SITIO WEB` (HTML/CSS/JS estático,
  Vercel aparte), vende los mismos planes/Golden/mentoría por fuera de la
  app.

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
                               IMPORTANTE: no se aplican solas. El coach las
                               corre a mano en el SQL Editor de Supabase,
                               una por una, en orden numérico. Un cambio de
                               esquema nuevo sale como un migration_0XX.sql
                               nuevo (siguiente número libre), nunca editando
                               uno viejo ya corrido.
scripts/
  asignar-gifs.js            -- sube GIFs a Storage y los linkea por nombre
                                 (necesita SUPABASE_SERVICE_ROLE_KEY en .env.local,
                                 que el coach carga a mano -- nunca pedirla por chat)
public/section-icons/        -- íconos de cada sección/hub, PNG 160x160 transparentes
```

Carpetas sueltas en la raíz tipo `gifs-*/`, `videos-*/` son staging
temporal para que el coach suba archivos a Supabase Storage a mano -- no
son parte del código, no están en git.

## Modelo de datos (lo esencial)

- `profiles`: datos del usuario + acceso: `premium_hasta` (fecha),
  `golden_perpetuo` (bool), `premium_origen`
  ('trial'|'compra'|'golden'|'mentoria'). Ver `src/lib/premium.ts`
  (`esPremium`, `esGoldenTier`, `esMentoria`, `diasRestantesTrial`,
  `obtenerSuscripcion`) — es la fuente de verdad, no reimplementar esta
  lógica en otro lado. `esGoldenTier` es golden O mentoria (gates amplios
  tipo rutinas/calculadora); `esMentoria` es estricto, solo para
  beneficios exclusivos de mentoría (ej. Guía alimenticia).
- `exercise_definitions`: ejercicio canónico y reutilizable (nombre,
  categoria, imagen_url, video_url, video_url_fem, como_hacerlo,
  tipo_esfuerzo, unilateral, alternativa). Un mismo ejercicio se reutiliza
  entre rutinas distintas para no cortar el historial de fuerza. Ver más
  abajo la distinción gif/video, que se prestó a confusión una vez.
- `routine_exercises`: la fila de "scheduling" (qué ejercicio, qué día, en
  qué orden, con qué `series_reps` sugeridas) dentro de una rutina. Apunta
  a `exercise_definitions` por FK.
- `routines`: puede ser pública o **privada** (`es_privada = true`,
  protegido por RLS + `profile_routine_access`) — así se arman rutinas a
  medida para un solo usuario (mentoría, ej. "Kraken Split") o planes
  pagos específicos (ej. "Grasa Sub-Cero") sin que aparezcan gratis para
  cualquier Golden/trial.
- `workout_logs`: cada serie registrada (peso, reps, rir, lado, fecha),
  keyed por `exercise_definition_id`.
- `body_measurements`: medidas corporales, un registro por fecha.
- `profile_routine_history`: qué rutina tuvo activa cada usuario y cuándo.
  El análisis de Progreso se scopea al stint activo, no a toda la vida.
- `productos` / `compras` / `producto_rutinas`: planes sueltos (PDF +
  rutina + 3 meses de acceso). El checkout (`/api/checkout/mercadopago` y
  `/api/checkout/paypal`) y el webhook que acredita el acceso
  (`procesarCompraAprobada` en `src/lib/compras.ts`) son **100% genéricos**
  -- agregar un producto nuevo es una fila en `productos`, no código nuevo.
  `handle_new_user()` también reclama compras hechas antes de registrarse.
- `suscripciones`: pagos recurrentes reales de Golden (Mercado Pago o
  PayPal). Un Golden/mentoría otorgado a mano NO tiene fila acá.

## GIF vs VIDEO de un ejercicio -- dos cosas distintas

- **`imagen_url` (gif)**: vista rápida SIEMPRE visible (grilla de
  ejercicios, tarjetas compactas). Biblioteca de referencia (ilustrado,
  blanco y negro, ya hechos): `D:\PROYECTO FITNESS\VIDEOS\RECURSOS\
  TECNICAS DE EJERCICIOS\EJERCICIOS\<GRUPO MUSCULAR>\`.
- **`video_url` / `video_url_fem`**: solo aparece al tocar "¿Cómo
  hacerlo?" dentro del ejercicio activo. Fuente: carpeta separada
  `...\EJERCICIOS EXPLICATIVOS\` (ojo, no confundir con la de arriba).
- Nunca dejar ninguno de los dos en null -- si no hay archivo exacto,
  buscar un ejercicio hermano parecido en la biblioteca antes que dejarlo
  vacío.

## Bug de Supabase Storage a tener en cuenta

Cualquier nombre de archivo con tilde (á, é, í, ó, ú) falla al subirlo por
el Dashboard de Supabase ("File name is invalid"), tanto para .gif como
.mp4, uno por uno o en lote. El nombre del ARCHIVO en Storage va siempre
sin tilde; el `nombre` de la columna en la base sigue con tilde (español
correcto). Solo pasa subiendo por el Dashboard -- vía `asignar-gifs.js`
(service role) no aparece.

## Convenciones para migraciones que reasignan ejercicios de una rutina

- Si una migración reemplaza el `exercise_definition_id` de una fila de
  `routine_exercises` Y además hay que borrar el historial de
  `workout_logs` de esa rutina, el DELETE va **antes** del/de los UPDATE
  que reasignan, no después. `workout_logs` no tiene columna de rutina --
  el único join posible para "todos los logs de esta rutina" es a través
  de `routine_exercises`, y si el ejercicio viejo ya fue reemplazado en esa
  fila, el join ya no lo encuentra y ese historial queda huérfano sin
  borrar. Ver `migration_049_kraken_split_rediseno.sql` como ejemplo.
- Un cambio de postura (parado/sentado) del mismo movimiento no siempre
  necesita un `exercise_definition_id` nuevo -- si alcanza con anotarlo en
  el texto de `series_reps` de esa fila (`'... (sentado)'`), se reutiliza
  el mismo ejercicio canónico. Un id nuevo se justifica cuando cambia el
  equipo/movimiento de verdad (mancuerna -> polea, por ejemplo).

## Bug corregido: registro duplicado del mismo lado en ejercicios unilaterales

Reportado 2026-09-19: en un ejercicio unilateral el usuario cargaba el
lado derecho dos veces seguidas antes de que apareciera el izquierdo.
Causa: `descansoHasta`/`etiquetaDescanso` (cronómetro de "Descanso entre
lados") vivían solo en el estado de React, nunca se guardaban en
`sessionStorage` -- si la pestaña de la PWA se descargaba/cerraba durante
ese descanso (común en Android en segundo plano), al volver se restauraba
el lado correcto pero el cronómetro se perdía, mostrando de nuevo el
formulario de carga para el mismo lado sin que `avanzarLado()` se hubiese
disparado. Fix: `SesionGuardada` (en `sesion-entrenamiento.ts`) ahora
también persiste `descansoHasta`/`etiquetaDescanso`; al restaurar, si el
descanso ya venció mientras la app estaba cerrada se avanza el lado igual
en vez de dejarlo repetible.

## Categorías de acceso de usuario (premisa 2026-09-21, todavía por refinar)

Sale de columnas que ya existen, sin cambiar el esquema:
- **Golden Founder** (`golden_perpetuo = true`): SOLO las 2 cuentas propias
  del coach (`ezequiel.arce@outlook.com`, `ar.cs@hotmail.es`). Nunca
  ponerle esto a un cliente real.
- **Mentoría 1 a 1** (`premium_origen = 'mentoria'`): compra mentoría
  (vendida en el sitio). Incluye todo Golden + `esMentoria()` (Guía
  alimenticia). Dos variantes de trato sin columna propia todavía: online
  (a distancia) vs. privada/presencial (entrena con el coach). Renovación
  100% manual hoy (el coach empuja `premium_hasta` cuando le pagan fuera
  de Mercado Pago/PayPal) -- pendiente de diseño un sistema automático,
  explícitamente pausado por el usuario, no proponerlo sin que lo pida.
- **Golden Anual / Golden Mensual**: NO compra mentoría, se autogestiona
  (ej. Anti-Flakardo, Grasa Sub-Cero). Todavía sin discriminar con
  precisión contra `premium_origen = 'compra'` (3 meses) vs. `'golden'`
  con `suscripciones.frecuencia` -- pendiente a propósito.
- **Free Trial** (`premium_origen = 'trial'`): prueba de unos días.
- **Cuentas de testeo** (`kraken.test.qa@gmail.com`,
  `kraken.test.qa2@gmail.com`): no son clientes, excluir de reportes.
- **Bug corregido 2026-09-21**: 4 cuentas de mentoría tenían
  `golden_perpetuo = true` puesto a mano por error al darlas de alta --
  hacía que mostraran "Golden · Founder" en vez de "Mentoría · hasta
  [fecha]" (`obtenerSuscripcion()` chequea `golden_perpetuo` primero). Un
  cliente de mentoría nuevo se da de alta con `premium_origen = 'mentoria'`
  + `premium_hasta`, nunca con `golden_perpetuo`.

## Decisiones ya tomadas a propósito (no "corregir" sin preguntar)

- **Colores de los botones de pago**: Mercado Pago = amarillo, PayPal =
  celeste -- es lo OPUESTO a los colores de marca reales de cada uno. El
  usuario lo pidió así explícitamente, dos veces. No "arreglarlo" a los
  colores reales.
- **PWA, no app nativa (todavía)**: es una decisión consciente por
  velocidad/costo. Ya se identificaron limitaciones reales de esto:
  - iOS Safari **nunca** implementó bloqueo de orientación -- se resolvió
    con un overlay CSS que tapa la pantalla en landscape
    (`src/components/orientation-guard.tsx`), no hay forma real de
    forzar la rotación ahí.
  - Instalar la PWA en Android vía **Samsung Internet** (u otros
    navegadores de fabricante) puede disparar un bloqueo de Play Protect
    ("app insegura, diseñada para una versión anterior de Android") por
    cómo ese navegador arma el WebAPK -- Chrome no tiene ese problema.
    Workaround actual: instrucciones al usuario para instalar desde Chrome.
  - **"KRAKEN Entrena requiere la siguiente app: Chrome"** (loop de
    Cerrar/Instalar aunque Chrome esté actualizado): confirmado en
    producción el 2026-09-19. No es un bug del manifest/service worker de
    la app (revisados, están bien) -- el WebAPK que arma Android queda
    atado a la versión de Chrome que lo generó, y una actualización de
    Chrome en segundo plano puede romper esa asociación. Bug conocido de
    Android/WebAPK, no exclusivo de esta app. Arreglo confirmado:
    reiniciar el celular; si no alcanza, borrar caché de Chrome, después
    reinstalar el ícono, y como último recurso desinstalar las
    actualizaciones de Chrome. Solo se elimina de raíz publicando como app
    nativa real en Play Store en vez de PWA/WebAPK.
  - `-webkit-touch-callout: none` es Safari/iOS-only -- en Android/Chrome
    hace falta cancelar el evento `contextmenu` (ver `register-sw.tsx`)
    para evitar el menú nativo de "mantener presionado" sobre un link.
  - Pasar a Play Store/App Store (empaquetado con Capacitor) resolvería
    ambas cosas de raíz, pero es un proyecto aparte, no urgente.
- **Alimentación** (calculadora de calorías + guía) tiene dos niveles: la
  calculadora es Golden-o-Mentoría (`esGoldenTier`), la Guía alimenticia
  es EXCLUSIVA de Mentoría (`esMentoria`, más estricto). Ambas exigen un
  pop-up de disclaimer con "Sí, entiendo" guardado por usuario antes de
  mostrar contenido (`disclaimer-gate.tsx`).
- **Rutinas multi-día nuevas** (Sayayin, variantes de 3 días): rechazadas
  explícitamente por el usuario, "no las quiero hasta nuevo aviso" -- no
  proponerlas de nuevo salvo que él las pida.
- **Planes autoguiados** (Grasa Sub-Cero, Híbrido, En Casa, Minimalista):
  rutinas privadas, exclusivas de quien compró ese producto puntual.
- **Diferenciación de features entre trial / Golden mensual / Golden
  anual**: pendiente a propósito, el usuario todavía no lo definió.
- **Login con Google/Facebook**: prioridad reconocida pero bloqueada hasta
  que el usuario cree las cuentas de desarrollador correspondientes.
- **Recuperar contraseña**: falta implementar (`resetPasswordForEmail` de
  Supabase Auth) -- pedido explícito, no construido aún.

## Convenciones de código a respetar

- Español en nombres de variables/funciones/columnas de negocio, inglés
  solo en lo genérico de React/Next.
- Sin comentarios explicando "qué hace" el código (los nombres ya lo
  dicen) -- solo comentarios que expliquen un "por qué" no obvio.
- Fechas: **siempre** en huso horario Argentina, usando los helpers de
  `src/lib/fecha.ts` (`hoyISO`, `fechaISO`, `inicioDelDiaArgentinaUTC`,
  `calcularEdad`) -- nunca `new Date().toISOString()` a secas para
  mostrarle una fecha al usuario, porque el servidor corre en UTC.
- Tailwind con clases utilitarias directas, sin CSS-in-JS ni styled-components.
- No usar `<input type="date">` ni ningún `<select>` nativo del navegador
  para nada visible al usuario -- hay componentes propios
  (`SelectNativo` en `src/components/select-nativo.tsx`) para que se vea
  igual en iOS/Android en vez del picker nativo de cada uno.
- Estado de "dónde estaba el usuario" (sesión de entrenamiento en curso,
  última pantalla por hub) vive en `sessionStorage` del cliente
  (`src/lib/sesion-entrenamiento.ts`, `src/lib/ultima-pantalla.ts`), no en
  la base -- es conveniencia de UI, no dato a persistir server-side.

## Qué NO hacer sin preguntarle antes al usuario

- No correr ninguna migración SQL contra la base de producción -- Codex
  puede proponer una, pero el coach es quien la corre a mano.
- No tocar `.env.local` ni pedir la `SUPABASE_SERVICE_ROLE_KEY` por chat.
- No hacer `git push --force`, no reescribir historial.
- No sacar ni modificar ningún disclaimer legal (Alimentación, Medidas).
- No retomar rutinas multi-día nuevas sin que el usuario lo pida él mismo.

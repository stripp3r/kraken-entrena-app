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

## Qué NO hacer sin preguntarle antes al usuario

- No correr ninguna migración SQL contra la base de producción -- se
  puede escribir el archivo `migration_0XX.sql`, pero el coach es quien la
  corre a mano en el SQL Editor.
- No tocar `.env.local` ni pedir la `SUPABASE_SERVICE_ROLE_KEY` por chat.
- No hacer `git push --force`, no reescribir historial.
- No sacar ni modificar ningún disclaimer legal (Alimentación, Medidas).
- No retomar rutinas multi-día nuevas sin que el usuario lo pida él mismo.

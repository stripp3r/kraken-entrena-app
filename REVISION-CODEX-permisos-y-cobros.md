# Pedido de revisión — control de acceso y cobros (KRAKEN Entrena)

Este documento es un brief para que **Codex (OpenAI)** revise, de forma
independiente, el sistema de control de acceso por categoría de usuario y
el sistema de cobros recurrentes de esta app. Fue armado por otra sesión de
Claude Code que terminó de construir y verificar en vivo (producción) todo
lo que se describe acá. El objetivo de esta revisión es una segunda mirada
fresca: confirmar que la lógica es correcta, encontrar casos borde no
contemplados, y señalar cualquier inconsistencia — sin asumir que lo ya
descrito es intocable, pero teniendo en cuenta qué fue una decisión de
negocio deliberada (ver sección final) para no reportarla como bug.

Repo: `kraken-entrena-app` (Next.js 16 App Router + Supabase).
Para contexto completo del proyecto (modelo de datos, historial de
decisiones, convenciones), ver [`CLAUDE.md`](./CLAUDE.md) en la raíz —
es el living doc del repo, se actualiza con cada cambio de criterio.

## 1. El problema original que motivó todo esto

Una clienta de Mentoría 1:1 (acceso pago, a medida) podía ver y acceder a
un producto autoguiado pago que no había comprado. Causa raíz: el acceso a
features estaba chequeado con funciones booleanas sueltas repartidas por
toda la app (`esGoldenTier()`, chequeos inline por pantalla), sin una única
fuente de verdad — así que alguien podía agregar un chequeo nuevo sin
replicar todas las excepciones que ya existían en otro lado. Se resolvió
centralizando TODO el control de acceso en una sola matriz. Esta revisión
es, en esencia, pedirle a un segundo par de ojos que confirme que esa
centralización no tiene huecos (y de hecho, durante esta misma ronda de
trabajo con Claude apareció un segundo bug real de la misma familia — ver
sección 2.3 — lo cual es la razón concreta de pedir esta revisión externa
antes de salir a vender en serio).

## 2. Control de acceso por categoría

### 2.1 Fuente única de verdad: `permisos()`

Archivo: [`src/lib/premium.ts`](./src/lib/premium.ts).

```ts
export type Permisos = {
  catalogoCompleto: boolean;       // navegar/cambiarse a cualquier rutina pública
  cardio: boolean;
  limiteRutinasCreadas: number | null; // null = sin límite, 0 = bloqueado, N = tope
  historial: boolean;              // Progreso > Historial
  evolucion: boolean;              // Perfil > Mi evolución
  misPdfs: boolean;                // Perfil > Mis PDFs
  calculadora: boolean;            // Alimentación > Calculadora de calorías
  guiaAlimenticia: boolean;        // Alimentación > Guía alimenticia
};
```

`permisos(profile)` es la ÚNICA función que debe decidir qué puede hacer
cada perfil. La regla de trabajo de este repo (ver CLAUDE.md, sección
"Categorías de acceso de usuario") es que ninguna pantalla debe chequear
`premium_origen` directamente — siempre pasa por acá.

Categorías y su resultado actual (todas en `premium.ts`, función
`permisos()`):

| Categoría | `premium_origen` | catalogoCompleto | cardio | limiteRutinasCreadas | historial/evolucion/misPdfs | calculadora | guiaAlimenticia |
|---|---|---|---|---|---|---|---|
| Founder | `'founder'` | true | true | null (sin límite) | true | true | true |
| Mentoría 1:1 (online y presencial) | `'mentoria'` | **false** | true | 0 | true | true | true |
| Golden mensual/anual | `'golden'` | true | true | null | true | true | **false** |
| Compra Suelta (plan autoguiado) | `'compra'` | **false** | true | 0 | true | true | **false** |
| Free Trial (14 días) | `'trial'` | false | false | 1 | false | false | false |
| Sin plan vigente | — | false | false | 0 | false | false | false |

Puntos para verificar con ojo crítico:

- **Founder vs. Mentoría**: Founder tiene acceso incondicional a TODO
  (incluido `catalogoCompleto`), Mentoría explícitamente NO. ¿Tiene sentido
  que Founder (cuentas del propio coach) vea más que un cliente que paga
  mentoría? Fue una decisión consciente (Founder = cuentas de prueba/demo
  del propio coach, no clientes reales), pero vale que lo confirmen.
- **Guía alimenticia es EXCLUSIVA de Mentoría** — ni Golden ni Compra la
  tienen, por más que paguen más caro que algunos tiers de mentoría. Es
  intencional (ver sección 4), no un olvido.
- `esPremium(p)` (misma archivo, línea ~33): `!!p.premium_hasta &&
  p.premium_hasta >= hoyISO()`, con `golden_perpetuo` como override total.
  Revisar que no haya ninguna comparación de fechas con otro criterio
  (timezone, `>` vs `>=`, etc.) en otro lugar del código que contradiga
  esta.

### 2.2 Rutinas públicas vs. privadas: `rutinaIncluidaEnPlan()`

Mismo archivo, función `rutinaIncluidaEnPlan(p, rutina)`:

```ts
export function rutinaIncluidaEnPlan(p, rutina) {
  if (rutina.es_privada) return false;
  if (permisos(p).catalogoCompleto) return true;
  if (esTrial(p)) return RUTINAS_PUBLICAS_TRIAL.includes(rutina.nombre);
  return false;
}
```

`routines.es_privada` (columna boolean en Supabase) es la segunda mitad del
modelo de permisos: una rutina privada NUNCA se desbloquea por
`catalogoCompleto`, sin importar la categoría — necesita una fila explícita
en `profile_routine_access`. Esto está reforzado también a nivel de RLS
(Postgres Row Level Security) en las migraciones `035`, `081` — no es solo
un chequeo de UI, también está bloqueado a nivel de base de datos si
alguien pegara directo a la API de Supabase.

**Qué revisar acá específicamente**: que CUALQUIER rutina ligada a un
producto de venta individual (plan autoguiado) tenga `es_privada = true`.
Query de verificación:

```sql
select r.id, r.nombre, r.es_privada
from routines r
join producto_rutinas pr on pr.routine_id = r.id;
```

Todas las filas que devuelva esto deberían tener `es_privada = true`. Si
alguna da `false`, es el mismo bug de la sección 2.3 repitiéndose.

### 2.3 Bug real ya encontrado y corregido con este mismo criterio

El 2026-10-02, revisando precisamente esto, se encontró que
`"Anti-Flakardo Fullbody"` y `"Anti-Flakardo Torso Pierna"` (las rutinas
del único plan autoguiado que se vende hoy) tenían `es_privada = false`.
Causa: nacieron como rutinas públicas genéricas y se les reemplazó el
contenido por el plan de venta real en una migración posterior (061/062)
sin que nadie actualizara el flag. Efecto: cualquier cuenta Golden
(`catalogoCompleto = true`) las veía como parte del catálogo general y
podía usarlas sin haber comprado el plan. Corregido en
`migration_089_anti_flakardo_privada.sql` (ya corrida en producción). Se
confirmó por API REST contra la base real que las 6 rutinas de planes
autoguiados (Anti-Flakardo Fullbody/Torso Pierna, Grasa Sub-Cero, Híbrido,
En Casa, Minimalista) quedaron con `es_privada = true`.

Esto es la motivación concreta de pedir esta revisión: si este bug pasó
una vez por un flag que "se asume" en vez de verificarse, puede haber otro
caso similar que a Claude se le haya pasado. Buscarlo activamente es parte
del pedido.

### 2.4 Cómo se otorga acceso a una rutina privada por compra

Archivo: [`src/lib/compras.ts`](./src/lib/compras.ts), función
`procesarCompraAprobada()`. Al aprobarse un pago (webhook de Mercado Pago o
PayPal), busca en `producto_rutinas` qué `routine_id` corresponden al
`producto_id` comprado, e inserta esas filas en `profile_routine_access`
(`upsert` con `ignoreDuplicates: true`, así que es idempotente ante
reintentos del webhook). Esto es genérico — no hay ningún `if slug ===
'anti-flakardo'` hardcodeado — así que cualquier plan autoguiado nuevo que
se cargue correctamente en `productos` + `producto_rutinas` + `es_privada =
true` queda andando sin tocar código. Confirmar que efectivamente no hay
ningún caso hardcodeado a un producto puntual en este archivo ni en los
webhooks.

## 3. Cobros recurrentes (Golden y Mentoría Online)

### 3.1 Arquitectura: dos pipelines paralelos, deliberadamente separados

Golden (`src/lib/suscripciones.ts`, funciones con sufijo `Golden`) y
Mentoría Online (mismas funciones con sufijo `MentoriaOnline`) tienen
código **duplicado a propósito**, no compartido, para que trabajar en uno
no pueda romper el otro (Golden es el que ya genera ingresos reales; no se
quiso tocarlo para construir el nuevo). Evaluar si esto es la decisión
correcta o si el riesgo de duplicación (un fix que se aplica a uno y se
olvida en el otro) pesa más que el riesgo de acoplamiento — es una
pregunta de juicio válida para esta revisión, no hay una respuesta "obvia".

Funciones a revisar:
- `acreditarCobroGolden()` / `acreditarCobroMentoriaOnline()` — idéntica
  lógica de acreditación, ver 3.2.
- `codificarReferenciaGolden()`/`decodificarReferencia()` vs.
  `codificarReferenciaMentoriaOnline()`/`decodificarReferenciaMentoriaOnline()`
  — Mentoría usa un prefijo `"mentoria:"` en el `external_reference`
  (Mercado Pago) / `custom_id` (PayPal) para poder distinguir ambos tipos
  de suscripción dentro del MISMO webhook compartido. Confirmar que no hay
  ninguna colisión posible entre el formato `userId|frecuencia` de Golden y
  `mentoria:userId|tier` de Mentoría (ej. un `userId` que contenga el
  string `"mentoria:"` o un `|` por casualidad).
- `pausarGolden()` / `cancelarGolden()` — **se reutilizan tal cual para
  Mentoría Online** (no tienen versión separada). Funcionan por
  `proveedor` + `proveedor_sub_id`, no por `premium_origen`, así que son
  agnósticas — pero vale confirmar que ninguna lógica interna asuma
  Golden específicamente pese al nombre de la función.

### 3.2 Semántica de vencimiento (pedido explícito del negocio)

Regla de negocio, confirmada por el coach: **el acceso a la app se
mantiene habilitado mientras la suscripción siga pagándose, con cada pago
cubriendo 30 días hacia adelante, pagados de forma anticipada**. En cuanto
el pago se interrumpe (falla, se cancela, se pausa), el acceso debe
cortarse solo una vez que se agote el período ya pagado — sin
intervención manual.

Implementación (idéntica en Golden y Mentoría Online):

```ts
const base = perfil?.premium_hasta && perfil.premium_hasta > hoy
  ? perfil.premium_hasta
  : hoy;
const nuevoHasta = unMesDesde(base);
// ... update profiles.premium_hasta = nuevoHasta
```

- Cada webhook de pago aprobado extiende `premium_hasta` desde el MAYOR
  entre "hoy" y lo que ya tenía acreditado — nunca pisa días ya pagados ni
  permite que un cobro doble sume 60 días por error de timing.
- El corte de acceso NO es una acción explícita: `pausarGolden`/
  `cancelarGolden` solo tocan `suscripciones.estado` (para mostrarlo en
  UI), nunca `premium_hasta`. El acceso se apaga solo cuando
  `esPremium()` (sección 2.1) empieza a devolver `false` porque la fecha
  ya quedó en el pasado.
- **Pregunta concreta para la revisión**: ¿hay algún camino donde
  `premium_hasta` pueda quedar sin actualizarse por un webhook perdido
  (no reintentado por el proveedor, error 500 no recuperado, etc.) de
  forma que un cliente que SIGUE pagando pierda acceso injustamente? Mercado
  Pago y PayPal reintentan webhooks fallidos, pero vale auditar qué pasa
  si un `acreditarCobroMentoriaOnline` tira una excepción a mitad de
  camino (¿queda en estado inconsistente entre `profiles` y
  `suscripciones`?).
- Idempotencia: ambas funciones chequean `sub?.ultimo_cobro_id === cobroId`
  antes de acreditar, para que un webhook reintentado no sume 30 días dos
  veces. Confirmar que `cobroId` es realmente estable/único por cobro en
  ambos proveedores (no un id que pueda repetirse entre cobros distintos).

### 3.3 Webhooks: identificación de a quién pertenece cada pago

Archivos: [`src/app/api/webhooks/mercadopago/route.ts`](./src/app/api/webhooks/mercadopago/route.ts),
[`src/app/api/webhooks/paypal/route.ts`](./src/app/api/webhooks/paypal/route.ts).

Patrón: SIEMPRE se vuelve a consultar el pago/suscripción contra la API
real del proveedor (nunca se confía en el payload del webhook tal cual
llega) y recién ahí se decide, decodificando el `external_reference`/
`custom_id`, si es una referencia de Mentoría o de Golden — si no matchea
el prefijo `mentoria:`, cae al camino de Golden sin cambios. Revisar que
este fallback sea seguro ante un `external_reference` corrupto o ausente
(¿qué pasa si viene `null`? ¿se ignora silenciosamente o rompe el
webhook?).

### 3.4 Checkout: redirect seguro tras login (fix de seguridad reciente)

Archivo: [`src/lib/next-redirect.ts`](./src/lib/next-redirect.ts).

Bug corregido recientemente: las 4 rutas de checkout
(`/api/checkout/{golden,mentoria-online}/{paypal,mercadopago}`)
redirigían a `/login` a secas cuando el usuario no estaba autenticado,
perdiendo la intención de compra — el usuario terminaba en el Home después
de loguearse, no en el checkout. Se agregó un parámetro `next` propagado a
través de login, registro y el onboarding obligatorio
(`/perfil/datos`), con una función `rutaSiguienteSegura()` que **rechaza
cualquier valor que no empiece con `/` o que empiece con `//`** (para
evitar un open redirect vía URL protocol-relative, ej. `next=//evil.com`
resolviendo como absoluta).

```ts
export function rutaSiguienteSegura(next: FormDataEntryValue | string | null) {
  if (typeof next !== "string") return null;
  if (!next.startsWith("/")) return null;
  if (next.startsWith("//")) return null;
  return next;
}
```

Pedido específico de revisión de seguridad: ¿esta validación es
suficiente? Casos a probar mentalmente: `next=/\evil.com` (backslash,
algunos navegadores lo normalizan a `//`), `next=/%2F%2Fevil.com` (URL
encoded), `next=/ /evil.com` (espacio), rutas con `javascript:` embebido
en algún punto intermedio de la cadena de redirects. Confirmar que
`redirect()` de Next.js no hace ninguna normalización propia que reintroduzca
el problema después de pasar la validación.

## 4. Decisiones de negocio deliberadas (NO reportar como bug)

Para que la revisión no pierda tiempo señalando cosas que ya se decidieron
a propósito con el dueño del negocio:

- **Mentoría Privada (presencial) sigue siendo 100% manual**: no tiene
  checkout, no tiene webhook, el coach la activa/desactiva a mano viendo
  al cliente en persona. Es intencional por ahora (se automatizará a
  futuro si el negocio pasa a modalidad de suscripción mensual también
  para la presencial).
- **Guía alimenticia exclusiva de Mentoría**, ni Golden ni Compra Suelta
  la tienen pese a ser planes pagos — es una decisión de producto, no un
  olvido de permisos.
- **Compra Suelta bloquea "Crea tu rutina" por completo**
  (`limiteRutinasCreadas: 0`) mientras que Free Trial permite 1 — son
  casos de negocio distintos (compraste tu plan vs. estás probando) y no
  deberían unificarse.
- **Golden y Mentoría dan exactamente el mismo acceso entre "online" y
  "presencial"/mensual y anual respectivamente** — la única diferencia es
  la etiqueta mostrada en "Tu plan", nunca los permisos reales.
- **No hay cross-sell dentro de la app** ("Adquirir esta rutina" con
  candado) — se removió a propósito; los planes autoguiados se venden
  desde el sitio web, no desde adentro de la app.
- Precios en ARS se cargan siempre a mano por el coach (nunca generados o
  asumidos por la IA) — si alguna consulta muestra un producto sin precio
  en ARS, es esperado hasta que el coach lo cargue, no un bug.

## 5. Qué se espera de vuelta de esta revisión

No hace falta que se implemente nada — es una auditoría. Idealmente, un
informe con:
1. Confirmación de que la matriz de `permisos()` es exhaustiva y
   consistente (sin combinación de categoría × feature sin definir).
2. Cualquier caso borde de fechas/timezone en la comparación
   `premium_hasta >= hoy` que pueda cortar o extender acceso un día de más
   o de menos.
3. Cualquier rutina ligada a `producto_rutinas` que no tenga
   `es_privada = true` (ver query en 2.2).
4. Opinión fundamada sobre la validación de `rutaSiguienteSegura()`
   (sección 3.4) — ¿alcanza o falta algún caso?
5. Cualquier camino donde un webhook fallido/parcial pueda dejar
   `profiles` y `suscripciones` inconsistentes entre sí.

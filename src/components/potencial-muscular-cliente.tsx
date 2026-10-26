"use client";

import { useEffect, useMemo, useState } from "react";
import { aNumero, limpiarDecimal } from "@/lib/numero";
import {
  berkhan,
  datosFfmiValidos,
  datosValidos,
  FFMI_REFERENCIA,
  ffmiPotencial,
  porcentajeAlcanzado,
  potencialMuscular,
  type Rango,
} from "@/lib/potencial-muscular";

// Potencial muscular natural ESTIMADO, con tres métodos para comparar (ver lib/potencial-muscular.ts):
//  - Casey Butt (estructura ósea: altura, muñeca, tobillo)
//  - FFMI (índice de masa libre de grasa, Kouri 1995)
//  - Regla de Berkhan (altura - 100)
// Todo se calcula en el teléfono; nada se envía ni se guarda en la base (tobillo y % de grasa se recuerdan solo en el
// navegador). Las medidas actuales vienen de la última carga en Medidas.

export type UltimaMedida = {
  altura: number | null;
  muneca: number | null;
  peso: number | null;
  cuello: number | null;
  pecho: number | null;
  brazo: number | null;
  antebrazo: number | null;
  muslos: number | null;
  gemelos: number | null;
};

type Metodo = "butt" | "ffmi" | "berkhan";

const METODOS: { id: Metodo; nombre: string; detalle: string }[] = [
  { id: "butt", nombre: "Casey Butt", detalle: "Estructura ósea" },
  { id: "ffmi", nombre: "FFMI", detalle: "Masa libre de grasa" },
  { id: "berkhan", nombre: "Berkhan", detalle: "Regla de la altura" },
];

const CLAVES = { tobillo: "kraken_potencial_tobillo", grasaObj: "kraken_potencial_grasa", grasaActual: "kraken_potencial_grasa_actual" };
const num = (n: number) => String(n).replace(".", ",");
const campo = "w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500";

function Anillo({ pct }: { pct: number }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const lleno = Math.max(0, Math.min(100, pct));
  return (
    <svg viewBox="0 0 100 100" className="h-28 w-28 flex-none -rotate-90" role="img" aria-label={`${Math.round(pct)} % del potencial`}>
      <circle cx="50" cy="50" r={r} fill="none" stroke="#262626" strokeWidth="9" />
      <circle cx="50" cy="50" r={r} fill="none" stroke="#34d399" strokeWidth="9" strokeLinecap="round" strokeDasharray={`${(lleno / 100) * c} ${c}`} />
    </svg>
  );
}

function Resumen({ pct, etiqueta, grande, chico, extra }: { pct: number | null; etiqueta: string; grande: string; chico: string; extra: string }) {
  return (
    <div className="mt-4 rounded-xl border border-emerald-800 bg-gradient-to-b from-emerald-950/70 to-bg-card p-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-none">
          <Anillo pct={pct ?? 0} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-2xl font-bold text-white">{pct !== null ? `${Math.round(pct)}%` : "–"}</p>
            <p className="text-[10px] text-gray-400">de tu potencial</p>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-wider text-gray-400">{etiqueta}</p>
          <p className="text-3xl font-semibold leading-tight text-emerald-300">{grande}</p>
          <p className="text-[11px] text-gray-500">{chico}</p>
          <p className="mt-1.5 text-[12px] text-gray-300">{extra}</p>
        </div>
      </div>
    </div>
  );
}

// Barra con la banda del potencial (rango) y la marca de dónde estás hoy.
function FilaMedida({ nombre, rango, actual }: { nombre: string; rango: Rango; actual: number | null }) {
  const pct = porcentajeAlcanzado(actual, rango.valor);
  const escala = Math.max(rango.max * 1.04, actual ?? 0);
  const x = (v: number) => `${Math.min(100, (v / escala) * 100)}%`;
  return (
    <div className="py-3">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-medium text-white">{nombre}</p>
        <p className="text-sm text-gray-300">
          {actual ? <><span className="font-semibold text-white">{num(actual)}</span> / </> : null}
          {num(rango.valor)} cm
        </p>
      </div>
      <div className="relative mt-2 h-2.5 rounded-full bg-neutral-800">
        <div className="absolute inset-y-0 rounded-full bg-emerald-900/70" style={{ left: x(rango.min), width: `calc(${x(rango.max)} - ${x(rango.min)})` }} />
        {actual && <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-300" style={{ width: x(actual) }} />}
        <div className="absolute -top-0.5 h-3.5 w-0.5 rounded bg-white/70" style={{ left: x(rango.valor) }} />
      </div>
      <p className="mt-1 text-[11px] text-gray-500">
        {pct !== null ? `${Math.round(pct)} % del potencial · ` : "Cargá esta medida en Mis medidas para ver tu avance · "}
        rango {num(rango.min)} – {num(rango.max)} cm
      </p>
    </div>
  );
}

function Tarjeta({ titulo, valor, nota }: { titulo: string; valor: string; nota?: string }) {
  return (
    <div className="rounded-xl border border-border-strong bg-bg-card p-3">
      <p className="text-[11px] text-gray-400">{titulo}</p>
      <p className="text-xl font-semibold text-white">{valor}</p>
      {nota && <p className="text-[11px] text-gray-500">{nota}</p>}
    </div>
  );
}

export function PotencialMuscularCliente({ sexo, ultima }: { sexo: "masculino" | "femenino" | null; ultima: UltimaMedida }) {
  const [metodo, setMetodo] = useState<Metodo>("butt");
  const [altura, setAltura] = useState(ultima.altura ? num(ultima.altura) : "");
  const [muneca, setMuneca] = useState(ultima.muneca ? num(ultima.muneca) : "");
  const [peso, setPeso] = useState(ultima.peso ? num(ultima.peso) : "");
  const [tobillo, setTobillo] = useState("");
  const [grasaObj, setGrasaObj] = useState("10");
  const [grasaActual, setGrasaActual] = useState("");
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    try {
      const t = window.localStorage.getItem(CLAVES.tobillo);
      const g = window.localStorage.getItem(CLAVES.grasaObj);
      const ga = window.localStorage.getItem(CLAVES.grasaActual);
      /* eslint-disable react-hooks/set-state-in-effect */
      if (t) setTobillo(t);
      if (g) setGrasaObj(g);
      if (ga) setGrasaActual(ga);
      /* eslint-enable react-hooks/set-state-in-effect */
    } catch {
      /* sin almacenamiento: se escribe a mano */
    }
  }, []);

  function guardar(clave: string, valor: string) {
    try {
      window.localStorage.setItem(clave, valor);
    } catch {
      /* sin almacenamiento */
    }
  }
  const campoGuardado = (set: (v: string) => void, clave: string) => (e: { target: { value: string } }) => {
    const v = limpiarDecimal(e.target.value);
    set(v);
    guardar(clave, v);
  };

  const alturaCm = aNumero(altura);
  const pesoKg = aNumero(peso);
  const butt = useMemo(() => ({ alturaCm, munecaCm: aNumero(muneca), tobilloCm: aNumero(tobillo), grasaPct: aNumero(grasaObj) }), [alturaCm, muneca, tobillo, grasaObj]);
  const ffmiEntrada = useMemo(() => ({ alturaCm, pesoKg, grasaPct: aNumero(grasaActual) }), [alturaCm, pesoKg, grasaActual]);

  const validoButt = datosValidos(butt);
  const validoFfmi = datosFfmiValidos(ffmiEntrada);
  const validoBerkhan = Number.isFinite(alturaCm) && alturaCm > 120 && alturaCm < 230;
  const valido = metodo === "butt" ? validoButt : metodo === "ffmi" ? validoFfmi : validoBerkhan;

  const rButt = validoButt ? potencialMuscular(butt) : null;
  const rFfmi = validoFfmi ? ffmiPotencial(ffmiEntrada) : null;
  const rBerkhan = validoBerkhan ? berkhan(alturaCm) : null;
  const grasaFueraDeRango = validoButt && (butt.grasaPct < 4 || butt.grasaPct > 12);

  const filasButt = rButt
    ? [
        { nombre: "Pecho", rango: rButt.pechoCm, actual: ultima.pecho },
        { nombre: "Brazo (bíceps)", rango: rButt.bicepsCm, actual: ultima.brazo },
        { nombre: "Antebrazo", rango: rButt.antebrazoCm, actual: ultima.antebrazo },
        { nombre: "Cuello", rango: rButt.cuelloCm, actual: ultima.cuello },
        { nombre: "Muslo", rango: rButt.muslosCm, actual: ultima.muslos },
        { nombre: "Pantorrilla", rango: rButt.gemelosCm, actual: ultima.gemelos },
      ]
    : [];
  const porcentajes = filasButt.map((f) => porcentajeAlcanzado(f.actual, f.rango.valor)).filter((p): p is number => p !== null);
  const promedioButt = porcentajes.length ? porcentajes.reduce((a, b) => a + b, 0) / porcentajes.length : null;
  const pesoActualVsBerkhan = rBerkhan && pesoKg > 0 ? (pesoKg / ((rBerkhan.pesoCotidianoMinKg + rBerkhan.pesoCotidianoMaxKg) / 2)) * 100 : null;

  const resumenDatos =
    metodo === "butt"
      ? `${num(butt.alturaCm)} cm · muñeca ${num(butt.munecaCm)} · tobillo ${num(butt.tobilloCm)} · ${num(butt.grasaPct)} % de grasa`
      : metodo === "ffmi"
        ? `${num(alturaCm)} cm · ${num(pesoKg)} kg · ${num(ffmiEntrada.grasaPct)} % de grasa actual`
        : `${num(alturaCm)} cm`;
  const mostrarCampos = !valido || editando;

  return (
    <div>
      <p className="mb-3 text-[12px] leading-snug text-gray-400">
        <b className="text-amber-300">Son estimaciones, no límites.</b> Para una cifra mucho más exacta hacen falta más análisis (composición corporal con
        DEXA y mediciones antropométricas completas); la genética, las hormonas y los años de entrenamiento también influyen.
      </p>

      {sexo === "femenino" && (
        <p className="mb-3 rounded-lg border border-border bg-bg-card p-3 text-[12px] text-gray-300">
          Estos modelos se armaron con datos de varones: en mujeres son menos confiables y tienden a sobrestimar. Tomalos como una referencia muy aproximada.
        </p>
      )}

      {/* Tus datos: solo los que pide el método elegido; compactos cuando están completos */}
      <div className="rounded-xl border border-border-strong bg-bg-card p-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-white">Tus datos</p>
          {valido && (
            <button type="button" onClick={() => setEditando((v) => !v)} className="text-xs text-emerald-400 underline">
              {editando ? "Listo" : "Editar"}
            </button>
          )}
        </div>
        {!mostrarCampos ? (
          <p className="mt-1 text-[13px] text-gray-300">{resumenDatos}</p>
        ) : (
          <>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[11px] text-gray-500">Altura (cm)</label>
                <input className={campo} inputMode="decimal" value={altura} onChange={(e) => setAltura(limpiarDecimal(e.target.value))} />
              </div>
              {metodo === "butt" && (
                <>
                  <div>
                    <label className="mb-1 block text-[11px] text-gray-500">% de grasa objetivo</label>
                    <input className={campo} inputMode="decimal" value={grasaObj} onChange={campoGuardado(setGrasaObj, CLAVES.grasaObj)} />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] text-gray-500">Muñeca (cm)</label>
                    <input className={campo} inputMode="decimal" value={muneca} onChange={(e) => setMuneca(limpiarDecimal(e.target.value))} />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] text-gray-500">Tobillo (cm)</label>
                    <input className={campo} inputMode="decimal" value={tobillo} onChange={campoGuardado(setTobillo, CLAVES.tobillo)} />
                  </div>
                </>
              )}
              {metodo === "ffmi" && (
                <>
                  <div>
                    <label className="mb-1 block text-[11px] text-gray-500">Peso (kg)</label>
                    <input className={campo} inputMode="decimal" value={peso} onChange={(e) => setPeso(limpiarDecimal(e.target.value))} />
                  </div>
                  <div className="col-span-2">
                    <label className="mb-1 block text-[11px] text-gray-500">% de grasa actual (estimado)</label>
                    <input className={campo} inputMode="decimal" value={grasaActual} onChange={campoGuardado(setGrasaActual, CLAVES.grasaActual)} />
                  </div>
                </>
              )}
              {metodo === "berkhan" && (
                <div>
                  <label className="mb-1 block text-[11px] text-gray-500">Peso actual (kg, opcional)</label>
                  <input className={campo} inputMode="decimal" value={peso} onChange={(e) => setPeso(limpiarDecimal(e.target.value))} />
                </div>
              )}
            </div>
            {metodo === "butt" && (
              <p className="mt-2 text-[11px] leading-snug text-gray-500">
                Muñeca: entre la mano y el hueso saliente de la muñeca, con la mano abierta. Tobillo: en la parte más angosta, justo encima del hueso saliente.
                Cinta ajustada, sin apretar. Este método es válido para 4 % a 12 % de grasa.
              </p>
            )}
            {metodo === "ffmi" && (
              <p className="mt-2 text-[11px] leading-snug text-gray-500">
                El resultado depende de qué tan bien conozcas tu % de grasa actual: un error de 3 puntos cambia la masa magra en más de 2 kg.
              </p>
            )}
            {grasaFueraDeRango && metodo === "butt" && <p className="mt-1 text-[11px] text-amber-300">Con un porcentaje de grasa fuera de 4 % a 12 % el resultado es menos confiable.</p>}
          </>
        )}
      </div>

      {/* Resultado del método elegido */}
      {!valido ? (
        <p className="mt-5 rounded-xl border border-border bg-bg-card p-4 text-center text-sm text-gray-400">
          {metodo === "butt" && "Completá altura, muñeca, tobillo y % de grasa para ver tu estimación."}
          {metodo === "ffmi" && "Completá altura, peso y % de grasa actual para ver tu estimación."}
          {metodo === "berkhan" && "Completá tu altura para ver tu estimación."}
        </p>
      ) : metodo === "butt" && rButt ? (
        <>
          <Resumen
            pct={promedioButt}
            etiqueta="Peso máximo estimado"
            grande={`${num(rButt.pesoKg.valor)} kg`}
            chico={`rango ${num(rButt.pesoKg.min)} – ${num(rButt.pesoKg.max)} kg a ${num(butt.grasaPct)} % de grasa`}
            extra={`${ultima.peso ? `Hoy: ${num(ultima.peso)} kg · ` : ""}masa magra máx. ${num(rButt.masaMagraKg)} kg`}
          />
          {promedioButt === null && <p className="mt-2 text-[11px] text-gray-500">Cargá tus medidas en Mis medidas para ver cuánto de tu potencial llevás alcanzado.</p>}
          <div className="mt-4 rounded-xl border border-border-strong bg-bg-card px-4 py-1">
            <div className="flex items-center justify-between pt-3 text-[11px] uppercase tracking-wider text-gray-400">
              <span>Medida máxima estimada</span>
              <span>hoy / potencial</span>
            </div>
            <div className="divide-y divide-border">
              {filasButt.map((f) => (
                <FilaMedida key={f.nombre} nombre={f.nombre} rango={f.rango} actual={f.actual} />
              ))}
            </div>
            <p className="pb-3 text-[10px] text-gray-600">La zona oscura es el rango del modelo; la línea blanca, el valor central.</p>
          </div>
        </>
      ) : metodo === "ffmi" && rFfmi ? (
        <>
          <Resumen
            pct={rFfmi.porcentaje}
            etiqueta="Tu FFMI"
            grande={`${num(rFfmi.ffmiActual)} de ${FFMI_REFERENCIA}`}
            chico="25 = referencia de límite natural más citada"
            extra={rFfmi.kgPorGanar > 0 ? `Te faltan unos ${num(rFfmi.kgPorGanar)} kg de masa magra para llegar a 25` : "Ya alcanzaste o superaste la referencia de 25"}
          />
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Tarjeta titulo="Masa magra actual" valor={`${num(rFfmi.masaMagraActualKg)} kg`} nota={`${num(ffmiEntrada.pesoKg)} kg con ${num(ffmiEntrada.grasaPct)} % de grasa`} />
            <Tarjeta titulo="Masa magra con FFMI 25" valor={`${num(rFfmi.masaMagraMaxKg)} kg`} nota={`≈ ${num(rFfmi.pesoMaxKg)} kg de peso con la misma grasa`} />
          </div>
          <p className="mt-3 text-[11px] leading-snug text-gray-500">
            Se han reportado valores de FFMI mayores a 25 en personas naturales: tomalo como una referencia, no como un tope.
          </p>
        </>
      ) : metodo === "berkhan" && rBerkhan ? (
        <>
          <Resumen
            pct={pesoActualVsBerkhan}
            etiqueta="Peso de todos los días estimado"
            grande={`${num(rBerkhan.pesoCotidianoMinKg)} – ${num(rBerkhan.pesoCotidianoMaxKg)} kg`}
            chico={`en definición extrema: ${num(rBerkhan.pesoDefinicionKg)} kg`}
            extra={pesoActualVsBerkhan !== null ? `Hoy: ${num(pesoKg)} kg` : "Cargá tu peso para ver cuánto llevás"}
          />
          <p className="mt-3 text-[11px] leading-snug text-gray-500">
            Es la regla más burda de las tres: solo mira la altura, no tu estructura ósea ni tu % de grasa. Sirve como un primer orden de magnitud.
          </p>
        </>
      ) : null}

      {/* Elegir el método (abajo, como pediste) */}
      <p className="mb-2 mt-6 text-[11px] uppercase tracking-wider text-gray-400">Calcular con otro método</p>
      <div className="grid grid-cols-3 gap-2">
        {METODOS.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => {
              setMetodo(m.id);
              setEditando(false);
            }}
            className={`rounded-xl border px-2 py-3 text-center transition-colors ${metodo === m.id ? "border-emerald-500 bg-emerald-950/50" : "border-border-strong bg-bg-card"}`}
          >
            <p className={`text-sm font-semibold ${metodo === m.id ? "text-emerald-300" : "text-white"}`}>{m.nombre}</p>
            <p className="mt-0.5 text-[10px] leading-tight text-gray-500">{m.detalle}</p>
          </button>
        ))}
      </div>

      {/* Cómo se calcula (del método elegido) */}
      <details className="mt-4 rounded-xl border border-border bg-bg-card p-3 text-[12px] leading-snug text-gray-400" open>
        <summary className="cursor-pointer text-gray-300">Cómo se calcula: {METODOS.find((m) => m.id === metodo)?.nombre}</summary>
        {metodo === "butt" && (
          <p className="mt-2">
            Modelo de Casey Butt (<i>Your Muscular Potential</i>, 4.ª edición): estima la masa magra máxima y las medidas máximas a partir de la altura y del
            contorno de muñeca y tobillo (que casi no cambian con el entrenamiento) y del porcentaje de grasa. Se desarrolló con atletas de élite del siglo
            pasado y representa un promedio de lo que logran personas bien dotadas, no un techo.
          </p>
        )}
        {metodo === "ffmi" && (
          <p className="mt-2">
            Índice de masa libre de grasa normalizado (Kouri y colaboradores, 1995): FFMI = masa magra (kg) ÷ altura (m)² + 6,1 × (1,8 − altura en m). La masa
            magra se calcula con tu peso y tu % de grasa actual. El valor 25 es la referencia de límite natural más citada, pero se han reportado valores
            mayores en personas naturales y el resultado depende de qué tan bien conozcas tu % de grasa.
          </p>
        )}
        {metodo === "berkhan" && (
          <p className="mt-2">
            Regla de Martin Berkhan (Leangains): el peso en definición extrema es aproximadamente la altura en cm menos 100 (en kg), y el propio autor sugiere
            sumar entre 5 y 10 libras (2,3 a 4,5 kg) para el peso de todos los días. Es una regla muy simple: no considera la estructura ósea ni la
            composición corporal.
          </p>
        )}
        <p className="mt-2">
          Otros enfoques, como el de relación músculo/hueso de Fran Holway, se basan en una fraccionación antropométrica completa (diámetros óseos, pliegues y
          perímetros medidos por un profesional) y no se pueden calcular acá. Tus datos se calculan en tu teléfono y no se guardan.
        </p>
      </details>
    </div>
  );
}

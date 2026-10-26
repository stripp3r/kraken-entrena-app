"use client";

import { useEffect, useMemo, useState } from "react";
import { aNumero, limpiarDecimal } from "@/lib/numero";
import { datosValidos, porcentajeAlcanzado, potencialMuscular, type Rango } from "@/lib/potencial-muscular";

// Potencial muscular natural estimado (modelo de Casey Butt, ver lib/potencial-muscular.ts).
// Todo se calcula en el teléfono; nada se envía ni se guarda en la base (el tobillo se recuerda solo en el
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

const CLAVE_TOBILLO = "kraken_potencial_tobillo";
const CLAVE_GRASA = "kraken_potencial_grasa";
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

export function PotencialMuscularCliente({ sexo, ultima }: { sexo: "masculino" | "femenino" | null; ultima: UltimaMedida }) {
  const [altura, setAltura] = useState(ultima.altura ? num(ultima.altura) : "");
  const [muneca, setMuneca] = useState(ultima.muneca ? num(ultima.muneca) : "");
  const [tobillo, setTobillo] = useState("");
  const [grasa, setGrasa] = useState("10");
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    try {
      const t = window.localStorage.getItem(CLAVE_TOBILLO);
      const g = window.localStorage.getItem(CLAVE_GRASA);
      /* eslint-disable react-hooks/set-state-in-effect */
      if (t) setTobillo(t);
      if (g) setGrasa(g);
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

  const entrada = useMemo(
    () => ({ alturaCm: aNumero(altura), munecaCm: aNumero(muneca), tobilloCm: aNumero(tobillo), grasaPct: aNumero(grasa) }),
    [altura, muneca, tobillo, grasa]
  );
  const valido = datosValidos(entrada);
  const r = valido ? potencialMuscular(entrada) : null;
  const grasaFueraDeRango = valido && (entrada.grasaPct < 4 || entrada.grasaPct > 12);

  const filas = r
    ? [
        { nombre: "Pecho", rango: r.pechoCm, actual: ultima.pecho },
        { nombre: "Brazo (bíceps)", rango: r.bicepsCm, actual: ultima.brazo },
        { nombre: "Antebrazo", rango: r.antebrazoCm, actual: ultima.antebrazo },
        { nombre: "Cuello", rango: r.cuelloCm, actual: ultima.cuello },
        { nombre: "Muslo", rango: r.muslosCm, actual: ultima.muslos },
        { nombre: "Pantorrilla", rango: r.gemelosCm, actual: ultima.gemelos },
      ]
    : [];
  const porcentajes = filas.map((f) => porcentajeAlcanzado(f.actual, f.rango.valor)).filter((p): p is number => p !== null);
  const promedio = porcentajes.length ? porcentajes.reduce((a, b) => a + b, 0) / porcentajes.length : null;
  const datosCompletos = valido && !editando;

  return (
    <div>
      <p className="mb-3 text-[12px] leading-snug text-gray-400">
        <b className="text-amber-300">Es una estimación, no un límite.</b> Para una cifra mucho más exacta hacen falta más análisis (composición corporal con
        DEXA y mediciones antropométricas completas); la genética, las hormonas y los años de entrenamiento también influyen.
      </p>

      {sexo === "femenino" && (
        <p className="mb-3 rounded-lg border border-border bg-bg-card p-3 text-[12px] text-gray-300">
          El modelo se armó con datos de varones: en mujeres es menos confiable y tiende a sobrestimar. Tomalo como una referencia muy aproximada.
        </p>
      )}

      {/* Tus datos: compactos cuando ya están completos, editables con un toque */}
      <div className="rounded-xl border border-border-strong bg-bg-card p-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-white">Tus datos</p>
          {valido && (
            <button type="button" onClick={() => setEditando((v) => !v)} className="text-xs text-emerald-400 underline">
              {editando ? "Listo" : "Editar"}
            </button>
          )}
        </div>
        {datosCompletos ? (
          <p className="mt-1 text-[13px] text-gray-300">
            {num(entrada.alturaCm)} cm · muñeca {num(entrada.munecaCm)} · tobillo {num(entrada.tobilloCm)} · {num(entrada.grasaPct)} % de grasa
          </p>
        ) : (
          <>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[11px] text-gray-500">Altura (cm)</label>
                <input className={campo} inputMode="decimal" value={altura} onChange={(e) => setAltura(limpiarDecimal(e.target.value))} />
              </div>
              <div>
                <label className="mb-1 block text-[11px] text-gray-500">% de grasa objetivo</label>
                <input className={campo} inputMode="decimal" value={grasa} onChange={(e) => { const v = limpiarDecimal(e.target.value); setGrasa(v); guardar(CLAVE_GRASA, v); }} />
              </div>
              <div>
                <label className="mb-1 block text-[11px] text-gray-500">Muñeca (cm)</label>
                <input className={campo} inputMode="decimal" value={muneca} onChange={(e) => setMuneca(limpiarDecimal(e.target.value))} />
              </div>
              <div>
                <label className="mb-1 block text-[11px] text-gray-500">Tobillo (cm)</label>
                <input className={campo} inputMode="decimal" value={tobillo} onChange={(e) => { const v = limpiarDecimal(e.target.value); setTobillo(v); guardar(CLAVE_TOBILLO, v); }} />
              </div>
            </div>
            <p className="mt-2 text-[11px] leading-snug text-gray-500">
              Muñeca: entre la mano y el hueso saliente de la muñeca, con la mano abierta. Tobillo: en la parte más angosta, justo encima del hueso
              saliente. Cinta ajustada, sin apretar. El modelo es válido para 4 % a 12 % de grasa.
            </p>
            {grasaFueraDeRango && <p className="mt-1 text-[11px] text-amber-300">Con un porcentaje de grasa fuera de 4 % a 12 % el resultado es menos confiable.</p>}
          </>
        )}
      </div>

      {!r ? (
        <p className="mt-5 rounded-xl border border-border bg-bg-card p-4 text-center text-sm text-gray-400">
          Completá altura, muñeca, tobillo y % de grasa para ver tu estimación.
        </p>
      ) : (
        <>
          {/* Resumen */}
          <div className="mt-4 rounded-xl border border-emerald-800 bg-gradient-to-b from-emerald-950/70 to-bg-card p-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-none">
                <Anillo pct={promedio ?? 0} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-2xl font-bold text-white">{promedio !== null ? `${Math.round(promedio)}%` : "–"}</p>
                  <p className="text-[10px] text-gray-400">de tu potencial</p>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] uppercase tracking-wider text-gray-400">Peso máximo estimado</p>
                <p className="text-3xl font-semibold leading-tight text-emerald-300">{num(r.pesoKg.valor)} kg</p>
                <p className="text-[11px] text-gray-500">
                  rango {num(r.pesoKg.min)} – {num(r.pesoKg.max)} kg a {num(entrada.grasaPct)} % de grasa
                </p>
                <p className="mt-1.5 text-[12px] text-gray-300">
                  {ultima.peso ? `Hoy: ${num(ultima.peso)} kg · ` : ""}masa magra máx. <b className="text-white">{num(r.masaMagraKg)} kg</b>
                </p>
              </div>
            </div>
            {promedio === null && <p className="mt-3 text-[11px] text-gray-500">Cargá tus medidas en Mis medidas para ver cuánto de tu potencial llevás alcanzado.</p>}
          </div>

          {/* Medidas */}
          <div className="mt-4 rounded-xl border border-border-strong bg-bg-card px-4 py-1">
            <div className="flex items-center justify-between pt-3 text-[11px] uppercase tracking-wider text-gray-400">
              <span>Medida máxima estimada</span>
              <span>hoy / potencial</span>
            </div>
            <div className="divide-y divide-border">
              {filas.map((f) => (
                <FilaMedida key={f.nombre} nombre={f.nombre} rango={f.rango} actual={f.actual} />
              ))}
            </div>
            <p className="pb-3 text-[10px] text-gray-600">La zona oscura es el rango del modelo; la línea blanca, el valor central.</p>
          </div>
        </>
      )}

      <details className="mt-4 rounded-xl border border-border bg-bg-card p-3 text-[12px] leading-snug text-gray-400">
        <summary className="cursor-pointer text-gray-300">Cómo se calcula</summary>
        <p className="mt-2">
          Modelo de Casey Butt (<i>Your Muscular Potential</i>, 4.ª edición): estima la masa magra máxima y las medidas máximas a partir de la altura y del contorno
          de muñeca y tobillo (que casi no cambian con el entrenamiento) y del porcentaje de grasa. Se desarrolló con atletas de élite del siglo pasado y
          representa un promedio de lo que logran personas bien dotadas, no un techo. Otros enfoques, como el de relación músculo/hueso de Fran Holway,
          requieren estudios de composición corporal (DEXA). Tus datos se calculan en tu teléfono y no se guardan.
        </p>
      </details>
    </div>
  );
}

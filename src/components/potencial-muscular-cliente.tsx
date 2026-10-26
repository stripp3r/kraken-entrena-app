"use client";

import { useEffect, useMemo, useState } from "react";
import { aNumero, limpiarDecimal } from "@/lib/numero";
import { datosValidos, porcentajeAlcanzado, potencialMuscular, type Rango } from "@/lib/potencial-muscular";

// Calculadora de potencial muscular natural (modelo de Casey Butt, ver lib/potencial-muscular.ts).
// Todo se calcula en el teléfono; nada se envía ni se guarda en la base (el tobillo se recuerda solo en el
// navegador). Las medidas actuales vienen de la última carga en Medidas.

type Ultima = {
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
const num = (n: number) => String(n).replace(".", ",");
const campo = "w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-white outline-none focus:border-border-strong";

function Fila({ nombre, rango, actual }: { nombre: string; rango: Rango; actual: number | null }) {
  const pct = porcentajeAlcanzado(actual, rango.valor);
  return (
    <div className="rounded-lg border border-border bg-bg-card p-3">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-semibold text-white">{nombre}</p>
        <p className="text-sm text-white">
          {num(rango.valor)} cm <span className="text-[11px] text-gray-500">({num(rango.min)} – {num(rango.max)})</span>
        </p>
      </div>
      {pct !== null ? (
        <div className="mt-2">
          <div className="mb-1 flex justify-between text-[11px] text-gray-400">
            <span>Hoy: {num(actual as number)} cm</span>
            <span>{Math.round(pct)} % del potencial</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-neutral-800">
            <div className="h-full rounded-full bg-emerald-400" style={{ width: `${Math.min(100, pct)}%` }} />
          </div>
        </div>
      ) : (
        <p className="mt-1 text-[11px] text-gray-600">Cargá esta medida en Medidas para ver cuánto llevás.</p>
      )}
    </div>
  );
}

export function PotencialMuscularCliente({ sexo, ultima }: { sexo: "masculino" | "femenino" | null; ultima: Ultima }) {
  const [altura, setAltura] = useState(ultima.altura ? num(ultima.altura) : "");
  const [muneca, setMuneca] = useState(ultima.muneca ? num(ultima.muneca) : "");
  const [tobillo, setTobillo] = useState("");
  const [grasa, setGrasa] = useState("10");

  useEffect(() => {
    try {
      const guardado = window.localStorage.getItem(CLAVE_TOBILLO);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (guardado) setTobillo(guardado);
    } catch {
      /* sin almacenamiento: se escribe a mano */
    }
  }, []);

  function cambiarTobillo(v: string) {
    setTobillo(v);
    try {
      window.localStorage.setItem(CLAVE_TOBILLO, v);
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

  return (
    <div>
      <div className="mb-4 rounded-lg border border-amber-700/60 bg-amber-950/30 p-3 text-[12px] leading-snug text-amber-100">
        <b>Es una estimación, no un límite.</b> Calcula cuánto músculo natural podría sostener tu estructura ósea, a partir de tu
        altura y del contorno de muñeca y tobillo. Para una cifra mucho más exacta hacen falta más análisis (composición corporal
        con DEXA, mediciones antropométricas completas), y aun así la genética muscular, las hormonas y los años de entrenamiento
        también influyen.
      </div>

      {sexo === "femenino" && (
        <p className="mb-4 rounded-lg border border-border bg-bg-card p-3 text-[12px] text-gray-300">
          Este modelo se armó con datos de atletas varones: en mujeres es menos confiable y tiende a sobrestimar. Tomalo como una
          referencia muy aproximada.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-[11px] text-gray-500">Altura (cm)</label>
          <input className={campo} inputMode="decimal" value={altura} onChange={(e) => setAltura(limpiarDecimal(e.target.value))} />
        </div>
        <div>
          <label className="mb-1 block text-[11px] text-gray-500">% de grasa objetivo</label>
          <input className={campo} inputMode="decimal" value={grasa} onChange={(e) => setGrasa(limpiarDecimal(e.target.value))} />
        </div>
        <div>
          <label className="mb-1 block text-[11px] text-gray-500">Muñeca (cm)</label>
          <input className={campo} inputMode="decimal" value={muneca} onChange={(e) => setMuneca(limpiarDecimal(e.target.value))} />
        </div>
        <div>
          <label className="mb-1 block text-[11px] text-gray-500">Tobillo (cm)</label>
          <input className={campo} inputMode="decimal" value={tobillo} onChange={(e) => cambiarTobillo(limpiarDecimal(e.target.value))} />
        </div>
      </div>
      <p className="mt-2 text-[11px] leading-snug text-gray-500">
        Muñeca: entre la mano y el hueso saliente de la muñeca, con la mano abierta. Tobillo: en la parte más angosta, justo encima del
        hueso saliente. Cinta ajustada, sin apretar. El modelo es válido para 4 % a 12 % de grasa.
      </p>
      {grasaFueraDeRango && <p className="mt-1 text-[11px] text-amber-300">Con un porcentaje de grasa fuera de 4 % a 12 % el resultado es menos confiable.</p>}

      {!r ? (
        <p className="mt-6 rounded-lg border border-border bg-bg-card p-4 text-center text-sm text-gray-400">
          Completá altura, muñeca, tobillo y % de grasa para ver tu estimación.
        </p>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-emerald-700 bg-emerald-950/50 p-3">
              <p className="text-[11px] text-gray-400">Peso corporal máximo estimado</p>
              <p className="text-2xl font-semibold text-emerald-300">{num(r.pesoKg.valor)} kg</p>
              <p className="text-[11px] text-gray-500">rango {num(r.pesoKg.min)} – {num(r.pesoKg.max)} kg a {num(entrada.grasaPct)} % de grasa</p>
              {ultima.peso && <p className="mt-1 text-[11px] text-gray-400">Hoy: {num(ultima.peso)} kg</p>}
            </div>
            <div className="rounded-lg border border-border bg-bg-card p-3">
              <p className="text-[11px] text-gray-400">Masa magra máxima estimada</p>
              <p className="text-2xl font-semibold text-white">{num(r.masaMagraKg)} kg</p>
              <p className="text-[11px] text-gray-500">todo lo que no es grasa</p>
            </div>
          </div>

          <h2 className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wider text-gray-400">Medidas máximas estimadas</h2>
          <div className="flex flex-col gap-2">
            <Fila nombre="Pecho" rango={r.pechoCm} actual={ultima.pecho} />
            <Fila nombre="Brazo (bíceps)" rango={r.bicepsCm} actual={ultima.brazo} />
            <Fila nombre="Antebrazo" rango={r.antebrazoCm} actual={ultima.antebrazo} />
            <Fila nombre="Cuello" rango={r.cuelloCm} actual={ultima.cuello} />
            <Fila nombre="Muslo" rango={r.muslosCm} actual={ultima.muslos} />
            <Fila nombre="Pantorrilla" rango={r.gemelosCm} actual={ultima.gemelos} />
          </div>
        </>
      )}

      <p className="mt-6 text-[11px] leading-snug text-gray-600">
        Modelo de Casey Butt (<i>Your Muscular Potential</i>, 4.ª edición). Se desarrolló con atletas de élite del siglo pasado y representa
        un promedio de lo que logran personas bien dotadas, no un techo. Otros enfoques, como el de relación músculo/hueso de Fran Holway,
        requieren estudios de composición corporal (DEXA). Tus datos se calculan en tu teléfono y no se guardan.
      </p>
    </div>
  );
}

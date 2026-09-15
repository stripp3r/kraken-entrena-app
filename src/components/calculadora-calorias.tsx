"use client";

import { useState } from "react";

const fieldClass =
  "w-full rounded-lg border border-border bg-bg-card px-3 py-2.5 text-white outline-none focus:border-border-strong";
const labelClass = "text-sm text-gray-300";

const ACTIVIDAD_OPCIONES = [
  { valor: "1.2", label: "Sedentario: no hago ejercicio" },
  { valor: "1.375", label: "Ligero: entreno 1-3 veces por semana" },
  { valor: "1.55", label: "Moderado: entreno 3-5 veces por semana" },
  { valor: "1.725", label: "Muy activo: entreno 6-7 veces por semana" },
  { valor: "1.9", label: "Extremo: entreno intenso + trabajo físico demandante" },
];

type Resultado = {
  kcal: number;
  etiqueta: string;
  proteina: number;
  carbos: number;
  grasa: number;
};

function calcular(
  sexo: string,
  peso: number,
  altura: number,
  edad: number,
  actividad: number,
  objetivo: string
): Resultado {
  const tmb =
    sexo === "hombre"
      ? 10 * peso + 6.25 * altura - 5 * edad + 5
      : 10 * peso + 6.25 * altura - 5 * edad - 161;

  const tdee = tmb * actividad;

  let factor = 1;
  let etiqueta = "para mantener tu peso";
  if (objetivo === "ganar") {
    factor = 1.1;
    etiqueta = "para ganar masa muscular limpia";
  }
  if (objetivo === "bajar") {
    factor = 0.8;
    etiqueta = "para bajar grasa de forma sostenida";
  }

  const metaCalorias = tdee * factor;
  const proteinaG = Math.round(peso * 2);
  const proteinaKcal = proteinaG * 4;
  const grasaKcal = metaCalorias * 0.25;
  const grasaG = Math.round(grasaKcal / 9);
  const carbosKcal = Math.max(metaCalorias - proteinaKcal - grasaKcal, 0);
  const carbosG = Math.round(carbosKcal / 4);

  return {
    kcal: Math.round(metaCalorias),
    etiqueta,
    proteina: proteinaG,
    carbos: carbosG,
    grasa: grasaG,
  };
}

export function CalculadoraCalorias() {
  const [sexo, setSexo] = useState("hombre");
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [edad, setEdad] = useState("");
  const [actividad, setActividad] = useState("1.55");
  const [objetivo, setObjetivo] = useState("ganar");
  const [resultado, setResultado] = useState<Resultado | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const p = Number(peso);
    const a = Number(altura);
    const ed = Number(edad);
    if (!p || !a || !ed) return;
    setResultado(calcular(sexo, p, a, ed, Number(actividad), objetivo));
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="cal-sexo" className={labelClass}>
          Sexo
        </label>
        <select id="cal-sexo" value={sexo} onChange={(e) => setSexo(e.target.value)} className={fieldClass}>
          <option value="hombre">Hombre</option>
          <option value="mujer">Mujer</option>
        </select>
      </div>

      <div className="flex gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <label htmlFor="cal-peso" className={labelClass}>
            Peso (kg)
          </label>
          <input
            id="cal-peso"
            type="number"
            inputMode="decimal"
            step="0.1"
            value={peso}
            onChange={(e) => setPeso(e.target.value)}
            className={`${fieldClass} w-full min-w-0`}
            required
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <label htmlFor="cal-altura" className={labelClass}>
            Altura (cm)
          </label>
          <input
            id="cal-altura"
            type="number"
            inputMode="numeric"
            value={altura}
            onChange={(e) => setAltura(e.target.value)}
            className={`${fieldClass} w-full min-w-0`}
            required
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <label htmlFor="cal-edad" className={labelClass}>
            Edad
          </label>
          <input
            id="cal-edad"
            type="number"
            inputMode="numeric"
            value={edad}
            onChange={(e) => setEdad(e.target.value)}
            className={`${fieldClass} w-full min-w-0`}
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="cal-actividad" className={labelClass}>
          Nivel de actividad física
        </label>
        <select
          id="cal-actividad"
          value={actividad}
          onChange={(e) => setActividad(e.target.value)}
          className={fieldClass}
        >
          {ACTIVIDAD_OPCIONES.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="cal-objetivo" className={labelClass}>
          Tu objetivo
        </label>
        <select
          id="cal-objetivo"
          value={objetivo}
          onChange={(e) => setObjetivo(e.target.value)}
          className={fieldClass}
        >
          <option value="mantener">Mantener mi peso</option>
          <option value="ganar">Ganar masa muscular</option>
          <option value="bajar">Bajar grasa corporal</option>
        </select>
      </div>

      <button type="submit" className="rounded-full bg-white px-5 py-3 font-medium text-black">
        Calcular
      </button>

      {resultado && (
        <div className="rounded-lg border border-border bg-bg-card p-4 text-center">
          <p className="text-3xl font-medium text-white">
            {resultado.kcal.toLocaleString("es-AR")}{" "}
            <span className="text-base font-normal text-gray-500">kcal / día</span>
          </p>
          <p className="mt-1 text-sm text-gray-400">{resultado.etiqueta}</p>

          <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4">
            <div>
              <p className="text-lg font-medium text-white">{resultado.proteina} g</p>
              <p className="text-xs text-gray-500">Proteína</p>
            </div>
            <div>
              <p className="text-lg font-medium text-white">{resultado.carbos} g</p>
              <p className="text-xs text-gray-500">Carbohidratos</p>
            </div>
            <div>
              <p className="text-lg font-medium text-white">{resultado.grasa} g</p>
              <p className="text-xs text-gray-500">Grasas</p>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

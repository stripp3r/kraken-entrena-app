import type { PentagonoScores } from "@/lib/pentagono";

const EJES: { clave: keyof PentagonoScores; etiqueta: string; referencia: string }[] = [
  { clave: "volumen", etiqueta: "Volumen", referencia: "100 = 30 series/semana por grupo" },
  { clave: "frecuencia", etiqueta: "Frecuencia", referencia: "100 = 4 veces/semana por grupo" },
  { clave: "recuperacion", etiqueta: "Recuperación", referencia: "100 = 3+ días entre estímulos del mismo grupo" },
  { clave: "intensidad", etiqueta: "Intensidad", referencia: "100 = RIR 0 con reps bajas" },
  { clave: "sostenibilidad", etiqueta: "Sostenibilidad", referencia: "100 = pocos días, sesiones cortas" },
];

const CENTRO = 130;
const RADIO = 90;

function puntoEnEje(indice: number, valor: number) {
  const angulo = -Math.PI / 2 + (indice * 2 * Math.PI) / EJES.length;
  const r = (Math.max(0, Math.min(100, valor)) / 100) * RADIO;
  return { x: CENTRO + r * Math.cos(angulo), y: CENTRO + r * Math.sin(angulo) };
}

function puntoEtiqueta(indice: number) {
  const angulo = -Math.PI / 2 + (indice * 2 * Math.PI) / EJES.length;
  const r = RADIO + 26;
  const x = CENTRO + r * Math.cos(angulo);
  const y = CENTRO + r * Math.sin(angulo);
  const anchor = Math.cos(angulo) > 0.3 ? "start" : Math.cos(angulo) < -0.3 ? "end" : "middle";
  return { x, y, anchor };
}

export function PentagonoChart({ scores }: { scores: PentagonoScores }) {
  const puntosDato = EJES.map((eje, i) => puntoEnEje(i, scores[eje.clave]));
  const pathDato = puntosDato.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 260 260" className="w-full max-w-[280px]">
        {[0.25, 0.5, 0.75, 1].map((frac) => (
          <polygon
            key={frac}
            points={EJES.map((_, i) => {
              const p = puntoEnEje(i, frac * 100);
              return `${p.x},${p.y}`;
            }).join(" ")}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={1}
          />
        ))}

        {EJES.map((_, i) => {
          const p = puntoEnEje(i, 100);
          return (
            <line
              key={i}
              x1={CENTRO}
              y1={CENTRO}
              x2={p.x}
              y2={p.y}
              stroke="var(--color-border)"
              strokeWidth={1}
            />
          );
        })}

        <polygon points={pathDato} fill="#10b981" fillOpacity={0.25} stroke="#10b981" strokeWidth={2} />
        {puntosDato.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3} fill="#10b981" />
        ))}

        {EJES.map((eje, i) => {
          const et = puntoEtiqueta(i);
          return (
            <text
              key={eje.clave}
              x={et.x}
              y={et.y}
              textAnchor={et.anchor as "start" | "middle" | "end"}
              dominantBaseline="middle"
              className="fill-gray-300"
              fontSize={11}
            >
              {eje.etiqueta} · {scores[eje.clave]}
            </text>
          );
        })}
      </svg>

      <div className="mt-2 flex flex-col gap-0.5 text-center">
        {EJES.map((eje) => (
          <p key={eje.clave} className="text-[10px] text-gray-500">
            <span className="text-gray-400">{eje.etiqueta}:</span> {eje.referencia}
          </p>
        ))}
      </div>
    </div>
  );
}

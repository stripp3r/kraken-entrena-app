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

export type SerieEnPentagono = { label: string; color: string; scores: PentagonoScores };

// Con una sola serie muestra el pentágono clásico (etiqueta + valor en cada
// eje). Con dos o más, funciona como el comparador de jugadores del PES:
// los polígonos se superponen, cada uno con su color, y una referencia
// abajo dice quién es quién -- a simple vista se ve quién le gana a quién
// en cada eje sin tener que leer números.
export function PentagonoChart({ series }: { series: SerieEnPentagono[] }) {
  const comparando = series.length > 1;

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="-110 0 450 235" className="w-full max-w-[340px]">
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

        {series.map((s) => {
          const puntos = EJES.map((eje, i) => puntoEnEje(i, s.scores[eje.clave]));
          const path = puntos.map((p) => `${p.x},${p.y}`).join(" ");
          return (
            <g key={s.label}>
              <polygon points={path} fill={s.color} fillOpacity={comparando ? 0.15 : 0.25} stroke={s.color} strokeWidth={2} />
              {puntos.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={3} fill={s.color} />
              ))}
            </g>
          );
        })}

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
              {comparando ? eje.etiqueta : `${eje.etiqueta} · ${series[0]?.scores[eje.clave] ?? 0}`}
            </text>
          );
        })}
      </svg>

      {comparando && (
        <div className="mt-1 flex flex-wrap justify-center gap-3">
          {series.map((s) => (
            <span key={s.label} className="flex items-center gap-1.5 text-xs text-gray-300">
              <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
              {s.label}
            </span>
          ))}
        </div>
      )}

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

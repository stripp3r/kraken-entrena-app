"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Medicion = {
  fecha: string;
  peso: number | null;
  cuello: number | null;
  hombros: number | null;
  pecho: number | null;
  brazo: number | null;
  cintura: number | null;
  caderas: number | null;
  muslos: number | null;
};

const CAMPOS: { key: keyof Omit<Medicion, "fecha" | "peso">; label: string }[] = [
  { key: "cuello", label: "Cuello" },
  { key: "hombros", label: "Hombros" },
  { key: "pecho", label: "Pecho" },
  { key: "brazo", label: "Brazo" },
  { key: "cintura", label: "Cintura" },
  { key: "caderas", label: "Caderas" },
  { key: "muslos", label: "Muslos" },
];

const COLORES = ["#7a7a7a", "#e7e7e7", "#f97316", "#38bdf8", "#a3e635"];

function fechaCorta(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y.slice(2)}`;
}

export function ProgresoMedidas({ historial }: { historial: Medicion[] }) {
  const ordenado = [...historial].sort((a, b) => a.fecha.localeCompare(b.fecha));

  if (ordenado.length === 0) return null;

  const fechas = [...new Set(ordenado.map((m) => m.fecha))];

  const datos = CAMPOS.map((campo) => {
    const fila: Record<string, string | number> = { medida: campo.label };
    for (const m of ordenado) {
      if (m[campo.key] !== null) {
        fila[fechaCorta(m.fecha)] = m[campo.key] as number;
      }
    }
    return fila;
  }).filter((fila) => Object.keys(fila).length > 1);

  if (datos.length === 0) return null;

  // diferencia entre la primera y la última medición cargada de cada campo
  const diferencias = CAMPOS.map((campo) => {
    const valores = ordenado
      .filter((m) => m[campo.key] !== null)
      .map((m) => m[campo.key] as number);
    if (valores.length < 2) return null;
    const diferencia = Math.round((valores[valores.length - 1] - valores[0]) * 10) / 10;
    return { label: campo.label, diferencia };
  }).filter((d): d is { label: string; diferencia: number } => d !== null);

  return (
    <div className="rounded-lg border border-border bg-bg-card p-4">
      <h3 className="mb-3 text-white">Comparar mediciones</h3>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={datos} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
            <CartesianGrid stroke="#1f1f1f" vertical={false} />
            <XAxis dataKey="medida" tick={{ fill: "#7a7a7a", fontSize: 10 }} />
            <YAxis tick={{ fill: "#7a7a7a", fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                background: "#111111",
                border: "1px solid #2e2e2e",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "#e7e7e7" }}
            />
            <Legend wrapperStyle={{ fontSize: 11, color: "#b5b5b5" }} />
            {fechas.map((f, i) => (
              <Bar
                key={f}
                dataKey={fechaCorta(f)}
                fill={COLORES[i % COLORES.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {diferencias.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-border pt-3 text-sm">
          {diferencias.map((d) => (
            <div key={d.label} className="flex justify-between">
              <span className="text-gray-500">{d.label}</span>
              <span className={d.diferencia === 0 ? "text-gray-400" : "text-white"}>
                {d.diferencia > 0 ? "+" : ""}
                {d.diferencia} cm
              </span>
            </div>
          ))}
        </div>
      )}

      <p className="mt-4 border-t border-border pt-3 text-xs text-gray-500">
        <strong className="text-gray-400">Importante:</strong> no obsesionarse
        con "las medidas perfectas"; todos somos diferentes y tenemos nuestras
        propias proporciones perfectas. Recordá que la salud y el bienestar no
        se definen únicamente por medidas corporales. Lo más importante es
        cómo te sentís en tu propio cuerpo y tu progreso hacia un estilo de
        vida más saludable. Enfocate en tus propios objetivos y disfrutá el
        camino hacia una mejor versión de vos mismo.
      </p>
    </div>
  );
}

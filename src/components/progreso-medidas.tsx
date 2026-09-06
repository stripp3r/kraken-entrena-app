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
    </div>
  );
}

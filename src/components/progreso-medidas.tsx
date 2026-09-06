"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

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

const CAMPOS: { key: keyof Omit<Medicion, "fecha">; label: string; unidad: string }[] = [
  { key: "peso", label: "Peso", unidad: "kg" },
  { key: "cuello", label: "Cuello", unidad: "cm" },
  { key: "hombros", label: "Hombros", unidad: "cm" },
  { key: "pecho", label: "Pecho", unidad: "cm" },
  { key: "brazo", label: "Brazo", unidad: "cm" },
  { key: "cintura", label: "Cintura", unidad: "cm" },
  { key: "caderas", label: "Caderas", unidad: "cm" },
  { key: "muslos", label: "Muslos", unidad: "cm" },
];

export function ProgresoMedidas({ historial }: { historial: Medicion[] }) {
  const ordenado = [...historial].sort((a, b) => a.fecha.localeCompare(b.fecha));

  return (
    <div className="flex flex-col gap-4">
      {CAMPOS.map((campo) => {
        const datos = ordenado
          .filter((m) => m[campo.key] !== null)
          .map((m) => ({ fecha: m.fecha, valor: m[campo.key] as number }));

        if (datos.length === 0) return null;

        const primero = datos[0].valor;
        const ultimo = datos[datos.length - 1].valor;
        const diferencia = Math.round((ultimo - primero) * 10) / 10;

        return (
          <div key={campo.key} className="rounded-lg border border-border bg-bg-card p-4">
            <div className="mb-2 flex items-baseline justify-between">
              <h3 className="text-white">{campo.label}</h3>
              <span className="text-sm text-gray-400">
                {ultimo}
                {campo.unidad}{" "}
                {datos.length > 1 && (
                  <span className={diferencia === 0 ? "text-gray-500" : "text-gray-300"}>
                    ({diferencia > 0 ? "+" : ""}
                    {diferencia}
                    {campo.unidad})
                  </span>
                )}
              </span>
            </div>

            {datos.length < 2 ? (
              <p className="py-4 text-center text-xs text-gray-600">
                Cargá al menos 2 mediciones para ver la evolución.
              </p>
            ) : (
              <div className="h-28 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={datos} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                    <XAxis dataKey="fecha" tick={{ fill: "#7a7a7a", fontSize: 10 }} />
                    <YAxis tick={{ fill: "#7a7a7a", fontSize: 10 }} domain={["auto", "auto"]} />
                    <Tooltip
                      contentStyle={{
                        background: "#111111",
                        border: "1px solid #2e2e2e",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      labelStyle={{ color: "#e7e7e7" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="valor"
                      stroke="#ffffff"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

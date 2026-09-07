"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { serieDeVolumen, type SetLog } from "@/lib/analytics";

const COLORES = ["#7a7a7a", "#e7e7e7", "#f97316", "#38bdf8", "#a3e635", "#e879f9", "#facc15"];

function fechaCorta(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y.slice(2)}`;
}

export function GraficoVolumenEjercicios({
  exercises,
  logsByExercise,
}: {
  exercises: { id: number; nombre: string }[];
  logsByExercise: Record<number, SetLog[]>;
}) {
  const fechas = [
    ...new Set(
      exercises.flatMap((ex) => serieDeVolumen(logsByExercise[ex.id] ?? []).map((p) => p.fecha))
    ),
  ].sort();

  if (fechas.length === 0) {
    return (
      <p className="py-6 text-center text-xs text-gray-600">
        Todavía no hay sets registrados para graficar.
      </p>
    );
  }

  const datos = exercises.map((ex) => {
    const fila: Record<string, string | number> = { ejercicio: ex.nombre };
    for (const punto of serieDeVolumen(logsByExercise[ex.id] ?? [])) {
      fila[fechaCorta(punto.fecha)] = punto.valor;
    }
    return fila;
  });

  const alto = Math.max(120, datos.length * Math.max(50, fechas.length * 16));

  return (
    <div style={{ height: alto }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={datos}
          layout="vertical"
          margin={{ top: 5, right: 20, bottom: 0, left: 10 }}
        >
          <CartesianGrid stroke="#1f1f1f" horizontal={false} />
          <XAxis type="number" tick={{ fill: "#7a7a7a", fontSize: 10 }} />
          <YAxis
            type="category"
            dataKey="ejercicio"
            width={110}
            tick={{ fill: "#b5b5b5", fontSize: 10 }}
          />
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
            <Bar key={f} dataKey={fechaCorta(f)} fill={COLORES[i % COLORES.length]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

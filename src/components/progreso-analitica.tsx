"use client";

import { useState } from "react";
import { calcularEstadisticasEjercicio, serieDeUnaRM, type SetLog } from "@/lib/analytics";
import { GraficoVolumenEjercicios } from "./grafico-volumen-ejercicios";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Exercise = { id: number; nombre: string; dia: string };

function num(n: number | null, decimales = 1) {
  if (n === null || Number.isNaN(n)) return "-";
  return n.toFixed(decimales);
}

function GraficoLinea({ datos }: { datos: { fecha: string; valor: number }[] }) {
  if (datos.length < 2) {
    return (
      <p className="py-6 text-center text-xs text-gray-600">
        Cargá al menos 2 registros para ver el gráfico.
      </p>
    );
  }
  return (
    <div className="h-32 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={datos} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
          <XAxis dataKey="fecha" tick={{ fill: "#7a7a7a", fontSize: 10 }} />
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
          <Line type="monotone" dataKey="valor" stroke="#ffffff" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function TarjetaEjercicio({ nombre, logs }: { nombre: string; logs: SetLog[] }) {
  const stats = calcularEstadisticasEjercicio(logs);
  const serie = serieDeUnaRM(logs);

  if (stats.cantidadDias === 0) {
    return (
      <div className="rounded-lg border border-border bg-bg-card p-4">
        <h3 className="mb-1 text-white">{nombre}</h3>
        <p className="text-xs text-gray-600">Todavía no cargaste sets de este ejercicio.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-bg-card p-4">
      <h3 className="mb-3 text-white">{nombre}</h3>

      <p className="mb-1 text-[11px] uppercase tracking-wide text-gray-500">
        Evolución del 1RM estimado
      </p>
      <GraficoLinea datos={serie} />

      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-border pt-3 text-sm">
        <Stat label="1RM est." valor={num(stats.rm1)} />
        <Stat label="IRP" valor={stats.irp !== null ? `${num(stats.irp * 100, 0)}%` : "-"} />
        <Stat label="6RM" valor={num(stats.rm6)} />
        <Stat label="8RM" valor={num(stats.rm8)} />
        <Stat label="10RM" valor={num(stats.rm10)} />
        <Stat label="12RM" valor={num(stats.rm12)} />
        <Stat label="PR +" valor={num(stats.prMax)} />
        <Stat label="PR -" valor={num(stats.prMin)} />
        <Stat label="Volumen máx" valor={num(stats.volMax, 0)} />
        <Stat label="Volumen mín" valor={num(stats.volMin, 0)} />
      </div>
    </div>
  );
}

function Stat({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="text-white">{valor}</span>
    </div>
  );
}

export function ProgresoAnalitica({
  dias,
  exercises,
  logsByExercise,
}: {
  dias: string[];
  exercises: Exercise[];
  logsByExercise: Record<number, SetLog[]>;
}) {
  const [vista, setVista] = useState<string>("GLOBAL");

  const ejerciciosVista = exercises.filter((e) => e.dia === vista);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-gray-500">
        Estos gráficos y estadísticas toman el <strong className="text-gray-300">top set</strong>{" "}
        (la serie más exigente) de cada día — si cargaste varios sets, se usa solo el más pesado.
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setVista("GLOBAL")}
          className={`rounded-full px-4 py-1.5 text-sm ${
            vista === "GLOBAL" ? "bg-white text-black" : "border border-border-strong text-gray-300"
          }`}
        >
          Global
        </button>
        {dias.map((d) => (
          <button
            key={d}
            onClick={() => setVista(d)}
            className={`rounded-full px-4 py-1.5 text-sm ${
              vista === d ? "bg-white text-black" : "border border-border-strong text-gray-300"
            }`}
          >
            Día {d}
          </button>
        ))}
      </div>

      {vista === "GLOBAL" ? (
        <div className="flex flex-col gap-4">
          {dias.map((d) => {
            const ejerciciosDia = exercises.filter((e) => e.dia === d);
            return (
              <div key={d} className="rounded-lg border border-border bg-bg-card p-4">
                <h3 className="mb-1 text-white">Entrenamiento {d}</h3>
                <p className="mb-3 text-xs text-gray-500">
                  Suma de peso × reps del top set, por fecha.
                </p>
                <GraficoVolumenEjercicios exercises={ejerciciosDia} logsByExercise={logsByExercise} />
              </div>
            );
          })}
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-border bg-bg-card p-4">
            <h3 className="mb-1 text-white">Volumen por ejercicio</h3>
            <p className="mb-3 text-xs text-gray-500">
              Suma de peso × reps del top set, por fecha — comparás de un vistazo qué
              ejercicios vienen sumando más.
            </p>
            <GraficoVolumenEjercicios exercises={ejerciciosVista} logsByExercise={logsByExercise} />
          </div>

          <div className="flex flex-col gap-4">
            {ejerciciosVista.length === 0 ? (
              <p className="text-center text-sm text-gray-500">
                No hay ejercicios cargados para este día.
              </p>
            ) : (
              ejerciciosVista.map((ex) => (
                <TarjetaEjercicio key={ex.id} nombre={ex.nombre} logs={logsByExercise[ex.id] ?? []} />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

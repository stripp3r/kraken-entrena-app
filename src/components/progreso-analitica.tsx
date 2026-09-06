"use client";

import { useState } from "react";
import { calcularEstadisticasEjercicio, type SetLog } from "@/lib/analytics";
import { GraficoVolumenEjercicios } from "./grafico-volumen-ejercicios";

type Exercise = { id: number; nombre: string; dia: string };

function num(n: number | null, decimales = 1) {
  if (n === null || Number.isNaN(n)) return "-";
  return n.toFixed(decimales);
}

function TarjetaEjercicio({ nombre, logs }: { nombre: string; logs: SetLog[] }) {
  const stats = calcularEstadisticasEjercicio(logs);

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

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
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

  const ejerciciosVista = vista === "GLOBAL" ? exercises : exercises.filter((e) => e.dia === vista);

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

      <div className="rounded-lg border border-border bg-bg-card p-4">
        <h3 className="mb-1 text-white">Volumen por ejercicio</h3>
        <p className="mb-3 text-xs text-gray-500">
          Suma de peso × reps del top set, por fecha — comparás de un vistazo qué
          ejercicios vienen sumando más.
        </p>
        <GraficoVolumenEjercicios exercises={ejerciciosVista} logsByExercise={logsByExercise} />
      </div>

      {vista !== "GLOBAL" && (
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
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { ExerciseCard } from "./exercise-card";
import { segundosEntreLados, segundosEntreSeries, type Lado, type TipoEsfuerzo } from "@/lib/descanso";
import { prepararAlertas } from "@/lib/sonido";

const OBJETIVO_SERIES = 3;

type ExerciseAlternativa = {
  id: number;
  nombre: string;
  imagen_url: string | null;
  como_hacerlo: string | null;
};

type WorkoutLog = {
  id: number;
  peso: number | null;
  reps: number | null;
  rir: number | null;
  lado: Lado | null;
  created_at: string;
};

export type ExerciseFull = {
  id: number;
  nombre: string;
  imagen_url: string | null;
  video_url: string | null;
  como_hacerlo: string | null;
  alternativa: ExerciseAlternativa | null;
  unilateral: boolean;
  tipoEsfuerzo: TipoEsfuerzo;
};

function contarSeriesCompletas(ex: ExerciseFull, logs: WorkoutLog[]): number {
  if (!ex.unilateral) return logs.length;
  const derecho = logs.filter((l) => l.lado === "derecho").length;
  const izquierdo = logs.filter((l) => l.lado === "izquierdo").length;
  return Math.min(derecho, izquierdo);
}

export function EntrenamientoDiaCliente({
  exercises,
  logsPorEjercicio,
}: {
  exercises: ExerciseFull[];
  logsPorEjercicio: Record<number, WorkoutLog[]>;
}) {
  const [sesionActiva, setSesionActiva] = useState(false);
  const [activoIdx, setActivoIdx] = useState(0);
  const [lado, setLado] = useState<Lado | null>(null);
  const [descansoHasta, setDescansoHasta] = useState<number | null>(null);
  const [etiquetaDescanso, setEtiquetaDescanso] = useState("");

  const activo = exercises[activoIdx];
  const seriesCompletas = activo ? contarSeriesCompletas(activo, logsPorEjercicio[activo.id] ?? []) : 0;
  const listoParaSiguiente = seriesCompletas >= OBJETIVO_SERIES;

  function iniciar() {
    prepararAlertas();
    setSesionActiva(true);
    setActivoIdx(0);
    setLado(exercises[0]?.unilateral ? "derecho" : null);
    setDescansoHasta(null);
  }

  function finalizar() {
    setSesionActiva(false);
    setDescansoHasta(null);
    setLado(null);
  }

  function siguienteEjercicio() {
    const next = activoIdx + 1;
    if (next >= exercises.length) {
      finalizar();
      return;
    }
    setActivoIdx(next);
    setLado(exercises[next]?.unilateral ? "derecho" : null);
    setDescansoHasta(null);
  }

  function onSetGuardado() {
    if (!activo) return;
    if (activo.unilateral && lado === "derecho") {
      setEtiquetaDescanso("Descanso entre lados");
      setDescansoHasta(Date.now() + segundosEntreLados(activo.tipoEsfuerzo) * 1000);
    } else {
      setEtiquetaDescanso("Descanso");
      setDescansoHasta(Date.now() + segundosEntreSeries(activo.tipoEsfuerzo) * 1000);
    }
  }

  function avanzarLado() {
    setDescansoHasta(null);
    if (activo?.unilateral) {
      setLado((prev) => (prev === "derecho" ? "izquierdo" : "derecho"));
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {exercises.length > 0 &&
        (sesionActiva ? (
          <div className="sticky top-2 z-10 flex items-center justify-between rounded-lg border border-emerald-500/40 bg-bg-elev p-3 shadow-lg">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-emerald-400">Entrenando</p>
              <p className="truncate text-sm font-medium text-white">{activo?.nombre}</p>
              {listoParaSiguiente && (
                <p className="text-xs text-emerald-300">
                  ✓ {seriesCompletas} series completas — ¿pasamos al siguiente?
                </p>
              )}
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={siguienteEjercicio}
                className={`rounded-md px-3 py-1.5 text-xs transition-colors ${
                  listoParaSiguiente
                    ? "bg-emerald-500 font-medium text-black"
                    : "border border-border-strong text-white"
                }`}
              >
                Siguiente →
              </button>
              <button onClick={finalizar} className="px-2 py-1.5 text-xs text-gray-400 underline">
                Finalizar
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={iniciar}
            className="rounded-md bg-emerald-500 px-4 py-3 text-sm font-medium text-black"
          >
            Iniciar entrenamiento
          </button>
        ))}

      {exercises.map((ex, idx) => {
        const esActivo = sesionActiva && idx === activoIdx;
        return (
          <ExerciseCard
            key={ex.id}
            exercise={ex}
            logsDeHoy={logsPorEjercicio[ex.id] ?? []}
            activo={esActivo}
            sesion={
              esActivo
                ? {
                    lado,
                    descansoHasta,
                    etiquetaDescanso,
                    onSetGuardado,
                    onDescansoTerminado: avanzarLado,
                    onSaltarDescanso: avanzarLado,
                  }
                : undefined
            }
          />
        );
      })}
    </div>
  );
}

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
  const [activoId, setActivoId] = useState<number | null>(null);
  const [lado, setLado] = useState<Lado | null>(null);
  const [descansoHasta, setDescansoHasta] = useState<number | null>(null);
  const [etiquetaDescanso, setEtiquetaDescanso] = useState("");

  const activo = exercises.find((e) => e.id === activoId);
  const seriesCompletas = activo ? contarSeriesCompletas(activo, logsPorEjercicio[activo.id] ?? []) : 0;
  const listoParaOtro = seriesCompletas >= OBJETIVO_SERIES;

  function iniciar() {
    prepararAlertas();
    setSesionActiva(true);
    setActivoId(exercises[0]?.id ?? null);
    setLado(exercises[0]?.unilateral ? "derecho" : null);
    setDescansoHasta(null);
  }

  function finalizar() {
    setSesionActiva(false);
    setActivoId(null);
    setDescansoHasta(null);
    setLado(null);
  }

  function seleccionar(id: number) {
    if (id === activoId) return;
    const ex = exercises.find((e) => e.id === id);
    setActivoId(id);
    setLado(ex?.unilateral ? "derecho" : null);
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

  function finalizarEjercicio() {
    setActivoId(null);
    setDescansoHasta(null);
    setLado(null);
  }

  return (
    <div className="flex flex-col gap-4">
      {exercises.length > 0 &&
        (sesionActiva ? (
          <button
            onClick={finalizar}
            className="self-start text-sm text-gray-400 underline"
          >
            Finalizar entrenamiento
          </button>
        ) : (
          <button
            onClick={iniciar}
            className="rounded-md bg-emerald-500 px-4 py-3 text-sm font-medium text-black"
          >
            Iniciar entrenamiento
          </button>
        ))}

      {sesionActiva && (
        <p className="-mt-2 text-xs text-gray-500">
          Tocá el botón verde de cualquier ejercicio para elegir por dónde seguir — no hace falta
          respetar el orden si una máquina está ocupada, rota, o preferís cambiar.
        </p>
      )}

      {exercises.map((ex) => {
        const esActivo = sesionActiva && ex.id === activoId;
        return (
          <ExerciseCard
            key={ex.id}
            exercise={ex}
            logsDeHoy={logsPorEjercicio[ex.id] ?? []}
            activo={esActivo}
            onSeleccionar={sesionActiva && !esActivo ? () => seleccionar(ex.id) : undefined}
            sesion={
              esActivo
                ? {
                    lado,
                    descansoHasta,
                    etiquetaDescanso,
                    seriesCompletas,
                    listoParaOtro,
                    onSetGuardado,
                    onDescansoTerminado: avanzarLado,
                    onSaltarDescanso: avanzarLado,
                    onFinalizarEjercicio: finalizarEjercicio,
                  }
                : undefined
            }
          />
        );
      })}
    </div>
  );
}

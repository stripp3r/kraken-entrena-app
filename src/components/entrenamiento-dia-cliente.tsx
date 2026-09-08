"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ExerciseCard } from "./exercise-card";
import { finalizarEntrenamientoDia } from "@/app/entrenamiento/actions";
import { segundosEntreLados, segundosEntreSeries, type Lado, type TipoEsfuerzo } from "@/lib/descanso";
import { prepararAlertas } from "@/lib/sonido";
import { hoyISO } from "@/lib/fecha";

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

function fechaLegible(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function EntrenamientoDiaCliente({
  dia,
  routineId,
  finalizadoHoy,
  exercises,
  logsPorEjercicio,
}: {
  dia: string;
  routineId: number | null;
  finalizadoHoy: boolean;
  exercises: ExerciseFull[];
  logsPorEjercicio: Record<number, WorkoutLog[]>;
}) {
  const router = useRouter();
  const [sesionActiva, setSesionActiva] = useState(false);
  const [activoId, setActivoId] = useState<number | null>(null);
  const [lado, setLado] = useState<Lado | null>(null);
  const [descansoHasta, setDescansoHasta] = useState<number | null>(null);
  const [etiquetaDescanso, setEtiquetaDescanso] = useState("");
  const [finalizando, setFinalizando] = useState(false);

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

  async function finalizarEntrenamiento() {
    prepararAlertas();
    const confirmado = window.confirm(
      "¿Estás seguro de que querés finalizar el entrenamiento de hoy?\n\n" +
        "Una vez finalizado, el registro de hoy queda cerrado y no vas a poder volver a entrar a este día para modificarlo."
    );
    if (!confirmado) return;

    setFinalizando(true);
    const result = await finalizarEntrenamientoDia(dia, routineId);
    setFinalizando(false);

    if (result.error) {
      window.alert("No se pudo finalizar: " + result.error);
      return;
    }

    setSesionActiva(false);
    setActivoId(null);
    setDescansoHasta(null);
    setLado(null);
    router.refresh();
  }

  function seleccionar(id: number) {
    if (id === activoId) return;
    prepararAlertas();
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

  if (finalizadoHoy) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4 text-center">
          <p className="text-sm font-medium text-emerald-300">
            ✓ Ya finalizaste el entrenamiento de hoy ({fechaLegible(hoyISO())}) para este día.
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Ese registro quedó cerrado. Si querés seguir entrenando hoy, elegí otro día.
          </p>
        </div>
        {exercises.map((ex) => (
          <ExerciseCard key={ex.id} exercise={ex} logsDeHoy={[]} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {exercises.length > 0 && !sesionActiva && (
        <button
          onClick={iniciar}
          className="rounded-md bg-emerald-500 px-4 py-3 text-sm font-medium text-black"
        >
          Iniciar entrenamiento
        </button>
      )}

      {sesionActiva && (
        <p className="text-xs text-gray-500">
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

      {sesionActiva && (
        <div className="flex flex-col gap-2 border-t border-border pt-4">
          <button
            disabled={finalizando}
            onClick={finalizarEntrenamiento}
            className="rounded-md bg-red-500/90 px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            {finalizando ? "Finalizando..." : "Finalizar entrenamiento"}
          </button>
          <p className="text-center text-xs text-gray-500">
            El entrenamiento de hoy ({fechaLegible(hoyISO())}) queda registrado con la fecha y
            hora exacta de cada serie que cargaste. Al finalizar, este registro se cierra y no se
            puede volver a modificar.
          </p>
        </div>
      )}
    </div>
  );
}

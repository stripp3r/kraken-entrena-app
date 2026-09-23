"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ExerciseCard } from "./exercise-card";
import { finalizarEntrenamientoDia } from "@/app/entrenamiento/actions";
import { segundosEntreLados, segundosEntreSeries, type Lado, type TipoEsfuerzo } from "@/lib/descanso";
import { prepararAlertas } from "@/lib/sonido";
import { hoyISO } from "@/lib/fecha";
import { leerSesionActiva, guardarSesionActiva, borrarSesionActiva } from "@/lib/sesion-entrenamiento";

const OBJETIVO_SERIES_DEFAULT = 3;

// Saca la cantidad de series recomendadas del texto de series_reps
// (ej. "4 x 5-8" -> 4, "3-4 x 8-12 por pierna" -> 3, el mínimo del rango).
// Si el ejercicio no tiene esa recomendación cargada (rutinas viejas sin
// series_reps), se usa el default de siempre.
function seriesObjetivoDe(seriesReps: string | null): number {
  if (!seriesReps) return OBJETIVO_SERIES_DEFAULT;
  const match = seriesReps.match(/^(\d+)/);
  const n = match ? Number(match[1]) : NaN;
  return Number.isFinite(n) && n > 0 ? n : OBJETIVO_SERIES_DEFAULT;
}

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

export type Sugerencia = {
  pesoAnterior: number;
  repsAnterior: number;
  pesoSugerido: number | null;
};

export type ExerciseFull = {
  id: number;
  nombre: string;
  imagen_url: string | null;
  video_url: string | null;
  como_hacerlo: string | null;
  series_reps: string | null;
  alternativa: ExerciseAlternativa | null;
  unilateral: boolean;
  tipoEsfuerzo: TipoEsfuerzo;
  sugerencia: Sugerencia | null;
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
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [errorFinalizar, setErrorFinalizar] = useState<string | null>(null);

  const activo = exercises.find((e) => e.id === activoId);
  const seriesCompletas = activo ? contarSeriesCompletas(activo, logsPorEjercicio[activo.id] ?? []) : 0;
  const listoParaOtro = seriesCompletas >= seriesObjetivoDe(activo?.series_reps ?? null);

  // Si el usuario navegó a otra pestaña de la app (Progreso, Inicio) y vuelve
  // acá, esto restaura por dónde iba en vez de obligarlo a tocar "Iniciar
  // entrenamiento" y elegir el ejercicio de nuevo -- los sets ya guardados
  // nunca dependieron de esto, es solo la UI de "dónde estaba". Si todavía
  // no había arrancado la sesión (solo entró a mirar este día), igual queda
  // marcado como "último día visitado" para que el botón "Entrenar" del
  // nav vuelva justo acá y no al menú principal -- eso es lo que el botón
  // atrás nativo del celular ya hace solo, al volver literalmente a la misma
  // página. Se resuelve en un efecto (no en el estado inicial) para que el
  // primer render coincida con el del servidor y no haya salto de hidratación.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (finalizadoHoy) return;
    const guardada = leerSesionActiva();
    if (guardada?.dia === dia && exercises.some((e) => e.id === guardada.activoId)) {
      setSesionActiva(true);
      setActivoId(guardada.activoId);
      // Si el descanso guardado ya venció mientras la app estaba cerrada/en
      // segundo plano, no lo restauramos tal cual -- lo tratamos como si
      // hubiese terminado normalmente (avanza de lado si era "entre lados")
      // para no dejar la puerta abierta a cargar el mismo lado dos veces.
      const descansoVigente = guardada.descansoHasta && guardada.descansoHasta > Date.now();
      if (descansoVigente) {
        setLado(guardada.lado);
        setDescansoHasta(guardada.descansoHasta);
        setEtiquetaDescanso(guardada.etiquetaDescanso);
      } else if (guardada.descansoHasta && guardada.etiquetaDescanso === "Descanso entre lados") {
        setLado(guardada.lado === "derecho" ? "izquierdo" : "derecho");
      } else {
        setLado(guardada.lado);
      }
    } else {
      guardarSesionActiva({ dia, activoId: null, lado: null, descansoHasta: null, etiquetaDescanso: "" });
    }
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!sesionActiva) return;
    guardarSesionActiva({ dia, activoId, lado, descansoHasta, etiquetaDescanso });
  }, [sesionActiva, activoId, lado, dia, descansoHasta, etiquetaDescanso]);

  useEffect(() => {
    if (finalizadoHoy && leerSesionActiva()?.dia === dia) {
      borrarSesionActiva();
    }
  }, [finalizadoHoy, dia]);

  function iniciar() {
    prepararAlertas();
    setSesionActiva(true);
    setActivoId(exercises[0]?.id ?? null);
    setLado(exercises[0]?.unilateral ? "derecho" : null);
    setDescansoHasta(null);
  }

  function pedirFinalizar() {
    prepararAlertas();
    setErrorFinalizar(null);
    setMostrarConfirmacion(true);
  }

  async function confirmarFinalizar() {
    setMostrarConfirmacion(false);
    setFinalizando(true);
    const result = await finalizarEntrenamientoDia(dia, routineId);
    setFinalizando(false);

    if (result.error) {
      setErrorFinalizar(result.error);
      return;
    }

    setSesionActiva(false);
    setActivoId(null);
    setDescansoHasta(null);
    setLado(null);
    borrarSesionActiva();
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

  // onSetGuardado solo se dispara desde el botón "Guardar serie" de
  // ExerciseCard (nunca durante el render) -- necesita el reloj real para
  // saber hasta cuándo dura el descanso.
  function onSetGuardado() {
    if (!activo) return;
    if (activo.unilateral && lado === "derecho") {
      setEtiquetaDescanso("Descanso entre lados");
      // eslint-disable-next-line react-hooks/purity
      setDescansoHasta(Date.now() + segundosEntreLados(activo.tipoEsfuerzo) * 1000);
    } else {
      setEtiquetaDescanso("Descanso");
      // eslint-disable-next-line react-hooks/purity
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
        <div className="grid grid-cols-2 gap-3">
          {exercises.map((ex) => (
            <ExerciseCard key={ex.id} exercise={ex} dia={dia} logsDeHoy={[]} compacto />
          ))}
        </div>
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

      <div className={sesionActiva ? "flex flex-col gap-3" : "grid grid-cols-2 gap-3"}>
        {exercises.map((ex) => {
          const esActivo = sesionActiva && ex.id === activoId;
          return (
            <ExerciseCard
              key={ex.id}
              exercise={ex}
              dia={dia}
              logsDeHoy={logsPorEjercicio[ex.id] ?? []}
              activo={esActivo}
              compacto={!sesionActiva}
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

      {sesionActiva && (
        <div className="flex flex-col gap-2 border-t border-border pt-4">
          <button
            disabled={finalizando}
            onClick={pedirFinalizar}
            className="rounded-md bg-red-500/90 px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            {finalizando ? "Finalizando..." : "Finalizar entrenamiento"}
          </button>
          {errorFinalizar && (
            <p className="text-center text-xs text-red-400">{errorFinalizar}</p>
          )}
          <p className="text-center text-xs text-gray-500">
            No hace falta que finalices — cada serie que cargás ya queda registrada con su fecha y
            hora, se toque este botón o no. Finalizar es solo una formalidad opcional, por si
            querés cerrar el registro de hoy ({fechaLegible(hoyISO())}) para no volver a tocarlo.
          </p>
        </div>
      )}

      {mostrarConfirmacion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
          <div className="w-full max-w-sm rounded-lg border border-border-strong bg-bg-elev p-5">
            <h2 className="mb-2 text-lg font-medium text-white">¿Finalizar entrenamiento?</h2>
            <p className="mb-5 text-sm text-gray-400">
              El registro de hoy ({fechaLegible(hoyISO())}) va a quedar cerrado — no vas a poder
              volver a entrar a este día para editarlo o agregar algo más.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setMostrarConfirmacion(false)}
                className="flex-1 rounded-md border border-border-strong py-2 text-sm text-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarFinalizar}
                className="flex-1 rounded-md bg-red-500/90 py-2 text-sm font-medium text-white"
              >
                Sí, finalizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

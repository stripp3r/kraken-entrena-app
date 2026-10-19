"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { borrarSet, editarSet, registrarSets } from "@/app/entrenamiento/actions";
import { DescansoTimer } from "./descanso-timer";
import type { Lado } from "@/lib/descanso";
import { prepararAlertas } from "@/lib/sonido";
import {
  estadoDropset,
  pesoSugeridoBajada,
  planDeSeries,
  tieneDropset,
  type TipoSerie,
} from "@/lib/dropset";
import { aNumero, limpiarDecimal } from "@/lib/numero";

type WorkoutLog = {
  id: number;
  peso: number | null;
  reps: number | null;
  rir: number | null;
  lado: Lado | null;
  tipo_serie: TipoSerie;
  drop_de: number | null;
  created_at: string;
};

type ExerciseAlternativa = {
  id: number;
  nombre: string;
  imagen_url: string | null;
  como_hacerlo: string | null;
};

type Sugerencia = {
  pesoAnterior: number;
  repsAnterior: number;
  pesoSugerido: number | null;
};

type Exercise = {
  id: number;
  nombre: string;
  imagen_url: string | null;
  video_url: string | null;
  como_hacerlo: string | null;
  series_reps: string | null;
  alternativa: ExerciseAlternativa | null;
  sugerencia?: Sugerencia | null;
};

export type SesionActiva = {
  lado: Lado | null;
  descansoHasta: number | null;
  etiquetaDescanso: string;
  seriesCompletas: number;
  listoParaOtro: boolean;
  // sinDescanso: true cuando lo registrado es el tramo de un drop set que se
  // sigue SIN descanso con la próxima bajada.
  onSetGuardado: (opciones?: { sinDescanso?: boolean }) => void;
  onDescansoTerminado: () => void;
  onSaltarDescanso: () => void;
  onFinalizarEjercicio: () => void;
};

const emptyRow = { peso: "", reps: "", rir: "" };

function horaDe(fechaIso: string) {
  return new Date(fechaIso).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function labelLado(lado: Lado | null) {
  if (lado === "derecho") return "Lado derecho";
  if (lado === "izquierdo") return "Lado izquierdo";
  return null;
}

export function ExerciseCard({
  exercise,
  dia,
  logsDeHoy,
  activo = false,
  compacto = false,
  onSeleccionar,
  sesion,
}: {
  exercise: Exercise;
  dia: string;
  logsDeHoy: WorkoutLog[];
  activo?: boolean;
  compacto?: boolean;
  onSeleccionar?: () => void;
  sesion?: SesionActiva;
}) {
  const router = useRouter();
  const [setActivo, setSetActivo] = useState(emptyRow);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRow, setEditRow] = useState(emptyRow);
  const [mostrarComoHacerlo, setMostrarComoHacerlo] = useState(false);
  const [mostrarAlternativa, setMostrarAlternativa] = useState(false);
  const [modoElegido, setModoElegido] = useState<"normal" | "dropset" | null>(null);
  const [cerradoId, setCerradoId] = useState<number | null>(null);
  const [ahora, setAhora] = useState(0);

  const plan = planDeSeries(exercise.series_reps);
  const conDropset = tieneDropset(plan);
  const { pendiente, modoSugerido } = estadoDropset(logsDeHoy, plan, ahora, cerradoId);
  const modo = modoElegido ?? modoSugerido;
  const pesoSugeridoDrop = pendiente ? pesoSugeridoBajada(pendiente.pesos) : null;

  // La tarjeta nunca se desmonta durante la sesión (solo cambian sus props),
  // así que si no se limpia el formulario de serie al cambiar de "activo"
  // queda texto sin guardar de un intento anterior, y reaparece cuando la
  // tarjeta vuelve a activarse.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setSetActivo(emptyRow);
    setJustSaved(false);
    setError(null);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [activo]);

  // Cada vez que cambian los registros de hoy: se renueva "ahora" (para la
  // ventana de bajadas) y se suelta la elección manual de modo, así vuelve a
  // seguir lo que corresponde según lo ya registrado.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setAhora(Date.now());
    setModoElegido(null);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [logsDeHoy.length]);

  // Al pasar a la próxima bajada, el peso viene sugerido (mismo salto que la
  // bajada anterior) para tocar solo las reps -- se puede corregir.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (pendiente) {
      setSetActivo({ peso: pesoSugeridoDrop?.toString() ?? "", reps: "", rir: "" });
    }
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendiente?.padreId, pendiente?.numero]);

  async function registrarSetDeSesion() {
    if (!sesion) return;
    if (!setActivo.peso && !setActivo.reps && !setActivo.rir) return;

    prepararAlertas();
    setSaving(true);
    setError(null);

    const tipo: TipoSerie = pendiente ? "drop" : conDropset && modo === "dropset" ? "dropset" : "normal";

    const result = await registrarSets(
      exercise.id,
      [
        {
          peso: setActivo.peso ? aNumero(setActivo.peso) : null,
          reps: setActivo.reps ? Number(setActivo.reps) : null,
          // Una bajada es siempre al fallo: no se pregunta el RIR.
          rir: tipo === "drop" ? 0 : setActivo.rir ? Number(setActivo.rir) : null,
          lado: sesion.lado,
          tipo,
          dropDe: pendiente?.padreId ?? null,
        },
      ],
      dia
    );
    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSetActivo(emptyRow);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1800);
    router.refresh();
    // Sin descanso entre tramos de un mismo drop set; el descanso real
    // arranca al terminar la última bajada prevista.
    const quedanBajadas =
      tipo === "dropset" ? plan.bajadas > 0 : tipo === "drop" && pendiente ? pendiente.numero < plan.bajadas : false;
    sesion.onSetGuardado({ sinDescanso: quedanBajadas });
  }

  function empezarEdicion(log: WorkoutLog) {
    setEditingId(log.id);
    setEditRow({
      peso: log.peso?.toString() ?? "",
      reps: log.reps?.toString() ?? "",
      rir: log.rir?.toString() ?? "",
    });
  }

  async function guardarEdicion(logId: number) {
    setSaving(true);
    setError(null);

    const result = await editarSet(logId, {
      peso: editRow.peso ? aNumero(editRow.peso) : null,
      reps: editRow.reps ? Number(editRow.reps) : null,
      rir: editRow.rir ? Number(editRow.rir) : null,
    });

    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setEditingId(null);
    router.refresh();
  }

  async function eliminar(logId: number) {
    setSaving(true);
    setError(null);
    const result = await borrarSet(logId);
    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.refresh();
  }

  const sesionEnCurso = activo || Boolean(onSeleccionar);

  return (
    <div
      className={`rounded-lg border p-3 transition-colors ${
        activo
          ? "border-emerald-500 bg-emerald-500/10"
          : "border-border bg-bg-card"
      }`}
    >
      <div className="flex flex-col gap-2">
        {exercise.imagen_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={exercise.imagen_url}
            alt={exercise.nombre}
            className={
              compacto
                ? "aspect-square w-full rounded-md bg-white object-contain"
                : "h-44 w-full rounded-md bg-white object-contain"
            }
          />
        )}
        <div>
          <h2 className="text-sm font-medium leading-tight text-white">{exercise.nombre}</h2>
          {exercise.series_reps && (
            <p className="mt-0.5 text-[11px] text-gray-500">{exercise.series_reps}</p>
          )}
          {sesionEnCurso && (
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
              {exercise.como_hacerlo && (
                <button
                  type="button"
                  onClick={() => setMostrarComoHacerlo((v) => !v)}
                  className="text-xs text-gray-400 underline"
                >
                  {mostrarComoHacerlo ? "Ocultar" : "¿Cómo hacerlo?"}
                </button>
              )}
              {exercise.alternativa && (
                <button
                  type="button"
                  onClick={() => setMostrarAlternativa((v) => !v)}
                  className="text-xs text-gray-400 underline"
                >
                  {mostrarAlternativa ? "Ocultar" : "Alternativa"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {onSeleccionar && (
        logsDeHoy.length > 0 ? (
          <div className="mt-3 flex flex-col gap-1.5">
            <span className="self-start rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300">
              ✓ Registrado
            </span>
            <button
              type="button"
              onClick={onSeleccionar}
              className="w-full rounded-md border border-orange-500/50 py-2 text-sm font-medium text-orange-300"
            >
              ↩ Volver
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onSeleccionar}
            className="mt-3 w-full rounded-md border border-emerald-500/50 py-2 text-sm font-medium text-emerald-300"
          >
            ▶ Iniciar
          </button>
        )
      )}

      {mostrarComoHacerlo && exercise.como_hacerlo && (
        <div className="mt-3 rounded-md bg-bg p-3">
          {exercise.video_url && (
            <video
              src={exercise.video_url}
              autoPlay
              muted
              loop
              playsInline
              className="mb-3 max-h-[70vh] w-full rounded-md bg-black object-contain"
            />
          )}
          <p className="whitespace-pre-line text-sm text-gray-300">{exercise.como_hacerlo}</p>
        </div>
      )}

      {mostrarAlternativa && exercise.alternativa && (
        <div className="mt-3 rounded-md border border-border-strong bg-bg p-3">
          <p className="mb-2 text-[11px] uppercase tracking-wide text-gray-500">
            Alternativa
          </p>
          <h3 className="mb-2 text-sm font-medium text-white">
            {exercise.alternativa.nombre}
          </h3>
          {exercise.alternativa.imagen_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={exercise.alternativa.imagen_url}
              alt={exercise.alternativa.nombre}
              className="mb-3 h-56 w-full rounded-md bg-white object-contain"
            />
          )}
          {exercise.alternativa.como_hacerlo && (
            <p className="whitespace-pre-line text-sm text-gray-300">
              {exercise.alternativa.como_hacerlo}
            </p>
          )}
        </div>
      )}

      {sesion && (
        <>
          {exercise.sugerencia && (
            <div className="mt-3 rounded-md border border-sky-500/30 bg-sky-500/10 p-3">
              <p className="text-xs text-sky-300">
                Última vez: {exercise.sugerencia.pesoAnterior}kg × {exercise.sugerencia.repsAnterior}
                {exercise.sugerencia.pesoSugerido !== null && (
                  <> — sugerencia orientativa hoy: ~{exercise.sugerencia.pesoSugerido}kg</>
                )}
              </p>
            </div>
          )}
          {logsDeHoy.length > 0 && (
            <div className="mt-3 flex flex-col gap-1.5 border-t border-border pt-3">
              <p className="text-[11px] uppercase tracking-wide text-gray-500">Hoy</p>
              {logsDeHoy.map((log, indice) => {
                const numeroSerie = logsDeHoy.slice(0, indice + 1).filter((l) => l.tipo_serie !== "drop").length;
                const etiquetaSerie =
                  log.tipo_serie === "drop"
                    ? `↳ Bajada ${logsDeHoy.filter((l) => l.drop_de === log.drop_de && l.id <= log.id).length}`
                    : log.tipo_serie === "dropset"
                      ? `Serie ${numeroSerie} · drop set`
                      : conDropset
                        ? `Serie ${numeroSerie}`
                        : null;
                return editingId === log.id ? (
                  <div key={log.id} className="flex items-center gap-1.5">
                    <input
                      value={editRow.peso}
                      onChange={(e) => setEditRow((r) => ({ ...r, peso: limpiarDecimal(e.target.value) }))}
                      placeholder="Peso"
                      inputMode="decimal"
                      className="w-16 rounded-md border border-border bg-bg px-2 py-1 text-sm text-white outline-none"
                    />
                    <input
                      value={editRow.reps}
                      onChange={(e) => setEditRow((r) => ({ ...r, reps: e.target.value }))}
                      placeholder="Reps"
                      inputMode="numeric"
                      className="w-16 rounded-md border border-border bg-bg px-2 py-1 text-sm text-white outline-none"
                    />
                    <input
                      value={editRow.rir}
                      onChange={(e) => setEditRow((r) => ({ ...r, rir: e.target.value }))}
                      placeholder="RIR"
                      inputMode="numeric"
                      className="w-14 rounded-md border border-border bg-bg px-2 py-1 text-sm text-white outline-none"
                    />
                    <button
                      disabled={saving}
                      onClick={() => guardarEdicion(log.id)}
                      className="rounded-md bg-white px-2 py-1 text-xs font-medium text-black disabled:opacity-50"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-xs text-gray-500"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <div
                    key={log.id}
                    className={`flex items-center justify-between text-sm text-gray-300 ${log.tipo_serie === "drop" ? "pl-4" : ""}`}
                  >
                    <span>
                      {etiquetaSerie && <span className="text-orange-300">{etiquetaSerie} · </span>}
                      {horaDe(log.created_at)} — {log.peso ?? "-"}kg × {log.reps ?? "-"}
                      {log.tipo_serie !== "drop" && <> (RIR {log.rir ?? "-"})</>}
                      {log.lado && (
                        <span className="text-gray-500"> · {labelLado(log.lado)}</span>
                      )}
                    </span>
                    <span className="flex gap-3 text-xs">
                      <button onClick={() => empezarEdicion(log)} className="text-gray-400 underline">
                        Editar
                      </button>
                      <button
                        disabled={saving}
                        onClick={() => eliminar(log.id)}
                        className="text-red-400 underline disabled:opacity-50"
                      >
                        Borrar
                      </button>
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-3 flex flex-col gap-3 border-t border-border pt-3">
            {sesion.listoParaOtro && (
              <p className="text-sm font-medium text-emerald-300">
                ✓ Completaste {sesion.seriesCompletas} series. Podés seguir acá o pasar a otro
                ejercicio cuando quieras.
              </p>
            )}
            {sesion.descansoHasta ? (
              <DescansoTimer
                hasta={sesion.descansoHasta}
                etiqueta={sesion.etiquetaDescanso}
                onTerminar={sesion.onDescansoTerminado}
                onSaltar={sesion.onSaltarDescanso}
              />
            ) : (
              <>
                {sesion.lado && (
                  <p className="text-sm font-medium text-emerald-300">{labelLado(sesion.lado)}</p>
                )}
                {conDropset && !pendiente && !sesion.lado && (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex gap-2">
                      {(["normal", "dropset"] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setModoElegido(m)}
                          className={`flex-1 rounded-md border py-1.5 text-xs font-medium ${
                            modo === m
                              ? "border-orange-400 bg-orange-400/15 text-orange-300"
                              : "border-border-strong text-gray-400"
                          }`}
                        >
                          {m === "normal" ? "Serie normal" : "Con drop set"}
                        </button>
                      ))}
                    </div>
                    {modo === "dropset" && (
                      <p className="text-[11px] text-gray-500">
                        Registrá primero la serie pesada al fallo. Después vas a cargar {plan.bajadas}{" "}
                        bajadas seguidas, sin descanso.
                      </p>
                    )}
                  </div>
                )}
                {pendiente && (
                  <div className="flex flex-col gap-1 rounded-md border border-orange-400/40 bg-orange-400/10 p-3">
                    <p className="text-sm font-medium text-orange-300">
                      Bajada {pendiente.numero} de {plan.bajadas} — sin descanso
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Bajá el peso
                      {pesoSugeridoDrop !== null && <> (sugerido: {pesoSugeridoDrop} kg)</>} y seguí al
                      fallo.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setCerradoId(logsDeHoy[logsDeHoy.length - 1]?.id ?? null);
                        sesion.onSetGuardado();
                      }}
                      className="self-start text-xs text-gray-400 underline"
                    >
                      Terminar drop set
                    </button>
                  </div>
                )}
                <div className="flex items-end gap-2">
                  <div className="flex flex-1 flex-col gap-1">
                    <label className="text-[11px] text-gray-500">Peso</label>
                    <input
                      value={setActivo.peso}
                      onChange={(e) => setSetActivo((r) => ({ ...r, peso: limpiarDecimal(e.target.value) }))}
                      type="text"
                      inputMode="decimal"
                      className="w-full rounded-md border border-border bg-bg px-2 py-1.5 text-sm text-white outline-none focus:border-border-strong"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <label className="text-[11px] text-gray-500">Reps</label>
                    <input
                      value={setActivo.reps}
                      onChange={(e) => setSetActivo((r) => ({ ...r, reps: e.target.value }))}
                      type="number"
                      inputMode="numeric"
                      className="w-full rounded-md border border-border bg-bg px-2 py-1.5 text-sm text-white outline-none focus:border-border-strong"
                    />
                  </div>
                  <div className={`flex flex-1 flex-col gap-1 ${pendiente ? "hidden" : ""}`}>
                    <label className="text-[11px] text-gray-500">RIR</label>
                    <input
                      value={setActivo.rir}
                      onChange={(e) => setSetActivo((r) => ({ ...r, rir: e.target.value }))}
                      type="number"
                      inputMode="numeric"
                      className="w-full rounded-md border border-border bg-bg px-2 py-1.5 text-sm text-white outline-none focus:border-border-strong"
                    />
                  </div>
                </div>
                {error && <p className="text-xs text-red-400">{error}</p>}
                {justSaved && <p className="text-xs text-emerald-400">✓ Serie registrada</p>}
                <button
                  disabled={saving || (!setActivo.peso && !setActivo.reps && !setActivo.rir)}
                  onClick={registrarSetDeSesion}
                  className="rounded-md bg-emerald-500 px-3 py-2 text-sm font-medium text-black disabled:opacity-50"
                >
                  {saving ? "Guardando..." : pendiente ? "Registrar bajada" : "Registrar serie"}
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => {
                prepararAlertas();
                sesion.onFinalizarEjercicio();
              }}
              className="rounded-md border border-border-strong py-2 text-sm text-gray-300"
            >
              Finalizar ejercicio
            </button>
          </div>
        </>
      )}
    </div>
  );
}

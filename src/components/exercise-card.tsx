"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { borrarSet, editarSet, registrarSets, type SetInput } from "@/app/entrenamiento/actions";
import { DescansoTimer } from "./descanso-timer";
import type { Lado } from "@/lib/descanso";
import { prepararAlertas } from "@/lib/sonido";

type WorkoutLog = {
  id: number;
  peso: number | null;
  reps: number | null;
  rir: number | null;
  lado: Lado | null;
  created_at: string;
};

type ExerciseAlternativa = {
  id: number;
  nombre: string;
  imagen_url: string | null;
  como_hacerlo: string | null;
};

type Exercise = {
  id: number;
  nombre: string;
  imagen_url: string | null;
  video_url: string | null;
  como_hacerlo: string | null;
  alternativa: ExerciseAlternativa | null;
};

export type SesionActiva = {
  lado: Lado | null;
  descansoHasta: number | null;
  etiquetaDescanso: string;
  onSetGuardado: () => void;
  onDescansoTerminado: () => void;
  onSaltarDescanso: () => void;
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
  logsDeHoy,
  activo = false,
  sesion,
}: {
  exercise: Exercise;
  logsDeHoy: WorkoutLog[];
  activo?: boolean;
  sesion?: SesionActiva;
}) {
  const router = useRouter();
  const [rows, setRows] = useState([{ ...emptyRow }, { ...emptyRow }, { ...emptyRow }]);
  const [setActivo, setSetActivo] = useState(emptyRow);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRow, setEditRow] = useState(emptyRow);
  const [mostrarComoHacerlo, setMostrarComoHacerlo] = useState(false);
  const [mostrarAlternativa, setMostrarAlternativa] = useState(false);

  function updateRow(i: number, field: keyof typeof emptyRow, value: string) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
  }

  async function guardarSets() {
    setSaving(true);
    setError(null);

    const sets: SetInput[] = rows.map((r) => ({
      peso: r.peso ? Number(r.peso) : null,
      reps: r.reps ? Number(r.reps) : null,
      rir: r.rir ? Number(r.rir) : null,
    }));

    const result = await registrarSets(exercise.id, sets);
    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setRows([{ ...emptyRow }, { ...emptyRow }, { ...emptyRow }]);
    router.refresh();
  }

  async function registrarSetDeSesion() {
    if (!sesion) return;
    prepararAlertas();
    setSaving(true);
    setError(null);

    const result = await registrarSets(exercise.id, [
      {
        peso: setActivo.peso ? Number(setActivo.peso) : null,
        reps: setActivo.reps ? Number(setActivo.reps) : null,
        rir: setActivo.rir ? Number(setActivo.rir) : null,
        lado: sesion.lado,
      },
    ]);
    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSetActivo(emptyRow);
    router.refresh();
    sesion.onSetGuardado();
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
      peso: editRow.peso ? Number(editRow.peso) : null,
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

  return (
    <div
      className={`rounded-lg border p-4 transition-colors ${
        activo
          ? "border-emerald-500 bg-emerald-500/10"
          : "border-border bg-bg-card"
      }`}
    >
      <div className="flex items-center gap-3">
        {exercise.imagen_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={exercise.imagen_url}
            alt={exercise.nombre}
            className="h-14 w-14 shrink-0 rounded-md object-cover"
          />
        )}
        <div>
          <h2 className="text-lg font-medium leading-tight text-white">{exercise.nombre}</h2>
          <div className="flex gap-3">
            {exercise.como_hacerlo && (
              <button
                type="button"
                onClick={() => setMostrarComoHacerlo((v) => !v)}
                className="text-xs text-gray-400 underline"
              >
                {mostrarComoHacerlo ? "Ocultar" : "¿Cómo hacerlo?"}
              </button>
            )}
            {exercise.video_url && (
              <a
                href={exercise.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-400 underline"
              >
                Ver video
              </a>
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
        </div>
      </div>

      {mostrarComoHacerlo && exercise.como_hacerlo && (
        <div className="mt-3 rounded-md bg-bg p-3">
          {exercise.imagen_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={exercise.imagen_url}
              alt={exercise.nombre}
              className="mb-3 h-56 w-full rounded-md bg-white object-contain"
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

      {logsDeHoy.length > 0 && (
        <div className="mt-3 flex flex-col gap-1.5 border-t border-border pt-3">
          <p className="text-[11px] uppercase tracking-wide text-gray-500">Hoy</p>
          {logsDeHoy.map((log) =>
            editingId === log.id ? (
              <div key={log.id} className="flex items-center gap-1.5">
                <input
                  value={editRow.peso}
                  onChange={(e) => setEditRow((r) => ({ ...r, peso: e.target.value }))}
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
              <div key={log.id} className="flex items-center justify-between text-sm text-gray-300">
                <span>
                  {horaDe(log.created_at)} — {log.peso ?? "-"}kg × {log.reps ?? "-"} (RIR{" "}
                  {log.rir ?? "-"})
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
            )
          )}
        </div>
      )}

      {sesion ? (
        <div className="mt-3 flex flex-col gap-3 border-t border-border pt-3">
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
              <div className="flex items-end gap-2">
                <div className="flex flex-1 flex-col gap-1">
                  <label className="text-[11px] text-gray-500">Peso</label>
                  <input
                    value={setActivo.peso}
                    onChange={(e) => setSetActivo((r) => ({ ...r, peso: e.target.value }))}
                    type="number"
                    step="0.5"
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
                <div className="flex flex-1 flex-col gap-1">
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
              <button
                disabled={saving}
                onClick={registrarSetDeSesion}
                className="rounded-md bg-emerald-500 px-3 py-2 text-sm font-medium text-black disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Registrar serie"}
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
          {rows.map((row, i) => (
            <div key={i} className="flex items-end gap-2">
              <div className="flex flex-1 flex-col gap-1">
                {i === 0 && <label className="text-[11px] text-gray-500">Peso</label>}
                <input
                  value={row.peso}
                  onChange={(e) => updateRow(i, "peso", e.target.value)}
                  type="number"
                  step="0.5"
                  inputMode="decimal"
                  className="w-full rounded-md border border-border bg-bg px-2 py-1.5 text-sm text-white outline-none focus:border-border-strong"
                />
              </div>
              <div className="flex flex-1 flex-col gap-1">
                {i === 0 && <label className="text-[11px] text-gray-500">Reps</label>}
                <input
                  value={row.reps}
                  onChange={(e) => updateRow(i, "reps", e.target.value)}
                  type="number"
                  inputMode="numeric"
                  className="w-full rounded-md border border-border bg-bg px-2 py-1.5 text-sm text-white outline-none focus:border-border-strong"
                />
              </div>
              <div className="flex flex-1 flex-col gap-1">
                {i === 0 && <label className="text-[11px] text-gray-500">RIR</label>}
                <input
                  value={row.rir}
                  onChange={(e) => updateRow(i, "rir", e.target.value)}
                  type="number"
                  inputMode="numeric"
                  className="w-full rounded-md border border-border bg-bg px-2 py-1.5 text-sm text-white outline-none focus:border-border-strong"
                />
              </div>
              <span className="pb-1.5 text-[11px] text-gray-600">Set {i + 1}</span>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setRows((prev) => [...prev, { ...emptyRow }])}
            className="self-start text-xs text-gray-400 underline"
          >
            + Agregar otro set
          </button>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            disabled={saving}
            onClick={guardarSets}
            className="mt-1 rounded-md bg-white px-3 py-2 text-sm font-medium text-black disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar sets"}
          </button>
        </div>
      )}
    </div>
  );
}

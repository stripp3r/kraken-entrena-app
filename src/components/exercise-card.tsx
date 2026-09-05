"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { borrarSet, editarSet, registrarSets, type SetInput } from "@/app/entrenamiento/actions";

type WorkoutLog = {
  id: number;
  peso: number | null;
  reps: number | null;
  rir: number | null;
  created_at: string;
};

type Exercise = {
  id: number;
  nombre: string;
  imagen_url: string | null;
  video_url: string | null;
  technique: { nombre: string; descripcion: string | null } | null;
};

const emptyRow = { peso: "", reps: "", rir: "" };

function horaDe(fechaIso: string) {
  return new Date(fechaIso).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ExerciseCard({
  exercise,
  logsDeHoy,
}: {
  exercise: Exercise;
  logsDeHoy: WorkoutLog[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState([{ ...emptyRow }, { ...emptyRow }, { ...emptyRow }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRow, setEditRow] = useState(emptyRow);

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
    <div className="rounded-lg border border-border bg-bg-card p-4">
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
          {exercise.technique && (
            <p className="text-xs text-gray-500">
              Técnica: <span className="text-gray-300">{exercise.technique.nombre}</span>
            </p>
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
        </div>
      </div>

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
    </div>
  );
}

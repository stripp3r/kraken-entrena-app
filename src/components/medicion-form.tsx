"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  borrarMedicion,
  editarMedicion,
  guardarMedicion,
  type MedicionInput,
} from "@/app/medidas/actions";
import { hoyISO } from "@/lib/fecha";

type Medicion = MedicionInput & { id: number };

const CAMPOS: { key: keyof MedicionInput; label: string }[] = [
  { key: "peso", label: "Peso (kg)" },
  { key: "altura", label: "Altura (cm)" },
  { key: "cuello", label: "Cuello (cm)" },
  { key: "hombros", label: "Hombros (cm)" },
  { key: "pecho", label: "Pecho (cm)" },
  { key: "brazo", label: "Brazo (cm)" },
  { key: "cintura", label: "Cintura (cm)" },
  { key: "caderas", label: "Caderas (cm)" },
  { key: "muslos", label: "Muslos (cm)" },
  { key: "gemelos", label: "Gemelos (cm)" },
];

function formVacio(): Record<string, string> {
  const base: Record<string, string> = { fecha: hoyISO() };
  CAMPOS.forEach((c) => (base[c.key] = ""));
  return base;
}

function aInput(m: Medicion): Record<string, string> {
  const base: Record<string, string> = { fecha: m.fecha };
  CAMPOS.forEach((c) => (base[c.key] = m[c.key]?.toString() ?? ""));
  return base;
}

function aMedicionInput(form: Record<string, string>): MedicionInput {
  const out: Partial<MedicionInput> = { fecha: form.fecha };
  CAMPOS.forEach((c) => {
    const v = form[c.key];
    (out as Record<string, number | null | string>)[c.key] = v ? Number(v) : null;
  });
  return out as MedicionInput;
}

export function MedicionForm({ historial }: { historial: Medicion[] }) {
  const router = useRouter();
  const [form, setForm] = useState(formVacio());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState(formVacio());

  async function guardar() {
    setSaving(true);
    setError(null);
    const result = await guardarMedicion(aMedicionInput(form));
    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setForm(formVacio());
    router.refresh();
  }

  async function guardarEdicion(id: number) {
    setSaving(true);
    setError(null);
    const result = await editarMedicion(id, aMedicionInput(editForm));
    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setEditingId(null);
    router.refresh();
  }

  async function eliminar(id: number) {
    setSaving(true);
    setError(null);
    const result = await borrarMedicion(id);
    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-border bg-bg-card p-4">
        <h2 className="mb-3 text-sm font-medium text-white">Nueva medición</h2>

        <div className="mb-3 flex min-w-0 flex-col gap-1.5">
          <label className="text-[11px] text-gray-500">Fecha</label>
          <input
            type="date"
            value={form.fecha}
            onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))}
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-white outline-none focus:border-border-strong"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {CAMPOS.map((c) => (
            <div key={c.key} className="flex min-w-0 flex-col gap-1.5">
              <label className="text-[11px] text-gray-500">{c.label}</label>
              <input
                value={form[c.key]}
                onChange={(e) => setForm((f) => ({ ...f, [c.key]: e.target.value }))}
                type="number"
                step="0.1"
                inputMode="decimal"
                className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-white outline-none focus:border-border-strong"
              />
            </div>
          ))}
        </div>

        {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

        <button
          disabled={saving}
          onClick={guardar}
          className="mt-4 w-full rounded-md bg-white px-3 py-2.5 text-sm font-medium text-black disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar medición"}
        </button>
      </div>

      {historial.length > 0 && (
        <div className="rounded-lg border border-border bg-bg-card p-4">
          <h2 className="mb-3 text-sm font-medium text-white">Historial</h2>
          <div className="flex flex-col gap-3">
            {historial.map((m) =>
              editingId === m.id ? (
                <div key={m.id} className="rounded-md bg-bg p-3">
                  <div className="mb-2 flex flex-col gap-1">
                    <label className="text-[11px] text-gray-500">Fecha</label>
                    <input
                      type="date"
                      value={editForm.fecha}
                      onChange={(e) => setEditForm((f) => ({ ...f, fecha: e.target.value }))}
                      className="w-full rounded-md border border-border bg-bg-card px-2 py-1.5 text-sm text-white outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {CAMPOS.map((c) => (
                      <div key={c.key} className="flex flex-col gap-1">
                        <label className="text-[11px] text-gray-500">{c.label}</label>
                        <input
                          value={editForm[c.key]}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, [c.key]: e.target.value }))
                          }
                          type="number"
                          step="0.1"
                          inputMode="decimal"
                          className="w-full rounded-md border border-border bg-bg-card px-2 py-1.5 text-sm text-white outline-none"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex gap-3">
                    <button
                      disabled={saving}
                      onClick={() => guardarEdicion(m.id)}
                      className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-black disabled:opacity-50"
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
                </div>
              ) : (
                <div key={m.id} className="flex items-start justify-between text-sm">
                  <div className="text-gray-300">
                    <p className="text-white">{m.fecha}</p>
                    <p className="text-gray-500">
                      {CAMPOS.filter((c) => m[c.key] !== null)
                        .map((c) => `${c.label.split(" ")[0]}: ${m[c.key]}`)
                        .join(" · ")}
                    </p>
                  </div>
                  <span className="flex shrink-0 gap-3 text-xs">
                    <button
                      onClick={() => {
                        setEditingId(m.id);
                        setEditForm(aInput(m));
                      }}
                      className="text-gray-400 underline"
                    >
                      Editar
                    </button>
                    <button
                      disabled={saving}
                      onClick={() => eliminar(m.id)}
                      className="text-red-400 underline disabled:opacity-50"
                    >
                      Borrar
                    </button>
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { subirFotoProgreso } from "@/app/evolucion/actions";

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

export function EvolucionUploader() {
  const router = useRouter();
  const [fecha, setFecha] = useState(hoyISO());
  const [subiendo, setSubiendo] = useState<"frontal" | "lateral" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function subir(tipo: "frontal" | "lateral", file: File | undefined) {
    if (!file) return;
    setSubiendo(tipo);
    setError(null);

    const formData = new FormData();
    formData.set("fecha", fecha);
    formData.set("tipo", tipo);
    formData.set("file", file);

    const result = await subirFotoProgreso(formData);
    setSubiendo(null);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.refresh();
  }

  return (
    <div className="rounded-lg border border-border bg-bg-card p-4">
      <h2 className="mb-3 text-sm font-medium text-white">Subir foto de hoy</h2>

      <div className="mb-3 flex flex-col gap-1.5">
        <label className="text-[11px] text-gray-500">Fecha</label>
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-white outline-none focus:border-border-strong"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] text-gray-500">Frontal</label>
          <input
            type="file"
            accept="image/*"
            disabled={subiendo === "frontal"}
            onChange={(e) => subir("frontal", e.target.files?.[0])}
            className="text-xs text-gray-400 file:mr-2 file:rounded-md file:border-0 file:bg-white file:px-2 file:py-1.5 file:text-xs file:font-medium file:text-black"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] text-gray-500">Lateral</label>
          <input
            type="file"
            accept="image/*"
            disabled={subiendo === "lateral"}
            onChange={(e) => subir("lateral", e.target.files?.[0])}
            className="text-xs text-gray-400 file:mr-2 file:rounded-md file:border-0 file:bg-white file:px-2 file:py-1.5 file:text-xs file:font-medium file:text-black"
          />
        </div>
      </div>

      {subiendo && <p className="mt-3 text-xs text-gray-500">Subiendo...</p>}
      {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
    </div>
  );
}

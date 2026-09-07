"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { subirFotoProgreso } from "@/app/evolucion/actions";
import { hoyISO } from "@/lib/fecha";

type Tipo = "frontal" | "lateral" | "trasera";

function BotonFoto({
  label,
  tipo,
  subiendo,
  onElegir,
}: {
  label: string;
  tipo: Tipo;
  subiendo: boolean;
  onElegir: (tipo: Tipo, file: File | undefined) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] text-gray-500">{label}</label>
      <label
        className={`flex w-full items-center justify-center rounded-md px-2 py-2 text-xs font-medium text-black ${
          subiendo ? "bg-gray-500" : "cursor-pointer bg-white"
        }`}
      >
        {subiendo ? "Subiendo..." : "Elegir foto"}
        <input
          type="file"
          accept="image/*"
          disabled={subiendo}
          onChange={(e) => onElegir(tipo, e.target.files?.[0])}
          className="hidden"
        />
      </label>
    </div>
  );
}

export function EvolucionUploader() {
  const router = useRouter();
  const [fecha, setFecha] = useState(hoyISO());
  const [subiendo, setSubiendo] = useState<Tipo | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function subir(tipo: Tipo, file: File | undefined) {
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

      <div className="grid grid-cols-3 gap-2">
        <BotonFoto label="Frontal" tipo="frontal" subiendo={subiendo === "frontal"} onElegir={subir} />
        <BotonFoto label="Lateral" tipo="lateral" subiendo={subiendo === "lateral"} onElegir={subir} />
        <BotonFoto label="Trasera" tipo="trasera" subiendo={subiendo === "trasera"} onElegir={subir} />
      </div>

      {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
    </div>
  );
}

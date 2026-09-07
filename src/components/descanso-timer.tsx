"use client";

import { useEffect, useRef, useState } from "react";
import { prepararAlertas, reproducirAlerta } from "@/lib/sonido";

function formatoMMSS(segundos: number) {
  const s = Math.max(0, Math.ceil(segundos));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export function DescansoTimer({
  hasta,
  onTerminar,
  onSaltar,
  etiqueta,
}: {
  hasta: number;
  onTerminar: () => void;
  onSaltar: () => void;
  etiqueta: string;
}) {
  const [restante, setRestante] = useState(() => (hasta - Date.now()) / 1000);
  const terminadoRef = useRef(false);

  useEffect(() => {
    terminadoRef.current = false;
    const id = setInterval(() => {
      const rest = (hasta - Date.now()) / 1000;
      setRestante(rest);
      if (rest <= 0 && !terminadoRef.current) {
        terminadoRef.current = true;
        reproducirAlerta();
        clearInterval(id);
        onTerminar();
      }
    }, 200);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasta]);

  return (
    <div className="flex flex-col items-center gap-2 rounded-md border border-orange-500/40 bg-orange-500/10 p-4">
      <p className="text-xs uppercase tracking-wide text-orange-300">{etiqueta}</p>
      <p className="text-3xl font-medium tabular-nums text-white">{formatoMMSS(restante)}</p>
      <button
        type="button"
        onClick={() => {
          prepararAlertas();
          onSaltar();
        }}
        className="text-xs text-gray-400 underline"
      >
        Saltar descanso
      </button>
    </div>
  );
}

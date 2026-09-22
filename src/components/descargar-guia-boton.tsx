"use client";

import { useState } from "react";
import { obtenerLinkDescargaGuia } from "@/app/alimentacion/actions";

export function DescargarGuiaBoton() {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function descargar() {
    setCargando(true);
    setError(null);

    const resultado = await obtenerLinkDescargaGuia();
    setCargando(false);

    if (resultado.error || !resultado.url) {
      setError(resultado.error ?? "No se pudo generar el link");
      return;
    }

    window.open(resultado.url, "_blank", "noopener,noreferrer");
  }

  return (
    <div>
      <button
        type="button"
        onClick={descargar}
        disabled={cargando}
        className="w-full rounded-full bg-amber-400 px-6 py-3 text-center text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {cargando ? "Generando..." : "Descargar mi guía alimenticia"}
      </button>
      {error && <p className="mt-1.5 text-center text-xs text-red-400">{error}</p>}
    </div>
  );
}

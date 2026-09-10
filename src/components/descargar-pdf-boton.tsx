"use client";

import { useState } from "react";
import { obtenerLinkDescargaPdf } from "@/app/perfil/recursos/actions";

export function DescargarPdfBoton({ productoId }: { productoId: number }) {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function descargar() {
    setCargando(true);
    setError(null);

    const resultado = await obtenerLinkDescargaPdf(productoId);
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
        className="rounded-full bg-white px-4 py-1.5 text-xs font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {cargando ? "Generando..." : "Descargar PDF"}
      </button>
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  );
}

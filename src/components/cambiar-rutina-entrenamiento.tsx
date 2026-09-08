"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cambiarRutinaActiva } from "@/app/entrenamiento/actions";

type Routine = { id: number; nombre: string; dias: number };

export function CambiarRutinaEntrenamiento({
  routineIdActual,
  rutinaActual,
  routines,
}: {
  routineIdActual: number;
  rutinaActual: { nombre: string; dias: number };
  routines: Routine[];
}) {
  const router = useRouter();
  const [mostrarModal, setMostrarModal] = useState(false);
  const [seleccion, setSeleccion] = useState(String(routineIdActual));
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function abrir() {
    setSeleccion(String(routineIdActual));
    setError(null);
    setMostrarModal(true);
  }

  async function confirmar() {
    const id = Number(seleccion);
    if (!id) {
      setError("Elegí una rutina.");
      return;
    }
    setGuardando(true);
    setError(null);

    const result = await cambiarRutinaActiva(id);
    setGuardando(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setMostrarModal(false);
    router.refresh();
  }

  return (
    <div className="mb-8 text-center">
      <p className="text-sm text-gray-500">Tu rutina activa</p>
      <p className="text-lg font-medium text-white">
        {rutinaActual.nombre} ({rutinaActual.dias} días)
      </p>

      {routines.length > 1 && (
        <button
          type="button"
          onClick={abrir}
          className="mt-2 rounded-full border border-border-strong px-4 py-1.5 text-xs text-gray-300 transition-colors hover:border-gray-400 active:bg-bg-card"
        >
          ¿Te gustaría cambiarla?
        </button>
      )}

      {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
          <div className="w-full max-w-sm rounded-lg border border-border-strong bg-bg-elev p-5 text-left">
            <h2 className="mb-2 text-lg font-medium text-white">¿Cambiar tu rutina activa?</h2>
            <p className="mb-4 text-sm text-gray-400">
              No es recomendable cambiar de rutina muy seguido. Para ver resultados reales, lo
              ideal es sostener el mismo programa al menos unos meses antes de pasar a otro.
            </p>

            <select
              value={seleccion}
              onChange={(e) => setSeleccion(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-4 py-2.5 text-white outline-none focus:border-border-strong"
            >
              <option value="" disabled>
                Elegí
              </option>
              {routines.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre} ({r.dias} días)
                </option>
              ))}
            </select>

            {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setMostrarModal(false)}
                className="flex-1 rounded-md border border-border-strong py-2 text-sm text-gray-300 transition-colors hover:border-gray-400 active:bg-bg-card"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={guardando}
                onClick={confirmar}
                className="flex-1 rounded-md bg-emerald-500 py-2 text-sm font-medium text-black transition-colors hover:bg-emerald-400 active:bg-emerald-600 disabled:opacity-50"
              >
                {guardando ? "Cambiando..." : "Confirmar cambio"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { borrarRutinaCreada } from "@/app/entrenamiento/rutinas/actions";

export function BorrarRutinaBoton({ routineId }: { routineId: number }) {
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);
  const [borrando, setBorrando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmar() {
    setBorrando(true);
    setError(null);
    const result = await borrarRutinaCreada(routineId);
    setBorrando(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push("/entrenamiento/rutinas");
    router.refresh();
  }

  if (confirmando) {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setConfirmando(false)}
            className="rounded-md border border-border-strong px-2.5 py-1 text-xs text-gray-300"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={borrando}
            onClick={confirmar}
            className="rounded-md bg-red-500/90 px-2.5 py-1 text-xs font-medium text-white disabled:opacity-50"
          >
            {borrando ? "Borrando..." : "Confirmar"}
          </button>
        </div>
        {error && <p className="text-[11px] text-red-400">{error}</p>}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirmando(true)}
      className="text-xs text-red-400 underline"
    >
      Borrar
    </button>
  );
}

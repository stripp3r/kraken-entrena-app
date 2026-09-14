"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cambiarRutinaActiva } from "@/app/entrenamiento/actions";

export function CambiarAEstaRutinaBoton({
  routineId,
  nombre,
  esActiva,
}: {
  routineId: number;
  nombre: string;
  esActiva: boolean;
}) {
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (esActiva) {
    return (
      <div className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-4 py-3 text-center text-sm text-emerald-300">
        Esta ya es tu rutina activa
      </div>
    );
  }

  async function confirmar() {
    setGuardando(true);
    setError(null);
    const result = await cambiarRutinaActiva(routineId);
    setGuardando(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push("/entrenamiento");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      {error && <p className="text-xs text-red-400">{error}</p>}
      {confirmando ? (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setConfirmando(false)}
            className="flex-1 rounded-md border border-border-strong py-2.5 text-sm text-gray-300 transition-colors hover:border-gray-400 active:bg-bg-card"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={guardando}
            onClick={confirmar}
            className="flex-1 rounded-md bg-emerald-500 py-2.5 text-sm font-medium text-black transition-colors hover:bg-emerald-400 active:bg-emerald-600 disabled:opacity-50"
          >
            {guardando ? "Cambiando..." : "Confirmar"}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmando(true)}
          className="w-full rounded-full bg-white px-8 py-3.5 font-medium text-black"
        >
          Cambiar a &quot;{nombre}&quot;
        </button>
      )}
    </div>
  );
}

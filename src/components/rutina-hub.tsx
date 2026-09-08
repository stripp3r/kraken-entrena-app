"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cambiarRutinaActiva } from "@/app/entrenamiento/actions";

const URL_PLANES = "https://kraken-fitness-web.vercel.app/#planes";

type Routine = { id: number; nombre: string; dias: number; descripcion: string | null };

export function RutinaHub({
  routineIdActual,
  rutinaActiva,
  routines,
  idsDesbloqueados,
}: {
  routineIdActual: number | null;
  rutinaActiva: { nombre: string; dias: number } | null;
  routines: Routine[];
  idsDesbloqueados: number[];
}) {
  const router = useRouter();
  const [candidata, setCandidata] = useState<Routine | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const desbloqueadas = new Set(idsDesbloqueados);
  const otras = routines.filter((r) => r.id !== routineIdActual);
  const adquiridas = otras.filter((r) => desbloqueadas.has(r.id));
  const paraAdquirir = otras.filter((r) => !desbloqueadas.has(r.id));

  async function confirmar() {
    if (!candidata) return;
    setGuardando(true);
    setError(null);

    const result = await cambiarRutinaActiva(candidata.id);
    setGuardando(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setCandidata(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-8">
      {rutinaActiva ? (
        <Link
          href="/entrenamiento/dias"
          className="block rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-5 py-4 text-center transition-colors hover:border-emerald-500"
        >
          <p className="text-xs uppercase tracking-wide text-emerald-300">Tu rutina activa</p>
          <p className="mt-1 text-lg font-medium text-white">
            {rutinaActiva.nombre} ({rutinaActiva.dias} días)
          </p>
        </Link>
      ) : (
        <div className="rounded-lg border border-border bg-bg-card px-5 py-4 text-center">
          <p className="text-sm text-gray-400">
            Todavía no tenés una rutina activa. Contactá a tu coach para que te asigne una.
          </p>
        </div>
      )}

      {adquiridas.length > 0 && (
        <div>
          <p className="mb-3 text-sm text-gray-500">Rutinas adquiridas</p>
          <div className="flex flex-col gap-3">
            {adquiridas.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setCandidata(r);
                  setError(null);
                }}
                className="flex items-center justify-between rounded-lg border border-border bg-bg-card px-4 py-3 text-left transition-colors hover:border-border-strong active:bg-bg"
              >
                <span className="text-sm text-white">
                  {r.nombre} ({r.dias} días)
                </span>
                <span className="text-xs text-gray-500">Cambiar →</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {paraAdquirir.length > 0 && (
        <div>
          <p className="mb-3 text-sm text-gray-500">Adquirir otras rutinas</p>
          <div className="flex flex-col gap-3">
            {paraAdquirir.map((r) => (
              <div
                key={r.id}
                className="relative overflow-hidden rounded-lg border border-border bg-bg-card px-4 py-3"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-2 -top-2 text-5xl opacity-10"
                >
                  🔒
                </span>
                <p className="text-sm font-medium text-gray-300">
                  {r.nombre} ({r.dias} días)
                </p>
                {r.descripcion && (
                  <p className="mt-0.5 text-xs text-gray-500">{r.descripcion}</p>
                )}
                <a
                  href={URL_PLANES}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block rounded-full bg-white px-4 py-1.5 text-xs font-medium text-black transition-opacity hover:opacity-90"
                >
                  Adquirir
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {candidata && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
          <div className="w-full max-w-sm rounded-lg border border-border-strong bg-bg-elev p-5 text-left">
            <h2 className="mb-2 text-lg font-medium text-white">
              ¿Cambiar a &quot;{candidata.nombre}&quot;?
            </h2>
            <p className="mb-4 text-sm text-gray-400">
              No es recomendable cambiar de rutina muy seguido. Para ver resultados reales, lo
              ideal es sostener el mismo programa al menos unos meses antes de pasar a otro.
            </p>

            {error && <p className="mb-3 text-xs text-red-400">{error}</p>}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCandidata(null)}
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

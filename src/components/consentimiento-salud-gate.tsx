"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { consentirDatosDeSalud } from "@/app/consentimiento-salud/actions";
import { TEXTO_CASILLA_SALUD, TEXTO_CONSENTIMIENTO_SALUD, TITULO_CONSENTIMIENTO_SALUD } from "@/lib/consentimiento-salud";
import { URL_ELIMINAR_DATOS, URL_PRIVACIDAD } from "@/lib/legal";

// Pop-up que tapa la pantalla hasta que se da el consentimiento específico de
// datos de salud. "Ahora no" vuelve atrás: nada de salud se carga sin esto.
export function ConsentimientoSaludGate({ volverA }: { volverA: string }) {
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();
  const [tildado, setTildado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function consentir() {
    setError(null);
    iniciar(async () => {
      const r = await consentirDatosDeSalud();
      if ("error" in r && r.error) setError(r.error);
      else router.refresh();
    });
  }

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-black/85 px-5 py-8">
      <div className="w-full max-w-sm rounded-2xl border border-border-strong bg-bg-card p-5">
        <h2 className="text-center font-[family-name:var(--font-display)] text-2xl tracking-wide text-white">
          {TITULO_CONSENTIMIENTO_SALUD}
        </h2>
        <div className="mt-4 flex flex-col gap-2 text-sm leading-relaxed text-gray-300">
          {TEXTO_CONSENTIMIENTO_SALUD.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <p className="text-xs text-gray-500">
            Más detalle en la{" "}
            <a href={URL_PRIVACIDAD} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
              Política de Privacidad
            </a>{" "}
            y en{" "}
            <a href={URL_ELIMINAR_DATOS} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
              Eliminar mis datos
            </a>
            .
          </p>
        </div>

        <label className="mt-4 flex items-start gap-3 rounded-lg border border-border bg-bg-elev px-4 py-3 text-sm text-gray-200">
          <input
            type="checkbox"
            checked={tildado}
            onChange={(e) => setTildado(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-orange-500"
          />
          <span>{TEXTO_CASILLA_SALUD}</span>
        </label>

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        <button
          type="button"
          onClick={consentir}
          disabled={!tildado || pendiente}
          className="mt-4 w-full rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {pendiente ? "Guardando…" : "Consentir y continuar"}
        </button>
        <Link href={volverA} className="mt-3 block text-center text-xs text-gray-500 underline-offset-2 hover:underline">
          Ahora no
        </Link>
      </div>
    </div>
  );
}

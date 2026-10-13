"use client";

import { useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { confirmarAvisoPrecio, rechazarNuevoPrecio } from "@/app/avisos-precio/actions";
import { URL_BAJA } from "@/lib/legal";
import type { AvisoPrecio } from "@/lib/aviso-precio";

// Pantallas donde no corresponde interrumpir (todavía no hay sesión útil o
// está en medio de aceptar los Términos).
const SIN_MODAL = ["/login", "/registro", "/aceptar-terminos", "/olvide-password", "/restablecer-password"];

function precioLegible(precio: number | null, moneda: string | null) {
  if (precio == null) return null;
  const numero = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 }).format(precio);
  return moneda ? `${moneda} ${numero}` : numero;
}

// Pop-up obligatorio de cambio de precio: no se puede cerrar sin confirmar
// ("Leí y acepto el nuevo precio"). Incluye el link al botón de baja por si
// la persona no está de acuerdo.
export function AvisoPrecioModal({ aviso }: { aviso: AvisoPrecio }) {
  const pathname = usePathname();
  const [pendiente, iniciar] = useTransition();
  const [confirmado, setConfirmado] = useState(false);
  const [confirmandoRechazo, setConfirmandoRechazo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (confirmado || SIN_MODAL.some((p) => pathname.startsWith(p))) return null;

  const precio = precioLegible(aviso.precioNuevo, aviso.moneda);

  function confirmar() {
    setError(null);
    iniciar(async () => {
      const r = await confirmarAvisoPrecio(aviso.id);
      if (r.error) setError(r.error);
      else setConfirmado(true);
    });
  }

  function rechazar() {
    setError(null);
    iniciar(async () => {
      const r = await rechazarNuevoPrecio(aviso.id);
      if ("error" in r && r.error) setError(r.error);
      else setConfirmado(true);
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="aviso-precio-titulo"
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 px-5"
    >
      <div className="w-full max-w-sm rounded-2xl border border-border-strong bg-bg-elev p-6">
        <h2 id="aviso-precio-titulo" className="mb-3 font-[family-name:var(--font-display)] text-3xl tracking-wide text-white">
          {aviso.titulo}
        </h2>
        <p className="whitespace-pre-line text-sm text-gray-300">{aviso.cuerpo}</p>

        {(precio || aviso.vigenteDesde) && (
          <div className="mt-4 rounded-lg border border-border bg-bg-card px-4 py-3 text-sm text-gray-300">
            {precio && (
              <p>
                Nuevo precio: <span className="font-medium text-white">{precio}</span>
              </p>
            )}
            {aviso.vigenteDesde && (
              <p>
                Vigente desde: <span className="font-medium text-white">{aviso.vigenteDesde.split("-").reverse().join("/")}</span>
              </p>
            )}
          </div>
        )}

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        <button
          type="button"
          onClick={confirmar}
          disabled={pendiente}
          className="mt-5 w-full rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pendiente ? "Guardando…" : "Leí y acepto el nuevo precio"}
        </button>

        {confirmandoRechazo ? (
          <div className="mt-4 rounded-lg border border-border bg-bg-card px-4 py-3 text-center text-sm text-gray-300">
            <p>
              Si no aceptás, <b>no se te cobra el precio nuevo</b>: cancelamos la renovación y conservás el acceso
              hasta el fin del período que ya pagaste. ¿Confirmás?
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={rechazar}
                disabled={pendiente}
                className="flex-1 rounded-full border border-border-strong px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {pendiente ? "Guardando…" : "Sí, no acepto"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmandoRechazo(false)}
                disabled={pendiente}
                className="flex-1 rounded-full px-4 py-2 text-sm text-gray-400 underline"
              >
                Volver
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmandoRechazo(true)}
            className="mt-3 w-full text-center text-sm text-gray-400 underline underline-offset-2"
          >
            No acepto el nuevo precio
          </button>
        )}

        <p className="mt-3 text-center text-xs text-gray-500">
          Si no respondés antes de la fecha de vigencia, tampoco se cobra el precio nuevo: la suscripción no se
          renueva.{" "}
          <a href={URL_BAJA} target="_blank" rel="noopener noreferrer" className="text-gray-300 underline underline-offset-2">
            Botón de baja
          </a>
        </p>
      </div>
    </div>
  );
}

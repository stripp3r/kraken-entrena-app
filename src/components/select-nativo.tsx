"use client";

import { useEffect, useState } from "react";

type Opcion = { valor: string; label: string };

export function SelectNativo({
  value,
  onChange,
  opciones,
  id,
  titulo,
}: {
  value: string;
  onChange: (valor: string) => void;
  opciones: Opcion[];
  id?: string;
  titulo?: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const seleccionada = opciones.find((o) => o.valor === value);

  useEffect(() => {
    if (!abierto) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setAbierto(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [abierto]);

  return (
    <>
      <button
        type="button"
        id={id}
        onClick={() => setAbierto(true)}
        className="flex w-full items-center justify-between rounded-lg border border-border bg-bg px-3 py-2.5 text-left text-white outline-none focus:border-border-strong"
      >
        <span>{seleccionada?.label ?? "Elegir…"}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-500"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {abierto && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60"
          onClick={() => setAbierto(false)}
        >
          <div
            className="max-h-[70vh] overflow-y-auto rounded-t-2xl border-t border-border bg-bg-elev pb-2"
            onClick={(e) => e.stopPropagation()}
          >
            {titulo && (
              <p className="px-5 pb-1 pt-4 text-xs uppercase tracking-wide text-gray-500">
                {titulo}
              </p>
            )}
            {opciones.map((o) => {
              const activa = o.valor === value;
              return (
                <button
                  key={o.valor}
                  type="button"
                  onClick={() => {
                    onChange(o.valor);
                    setAbierto(false);
                  }}
                  className={`flex w-full items-center justify-between px-5 py-3.5 text-left text-sm ${
                    activa ? "text-emerald-400" : "text-white"
                  } active:bg-bg-card`}
                >
                  {o.label}
                  {activa && (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

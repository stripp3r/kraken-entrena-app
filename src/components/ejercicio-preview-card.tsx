"use client";

import { useState } from "react";

export type EjercicioPreview = {
  nombre: string;
  imagen_url: string | null;
  video_url: string | null;
  como_hacerlo: string | null;
  series_reps: string | null;
};

export function EjercicioPreviewCard({ ejercicio }: { ejercicio: EjercicioPreview }) {
  const [mostrar, setMostrar] = useState(false);

  return (
    <div className="rounded-lg border border-border bg-bg-card p-3">
      <div className="flex flex-col gap-2">
        {ejercicio.imagen_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={ejercicio.imagen_url}
            alt={ejercicio.nombre}
            className="aspect-square w-full rounded-md bg-white object-contain"
          />
        )}
        <div>
          <h2 className="text-sm font-medium leading-tight text-white">{ejercicio.nombre}</h2>
          {ejercicio.series_reps && (
            <p className="mt-0.5 text-[11px] text-gray-500">{ejercicio.series_reps}</p>
          )}
          {ejercicio.como_hacerlo && (
            <button
              type="button"
              onClick={() => setMostrar((v) => !v)}
              className="mt-1 text-xs text-gray-400 underline"
            >
              {mostrar ? "Ocultar" : "¿Cómo hacerlo?"}
            </button>
          )}
        </div>
      </div>

      {mostrar && ejercicio.como_hacerlo && (
        <div className="mt-3 rounded-md bg-bg p-3">
          {ejercicio.video_url && (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video
              src={ejercicio.video_url}
              autoPlay
              muted
              loop
              playsInline
              className="mb-3 max-h-[70vh] w-full rounded-md bg-black object-contain"
            />
          )}
          <p className="whitespace-pre-line text-sm text-gray-300">{ejercicio.como_hacerlo}</p>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";

const DEFINICIONES = [
  {
    label: "1RM est.",
    texto:
      "Es la máxima cantidad de peso que una persona puede levantar en una repetición de un ejercicio específico con una técnica adecuada. Acá es estimado, calculado a partir de tus sets.",
  },
  {
    label: "IRP",
    texto:
      "Intensidad Relativa Promedio — indica el porcentaje de tu 1RM con el que estuviste trabajando en promedio.",
  },
  {
    label: "6RM / 8RM / 10RM / 12RM",
    texto:
      "Es la máxima cantidad de peso que una persona puede levantar en 6, 8, 10 o 12 repeticiones de ese ejercicio con una técnica adecuada (calculado a partir de tu 1RM).",
  },
  {
    label: "1% +",
    texto: "Sobrecarga sugerida: un aumento del 1% sobre tu 10RM o 12RM, como próximo objetivo.",
  },
  {
    label: "Volumen máx / mín",
    texto: "El volumen (peso × reps) más alto y más bajo que realizaste en un día para ese ejercicio.",
  },
  {
    label: "PR + / PR -",
    texto:
      "Récord personal: la carga máxima y la carga más baja que registraste para ese ejercicio.",
  },
];

export function GlosarioEstadisticas() {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="rounded-lg border border-border bg-bg-card p-4">
      <button
        onClick={() => setAbierto((v) => !v)}
        className="flex w-full items-center justify-between text-left text-sm text-gray-300"
      >
        ¿Qué significa cada dato?
        <span className="text-gray-500">{abierto ? "▲" : "▼"}</span>
      </button>

      {abierto && (
        <div className="mt-3 flex flex-col gap-3 border-t border-border pt-3">
          {DEFINICIONES.map((d) => (
            <div key={d.label}>
              <p className="text-xs font-medium text-gray-300">{d.label}</p>
              <p className="text-xs text-gray-500">{d.texto}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

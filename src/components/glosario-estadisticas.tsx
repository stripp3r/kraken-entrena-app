"use client";

import { useState } from "react";

const DEFINICIONES = [
  {
    label: "1RM est.",
    texto:
      "Es la máxima cantidad de peso que una persona puede levantar en una repetición de un ejercicio específico con una técnica adecuada. Acá es estimado, calculado a partir de tus sets. Te sirve para saber tu techo actual de fuerza y planificar tus cargas en base a él, sin tener que probar tu 1RM real (que es riesgoso).",
  },
  {
    label: "IRP",
    texto:
      "Intensidad Relativa Promedio — indica el porcentaje de tu 1RM con el que estuviste trabajando en promedio. Te sirve para saber si en general venís entrenando liviano o pesado en relación a tu máximo, y ajustar la intensidad si hace falta.",
  },
  {
    label: "6RM / 8RM / 10RM / 12RM",
    texto:
      "Es la máxima cantidad de peso que una persona puede levantar en 6, 8, 10 o 12 repeticiones de ese ejercicio con una técnica adecuada (calculado a partir de tu 1RM). Te sirve como referencia de qué peso usar según cuántas repeticiones querés hacer, en vez de ir probando a ciegas.",
  },
  {
    label: "1% + (10RM / 12RM)",
    texto:
      "Sobrecarga sugerida: un aumento del 1% sobre tu 10RM o 12RM. Es tu objetivo de sobrecarga progresiva — una referencia de cuánto deberías ir creciendo de a poco en tus próximos entrenamientos, en base a los datos que venís cargando.",
  },
  {
    label: "Volumen máx / mín",
    texto:
      "El volumen (peso × reps) más alto y más bajo que realizaste en un día para ese ejercicio. Te sirve para ver cuál fue tu mejor y peor sesión en términos de trabajo total, y notar qué tan constante venís siendo.",
  },
  {
    label: "PR + / PR -",
    texto:
      "Récord personal: la carga máxima y la carga más baja que registraste para ese ejercicio. Te sirve para llevar el registro de tus marcas y ver todo el rango de peso que fuiste manejando.",
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

"use client";

import { useState, type ComponentProps } from "react";
import { ProgresoMedidas } from "./progreso-medidas";
import { PotencialMuscularCliente, type UltimaMedida } from "./potencial-muscular-cliente";

// Análisis > Medidas: dos pestañas en la misma pantalla. "Comparar" (cómo cambiaron tus medidas) y
// "Potencial muscular" (cuánto podría crecer tu estructura, ver lib/potencial-muscular.ts).
export function MedidasAnalisis({
  historial,
  sexo,
  ultima,
  tabInicial,
}: {
  historial: ComponentProps<typeof ProgresoMedidas>["historial"];
  sexo: "masculino" | "femenino" | null;
  ultima: UltimaMedida;
  tabInicial: "comparar" | "potencial";
}) {
  const [tab, setTab] = useState<"comparar" | "potencial">(tabInicial);
  const pestanas = [
    { id: "comparar" as const, texto: "Comparar" },
    { id: "potencial" as const, texto: "Potencial muscular" },
  ];
  return (
    <div>
      <div role="tablist" className="mb-5 grid grid-cols-2 gap-1 rounded-full border border-border-strong bg-bg-card p-1">
        {pestanas.map((p) => (
          <button
            key={p.id}
            role="tab"
            aria-selected={tab === p.id}
            type="button"
            onClick={() => setTab(p.id)}
            className={`rounded-full px-3 py-2 text-sm font-medium transition-colors ${tab === p.id ? "bg-white text-black" : "text-gray-400"}`}
          >
            {p.texto}
          </button>
        ))}
      </div>

      {tab === "comparar" ? (
        historial.length === 0 ? (
          <p className="text-center text-sm text-gray-500">Todavía no cargaste medidas. Andá a Perfil → Mis medidas para empezar.</p>
        ) : (
          <ProgresoMedidas historial={historial} />
        )
      ) : (
        <PotencialMuscularCliente sexo={sexo} ultima={ultima} />
      )}
    </div>
  );
}

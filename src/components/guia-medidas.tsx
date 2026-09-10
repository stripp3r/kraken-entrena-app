"use client";

import { useState } from "react";
import { GUIA_MEDIDAS } from "@/lib/guia-medidas";
import { SelectNativo } from "@/components/select-nativo";

export function GuiaMedidas() {
  const [medida, setMedida] = useState<string>("Cuello");

  return (
    <div className="rounded-lg border border-border bg-bg-card p-4">
      <h3 className="mb-3 text-sm font-medium text-white">¿Cómo tomar las medidas?</h3>
      <div className="mb-3">
        <SelectNativo
          titulo="Medida"
          value={medida}
          onChange={setMedida}
          opciones={Object.keys(GUIA_MEDIDAS).map((m) => ({ valor: m, label: m }))}
        />
      </div>
      <p className="whitespace-pre-line text-sm text-gray-300">{GUIA_MEDIDAS[medida]}</p>
    </div>
  );
}

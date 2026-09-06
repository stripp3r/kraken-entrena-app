"use client";

import { useState } from "react";
import { GUIA_MEDIDAS } from "@/lib/guia-medidas";

export function GuiaMedidas() {
  const [medida, setMedida] = useState<string>("Cuello");

  return (
    <div className="rounded-lg border border-border bg-bg-card p-4">
      <h3 className="mb-3 text-sm font-medium text-white">¿Cómo tomar las medidas?</h3>
      <select
        value={medida}
        onChange={(e) => setMedida(e.target.value)}
        className="mb-3 w-full rounded-lg border border-border bg-bg px-4 py-2.5 text-white outline-none focus:border-border-strong"
      >
        {Object.keys(GUIA_MEDIDAS).map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      <p className="whitespace-pre-line text-sm text-gray-300">{GUIA_MEDIDAS[medida]}</p>
    </div>
  );
}

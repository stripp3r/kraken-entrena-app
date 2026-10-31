"use client";

import { useState } from "react";
import { aNumero, limpiarDecimal } from "@/lib/numero";

// Campo numérico acotado, de texto con teclado numérico. <input type="number"> dejaba vaciar el campo (que pasaba a
// valer 0), aceptaba negativos y decimales donde no van y en iPhone descarta la coma (ver lib/numero.ts). Mientras se
// escribe se muestra lo tipeado y solo se avisa un valor válido; al salir del campo se ajusta al rango permitido.
export function CampoNumero({
  valor,
  min,
  max,
  paso = 1,
  etiqueta,
  onCambio,
  className,
}: {
  valor: number;
  min: number;
  max: number;
  /** 1 = solo enteros; 0,5 = admite medios (RIR). */
  paso?: 1 | 0.5;
  etiqueta: string;
  onCambio: (n: number) => void;
  className?: string;
}) {
  // null = el campo no se está editando: se muestra el valor real.
  const [texto, setTexto] = useState<string | null>(null);

  const comoTexto = (n: number) => String(n).replace(".", ",");
  const ajustar = (n: number) => Math.min(max, Math.max(min, paso === 1 ? Math.round(n) : Math.round(n * 2) / 2));
  const valido = (n: number) => Number.isFinite(n) && n >= min && n <= max && Number.isInteger(n / paso);

  return (
    <input
      value={texto ?? comoTexto(valor)}
      inputMode={paso === 1 ? "numeric" : "decimal"}
      aria-label={etiqueta}
      onFocus={(e) => {
        setTexto(comoTexto(valor));
        e.currentTarget.select();
      }}
      onChange={(e) => {
        const limpio = paso === 1 ? e.target.value.replace(/\D/g, "") : limpiarDecimal(e.target.value);
        setTexto(limpio);
        if (limpio === "") return;
        const n = aNumero(limpio);
        if (valido(n)) onCambio(n);
      }}
      onBlur={() => {
        const n = texto ? aNumero(texto) : valor;
        onCambio(ajustar(Number.isFinite(n) ? n : valor));
        setTexto(null);
      }}
      className={className}
    />
  );
}

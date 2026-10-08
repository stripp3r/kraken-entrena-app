"use client";

import { usePathname } from "next/navigation";
import { URL_ARREPENTIMIENTO, URL_BAJA } from "@/lib/legal";

// Pantallas donde los dos botones obligatorios (Disposición 954/2025) tienen
// que verse sin scrollear y sin estar logueado: acceso, registro, inicio y
// las de venta/checkout. "/" es exacto (si no, coincidiría con todo).
const RUTAS = ["/login", "/registro", "/golden", "/compra"];

// Franja fina fija arriba (no tapa la navegación inferior). Los links van al
// sitio web, que atiende la solicitud sin pedir registro -- por eso son <a>
// externos comunes y NO pasan por ningún paso previo de la app.
export function FranjaLegal() {
  const pathname = usePathname();
  const visible = pathname === "/" || RUTAS.some((r) => pathname.startsWith(r));
  if (!visible) return null;

  const clase = "underline-offset-2 hover:underline";
  return (
    <div
      className="sticky top-0 z-30 flex flex-wrap items-center justify-center gap-x-5 gap-y-0.5 border-b border-border bg-black px-3 py-1.5 text-[10px] font-medium uppercase tracking-wide text-gray-300"
      style={{ paddingTop: "max(0.375rem, env(safe-area-inset-top))" }}
    >
      <a href={URL_ARREPENTIMIENTO} target="_blank" rel="noopener noreferrer" className={clase}>
        BOTÓN DE ARREPENTIMIENTO
      </a>
      <a href={URL_BAJA} target="_blank" rel="noopener noreferrer" className={clase}>
        BOTÓN DE BAJA DE SERVICIO
      </a>
    </div>
  );
}

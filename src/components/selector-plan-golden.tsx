"use client";

import { useState } from "react";

type Precio = { ars: number | null; usd: number | null } | null;

// Mismo formato para las dos monedas ("USD 12.99" / "ARS 19.500", sin
// duplicar el símbolo $ además del código) y mismo tamaño/peso -- ninguna
// de las dos debe verse más "importante" que la otra.
function LineaPrecio({ usd, ars }: { usd: number | null; ars: number | null }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      {usd != null && <p className="text-lg font-semibold text-white">USD {usd}</p>}
      {ars != null && (
        <p className="text-lg font-semibold text-white">ARS {ars.toLocaleString("es-AR")}</p>
      )}
    </div>
  );
}

export function SelectorPlanGolden({
  mensual,
  anual,
}: {
  mensual: Precio;
  anual: Precio;
}) {
  const [plan, setPlan] = useState<"mensual" | "anual">(anual ? "anual" : "mensual");

  const activo = plan === "anual" ? anual : mensual;
  const tieneArs = Boolean(activo?.ars);
  const tieneUsd = Boolean(activo?.usd);

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setPlan("mensual")}
          className={`flex flex-col items-center rounded-lg border-2 px-3 py-4 text-center transition-colors ${
            plan === "mensual" ? "border-white bg-bg-card" : "border-border bg-bg-card/50"
          }`}
        >
          <p className="mb-2 text-xs uppercase tracking-wide text-gray-500">Mensual</p>
          <LineaPrecio usd={mensual?.usd ?? null} ars={mensual?.ars ?? null} />
          <p className="mt-1.5 text-xs text-gray-500">por mes</p>
        </button>

        <button
          type="button"
          onClick={() => setPlan("anual")}
          className={`flex flex-col items-center rounded-lg border-2 px-3 py-4 text-center transition-colors ${
            plan === "anual" ? "border-amber-400 bg-bg-card" : "border-border bg-bg-card/50"
          }`}
        >
          <p className="mb-2 text-xs uppercase tracking-wide text-gray-500">Anual</p>
          <LineaPrecio
            usd={anual?.usd != null ? Number((anual.usd / 12).toFixed(2)) : null}
            ars={anual?.ars != null ? Math.round(anual.ars / 12) : null}
          />
          <p className="mt-1.5 text-xs text-gray-500">por mes (equivalente)</p>
          {anual?.usd != null && (
            <p className="mt-1 text-[11px] text-gray-600">
              USD {anual.usd} facturado 1 vez al año
            </p>
          )}
        </button>
      </div>

      <p className="mt-3 text-center text-xs font-medium text-amber-400">
        🏷️ Eligiendo anual ahorrás ~35% contra pagar mes a mes
      </p>

      <div className="mt-4 flex flex-col gap-2">
        {tieneArs && (
          <a
            href={`/api/checkout/golden/mercadopago?frecuencia=${plan}`}
            className="w-full rounded-full bg-[#ffe600] px-5 py-3 text-center text-sm font-medium text-black"
          >
            Suscribirme con Mercado Pago
          </a>
        )}
        {tieneUsd && (
          <a
            href={`/api/checkout/golden/paypal?frecuencia=${plan}`}
            className="w-full rounded-full bg-[#5ec4f7] px-5 py-3 text-center text-sm font-medium text-[#003087]"
          >
            Suscribirme con PayPal
          </a>
        )}
      </div>
    </div>
  );
}

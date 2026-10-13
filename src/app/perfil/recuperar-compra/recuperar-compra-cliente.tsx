"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { confirmarCodigoCompra, pedirCodigoCompra } from "./actions";

const input =
  "w-full rounded-lg border border-border-strong bg-bg-card px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-white/40";
const boton =
  "w-full rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50";

export function RecuperarCompraCliente() {
  const [paso, setPaso] = useState<"email" | "codigo" | "listo">("email");
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enlazadas, setEnlazadas] = useState(0);
  const [pendiente, iniciar] = useTransition();

  function pedir() {
    setError(null);
    iniciar(async () => {
      const r = await pedirCodigoCompra(email);
      if ("error" in r && r.error) setError(r.error);
      else setPaso("codigo");
    });
  }

  function confirmar() {
    setError(null);
    iniciar(async () => {
      const r = await confirmarCodigoCompra(email, codigo);
      if ("error" in r && r.error) setError(r.error);
      else {
        setEnlazadas("enlazadas" in r ? (r.enlazadas ?? 0) : 0);
        setPaso("listo");
      }
    });
  }

  if (paso === "listo") {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="text-sm text-gray-300">
          {enlazadas > 0
            ? "Listo: tu compra quedó asociada a esta cuenta. Ya podés usar tu plan."
            : "No encontramos compras pendientes con ese email para asociar."}
        </p>
        <Link href="/" className={`${boton} text-center`}>
          Ir al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {paso === "email" ? (
        <>
          <p className="text-sm text-gray-400">
            Si pagaste con un email distinto al de esta cuenta, ingresá el email que usaste para pagar. Te vamos a
            mandar un código para confirmar que es tuyo.
          </p>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="email-de-la-compra@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={input}
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button type="button" onClick={pedir} disabled={pendiente || !email.trim()} className={boton}>
            {pendiente ? "Enviando…" : "Enviarme el código"}
          </button>
        </>
      ) : (
        <>
          <p className="text-sm text-gray-400">
            Si ese email tiene una compra, te mandamos un código de 6 dígitos (revisá también spam). Vence en 30
            minutos.
          </p>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="000000"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
            className={`${input} text-center text-xl tracking-[0.4em]`}
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button type="button" onClick={confirmar} disabled={pendiente || codigo.length !== 6} className={boton}>
            {pendiente ? "Verificando…" : "Confirmar código"}
          </button>
          <button
            type="button"
            onClick={() => {
              setPaso("email");
              setCodigo("");
              setError(null);
            }}
            className="text-center text-sm text-gray-500 underline"
          >
            Usar otro email
          </button>
        </>
      )}
    </div>
  );
}

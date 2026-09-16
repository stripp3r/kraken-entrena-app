"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { BackLink } from "@/components/back-link";
import { aceptarDisclaimerAlimentacion } from "@/app/alimentacion/actions";

export function DisclaimerGate({
  campo,
  volverA,
  titulo,
  texto,
}: {
  campo: "calculadora" | "guia";
  volverA: string;
  titulo: string;
  texto: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function aceptar() {
    startTransition(async () => {
      await aceptarDisclaimerAlimentacion(campo);
      router.refresh();
    });
  }

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="relative mb-2">
          <BackLink href={volverA} />
          <h1 className="text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
            {titulo}
          </h1>
        </div>
        <p className="mt-6 text-center text-sm text-gray-500">
          Antes de continuar, leé esto:
        </p>
        <div className="mt-3 rounded-lg border border-border-strong bg-bg-card p-4">
          <p className="whitespace-pre-line text-sm leading-relaxed text-gray-300">{texto}</p>
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={aceptar}
          className="mt-6 w-full rounded-full bg-white px-6 py-3.5 text-sm font-medium text-black disabled:opacity-50"
        >
          {pending ? "Guardando..." : "Sí, entiendo"}
        </button>
      </div>
    </main>
  );
}

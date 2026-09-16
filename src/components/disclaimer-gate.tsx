"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { aceptarDisclaimerAlimentacion } from "@/app/alimentacion/actions";

// Se monta AL LADO del contenido real de la página (que ya está renderizado
// detrás), no en vez de él -- es un pop-up que tapa la pantalla hasta que
// el usuario confirma, no una pantalla intermedia separada.
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
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 px-6 py-8">
      <div className="w-full max-w-sm rounded-2xl border border-border-strong bg-bg-card p-5 shadow-xl">
        <h2 className="text-center font-[family-name:var(--font-display)] text-2xl tracking-wide text-white">
          {titulo}
        </h2>
        <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-300">{texto}</p>
        <button
          type="button"
          disabled={pending}
          onClick={aceptar}
          className="mt-5 w-full rounded-full bg-white px-6 py-3.5 text-sm font-medium text-black disabled:opacity-50"
        >
          {pending ? "Guardando..." : "Sí, entiendo"}
        </button>
        <Link
          href={volverA}
          className="mt-3 block text-center text-xs text-gray-500 underline-offset-2 hover:underline"
        >
          Volver
        </Link>
      </div>
    </div>
  );
}

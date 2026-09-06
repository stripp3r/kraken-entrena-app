"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { borrarFotoProgreso } from "@/app/evolucion/actions";

export function BorrarFotoBoton({ id, storagePath }: { id: number; storagePath: string }) {
  const router = useRouter();
  const [borrando, setBorrando] = useState(false);

  async function eliminar() {
    setBorrando(true);
    await borrarFotoProgreso(id, storagePath);
    router.refresh();
  }

  return (
    <button
      disabled={borrando}
      onClick={eliminar}
      className="text-xs text-red-400 underline disabled:opacity-50"
    >
      Borrar
    </button>
  );
}

"use client";

import { useState } from "react";

// Por ahora comparte el link de la PWA (se instala desde el navegador). El
// día que la app esté en Play Store/App Store, este mismo botón pasa a
// compartir ese link en su lugar -- no hace falta tocar nada más que
// `URL_APP` acá.
const URL_APP = "https://appfit.krakenbrand.com";
const TEXTO = "Descargá KRAKEN Entrena, la app de entrenamiento de KRAKEN Fitness:";

export function CompartirAppBoton() {
  const [copiado, setCopiado] = useState(false);

  async function compartir() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "KRAKEN Entrena", text: TEXTO, url: URL_APP });
      } catch {
        // El usuario canceló el share sheet -- no es un error, no hacer nada.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(`${TEXTO} ${URL_APP}`);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      window.open(URL_APP, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <button
      type="button"
      onClick={compartir}
      className="flex flex-col items-center gap-2 rounded-lg border border-border bg-bg-card px-3 py-4 text-xs text-white transition-colors hover:border-border-strong"
    >
      <img src="/section-icons/compartir.png" alt="" className="h-14 w-14 rounded-xl" />
      {copiado ? "¡Copiado!" : "Compartir"}
    </button>
  );
}

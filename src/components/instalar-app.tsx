"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function detectarNavegadorEmbebido(ua: string): string | null {
  if (/Instagram/i.test(ua)) return "Instagram";
  if (/FBAN|FBAV/i.test(ua)) return "Facebook";
  if (/Twitter/i.test(ua)) return "Twitter/X";
  if (/musical_ly|TikTok/i.test(ua)) return "TikTok";
  return null;
}

export function InstalarApp() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [instalada, setInstalada] = useState(false);
  const [esIOS, setEsIOS] = useState(false);
  const [navegadorEmbebido, setNavegadorEmbebido] = useState<string | null>(null);

  useEffect(() => {
    const yaInstalada =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as { standalone?: boolean }).standalone === true;
    setInstalada(yaInstalada);
    setEsIOS(/iphone|ipad|ipod/i.test(window.navigator.userAgent));
    setNavegadorEmbebido(detectarNavegadorEmbebido(window.navigator.userAgent));

    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      const evt = e as BeforeInstallPromptEvent;
      setPromptEvent(evt);
      // Dispara el cartel nativo apenas está disponible, sin esperar un
      // segundo toque -- así alguien que llega desde un link (ej. el botón
      // "Instalar app" del sitio web) lo ve directo en cuanto carga esta
      // página, en vez de tener que tocar este botón de nuevo.
      evt.prompt();
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  if (instalada) return null;

  async function instalar() {
    if (!promptEvent) return;
    await promptEvent.prompt();
    setPromptEvent(null);
  }

  // Instagram/Facebook/etc. abren los links en un navegador embebido que
  // bloquea la instalación de apps a propósito -- no hay forma de instalar
  // desde ahí, sin importar el sistema operativo. Hay que salir a Chrome o
  // Safari primero.
  if (navegadorEmbebido) {
    return (
      <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-left">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/alerta-navegador.png" alt="" className="mt-0.5 h-8 w-8 shrink-0" />
        <p className="text-xs text-red-200">
          Estás viendo esto desde {navegadorEmbebido} — para instalar la app, tocá los{" "}
          <strong className="text-red-100">⋮</strong> (tres puntos, arriba a la derecha) y elegí{" "}
          <strong className="text-red-100">&quot;Abrir en el navegador&quot;</strong>.
        </p>
      </div>
    );
  }

  if (promptEvent) {
    return (
      <button
        type="button"
        onClick={instalar}
        className="mb-6 w-full rounded-full border border-border-strong bg-bg-card px-5 py-3 text-sm font-medium text-white transition-colors hover:border-gray-400 active:bg-bg"
      >
        📲 Instalar app
      </button>
    );
  }

  if (esIOS) {
    return (
      <div className="mb-6 rounded-lg border border-border bg-bg-card px-4 py-3 text-center text-xs text-gray-400">
        Para instalar la app: tocá <strong className="text-gray-300">Compartir</strong> (el
        ícono del cuadrado con la flecha) y después{" "}
        <strong className="text-gray-300">&quot;Agregar a la pantalla de inicio&quot;</strong>.
      </div>
    );
  }

  return null;
}

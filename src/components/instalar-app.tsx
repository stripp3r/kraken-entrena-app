"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstalarApp() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [instalada, setInstalada] = useState(false);
  const [esIOS, setEsIOS] = useState(false);

  useEffect(() => {
    const yaInstalada =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as { standalone?: boolean }).standalone === true;
    setInstalada(yaInstalada);
    setEsIOS(/iphone|ipad|ipod/i.test(window.navigator.userAgent));

    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
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

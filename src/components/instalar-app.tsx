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

// En iOS SOLO Safari puede "Agregar a pantalla de inicio". Chrome/Firefox/
// Edge para iOS (CriOS/FxiOS/EdgiOS) y los navegadores embebidos de
// WhatsApp/Mail/etc. (WKWebView sin "Safari" en el UA) no pueden.
function esIOSsinSafari(ua: string): boolean {
  if (!/iphone|ipad|ipod/i.test(ua)) return false;
  if (/CriOS|FxiOS|EdgiOS/i.test(ua)) return true;
  return !/Safari/i.test(ua);
}

export function InstalarApp() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [instalada, setInstalada] = useState(false);
  const [esIOS, setEsIOS] = useState(false);
  const [iosSinSafari, setIosSinSafari] = useState(false);
  const [navegadorEmbebido, setNavegadorEmbebido] = useState<string | null>(null);

  useEffect(() => {
    const yaInstalada =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as { standalone?: boolean }).standalone === true;
    const ua = window.navigator.userAgent;
    setInstalada(yaInstalada);
    setEsIOS(/iphone|ipad|ipod/i.test(ua));
    setIosSinSafari(esIOSsinSafari(ua));
    setNavegadorEmbebido(detectarNavegadorEmbebido(ua));

    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      // Guardamos el evento nada más -- Chrome exige que prompt() se llame
      // desde un click real del usuario (probado: llamarlo acá directamente,
      // sin un click de por medio, falla en silencio). Por eso el botón de
      // abajo es imprescindible, no un paso de más.
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

  // iPhone/iPad pero fuera de Safari (Chrome iOS, o abierto desde WhatsApp/
  // Mail/etc.): no se puede instalar desde acá, hay que pasar a Safari.
  if (iosSinSafari) {
    return (
      <div className="mb-6 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-left text-sm text-amber-200">
        Para instalar la app en tu iPhone, abrí este mismo link en{" "}
        <strong className="text-amber-100">Safari</strong> (no desde WhatsApp, Instagram ni
        Chrome). Después tocá <strong className="text-amber-100">Compartir</strong> y{" "}
        <strong className="text-amber-100">&quot;Agregar a la pantalla de inicio&quot;</strong>.
      </div>
    );
  }

  if (esIOS) {
    return (
      <div className="mb-6 rounded-lg border border-border bg-bg-card px-4 py-3 text-left text-sm text-gray-300">
        Para instalar la app: tocá{" "}
        <strong className="text-white">Compartir</strong> (el ícono del cuadrado con la
        flecha, abajo) y después{" "}
        <strong className="text-white">&quot;Agregar a la pantalla de inicio&quot;</strong>.
      </div>
    );
  }

  return null;
}

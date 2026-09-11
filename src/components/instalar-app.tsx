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

// Botón chico para copiar el link actual -- así en Safari no hay que
// escribir la URL a mano después de salir de Chrome/una app.
function BotonCopiarLink() {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Si el navegador bloquea el portapapeles, no rompe nada -- el link
      // sigue estando visible en la barra de direcciones para copiarlo a mano.
    }
  }

  return (
    <button
      type="button"
      onClick={copiar}
      className="mt-2 rounded-full border border-current px-3 py-1 text-xs font-medium"
    >
      {copiado ? "¡Copiado!" : "📋 Copiar link"}
    </button>
  );
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
        <div className="text-xs text-red-200">
          <p>
            Estás viendo esto desde {navegadorEmbebido} — para instalar la app, tocá los{" "}
            <strong className="text-red-100">⋮</strong> (tres puntos, arriba a la derecha) y
            elegí <strong className="text-red-100">&quot;Abrir en el navegador&quot;</strong>.
          </p>
          <BotonCopiarLink />
        </div>
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
        <p className="mb-2 font-medium text-amber-100">
          En iPhone, instalar solo funciona desde Safari
        </p>
        <ol className="list-decimal space-y-1 pl-4">
          <li>Copiá este link (botón abajo).</li>
          <li>
            Abrí la app <strong className="text-amber-100">Safari</strong> (el ícono de la
            brújula, desde la pantalla de inicio de tu iPhone) — no Chrome, ni un link abierto
            desde WhatsApp/Instagram/Mail.
          </li>
          <li>Pegá el link ahí y entrá.</li>
          <li>Seguí las instrucciones que van a aparecer en esta misma pantalla.</li>
        </ol>
        <BotonCopiarLink />
      </div>
    );
  }

  if (esIOS) {
    return (
      <div className="mb-6 rounded-lg border border-border bg-bg-card px-4 py-3 text-left text-sm text-gray-300">
        <p className="mb-2 font-medium text-white">Para instalar la app en tu iPhone:</p>
        <ol className="list-decimal space-y-1.5 pl-4">
          <li>
            Abajo de la pantalla, tocá el ícono de <strong className="text-white">Compartir</strong>{" "}
            (un cuadrado con una flecha hacia arriba <span aria-hidden>⬆️</span>).
          </li>
          <li>
            Si no lo ves, tocá primero los{" "}
            <strong className="text-white">&quot;•••&quot;</strong> (tres puntos) y buscá ahí la
            opción <strong className="text-white">&quot;Compartir&quot;</strong>.
          </li>
          <li>
            En la lista que se abre, deslizá hacia abajo hasta encontrar{" "}
            <strong className="text-white">&quot;Agregar a la pantalla de inicio&quot;</strong> y
            tocala.
          </li>
          <li>
            Confirmá tocando <strong className="text-white">&quot;Agregar&quot;</strong> arriba a
            la derecha.
          </li>
        </ol>
      </div>
    );
  }

  return null;
}

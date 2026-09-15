"use client";

import { useEffect } from "react";

export function RegisterServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // instalar la PWA sigue funcionando sin SW; el offline queda como mejora
      });
    }

    // Refuerzo del "orientation: portrait" del manifest -- el manifest solo
    // lo aplican algunos navegadores/versiones al abrir la app instalada, y
    // el WebAPK de Android puede tardar en "reinstalar" el manifest nuevo.
    // Este lock por JS es best-effort: falla silenciosamente si el
    // navegador no lo soporta en este contexto (ej. pestaña normal, no
    // instalada), así que no reemplaza reinstalar el ícono.
    const orientacion = screen.orientation as ScreenOrientation & {
      lock?: (o: string) => Promise<void>;
    };
    orientacion?.lock?.("portrait").catch(() => {});
  }, []);

  return null;
}

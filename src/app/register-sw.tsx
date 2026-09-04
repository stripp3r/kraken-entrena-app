"use client";

import { useEffect } from "react";

export function RegisterServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // instalar la PWA sigue funcionando sin SW; el offline queda como mejora
      });
    }
  }, []);

  return null;
}

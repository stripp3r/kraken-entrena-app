"use client";

import { useEffect, useRef, useState } from "react";

function sonarYVibrar() {
  try {
    const AudioCtx =
      window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    }
  } catch {
    // audio no disponible, seguimos sin sonido
  }
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate([200, 100, 200]);
  }
}

function formatoMMSS(segundos: number) {
  const s = Math.max(0, Math.ceil(segundos));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export function DescansoTimer({
  hasta,
  onTerminar,
  onSaltar,
  etiqueta,
}: {
  hasta: number;
  onTerminar: () => void;
  onSaltar: () => void;
  etiqueta: string;
}) {
  const [restante, setRestante] = useState(() => (hasta - Date.now()) / 1000);
  const terminadoRef = useRef(false);

  useEffect(() => {
    terminadoRef.current = false;
    const id = setInterval(() => {
      const rest = (hasta - Date.now()) / 1000;
      setRestante(rest);
      if (rest <= 0 && !terminadoRef.current) {
        terminadoRef.current = true;
        sonarYVibrar();
        clearInterval(id);
        onTerminar();
      }
    }, 200);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasta]);

  return (
    <div className="flex flex-col items-center gap-2 rounded-md border border-orange-500/40 bg-orange-500/10 p-4">
      <p className="text-xs uppercase tracking-wide text-orange-300">{etiqueta}</p>
      <p className="text-3xl font-medium tabular-nums text-white">{formatoMMSS(restante)}</p>
      <button
        type="button"
        onClick={onSaltar}
        className="text-xs text-gray-400 underline"
      >
        Saltar descanso
      </button>
    </div>
  );
}

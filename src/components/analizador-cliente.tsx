"use client";

import { useState } from "react";
import { PentagonoChart } from "@/components/pentagono-chart";
import { GRUPOS_MUSCULARES } from "@/lib/grupos-musculares";
import type { PentagonoScores } from "@/lib/pentagono";

type RutinaAnalizada = {
  id: number;
  nombre: string;
  dias: number;
  pentagono: PentagonoScores;
  volumenPorGrupo: { grupo: string; series: number; mrv: number }[];
};

const COLORES = ["#10b981", "#38bdf8", "#f59e0b"];
const MAX_SELECCION = 3;

export function AnalizadorCliente({ rutinas }: { rutinas: RutinaAnalizada[] }) {
  const [seleccionadas, setSeleccionadas] = useState<number[]>([]);

  function toggle(id: number) {
    setSeleccionadas((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_SELECCION) return prev;
      return [...prev, id];
    });
  }

  const elegidas = seleccionadas
    .map((id) => rutinas.find((r) => r.id === id))
    .filter((r): r is RutinaAnalizada => Boolean(r));

  const series = elegidas.map((r, i) => ({ label: r.nombre, color: COLORES[i], scores: r.pentagono }));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        {rutinas.map((r) => {
          const activa = seleccionadas.includes(r.id);
          const indice = seleccionadas.indexOf(r.id);
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => toggle(r.id)}
              disabled={!activa && seleccionadas.length >= MAX_SELECCION}
              className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors disabled:opacity-40 ${
                activa ? "border-emerald-500 bg-emerald-500/10" : "border-border bg-bg-card hover:border-border-strong"
              }`}
            >
              <span className="text-sm text-white">
                {r.nombre} <span className="text-gray-500">· {r.dias} días</span>
              </span>
              {activa && (
                <span
                  className="h-3 w-3 flex-shrink-0 rounded-full"
                  style={{ background: COLORES[indice] }}
                />
              )}
            </button>
          );
        })}
      </div>

      {elegidas.length === 0 ? (
        <p className="text-center text-sm text-gray-500">Elegí una o más rutinas para ver el pentágono.</p>
      ) : (
        <>
          <div className="rounded-md border border-border bg-bg-card p-3">
            <PentagonoChart series={series} />
          </div>

          <div>
            <p className="mb-2 text-sm text-gray-400">
              Series por semana, por grupo muscular <span className="text-gray-500">(vs. MRV)</span>
            </p>
            <div className="overflow-x-auto rounded-md border border-border bg-bg-card p-3">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="pb-2 text-left font-normal text-gray-500">Grupo</th>
                    <th className="pb-2 pl-3 text-right font-normal text-gray-500">MRV</th>
                    {elegidas.map((r, i) => (
                      <th key={r.id} className="pb-2 pl-3 text-right font-normal">
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full"
                          style={{ background: COLORES[i] }}
                        />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {GRUPOS_MUSCULARES.map((grupo) => {
                    const valores = elegidas.map(
                      (r) => r.volumenPorGrupo.find((v) => v.grupo === grupo)?.series ?? 0
                    );
                    if (valores.every((v) => v === 0)) return null;
                    const mrv = elegidas[0]?.volumenPorGrupo.find((v) => v.grupo === grupo)?.mrv;
                    return (
                      <tr key={grupo}>
                        <td className="py-1 text-gray-300">{grupo}</td>
                        <td className="py-1 pl-3 text-right text-gray-500">{mrv ?? "–"}</td>
                        {valores.map((v, i) => (
                          <td key={i} className="py-1 pl-3 text-right text-white">
                            {v === 0 ? "–" : Number.isInteger(v) ? v : v.toFixed(1)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

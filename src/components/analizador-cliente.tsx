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
  volumenPorGrupo: { grupo: string; series: number; mev: number; mav: number; mrv: number; nucleo: boolean }[];
  frecuenciaPorGrupo: { grupo: string; vecesPorSemana: number }[];
  recuperacionPorGrupo: { grupo: string; diasDescanso: number }[];
  intensidadPorDia: { dia: string; rirPromedio: number }[];
  sostenibilidadPorDia: { dia: string; minutos: number }[];
};

const COLORES = ["#10b981", "#38bdf8", "#f59e0b"];
const MAX_SELECCION = 3;
const LETRAS_DIA = ["A", "B", "C", "D", "E", "F", "G"];
const LETRAS_DIA_Y_TOTAL = [...LETRAS_DIA, "Total semanal"];

// Tabla comparativa genérica: una fila por grupo muscular (o por día),
// una columna por rutina elegida, con el número más alto de cada fila
// resaltado con el color de esa rutina (empate = todos blancos) -- mismo
// criterio ya validado para Volumen. `resaltarGanador=false` para métricas
// donde "más alto" no significa "mejor" (ej. duración de sesión: una
// sesión más corta es más sostenible, no al revés) -- ahí resaltar el
// número más grande sería engañoso, mejor mostrar los valores pelados.
function TablaComparativa({
  titulo,
  columnaExtra,
  etiquetas,
  colores,
  referencia,
  filas,
  resaltarGanador = true,
}: {
  titulo: React.ReactNode;
  columnaExtra?: string;
  etiquetas: string[];
  colores: string[];
  referencia?: (etiqueta: string) => string | number | undefined;
  filas: (etiqueta: string) => { numero: number | null; texto: string }[];
  resaltarGanador?: boolean;
}) {
  const conDatos = etiquetas
    .map((etiqueta) => ({ etiqueta, valores: filas(etiqueta) }))
    .filter(({ valores }) => valores.some((v) => v.numero !== null));

  if (conDatos.length === 0) return null;

  return (
    <div className="mt-5">
      <p className="mb-2 text-sm text-gray-400">{titulo}</p>
      <div className="overflow-x-auto rounded-md border border-border bg-bg-card p-3">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="pb-2 text-left font-normal text-gray-500"></th>
              {columnaExtra && <th className="pb-2 pl-3 text-right font-normal text-gray-500">{columnaExtra}</th>}
              {colores.map((color, i) => (
                <th key={i} className="pb-2 pl-3 text-right font-normal">
                  <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color }} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {conDatos.map(({ etiqueta, valores }) => (
              <tr key={etiqueta}>
                <td className="py-1 text-gray-300">{etiqueta}</td>
                {referencia && (
                  <td className="py-1 pl-3 text-right text-gray-500">{referencia(etiqueta) ?? "–"}</td>
                )}
                {valores.map((v, i) => {
                  const numeros = valores.map((x) => x.numero).filter((n): n is number => n !== null);
                  const maximo = numeros.length > 0 ? Math.max(...numeros) : null;
                  const ganadores = maximo === null ? 0 : valores.filter((x) => x.numero === maximo).length;
                  const gana = resaltarGanador && ganadores === 1 && v.numero === maximo;
                  return (
                    <td
                      key={i}
                      className={`py-1 pl-3 text-right ${gana ? "font-medium" : "text-white"}`}
                      style={gana ? { color: colores[i] } : undefined}
                    >
                      {v.texto}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

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
  const colores = elegidas.map((_, i) => COLORES[i]);

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

          <TablaComparativa
            titulo={
              <>
                Series por semana, por grupo muscular <span className="text-gray-500">(vs. MRV)</span>
              </>
            }
            columnaExtra="MRV"
            etiquetas={[...GRUPOS_MUSCULARES]}
            colores={colores}
            referencia={(grupo) => elegidas[0]?.volumenPorGrupo.find((v) => v.grupo === grupo)?.mrv}
            filas={(grupo) =>
              elegidas.map((r) => {
                const v = r.volumenPorGrupo.find((x) => x.grupo === grupo)?.series ?? 0;
                return { numero: v || null, texto: v === 0 ? "–" : Number.isInteger(v) ? String(v) : v.toFixed(1) };
              })
            }
          />

          <TablaComparativa
            titulo="Frecuencia, por grupo muscular"
            etiquetas={[...GRUPOS_MUSCULARES]}
            colores={colores}
            filas={(grupo) =>
              elegidas.map((r) => {
                const v = r.frecuenciaPorGrupo.find((x) => x.grupo === grupo)?.vecesPorSemana ?? 0;
                return { numero: v || null, texto: v === 0 ? "–" : `${v}x` };
              })
            }
          />

          <TablaComparativa
            titulo="Recuperación, por grupo muscular"
            etiquetas={[...GRUPOS_MUSCULARES]}
            colores={colores}
            filas={(grupo) =>
              elegidas.map((r) => {
                const dato = r.recuperacionPorGrupo.find((x) => x.grupo === grupo);
                if (!dato) return { numero: null, texto: "–" };
                return { numero: dato.diasDescanso, texto: `${dato.diasDescanso}d` };
              })
            }
          />

          <TablaComparativa
            titulo="Intensidad (RIR), por día"
            etiquetas={LETRAS_DIA}
            colores={colores}
            resaltarGanador={false}
            filas={(dia) =>
              elegidas.map((r) => {
                const dato = r.intensidadPorDia.find((x) => x.dia === dia);
                return dato ? { numero: dato.rirPromedio, texto: `RIR ${dato.rirPromedio}` } : { numero: null, texto: "–" };
              })
            }
          />

          <TablaComparativa
            titulo="Sostenibilidad (duración), por día"
            etiquetas={LETRAS_DIA_Y_TOTAL}
            colores={colores}
            resaltarGanador={false}
            filas={(dia) =>
              elegidas.map((r) => {
                if (dia === "Total semanal") {
                  const total = r.sostenibilidadPorDia.reduce((acc, d) => acc + d.minutos, 0);
                  return { numero: total, texto: `${total} min` };
                }
                const dato = r.sostenibilidadPorDia.find((x) => x.dia === dia);
                return dato ? { numero: dato.minutos, texto: `${dato.minutos} min` } : { numero: null, texto: "–" };
              })
            }
          />
        </>
      )}
    </div>
  );
}

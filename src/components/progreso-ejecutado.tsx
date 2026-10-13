"use client";

import { useMemo, useState } from "react";
import { Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  UMBRAL_SERIE_EFECTIVA,
  agruparSesiones,
  cumplimientoSemanal,
  estadoProgresion,
  lunesDeSemana,
  resumirSesion,
  serieRirPorSesion,
  sumarDias,
  volumenSemanalPorGrupo,
  type EjercicioAnalizado,
  type LogCompleto,
  type Objetivo,
  type VolumenGrupoSemana,
} from "@/lib/analisis-ejecutado";
import { hoyISO } from "@/lib/fecha";

const fmt = (n: number, d = 0) => n.toFixed(d).replace(".", ",");
const fechaCorta = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

function Fila({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-white">{valor}</span>
    </div>
  );
}

function describirSerie(s: ReturnType<typeof agruparSesiones>[number]["series"][number]) {
  const p = s.principal;
  if (s.bajadas.length === 0) {
    return { tipo: "", peso: p.peso !== null ? `${fmt(p.peso, 1)} kg` : "-", reps: p.reps !== null ? String(p.reps) : "-" };
  }
  const tramos = [p, ...s.bajadas];
  return {
    tipo: " · drop set",
    peso: tramos.map((t) => (t.peso !== null ? fmt(t.peso, 1) : "-")).join(" → ") + " kg",
    reps: tramos.map((t) => t.reps ?? "-").join(" + "),
  };
}

export function DetalleEjercicio({ logs, objetivo }: { logs: LogCompleto[]; objetivo: Objetivo }) {
  const sesiones = useMemo(() => agruparSesiones(logs), [logs]);
  if (sesiones.length === 0) return null;

  const ultima = sesiones[sesiones.length - 1];
  const r = resumirSesion(ultima);
  const estado = estadoProgresion(sesiones, objetivo);
  const serieRir = serieRirPorSesion(sesiones);
  const colorEstado =
    estado.tipo === "subir"
      ? "bg-emerald-500/15 text-emerald-300"
      : estado.tipo === "estancado"
        ? "bg-amber-500/15 text-amber-300"
        : "bg-white/5 text-gray-400";

  return (
    <div className="mt-4 flex flex-col gap-4 border-t border-border pt-4">
      <div>
        <p className="mb-1 text-[11px] uppercase tracking-wide text-gray-500">
          Última sesión ({fechaCorta(ultima.fecha)}), todas las series
        </p>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-500">
              <th className="py-1 text-left font-normal">Serie</th>
              <th className="py-1 text-right font-normal">Peso</th>
              <th className="py-1 text-right font-normal">Reps</th>
              <th className="py-1 text-right font-normal">RIR</th>
            </tr>
          </thead>
          <tbody>
            {ultima.series.map((s, i) => {
              const d = describirSerie(s);
              return (
                <tr key={s.principal.id} className="border-t border-border text-white">
                  <td className="py-1">
                    {i + 1}
                    <span className="text-gray-500">{d.tipo}</span>
                  </td>
                  <td className="py-1 text-right">{d.peso}</td>
                  <td className="py-1 text-right">{d.reps}</td>
                  <td className="py-1 text-right">{s.principal.rir !== null ? fmt(s.principal.rir, 1) : "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {r.caidaRepsPct !== null && (
          <div className="mt-2">
            <Fila label="Caída de reps entre series" valor={`${r.caidaRepsPct > 0 ? "+" : ""}${r.caidaRepsPct}%`} />
          </div>
        )}
      </div>

      {serieRir.length >= 2 && (
        <div>
          <p className="mb-1 text-[11px] uppercase tracking-wide text-gray-500">
            RIR promedio por sesión{objetivo.rirObjetivo !== null ? ` (objetivo ${fmt(objetivo.rirObjetivo, 1)})` : ""}
          </p>
          <div className="h-28 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={serieRir.map((p) => ({ fecha: fechaCorta(p.fecha), valor: p.valor }))} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <XAxis dataKey="fecha" tick={{ fill: "#7a7a7a", fontSize: 10 }} />
                <YAxis tick={{ fill: "#7a7a7a", fontSize: 10 }} allowDecimals={false} domain={[0, "dataMax + 1"]} />
                <Tooltip contentStyle={{ background: "#111111", border: "1px solid #2e2e2e", borderRadius: 8, fontSize: 12 }} labelStyle={{ color: "#e7e7e7" }} />
                {objetivo.rirObjetivo !== null && <ReferenceLine y={objetivo.rirObjetivo} stroke="#7a7a7a" strokeDasharray="4 4" />}
                <Line type="monotone" dataKey="valor" stroke="#fb923c" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <p className={`rounded-md px-3 py-2 text-xs ${colorEstado}`}>{estado.mensaje}</p>

      <div className="flex flex-col gap-1">
        <p className="text-[11px] uppercase tracking-wide text-gray-500">Volumen de la sesión</p>
        <Fila label="Volumen total (todas las series)" valor={fmt(r.volumenTotal)} />
        <Fila label="Del cual, bajadas de drop set" valor={fmt(r.volumenBajadas)} />
        <Fila label={`Series efectivas (RIR ≤ ${UMBRAL_SERIE_EFECTIVA})`} valor={`${r.seriesEfectivas} de ${r.seriesTotales}`} />
        {r.seriesSinRir > 0 && (
          <p className="text-[11px] text-gray-600">
            {r.seriesSinRir} serie{r.seriesSinRir > 1 ? "s" : ""} sin RIR cargado: no se pueden clasificar.
          </p>
        )}
      </div>
    </div>
  );
}

const ZONA: Record<VolumenGrupoSemana["zona"], { texto: string; color: string }> = {
  "bajo-mev": { texto: "bajo MEV", color: "bg-amber-400" },
  "mev-mav": { texto: "MEV–MAV", color: "bg-emerald-400" },
  "mav-mrv": { texto: "MAV–MRV", color: "bg-sky-400" },
  "sobre-mrv": { texto: "sobre MRV", color: "bg-red-400" },
};

export function ResumenSemanal({
  ejercicios,
  diasPorSemana,
}: {
  ejercicios: EjercicioAnalizado[];
  diasPorSemana: number;
}) {
  const [semanasAtras, setSemanasAtras] = useState(0);
  const lunes = sumarDias(lunesDeSemana(hoyISO()), -7 * semanasAtras);
  const grupos = useMemo(() => volumenSemanalPorGrupo(ejercicios, lunes), [ejercicios, lunes]);
  const cumplimiento = useMemo(() => cumplimientoSemanal(ejercicios, diasPorSemana, lunes), [ejercicios, diasPorSemana, lunes]);
  const hayDatos = cumplimiento.seriesHechas > 0;

  return (
    <div className="rounded-lg border border-border bg-bg-card p-4">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-white">Semana real</h3>
        <div className="flex gap-1 text-xs">
          {[0, 1].map((n) => (
            <button
              key={n}
              onClick={() => setSemanasAtras(n)}
              className={`rounded-full px-3 py-1 ${semanasAtras === n ? "bg-white text-black" : "border border-border-strong text-gray-300"}`}
            >
              {n === 0 ? "Esta" : "Anterior"}
            </button>
          ))}
        </div>
      </div>
      <p className="mb-3 text-xs text-gray-500">
        Del {fechaCorta(lunes)} al {fechaCorta(sumarDias(lunes, 6))}. Lo ejecutado, no lo planificado.
      </p>

      {!hayDatos ? (
        <p className="py-4 text-center text-xs text-gray-600">Sin series registradas en esta semana.</p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-md bg-white/5 p-2">
              <p className="text-[11px] text-gray-500">Entrenamientos</p>
              <p className="text-lg text-white">{cumplimiento.entrenamientosHechos} / {cumplimiento.entrenamientosPrevistos}</p>
            </div>
            <div className="rounded-md bg-white/5 p-2">
              <p className="text-[11px] text-gray-500">Series hechas</p>
              <p className="text-lg text-white">{cumplimiento.seriesHechas} / {cumplimiento.seriesPrevistas}</p>
            </div>
            <div className="rounded-md bg-white/5 p-2">
              <p className="text-[11px] text-gray-500">RIR vs objetivo</p>
              <p className="text-lg text-white">
                {cumplimiento.rirVsObjetivo === null ? "-" : `${cumplimiento.rirVsObjetivo > 0 ? "+" : ""}${fmt(cumplimiento.rirVsObjetivo, 1)}`}
              </p>
            </div>
          </div>
          {cumplimiento.rirVsObjetivo !== null && (
            <p className="mt-1 text-[11px] text-gray-600">Positivo = terminaste más lejos del fallo que lo prescrito.</p>
          )}

          <p className="mb-2 mt-4 text-[11px] uppercase tracking-wide text-gray-500">
            Series efectivas por grupo (RIR ≤ {UMBRAL_SERIE_EFECTIVA})
          </p>
          <div className="flex flex-col gap-2">
            {grupos.map((g) => (
              <div key={g.grupo} className="text-xs">
                <div className="mb-1 flex justify-between">
                  <span className="text-gray-300">{g.grupo}</span>
                  <span className="text-gray-500">
                    {fmt(g.efectivas, g.efectivas % 1 ? 1 : 0)} · {ZONA[g.zona].texto}
                    {g.sinRir > 0 ? ` · +${fmt(g.sinRir, g.sinRir % 1 ? 1 : 0)} sin RIR` : ""}
                  </span>
                </div>
                <div className="h-2 rounded bg-white/10">
                  <div className={`h-2 rounded ${ZONA[g.zona].color}`} style={{ width: `${Math.min(100, (g.efectivas / g.mrv) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-gray-600">
            La barra llega al 100% en el MRV. Los grupos secundarios cuentan media serie y los terciarios un cuarto.
          </p>
        </>
      )}
    </div>
  );
}

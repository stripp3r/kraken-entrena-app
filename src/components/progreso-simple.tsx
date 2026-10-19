"use client";

import { useMemo, useState } from "react";
import {
  cambiosDeMedidas,
  evaluarEjercicio,
  musculosDeLaSemana,
  resumirGeneral,
  type Ancla,
  type EstadoEjercicio,
  type FilaMedida,
  type LogSerie,
  type NivelMusculo,
} from "@/lib/progreso-simple";

export type EjercicioProgreso = { nombre: string; grupos: string[]; logs: LogSerie[] };

const SECCIONES: { estado: EstadoEjercicio; titulo: string; color: string; icono: string; fondo: string }[] = [
  { estado: "mejoro", titulo: "Mejoraron", color: "text-emerald-400", icono: "↑", fondo: "bg-emerald-950 text-emerald-400" },
  { estado: "estable", titulo: "Estables", color: "text-gray-400", icono: "=", fondo: "bg-neutral-800 text-gray-400" },
  { estado: "bajo", titulo: "Bajaron", color: "text-red-400", icono: "↓", fondo: "bg-red-950 text-red-400" },
];

const TONO = {
  bien: "border-emerald-700 bg-emerald-950/60",
  estable: "border-border-strong bg-bg-card",
  atencion: "border-amber-700 bg-amber-950/40",
};

const NIVEL: Record<NivelMusculo, { texto: string; color: string; barra: string }> = {
  poco: { texto: "Poco", color: "text-amber-400", barra: "bg-amber-400" },
  bien: { texto: "Bien", color: "text-emerald-400", barra: "bg-emerald-400" },
  mucho: { texto: "Mucho", color: "text-orange-400", barra: "bg-orange-400" },
};

const num = (n: number) => String(n).replace(".", ",");

export function ProgresoSimple({ ejercicios, medidas, hoy }: { ejercicios: EjercicioProgreso[]; medidas: FilaMedida[]; hoy: string }) {
  const [ancla, setAncla] = useState<Ancla>("ultimos");

  const evaluados = useMemo(() => ejercicios.map((e) => ({ ...e, r: evaluarEjercicio(e.logs, ancla) })), [ejercicios, ancla]);
  const conDatos = evaluados.filter((e) => e.r.estado !== "sin-datos");
  const sinDatos = evaluados.length - conDatos.length;
  const general = resumirGeneral(conDatos.map((e) => e.r.estado));
  const cambios = useMemo(() => cambiosDeMedidas(medidas), [medidas]);
  const musculos = useMemo(() => musculosDeLaSemana(ejercicios, hoy), [ejercicios, hoy]);

  return (
    <div>
      <div className="mb-2 flex justify-center gap-2">
        {(
          [
            ["ultimos", "Últimos entrenos"],
            ["inicio", "Desde que empezaste"],
          ] as const
        ).map(([k, t]) => (
          <button
            key={k}
            onClick={() => setAncla(k)}
            className={`rounded-full border px-4 py-1.5 text-sm ${ancla === k ? "border-white bg-white text-black" : "border-border-strong text-gray-400"}`}
          >
            {t}
          </button>
        ))}
      </div>
      <p className="mb-4 text-center text-xs text-gray-500">
        {ancla === "ultimos"
          ? "Comparado con tus 3 entrenos anteriores de cada ejercicio"
          : "Tus primeros entrenos de cada ejercicio, comparados con los más recientes"}
      </p>

      {conDatos.length === 0 ? (
        <p className="rounded-lg border border-border bg-bg-card p-4 text-center text-sm text-gray-400">
          Todavía hay pocos entrenos para comparar. Con 2 o 3 entrenos de un mismo ejercicio ya te puedo decir cómo vas.
        </p>
      ) : (
        <div className={`rounded-xl border p-4 ${TONO[general.tono]}`}>
          <p className="mb-2 text-lg font-semibold text-white">{general.titulo}</p>
          <div className="flex gap-4 text-sm">
            <span className="text-emerald-400">{general.mejoraron} mejoraron</span>
            <span className="text-gray-400">{general.estables} estables</span>
            <span className="text-red-400">{general.bajaron} bajó</span>
          </div>
        </div>
      )}

      {SECCIONES.map((s) => {
        const lista = conDatos.filter((e) => e.r.estado === s.estado);
        if (!lista.length) return null;
        return (
          <section key={s.estado}>
            <h2 className={`mb-2 mt-6 text-xs font-semibold uppercase tracking-wider ${s.color}`}>{s.titulo}</h2>
            <div className="flex flex-col gap-2">
              {lista.map((e) => (
                <div key={e.nombre} className="flex items-start gap-3 rounded-xl border border-border-strong bg-bg-card p-3">
                  <span className={`flex h-8 w-8 flex-none items-center justify-center rounded-full text-base font-bold ${s.fondo}`}>{s.icono}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{e.nombre}</p>
                    <p className="text-[13px] leading-snug text-gray-400">{e.r.frase}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
      {sinDatos > 0 && conDatos.length > 0 && (
        <p className="mt-4 text-center text-xs text-gray-500">
          {sinDatos} ejercicio{sinDatos === 1 ? "" : "s"} con pocos entrenos todavía; aparecen cuando tengas 2 o 3 registros.
        </p>
      )}

      {cambios.length > 0 && (
        <section>
          <h2 className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wider text-gray-400">Tus medidas</h2>
          <div className="grid grid-cols-2 gap-2">
            {cambios.map((c) => (
              <div key={c.clave} className="rounded-xl border border-border-strong bg-bg-card p-3">
                <p className="text-lg font-semibold text-white">
                  {num(c.actual)} {c.unidad}{" "}
                  <span className="text-xs font-normal text-gray-400">
                    {c.tendencia === "igual" ? "= igual" : `${c.tendencia === "sube" ? "↑" : "↓"} ${num(Math.abs(c.cambio))}`}
                  </span>
                </p>
                <p className="text-xs text-gray-500">{c.etiqueta}, desde que empezaste</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {musculos.length > 0 && (
        <section>
          <h2 className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wider text-gray-400">Músculos trabajados esta semana</h2>
          <div className="flex flex-col gap-3">
            {musculos.map((m) => (
              <div key={m.grupo} className="text-sm">
                <div className="mb-1 flex justify-between">
                  <span className="font-semibold text-white">{m.grupo}</span>
                  <span className={NIVEL[m.nivel].color}>{NIVEL[m.nivel].texto}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-neutral-800">
                  <div className={`h-full rounded-full ${NIVEL[m.nivel].barra}`} style={{ width: `${Math.max(4, Math.min(100, m.porcentaje))}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

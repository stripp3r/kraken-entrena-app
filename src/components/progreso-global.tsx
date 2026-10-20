"use client";

import { useMemo, useRef, useState } from "react";
import {
  constancia,
  equilibrio,
  fraseRitmo,
  fuerzaTotal,
  misLevantamientos,
  recordes,
  resumenSemanal,
  veredicto,
  type EjercicioGlobal,
  type Levantamiento3,
} from "@/lib/progreso-global";
import { cambiosDeMedidas, type FilaMedida } from "@/lib/progreso-simple";
import type { Sexo } from "@/lib/estandares-fuerza";

const COLOR = { bien: "#34d399", estable: "#9ca3af", atencion: "#fbbf24" };
const TONO_CARD = {
  bien: "border-emerald-700 bg-emerald-950/60",
  estable: "border-border-strong bg-bg-card",
  atencion: "border-amber-700 bg-amber-950/40",
};
const NIVELES = ["Inicial", "Principiante", "Novicio", "Intermedio", "Avanzado", "Élite"];
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

const num = (n: number, d = 1) => n.toFixed(d).replace(".", ",");
const signo = (n: number, d = 0) => `${n >= 0 ? "+" : "−"}${num(Math.abs(n), d)}`;

function Grafico({ puntos }: { puntos: { semana: string; indice: number }[] }) {
  if (puntos.length < 2) return null;
  const W = 340, H = 120, PL = 30, PR = 8, PT = 8, PB = 18;
  const t0 = Date.parse(puntos[0].semana), t1 = Date.parse(puntos[puntos.length - 1].semana);
  const vals = puntos.map((p) => p.indice);
  const mn = Math.min(98, ...vals), mx = Math.max(...vals) + 2;
  const x = (s: string) => PL + ((Date.parse(s) - t0) / Math.max(1, t1 - t0)) * (W - PL - PR);
  const y = (v: number) => PT + (1 - (v - mn) / (mx - mn)) * (H - PT - PB);
  const linea = puntos.map((p) => `${x(p.semana).toFixed(1)},${y(p.indice).toFixed(1)}`).join(" ");
  const ultimo = puntos[puntos.length - 1];
  const mesesMarcas = [puntos[0], puntos[Math.floor(puntos.length / 2)], ultimo].map((p) => ({ x: x(p.semana), t: MESES[new Date(p.semana).getUTCMonth()] }));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Fuerza total en el tiempo">
      <line x1={PL} x2={W - PR} y1={y(100)} y2={y(100)} stroke="#2a2a2a" strokeDasharray="3 4" />
      <text x={2} y={y(100) + 3} fill="#6b7280" fontSize="10">100</text>
      <text x={2} y={y(mx - 2) + 3} fill="#6b7280" fontSize="10">{Math.round(mx - 2)}</text>
      <polygon points={`${x(puntos[0].semana)},${y(mn)} ${linea} ${x(ultimo.semana)},${y(mn)}`} fill="rgba(52,211,153,0.12)" />
      <polyline points={linea} fill="none" stroke="#34d399" strokeWidth="2.6" strokeLinejoin="round" />
      <circle cx={x(ultimo.semana)} cy={y(ultimo.indice)} r="4.5" fill="#34d399" />
      {mesesMarcas.map((m, i) => (
        <text key={i} x={Math.min(Math.max(m.x, PL), W - PR - 14)} y={H - 4} fill="#6b7280" fontSize="10">{m.t}</text>
      ))}
    </svg>
  );
}

function Mini({ serie, color }: { serie: number[]; color: string }) {
  if (serie.length < 2) return <div className="h-5 w-14" />;
  const mn = Math.min(...serie), mx = Math.max(...serie);
  const pts = serie.map((v, i) => `${(i / (serie.length - 1)) * 56},${18 - ((v - mn) / Math.max(1e-9, mx - mn)) * 16 - 1}`).join(" ");
  return (
    <svg width="56" height="18" viewBox="0 0 56 18" className="flex-none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function FilaLevantamiento({ l }: { l: Levantamiento3 }) {
  const color = l.cambio > 1.5 ? "#34d399" : l.cambio < -3 ? "#f87171" : "#9ca3af";
  return (
    <div className="rounded-xl border border-border-strong bg-bg-card p-3">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{l.nombre}</p>
          <p className="text-[11px] text-gray-500">Mejor: {l.mejor}</p>
        </div>
        <Mini serie={l.serie} color={color} />
        <p className="w-14 flex-none text-right text-sm font-semibold" style={{ color }}>{signo(l.cambio)} %</p>
      </div>
      {l.nivel && (
        <div className="mt-2">
          <div className="mb-1 flex justify-between text-[11px]">
            <span className="font-medium text-amber-300">Nivel: {l.nivel.nivel}</span>
            <span className="text-gray-500">{l.nivel.siguiente ? `te faltan ${Math.max(1, l.nivel.siguienteKg! - l.nivel.unoRM)} kg para ${l.nivel.siguiente}` : "máximo nivel"}</span>
          </div>
          <div className="flex gap-1">
            {NIVELES.slice(1).map((n, i) => {
              const lleno = Math.max(0, Math.min(1, l.nivel!.indice - i));
              return (
                <div key={n} className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-800">
                  <div className="h-full rounded-full bg-amber-400" style={{ width: `${lleno * 100}%` }} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Calendario({ semanas }: { semanas: ReturnType<typeof constancia>["semanas"] }) {
  const colores = ["#1c1c1c", "#14532d", "#16a34a", "#4ade80"];
  return (
    <div className="flex justify-between gap-[3px]">
      {semanas.map((col, i) => (
        <div key={i} className="flex flex-1 flex-col gap-[3px]">
          {col.map((d) => (
            <div key={d.fecha} title={`${d.fecha}: ${d.series} series`} className="aspect-square w-full rounded-[3px]" style={{ background: d.futuro ? "transparent" : colores[d.nivel], border: d.futuro ? "1px dashed #222" : undefined }} />
          ))}
        </div>
      ))}
    </div>
  );
}

function BarraDoble({ izq, der, a, b }: { izq: string; der: string; a: number; b: number }) {
  return (
    <div className="mb-3">
      <div className="mb-1 flex justify-between text-[12px]">
        <span className="font-medium text-white">{izq} {a} %</span>
        <span className="font-medium text-white">{b} % {der}</span>
      </div>
      <div className="flex h-2.5 overflow-hidden rounded-full bg-neutral-800">
        <div style={{ width: `${a}%`, background: "#60a5fa" }} />
        <div style={{ width: `${b}%`, background: "#f472b6" }} />
      </div>
    </div>
  );
}

// Imagen para compartir (1080x1350), dibujada en el teléfono; se comparte con la hoja de compartir del sistema.
async function compartirImagen(datos: { titulo: string; grande: string; lineas: string[] }) {
  const c = document.createElement("canvas");
  c.width = 1080;
  c.height = 1350;
  const g = c.getContext("2d")!;
  g.fillStyle = "#050505";
  g.fillRect(0, 0, 1080, 1350);
  const grad = g.createLinearGradient(0, 0, 0, 1350);
  grad.addColorStop(0, "rgba(52,211,153,0.18)");
  grad.addColorStop(1, "rgba(52,211,153,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 1080, 700);
  g.fillStyle = "#ffffff";
  g.font = "bold 70px Impact, 'Arial Black', sans-serif";
  g.textAlign = "center";
  g.fillText("KRAKEN ENTRENA", 540, 150);
  g.fillStyle = "#9ca3af";
  g.font = "44px Arial, sans-serif";
  g.fillText(datos.titulo, 540, 260);
  g.fillStyle = "#34d399";
  g.font = "bold 330px Arial, sans-serif";
  g.fillText(datos.grande, 540, 640);
  g.fillStyle = "#ffffff";
  g.font = "bold 52px Arial, sans-serif";
  g.fillText("de fuerza total", 540, 730);
  g.font = "46px Arial, sans-serif";
  g.fillStyle = "#d1d5db";
  datos.lineas.slice(0, 4).forEach((l, i) => g.fillText(l, 540, 870 + i * 80));
  g.fillStyle = "#6b7280";
  g.font = "36px Arial, sans-serif";
  g.fillText("appfit.krakenbrand.com", 540, 1270);
  const blob: Blob | null = await new Promise((r) => c.toBlob(r, "image/png"));
  if (!blob) return;
  const file = new File([blob], "mi-progreso-kraken.png", { type: "image/png" });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], title: "Mi progreso en KRAKEN" });
      return;
    } catch {
      /* canceló */
    }
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "mi-progreso-kraken.png";
  a.click();
}

export function ProgresoGlobal({
  ejercicios,
  medidas,
  perfil,
  hoy,
}: {
  ejercicios: EjercicioGlobal[];
  medidas: FilaMedida[];
  perfil: { sexo: Sexo | null; pesoCorporal: number | null };
  hoy: string;
}) {
  const fuerza = useMemo(() => fuerzaTotal(ejercicios, hoy), [ejercicios, hoy]);
  const ver = veredicto(fuerza);
  const levs = useMemo(() => misLevantamientos(ejercicios, perfil, hoy), [ejercicios, perfil, hoy]);
  const recs = useMemo(() => recordes(ejercicios, hoy), [ejercicios, hoy]);
  const con = useMemo(() => constancia(ejercicios, hoy), [ejercicios, hoy]);
  const eq = useMemo(() => equilibrio(ejercicios, hoy), [ejercicios, hoy]);
  const sem = useMemo(() => resumenSemanal(ejercicios, hoy), [ejercicios, hoy]);
  const med = useMemo(() => cambiosDeMedidas(medidas).filter((m) => m.clave === "peso" || m.clave === "cintura"), [medidas]);
  const [pagina, setPagina] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);

  function alScrollear() {
    const el = scroller.current;
    if (el) setPagina(Math.round(el.scrollLeft / el.clientWidth));
  }
  function ir(p: number) {
    const el = scroller.current;
    if (el) el.scrollTo({ left: p * el.clientWidth, behavior: "smooth" });
  }

  return (
    <div>
      <div ref={scroller} onScroll={alScrollear} className="-mx-6 flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]">
        {/* ---------- Pantalla 1: ¿progresé? ---------- */}
        <section className="w-full flex-none snap-center px-6">
          {sem && (
            <div className="mb-3 flex items-center justify-between rounded-xl border border-border-strong bg-bg-card px-3 py-2">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500">Tu última semana</p>
                <p className="text-sm font-semibold text-white">{sem.titulo}</p>
              </div>
              <p className="text-right text-[12px] text-gray-300">{sem.detalle}</p>
            </div>
          )}

          <div className={`rounded-xl border p-4 ${TONO_CARD[ver.tono]}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-white">{ver.titulo}</p>
                <p className="mt-1 text-[12px] leading-snug text-gray-300">{ver.detalle}</p>
              </div>
              {fuerza && (
                <div className="flex-none text-right">
                  <p className="text-4xl font-bold leading-none" style={{ color: COLOR[ver.tono] }}>{signo(fuerza.cambioTotal)}%</p>
                  <p className="mt-1 text-[10px] text-gray-400">desde que empezaste</p>
                </div>
              )}
            </div>
          </div>

          {fuerza && (
            <div className="mt-3 rounded-xl border border-border-strong bg-bg-card p-3">
              <p className="mb-1 flex justify-between text-sm font-semibold text-white">
                Tu fuerza total <span className="text-[11px] font-normal text-gray-500">100 = cuando empezaste</span>
              </p>
              <Grafico puntos={fuerza.serie} />
              <p className="mt-1 text-[12px] text-gray-400">{fraseRitmo(fuerza)}</p>
            </div>
          )}

          {levs.length > 0 && (
            <>
              <h2 className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Mis levantamientos</h2>
              <div className="flex flex-col gap-2">{levs.map((l) => <FilaLevantamiento key={l.id} l={l} />)}</div>
            </>
          )}

          {recs.length > 0 && (
            <div className="mt-3 rounded-xl border border-border-strong bg-bg-card px-3 py-2">
              <p className="mb-1 text-sm font-semibold text-white">Récords del mes <span className="text-[11px] font-normal text-amber-300">{recs.length}</span></p>
              {recs.slice(0, 3).map((r) => (
                <div key={r.ejercicio} className="flex items-center gap-2 border-t border-border py-1.5 text-[12px] first-of-type:border-t-0">
                  <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-amber-950 text-[11px] text-amber-300">★</span>
                  <span className="min-w-0 flex-1 truncate font-medium text-white">{r.ejercicio}</span>
                  <span className="text-gray-400">{r.texto}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ---------- Pantalla 2: constancia y equilibrio ---------- */}
        <section className="w-full flex-none snap-center px-6">
          <div className="rounded-xl border border-border-strong bg-bg-card p-3">
            <p className="mb-2 flex justify-between text-sm font-semibold text-white">
              Constancia <span className="text-[11px] font-normal text-gray-500">últimas 12 semanas</span>
            </p>
            <Calendario semanas={con.semanas} />
            <div className="mt-2 flex justify-between text-[12px] text-gray-300">
              <span><b className="text-white">{num(con.entrenosPorSemana)}</b> entrenos por semana</span>
              <span><b className="text-emerald-400">{con.semanasSeguidas}</b> {con.semanasSeguidas === 1 ? "semana seguida" : "semanas seguidas"} con 3+</span>
            </div>
          </div>

          {eq && (
            <div className="mt-3 rounded-xl border border-border-strong bg-bg-card p-3">
              <p className="mb-2 flex justify-between text-sm font-semibold text-white">
                Equilibrio <span className="text-[11px] font-normal text-gray-500">últimas 4 semanas</span>
              </p>
              <BarraDoble izq="Empuje" der="Tracción" a={eq.empuje} b={eq.traccion} />
              <BarraDoble izq="Superior" der="Inferior" a={eq.superior} b={eq.inferior} />
              {eq.nota && <p className="text-[12px] text-amber-300">{eq.nota}</p>}
              {!eq.nota && <p className="text-[12px] text-gray-500">Un reparto parecido entre empuje y tracción cuida los hombros.</p>}
            </div>
          )}

          {med.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {med.map((m) => (
                <div key={m.clave} className="rounded-xl border border-border-strong bg-bg-card p-3">
                  <p className="text-lg font-semibold text-white">
                    {num(m.actual)} {m.unidad}{" "}
                    <span className="text-xs font-normal text-gray-400">{m.tendencia === "igual" ? "= igual" : `${m.tendencia === "sube" ? "↑" : "↓"} ${num(Math.abs(m.cambio))}`}</span>
                  </p>
                  <p className="text-xs text-gray-500">{m.etiqueta}, desde que empezaste</p>
                </div>
              ))}
            </div>
          )}

          {fuerza && (
            <button
              type="button"
              onClick={() => void compartirImagen({ titulo: "Mi progreso", grande: `${signo(fuerza.cambioTotal)}%`, lineas: [sem ? `${sem.titulo}: ${sem.detalle}` : "", recs.length ? `${recs.length} ${recs.length === 1 ? "récord" : "récords"} este mes` : "", con.entrenosPorSemana ? `${num(con.entrenosPorSemana)} entrenos por semana` : "", ver.titulo].filter(Boolean) })}
              className="mt-4 w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-black"
            >
              Compartir mi progreso
            </button>
          )}
          <p className="mt-3 text-center text-[10px] text-gray-600">Niveles según tablas de StrengthLog (peso corporal y sexo). Orientativo.</p>
        </section>
      </div>

      <div className="mt-3 flex justify-center gap-2">
        {[0, 1].map((p) => (
          <button key={p} type="button" aria-label={`Pantalla ${p + 1}`} onClick={() => ir(p)} className={`h-2 rounded-full transition-all ${pagina === p ? "w-6 bg-white" : "w-2 bg-neutral-700"}`} />
        ))}
      </div>
    </div>
  );
}

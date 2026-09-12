"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  calcularEstadisticasSalud,
  tieneDatosSuficientes,
  type Genero,
  type MedicionSalud,
} from "@/lib/salud";
import { calcularContexturaYPesoIdeal } from "@/lib/contextura";

type Medicion = MedicionSalud & { fecha: string };

const HEX_BUENO = "#34d399";
const HEX_MEDIO = "#eab308";
const HEX_MALO = "#ef4444";
const HEX_NEUTRO = "#7a7a7a";

function colorIMC(c: string) {
  if (c === "Peso Normal") return HEX_BUENO;
  if (c === "Bajo Peso" || c === "Sobrepeso") return HEX_MEDIO;
  return HEX_MALO;
}

function colorGrasa(c: string) {
  if (c === "Fitness" || c === "Atletas") return HEX_BUENO;
  if (c === "Promedio" || c === "Grasa Esencial") return HEX_MEDIO;
  return HEX_MALO;
}

function colorEstandar(c: string) {
  if (c === "Estándar") return HEX_BUENO;
  if (c === "Alto" || c === "Bajo") return HEX_MEDIO;
  return HEX_MALO;
}

function fechaCorta(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y.slice(2)}`;
}

type Punto = { fecha: string; valor: number; clasificacion?: string; color: string };

function PanelMetrica({
  titulo,
  puntos,
  sufijo = "",
  decimales = 1,
}: {
  titulo: string;
  puntos: Punto[];
  sufijo?: string;
  decimales?: number;
}) {
  if (puntos.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-bg-card p-4">
      <h3 className="mb-3 text-white">{titulo}</h3>
      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={puntos} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
            <CartesianGrid stroke="#1f1f1f" vertical={false} />
            <XAxis dataKey="fecha" tick={{ fill: "#7a7a7a", fontSize: 10 }} />
            <YAxis tick={{ fill: "#7a7a7a", fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                background: "#111111",
                border: "1px solid #2e2e2e",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "#e7e7e7" }}
              formatter={
                ((valor: number, _n: unknown, item: { payload?: Punto }) => {
                  const clas = item?.payload?.clasificacion;
                  return [`${valor}${sufijo}${clas ? ` — ${clas}` : ""}`, titulo];
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                }) as any
              }
            />
            <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
              {puntos.map((p) => (
                <Cell key={p.fecha} fill={p.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {puntos.some((p) => p.clasificacion) && (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-2 text-xs text-gray-500">
          {puntos.map((p) => (
            <span key={p.fecha}>
              {p.fecha}: <span style={{ color: p.color }}>{p.clasificacion}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProgresoSalud({
  historial,
  genero,
  contextura,
}: {
  historial: Medicion[];
  genero: Genero;
  contextura: { altura: number; muneca: number; pesoActual: number | null } | null;
}) {
  const conDatos = historial.filter(tieneDatosSuficientes);
  const datosContextura = contextura
    ? calcularContexturaYPesoIdeal(contextura.altura, contextura.muneca, genero)
    : null;

  if (conDatos.length === 0 && !datosContextura) {
    return (
      <div className="rounded-lg border border-border bg-bg-card p-4 text-center">
        <p className="text-sm text-gray-500">
          Para calcular tus valores de salud necesitamos peso, altura, cuello,
          cintura y caderas. Cargalos en{" "}
          <span className="text-white">Perfil → Mis medidas</span>.
        </p>
      </div>
    );
  }

  const filas = conDatos.map((m) => ({
    fecha: fechaCorta(m.fecha),
    peso: m.peso as number,
    stats: calcularEstadisticasSalud(m, genero)!,
  }));

  const pesoPuntos: Punto[] = filas.map((f) => ({
    fecha: f.fecha,
    valor: f.peso,
    color: HEX_NEUTRO,
  }));
  const imcPuntos: Punto[] = filas.map((f) => ({
    fecha: f.fecha,
    valor: Number(f.stats.imc.toFixed(1)),
    clasificacion: f.stats.imcClasificacion,
    color: colorIMC(f.stats.imcClasificacion),
  }));
  const grasaPuntos: Punto[] = filas.map((f) => ({
    fecha: f.fecha,
    valor: Number(f.stats.grasaCorporal.toFixed(1)),
    clasificacion: f.stats.grasaClasificacion,
    color: colorGrasa(f.stats.grasaClasificacion),
  }));
  const masaMagraPuntos: Punto[] = filas.map((f) => ({
    fecha: f.fecha,
    valor: Number(f.stats.masaMagraKg.toFixed(1)),
    clasificacion: f.stats.masaMagraClasificacion,
    color: colorEstandar(f.stats.masaMagraClasificacion),
  }));
  const indicePuntos: Punto[] = filas.map((f) => ({
    fecha: f.fecha,
    valor: Number(f.stats.indiceGrasaVisceral.toFixed(2)),
    clasificacion: f.stats.grasaVisceralClasificacion,
    color: colorEstandar(f.stats.grasaVisceralClasificacion),
  }));

  return (
    <div className="flex flex-col gap-4">
      <p className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-xs text-yellow-300">
        ⚠️ Valores aproximados: estos cálculos se realizan mediante métodos
        indirectos y no cuentan con la precisión de las herramientas y
        equipos utilizados en entornos profesionales de salud y fitness. Son
        aproximaciones estimadas basadas en fórmulas matemáticas y las
        medidas corporales que vos cargaste.
      </p>

      <PanelMetrica titulo="Peso" puntos={pesoPuntos} sufijo=" kg" />
      <PanelMetrica titulo="IMC (Índice de masa corporal)" puntos={imcPuntos} />
      <PanelMetrica titulo="Grasa corporal (%)" puntos={grasaPuntos} sufijo="%" />
      <PanelMetrica titulo="Masa magra" puntos={masaMagraPuntos} sufijo=" kg" />
      <PanelMetrica titulo="Índice de grasa visceral" puntos={indicePuntos} decimales={2} />

      {datosContextura && (
        <div className="rounded-lg border border-border bg-bg-card p-4">
          <h3 className="mb-3 text-white">Contextura y peso ideal</h3>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-gray-500">Contextura</span>
              <span className="text-white">{datosContextura.contextura}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-gray-500">Peso ideal aproximado</span>
              <span className="text-white">{datosContextura.pesoIdealKg} kg</span>
            </div>
            {contextura?.pesoActual != null && (
              <div className="flex justify-between">
                <span className="text-gray-500">Tu peso actual</span>
                <span className="text-white">{contextura.pesoActual} kg</span>
              </div>
            )}
          </div>
          <p className="mt-3 border-t border-border pt-2 text-xs text-gray-500">
            Calculado a partir de tu altura y la circunferencia de tu muñeca
            (indicador del tamaño de tu esqueleto). No cambia con el
            entrenamiento, así que no hace falta volver a cargarlo seguido.
          </p>
        </div>
      )}

      <p className="rounded-lg border border-border bg-bg-card p-4 text-xs text-gray-500">
        <strong className="text-gray-400">Importante:</strong> estos valores
        son estimaciones a partir de medidas corporales, no un diagnóstico
        médico. Sirven como referencia para ver tu tendencia en el tiempo, no
        como un número para obsesionarse. Ante cualquier duda de salud,
        consultá a un profesional.
      </p>
    </div>
  );
}

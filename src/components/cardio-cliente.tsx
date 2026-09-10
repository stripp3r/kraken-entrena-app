"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ACTIVIDADES_CARDIO, labelActividad } from "@/lib/cardio";
import { registrarCardio, borrarCardio } from "@/app/entrenamiento/cardio/actions";

type Sesion = {
  id: number;
  fecha: string;
  actividad: string;
  duracion_min: number;
  distancia_km: number | null;
  calorias_estimadas: number | null;
};

export function CardioCliente({
  hoy,
  tienePeso,
  sesiones,
}: {
  hoy: string;
  tienePeso: boolean;
  sesiones: Sesion[];
}) {
  const router = useRouter();
  const [fecha, setFecha] = useState(hoy);
  const [actividad, setActividad] = useState("caminar");
  const [minutos, setMinutos] = useState("");
  const [km, setKm] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const minutosNum = Number(minutos);
  const puedeGuardar = minutosNum > 0 && !guardando;

  async function guardar() {
    setGuardando(true);
    setError(null);
    const resultado = await registrarCardio({
      fecha,
      actividad,
      duracionMin: minutosNum,
      distanciaKm: km.trim() === "" ? null : Number(km),
    });
    setGuardando(false);
    if (resultado.error) {
      setError(resultado.error);
      return;
    }
    setMinutos("");
    setKm("");
    router.refresh();
  }

  async function borrar(id: number) {
    await borrarCardio(id);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-bg-card p-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="cardio-actividad" className="text-sm text-gray-300">
            Actividad
          </label>
          <select
            id="cardio-actividad"
            value={actividad}
            onChange={(e) => setActividad(e.target.value)}
            className="rounded-lg border border-border bg-bg px-3 py-2.5 text-white outline-none focus:border-border-strong"
          >
            {ACTIVIDADES_CARDIO.map((a) => (
              <option key={a.valor} value={a.valor}>
                {a.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <div className="flex flex-1 flex-col gap-1.5">
            <label htmlFor="cardio-min" className="text-sm text-gray-300">
              Minutos
            </label>
            <input
              id="cardio-min"
              type="number"
              inputMode="numeric"
              min={1}
              value={minutos}
              onChange={(e) => setMinutos(e.target.value)}
              className="rounded-lg border border-border bg-bg px-3 py-2.5 text-white outline-none focus:border-border-strong"
            />
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <label htmlFor="cardio-km" className="text-sm text-gray-300">
              Km <span className="text-gray-600">(opcional)</span>
            </label>
            <input
              id="cardio-km"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.1"
              value={km}
              onChange={(e) => setKm(e.target.value)}
              className="rounded-lg border border-border bg-bg px-3 py-2.5 text-white outline-none focus:border-border-strong"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="cardio-fecha" className="text-sm text-gray-300">
            Fecha
          </label>
          <input
            id="cardio-fecha"
            type="date"
            value={fecha}
            max={hoy}
            onChange={(e) => setFecha(e.target.value)}
            className="rounded-lg border border-border bg-bg px-3 py-2.5 text-white outline-none focus:border-border-strong"
          />
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          type="button"
          onClick={guardar}
          disabled={!puedeGuardar}
          className="mt-1 rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {guardando ? "Guardando..." : "Registrar cardio"}
        </button>

        {!tienePeso && (
          <p className="text-xs text-gray-500">
            Cargá tu peso en Perfil → Mis medidas para que la app pueda estimar
            las calorías.
          </p>
        )}
      </div>

      {sesiones.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-gray-500">Sesiones cargadas</p>
          {sesiones.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-lg border border-border bg-bg-card px-4 py-3"
            >
              <div>
                <p className="text-sm text-white">
                  {labelActividad(s.actividad)} · {s.duracion_min} min
                  {s.distancia_km != null ? ` · ${s.distancia_km} km` : ""}
                </p>
                <p className="text-xs text-gray-500">
                  {s.fecha}
                  {s.calorias_estimadas != null
                    ? ` · ~${s.calorias_estimadas} kcal`
                    : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => borrar(s.id)}
                className="text-xs text-gray-500 underline"
              >
                Borrar
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-600">
        Las calorías son una estimación aproximada (fórmula MET según tu peso y
        el tiempo). Sirve como referencia, no como una medición exacta.
      </p>
    </div>
  );
}

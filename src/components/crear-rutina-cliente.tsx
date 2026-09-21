"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { GRUPOS_MUSCULARES, type GrupoMuscular } from "@/lib/grupos-musculares";
import { calcularPentagono, calcularVolumenPorGrupo, type DiaBorrador } from "@/lib/pentagono";
import type { TipoEsfuerzo } from "@/lib/descanso";
import { guardarRutinaCreada } from "@/app/entrenamiento/crear-rutina/actions";

type ExerciseCatalogo = {
  id: number;
  nombre: string;
  imagen_url: string | null;
  tipo_esfuerzo: TipoEsfuerzo;
};

type EjercicioDia = {
  exerciseDefinitionId: number;
  nombre: string;
  tipoEsfuerzo: TipoEsfuerzo;
  series: number;
  repsMin: number;
  repsMax: number;
  rirObjetivo: number;
};

type DiaWizard = {
  gruposMusculares: GrupoMuscular[];
  ejercicios: EjercicioDia[];
};

const diaVacio = (): DiaWizard => ({ gruposMusculares: [], ejercicios: [] });

const ETIQUETAS_PENTAGONO: Record<keyof ReturnType<typeof calcularPentagono>, string> = {
  volumen: "Volumen",
  frecuencia: "Frecuencia",
  recuperacion: "Recuperación",
  intensidad: "Intensidad",
  sostenibilidad: "Sostenibilidad",
};

export function CrearRutinaCliente({ catalogo }: { catalogo: ExerciseCatalogo[] }) {
  const router = useRouter();
  const [paso, setPaso] = useState<"cantidad" | "dias" | "resumen">("cantidad");
  const [dias, setDias] = useState<DiaWizard[]>([]);
  const [diaActivo, setDiaActivo] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const [nombreRutina, setNombreRutina] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function elegirCantidad(n: number) {
    setDias(Array.from({ length: n }, diaVacio));
    setDiaActivo(0);
    setPaso("dias");
  }

  function toggleGrupo(grupo: GrupoMuscular) {
    setDias((prev) =>
      prev.map((d, i) =>
        i !== diaActivo
          ? d
          : {
              ...d,
              gruposMusculares: d.gruposMusculares.includes(grupo)
                ? d.gruposMusculares.filter((g) => g !== grupo)
                : [...d.gruposMusculares, grupo],
            }
      )
    );
  }

  function agregarEjercicio(ex: ExerciseCatalogo) {
    setDias((prev) =>
      prev.map((d, i) =>
        i !== diaActivo
          ? d
          : {
              ...d,
              ejercicios: [
                ...d.ejercicios,
                {
                  exerciseDefinitionId: ex.id,
                  nombre: ex.nombre,
                  tipoEsfuerzo: ex.tipo_esfuerzo,
                  series: 3,
                  repsMin: 8,
                  repsMax: 12,
                  rirObjetivo: 2,
                },
              ],
            }
      )
    );
    setBusqueda("");
  }

  function quitarEjercicio(indice: number) {
    setDias((prev) =>
      prev.map((d, i) => (i !== diaActivo ? d : { ...d, ejercicios: d.ejercicios.filter((_, j) => j !== indice) }))
    );
  }

  function actualizarEjercicio(indice: number, cambios: Partial<EjercicioDia>) {
    setDias((prev) =>
      prev.map((d, i) =>
        i !== diaActivo
          ? d
          : {
              ...d,
              ejercicios: d.ejercicios.map((e, j) => (j !== indice ? e : { ...e, ...cambios })),
            }
      )
    );
  }

  const resultadosBusqueda = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return [];
    return catalogo.filter((ex) => ex.nombre.toLowerCase().includes(q)).slice(0, 20);
  }, [busqueda, catalogo]);

  const diasParaCalculo: DiaBorrador[] = useMemo(
    () =>
      dias.map((d) => ({
        dia: "",
        gruposMusculares: d.gruposMusculares,
        ejercicios: d.ejercicios.map((e) => ({
          exerciseDefinitionId: e.exerciseDefinitionId,
          tipoEsfuerzo: e.tipoEsfuerzo,
          series: e.series,
          repsMin: e.repsMin,
          repsMax: e.repsMax,
          rirObjetivo: e.rirObjetivo,
        })),
      })),
    [dias]
  );

  const pentagono = useMemo(() => calcularPentagono(diasParaCalculo), [diasParaCalculo]);
  const volumenPorGrupo = useMemo(() => calcularVolumenPorGrupo(diasParaCalculo), [diasParaCalculo]);

  const diaCompleto = (d: DiaWizard) => d.gruposMusculares.length > 0 && d.ejercicios.length > 0;
  const todosLosDiasCompletos = dias.every(diaCompleto);

  async function guardar() {
    setError(null);
    if (!nombreRutina.trim()) {
      setError("Ponele un nombre a tu rutina.");
      return;
    }
    setGuardando(true);
    const result = await guardarRutinaCreada(
      nombreRutina,
      dias.map((d) => ({
        gruposMusculares: d.gruposMusculares,
        ejercicios: d.ejercicios.map((e) => ({
          exerciseDefinitionId: e.exerciseDefinitionId,
          series: e.series,
          repsMin: e.repsMin,
          repsMax: e.repsMax,
          rirObjetivo: e.rirObjetivo,
        })),
      }))
    );
    setGuardando(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push("/entrenamiento");
    router.refresh();
  }

  if (paso === "cantidad") {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-center text-sm text-gray-400">¿Cuántos días por semana entrenás?</p>
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => elegirCantidad(n)}
              className="rounded-md border border-border bg-bg-card py-3 text-lg font-medium text-white transition-colors hover:border-emerald-500"
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (paso === "dias") {
    const letra = String.fromCharCode(65 + diaActivo);
    const dia = dias[diaActivo];

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-center gap-2">
          {dias.map((d, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setDiaActivo(i)}
              className={`h-8 w-8 rounded-full text-sm font-medium transition-colors ${
                i === diaActivo
                  ? "bg-emerald-500 text-black"
                  : diaCompleto(d)
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-bg-card text-gray-400"
              }`}
            >
              {String.fromCharCode(65 + i)}
            </button>
          ))}
        </div>

        <div>
          <p className="mb-2 text-sm text-gray-400">Día {letra} — ¿qué grupos musculares toca?</p>
          <div className="flex flex-wrap gap-2">
            {GRUPOS_MUSCULARES.map((grupo) => (
              <button
                key={grupo}
                type="button"
                onClick={() => toggleGrupo(grupo)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  dia.gruposMusculares.includes(grupo)
                    ? "border-emerald-500 bg-emerald-500/15 text-emerald-300"
                    : "border-border text-gray-400"
                }`}
              >
                {grupo}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm text-gray-400">Ejercicios del día {letra}</p>
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar ejercicio..."
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-white outline-none focus:border-border-strong"
          />
          {resultadosBusqueda.length > 0 && (
            <div className="mt-1 flex flex-col gap-1 rounded-md border border-border bg-bg-card p-1">
              {resultadosBusqueda.map((ex) => (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => agregarEjercicio(ex)}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-white hover:bg-bg"
                >
                  {ex.imagen_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={ex.imagen_url} alt="" className="h-8 w-8 rounded bg-white object-contain" />
                  )}
                  {ex.nombre}
                </button>
              ))}
            </div>
          )}
        </div>

        {dia.ejercicios.length > 0 && (
          <div className="flex flex-col gap-2">
            {dia.ejercicios.map((ej, indice) => (
              <div key={indice} className="rounded-md border border-border bg-bg-card p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{ej.nombre}</span>
                  <button
                    type="button"
                    onClick={() => quitarEjercicio(indice)}
                    className="text-xs text-red-400 underline"
                  >
                    Quitar
                  </button>
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex flex-1 flex-col gap-1">
                    <label className="text-[11px] text-gray-500">Series</label>
                    <input
                      type="number"
                      value={ej.series}
                      onChange={(e) => actualizarEjercicio(indice, { series: Number(e.target.value) })}
                      className="w-full rounded-md border border-border bg-bg px-2 py-1.5 text-sm text-white outline-none"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <label className="text-[11px] text-gray-500">Reps min</label>
                    <input
                      type="number"
                      value={ej.repsMin}
                      onChange={(e) => actualizarEjercicio(indice, { repsMin: Number(e.target.value) })}
                      className="w-full rounded-md border border-border bg-bg px-2 py-1.5 text-sm text-white outline-none"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <label className="text-[11px] text-gray-500">Reps max</label>
                    <input
                      type="number"
                      value={ej.repsMax}
                      onChange={(e) => actualizarEjercicio(indice, { repsMax: Number(e.target.value) })}
                      className="w-full rounded-md border border-border bg-bg px-2 py-1.5 text-sm text-white outline-none"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <label className="text-[11px] text-gray-500">RIR obj.</label>
                    <input
                      type="number"
                      value={ej.rirObjetivo}
                      onChange={(e) => actualizarEjercicio(indice, { rirObjetivo: Number(e.target.value) })}
                      className="w-full rounded-md border border-border bg-bg px-2 py-1.5 text-sm text-white outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          {diaActivo > 0 && (
            <button
              type="button"
              onClick={() => setDiaActivo((d) => d - 1)}
              className="flex-1 rounded-md border border-border-strong py-2.5 text-sm text-gray-300"
            >
              Día anterior
            </button>
          )}
          {diaActivo < dias.length - 1 ? (
            <button
              type="button"
              onClick={() => setDiaActivo((d) => d + 1)}
              disabled={!diaCompleto(dia)}
              className="flex-1 rounded-md bg-emerald-500 py-2.5 text-sm font-medium text-black disabled:opacity-50"
            >
              Día siguiente
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setPaso("resumen")}
              disabled={!todosLosDiasCompletos}
              className="flex-1 rounded-md bg-emerald-500 py-2.5 text-sm font-medium text-black disabled:opacity-50"
            >
              Ver resumen
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className="mb-1 block text-[11px] text-gray-500">Nombre de tu rutina</label>
        <input
          value={nombreRutina}
          onChange={(e) => setNombreRutina(e.target.value)}
          placeholder="Ej. Mi Split"
          className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-white outline-none focus:border-border-strong"
        />
      </div>

      <div>
        <p className="mb-2 text-sm text-gray-400">Cómo se compara tu rutina</p>
        <div className="flex flex-col gap-2 rounded-md border border-border bg-bg-card p-3">
          {(Object.keys(pentagono) as (keyof typeof pentagono)[]).map((clave) => (
            <div key={clave} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-xs text-gray-400">{ETIQUETAS_PENTAGONO[clave]}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${pentagono[clave]}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right text-xs text-gray-300">{pentagono[clave]}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm text-gray-400">Series por semana, por grupo muscular</p>
        <div className="flex flex-col gap-1 rounded-md border border-border bg-bg-card p-3">
          {volumenPorGrupo.map(({ grupo, series }) => (
            <div key={grupo} className="flex justify-between text-sm">
              <span className="text-gray-300">{grupo}</span>
              <span className="text-white">{series}</span>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-center text-xs text-red-400">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setPaso("dias")}
          className="flex-1 rounded-md border border-border-strong py-2.5 text-sm text-gray-300"
        >
          Seguir editando
        </button>
        <button
          type="button"
          disabled={guardando}
          onClick={guardar}
          className="flex-1 rounded-md bg-emerald-500 py-2.5 text-sm font-medium text-black disabled:opacity-50"
        >
          {guardando ? "Guardando..." : "Guardar y usar"}
        </button>
      </div>
    </div>
  );
}

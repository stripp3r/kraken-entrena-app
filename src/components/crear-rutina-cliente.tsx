"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { GRUPOS_MUSCULARES, type GrupoMuscular } from "@/lib/grupos-musculares";
import {
  calcularPentagono,
  calcularVolumenPorGrupo,
  calcularFrecuenciaPorGrupo,
  calcularRecuperacionPorGrupo,
  calcularIntensidadPorDia,
  calcularSostenibilidadPorDia,
  type DiaBorrador,
} from "@/lib/pentagono";
import { PentagonoChart } from "@/components/pentagono-chart";
import { TablaMetrica } from "@/components/tabla-metrica";
import {
  filasFrecuencia,
  filasRecuperacion,
  filasIntensidad,
  filasSostenibilidad,
  minutosTotalesSemana,
  formatearMinutosSemana,
} from "@/lib/formato-metricas";
import { guardarRutinaCreada, actualizarRutinaCreada } from "@/app/entrenamiento/crear-rutina/actions";
import { CampoNumero } from "@/components/campo-numero";
import {
  ejercicioNuevo,
  sanearBorrador,
  type Borrador,
  type DiaWizard,
  type EjercicioCatalogo,
  type EjercicioDia,
} from "@/lib/borrador-rutina";
import { LIMITES_RUTINA, validarRutina } from "@/lib/validar-rutina";
import { FILTRO_TODOS, filtrarCatalogo } from "@/lib/buscar-ejercicios";

const diaVacio = (): DiaWizard => ({ gruposMusculares: [], ejercicios: [] });

const CLASE_CAMPO = "w-full rounded-md border border-border bg-bg px-2 py-1.5 text-sm text-white outline-none";

// El wizard es varios pasos y puede llevar un rato armarlo -- sin esto, un
// F5 o un cierre accidental del navegador borraba todo lo cargado (el
// estado vivía solo en memoria de React). Se guarda en localStorage, un
// borrador por dispositivo, y se limpia solo al guardar la rutina con
// éxito. Nunca se persiste el paso "cantidad" porque ahí no hay nada
// todavía que valga la pena recuperar.
// La clave lleva el id del usuario: si dos personas usan el mismo teléfono no ven el borrador de la otra. Lo que se
// lee se sanea contra el catálogo de hoy (lib/borrador-rutina.ts): puede venir de una versión anterior de la app,
// con ejercicios fusionados o que ya no existen.
const BORRADOR_KEY_ANTERIOR = "kraken-crear-rutina-borrador";
const claveBorrador = (usuarioId: string) => `${BORRADOR_KEY_ANTERIOR}:${usuarioId}`;

function leerBorrador(clave: string): unknown {
  try {
    const crudo = localStorage.getItem(clave);
    return crudo ? JSON.parse(crudo) : null;
  } catch {
    return null;
  }
}

function guardarBorrador(clave: string, borrador: Borrador) {
  try {
    localStorage.setItem(clave, JSON.stringify(borrador));
  } catch {
    // Storage lleno, modo privado, etc. -- no es crítico, seguimos sin persistir.
  }
}

function borrarBorrador(clave: string) {
  try {
    localStorage.removeItem(clave);
  } catch {
    // no-op
  }
}

function quitarBorradorAnterior() {
  try {
    localStorage.removeItem(BORRADOR_KEY_ANTERIOR);
  } catch {
    // no-op
  }
}

export type RutinaExistente = { id: number; nombre: string; dias: DiaWizard[] };

export function CrearRutinaCliente({
  catalogo,
  rutinaExistente,
  usuarioId,
}: {
  catalogo: EjercicioCatalogo[];
  rutinaExistente?: RutinaExistente;
  // Solo hace falta al crear (el borrador se guarda por usuario); al editar no hay borrador.
  usuarioId?: string;
}) {
  const router = useRouter();
  const clave = usuarioId ? claveBorrador(usuarioId) : null;
  const [paso, setPaso] = useState<"cantidad" | "dias" | "resumen">(
    rutinaExistente ? "dias" : "cantidad"
  );
  const [dias, setDias] = useState<DiaWizard[]>(rutinaExistente?.dias ?? []);
  const [diaActivo, setDiaActivo] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const [filtroGrupo, setFiltroGrupo] = useState<string>(FILTRO_TODOS);
  const [nombreRutina, setNombreRutina] = useState(rutinaExistente?.nombre ?? "");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gruposAbierto, setGruposAbierto] = useState(false);
  const [filtroAbierto, setFiltroAbierto] = useState(false);
  const [cantidadAbierta, setCantidadAbierta] = useState(false);

  // Editar una rutina ya creada arranca directo en "dias", con el contenido
  // real cargado desde el servidor -- no tiene sentido restaurar un borrador
  // de localStorage (que podría ser de una sesión de "crear" completamente
  // distinta) ni guardar uno nuevo mientras se edita, cada edición es una
  // sesión corta y autocontenida.
  useEffect(() => {
    if (rutinaExistente || !clave) return;
    // Antes el borrador se guardaba en una clave común del teléfono: si hay uno y el usuario no tiene el suyo, se
    // rescata una sola vez y se descarta la clave vieja, para no mostrarle a otra persona un borrador ajeno.
    const propio = leerBorrador(clave);
    const heredado = propio === null ? leerBorrador(BORRADOR_KEY_ANTERIOR) : null;
    quitarBorradorAnterior();
    /* eslint-disable react-hooks/set-state-in-effect */
    const borrador = sanearBorrador(propio ?? heredado, catalogo);
    if (!borrador) return;
    setDias(borrador.dias);
    setDiaActivo(borrador.diaActivo);
    setNombreRutina(borrador.nombreRutina);
    setPaso(borrador.paso);
    /* eslint-enable react-hooks/set-state-in-effect */
    // Solo al montar -- es una restauración única, no una sincronización continua.
    // rutinaExistente no cambia durante la vida del componente (viene de props
    // fijas del server), no hace falta re-ejecutar si "cambiara".
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (rutinaExistente || !clave) return;
    if (paso === "cantidad") return;
    guardarBorrador(clave, { paso, dias, diaActivo, nombreRutina });
  }, [rutinaExistente, clave, paso, dias, diaActivo, nombreRutina]);

  function elegirCantidad(n: number) {
    setDias(Array.from({ length: n }, diaVacio));
    setDiaActivo(0);
    setPaso("dias");
  }

  function irADia(indice: number) {
    setDiaActivo(indice);
    setGruposAbierto(false);
    setFiltroAbierto(false);
    setFiltroGrupo(FILTRO_TODOS);
  }

  function toggleGrupo(grupo: GrupoMuscular) {
    const dia = dias[diaActivo];
    const nuevos = dia.gruposMusculares.includes(grupo)
      ? dia.gruposMusculares.filter((g) => g !== grupo)
      : [...dia.gruposMusculares, grupo];
    setDias((prev) => prev.map((d, i) => (i !== diaActivo ? d : { ...d, gruposMusculares: nuevos })));
    if (filtroGrupo !== FILTRO_TODOS && !(nuevos as string[]).includes(filtroGrupo)) {
      setFiltroGrupo(FILTRO_TODOS);
    }
  }

  // Un ejercicio no se repite dentro del mismo día: el historial se indexa por ejercicio y día
  // (lib/clave-ejercicio-dia.ts) y las dos tarjetas compartirían los registros.
  function agregarEjercicio(ex: EjercicioCatalogo) {
    setDias((prev) =>
      prev.map((d, i) =>
        i !== diaActivo || d.ejercicios.some((e) => e.exerciseDefinitionId === ex.id)
          ? d
          : { ...d, ejercicios: [...d.ejercicios, ejercicioNuevo(ex)] }
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

  const gruposDelDia = useMemo(() => dias[diaActivo]?.gruposMusculares ?? [], [dias, diaActivo]);

  const ejerciciosFiltrados = useMemo(
    () => filtrarCatalogo(catalogo, gruposDelDia, filtroGrupo, busqueda),
    [busqueda, filtroGrupo, catalogo, gruposDelDia]
  );

  const diasParaCalculo: DiaBorrador[] = useMemo(
    () =>
      dias.map((d, i) => ({
        dia: String.fromCharCode(65 + i),
        gruposMusculares: d.gruposMusculares,
        ejercicios: d.ejercicios.map((e) => ({
          exerciseDefinitionId: e.exerciseDefinitionId,
          tipoEsfuerzo: e.tipoEsfuerzo,
          series: e.series,
          repsMin: e.repsMin,
          repsMax: e.repsMax,
          rirObjetivo: e.rirObjetivo,
          gruposMusculares: e.gruposMusculares,
        })),
      })),
    [dias]
  );

  const pentagono = useMemo(() => calcularPentagono(diasParaCalculo), [diasParaCalculo]);
  const volumenPorGrupo = useMemo(() => calcularVolumenPorGrupo(diasParaCalculo), [diasParaCalculo]);
  const frecuenciaPorGrupo = useMemo(() => calcularFrecuenciaPorGrupo(diasParaCalculo), [diasParaCalculo]);
  const recuperacionPorGrupo = useMemo(
    () => calcularRecuperacionPorGrupo(diasParaCalculo),
    [diasParaCalculo]
  );
  const intensidadPorDia = useMemo(() => calcularIntensidadPorDia(diasParaCalculo), [diasParaCalculo]);
  const sostenibilidadPorDia = useMemo(
    () => calcularSostenibilidadPorDia(diasParaCalculo),
    [diasParaCalculo]
  );

  const diaCompleto = (d: DiaWizard) => d.gruposMusculares.length > 0 && d.ejercicios.length > 0;
  const todosLosDiasCompletos = dias.every(diaCompleto);

  async function guardar(activar: boolean) {
    setError(null);
    const diasParaGuardar = dias.map((d) => ({
      gruposMusculares: d.gruposMusculares,
      ejercicios: d.ejercicios.map((e) => ({
        exerciseDefinitionId: e.exerciseDefinitionId,
        series: e.series,
        repsMin: e.repsMin,
        repsMax: e.repsMax,
        rirObjetivo: e.rirObjetivo,
      })),
    }));
    // Mismo chequeo que hace el servidor (que es el que protege de verdad), pero acá el mensaje llega al instante y
    // nombra el día y el ejercicio con el problema.
    const nombresPorId = Object.fromEntries(catalogo.map((ex) => [ex.id, ex.nombre]));
    const validada = validarRutina(nombreRutina, diasParaGuardar, nombresPorId);
    if (!validada.ok) {
      setError(validada.error);
      return;
    }

    setGuardando(true);
    const resultado = rutinaExistente
      ? await actualizarRutinaCreada(rutinaExistente.id, validada.nombre, diasParaGuardar, activar)
      : await guardarRutinaCreada(validada.nombre, diasParaGuardar, activar);
    setGuardando(false);

    if ("error" in resultado) {
      setError(resultado.error);
      return;
    }

    if (!rutinaExistente && clave) borrarBorrador(clave);
    // Si quedó guardada pero no se pudo activar, se abre su detalle, donde se activa a mano (volver a intentar acá
    // crearía una copia).
    const faltoActivar = activar && !resultado.activada;
    router.push(rutinaExistente || faltoActivar ? `/entrenamiento/rutinas/${resultado.routineId}` : "/entrenamiento");
    router.refresh();
  }

  if (paso === "cantidad") {
    return (
      <div className="flex flex-col gap-2">
        <p className="mb-2 text-center text-sm text-gray-400">¿Cuántos días por semana entrenás?</p>
        <button
          type="button"
          onClick={() => setCantidadAbierta((v) => !v)}
          className="flex w-full items-center justify-between rounded-md border border-border bg-bg-card px-3 py-2.5 text-left text-sm text-white"
        >
          <span className="text-gray-500">Elegí cuántos días</span>
          <span className="text-gray-400">{cantidadAbierta ? "▲" : "▼"}</span>
        </button>
        {cantidadAbierta && (
          <div className="flex flex-wrap gap-2 rounded-md border border-border bg-bg-card p-2.5">
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => elegirCantidad(n)}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:border-emerald-500 hover:text-emerald-300"
              >
                {n} {n === 1 ? "día" : "días"}
              </button>
            ))}
          </div>
        )}
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
              onClick={() => irADia(i)}
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
          <button
            type="button"
            onClick={() => setGruposAbierto((v) => !v)}
            className="flex w-full items-center justify-between rounded-md border border-border bg-bg-card px-3 py-2.5 text-left text-sm text-white"
          >
            <span className={dia.gruposMusculares.length === 0 ? "text-gray-500" : "text-white"}>
              {dia.gruposMusculares.length === 0 ? "Elegí uno o más grupos" : dia.gruposMusculares.join(", ")}
            </span>
            <span className="text-gray-400">{gruposAbierto ? "▲" : "▼"}</span>
          </button>
          {gruposAbierto && (
            <div className="mt-1.5 flex flex-wrap gap-2 rounded-md border border-border bg-bg-card p-2.5">
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
          )}
        </div>

        <div>
          <p className="mb-2 text-sm text-gray-400">Ejercicios del día {letra}</p>
          {gruposDelDia.length === 0 ? (
            <p className="rounded-md border border-border bg-bg-card px-3 py-2.5 text-center text-xs text-gray-500">
              Elegí primero los grupos musculares de arriba.
            </p>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setFiltroAbierto((v) => !v)}
                className="flex w-full items-center justify-between rounded-md border border-border bg-bg-card px-3 py-2.5 text-left text-sm text-white"
              >
                <span>{filtroGrupo}</span>
                <span className="text-gray-400">{filtroAbierto ? "▲" : "▼"}</span>
              </button>
              {filtroAbierto && (
                <div className="mt-1.5 flex flex-wrap gap-2 rounded-md border border-border bg-bg-card p-2.5">
                  {[FILTRO_TODOS, ...gruposDelDia].map((grupo) => (
                    <button
                      key={grupo}
                      type="button"
                      onClick={() => {
                        setFiltroGrupo(grupo);
                        setFiltroAbierto(false);
                      }}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        filtroGrupo === grupo
                          ? "border-emerald-500 bg-emerald-500/15 text-emerald-300"
                          : "border-border text-gray-400"
                      }`}
                    >
                      {grupo}
                    </button>
                  ))}
                </div>
              )}
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre (opcional)..."
                className="mb-2 mt-1.5 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-white outline-none focus:border-border-strong"
              />
              <div className="grid max-h-72 grid-cols-3 gap-1.5 overflow-y-auto rounded-md border border-border bg-bg-card p-1.5">
                {ejerciciosFiltrados.length === 0 && (
                  <p className="col-span-3 py-4 text-center text-xs text-gray-500">
                    Ningún ejercicio coincide -- probá otro grupo o buscá por nombre.
                  </p>
                )}
                {ejerciciosFiltrados.map((ex) => {
                  const agregado = dia.ejercicios.some((e) => e.exerciseDefinitionId === ex.id);
                  return (
                    <button
                      key={ex.id}
                      type="button"
                      onClick={() => agregarEjercicio(ex)}
                      disabled={agregado}
                      title={agregado ? "Ya está en este día" : undefined}
                      className={`flex flex-col items-center gap-1 rounded-md p-1.5 text-center ${agregado ? "opacity-40" : "hover:bg-bg"}`}
                    >
                      <div className="relative w-full">
                        {ex.imagen_url ? (
                          // loading="lazy": cada imagen es un GIF animado de ~100 KB; sin esto el teléfono baja de
                          // una vez todos los del grupo (hasta ~10 MB) aunque se vean unos pocos.
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={ex.imagen_url}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            className="aspect-square w-full rounded bg-white object-contain"
                          />
                        ) : (
                          <div className="aspect-square w-full rounded bg-bg" />
                        )}
                        {agregado && (
                          <span className="absolute right-1 top-1 rounded-full bg-emerald-500 px-1.5 text-[10px] font-semibold text-black">
                            ✓
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] leading-tight text-gray-300">{ex.nombre}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {dia.ejercicios.length > 0 && (
          <div className="flex flex-col gap-2">
            {dia.ejercicios.map((ej, indice) => (
              <div key={ej.exerciseDefinitionId} className="rounded-md border border-border bg-bg-card p-3">
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
                    <CampoNumero
                      valor={ej.series}
                      min={LIMITES_RUTINA.series.min}
                      max={LIMITES_RUTINA.series.max}
                      etiqueta={`Series de ${ej.nombre}`}
                      onCambio={(n) => actualizarEjercicio(indice, { series: n })}
                      className={CLASE_CAMPO}
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <label className="text-[11px] text-gray-500">Reps min</label>
                    <CampoNumero
                      valor={ej.repsMin}
                      min={LIMITES_RUTINA.reps.min}
                      max={LIMITES_RUTINA.reps.max}
                      etiqueta={`Repeticiones mínimas de ${ej.nombre}`}
                      // El mínimo nunca pasa al máximo: si se sube por encima, el máximo lo acompaña.
                      onCambio={(n) => actualizarEjercicio(indice, { repsMin: n, repsMax: Math.max(n, ej.repsMax) })}
                      className={CLASE_CAMPO}
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <label className="text-[11px] text-gray-500">Reps max</label>
                    <CampoNumero
                      valor={ej.repsMax}
                      min={LIMITES_RUTINA.reps.min}
                      max={LIMITES_RUTINA.reps.max}
                      etiqueta={`Repeticiones máximas de ${ej.nombre}`}
                      // Y al revés: si el máximo baja del mínimo, el mínimo baja con él.
                      onCambio={(n) => actualizarEjercicio(indice, { repsMax: n, repsMin: Math.min(n, ej.repsMin) })}
                      className={CLASE_CAMPO}
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <label className="text-[11px] text-gray-500">RIR obj.</label>
                    <CampoNumero
                      valor={ej.rirObjetivo}
                      min={LIMITES_RUTINA.rir.min}
                      max={LIMITES_RUTINA.rir.max}
                      paso={0.5}
                      etiqueta={`RIR objetivo de ${ej.nombre}`}
                      onCambio={(n) => actualizarEjercicio(indice, { rirObjetivo: n })}
                      className={CLASE_CAMPO}
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
              onClick={() => irADia(diaActivo - 1)}
              className="flex-1 rounded-md border border-border-strong py-2.5 text-sm text-gray-300"
            >
              Día anterior
            </button>
          )}
          {diaActivo < dias.length - 1 ? (
            <button
              type="button"
              onClick={() => irADia(diaActivo + 1)}
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
        <p className="mb-2 text-center text-sm text-gray-400">Cómo se compara tu rutina</p>
        <div className="rounded-md border border-border bg-bg-card p-3">
          <PentagonoChart series={[{ label: nombreRutina || "Tu rutina", color: "#10b981", scores: pentagono }]} />
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm text-gray-400">
          Series por semana, por grupo muscular <span className="text-gray-500">(vs. MRV)</span>
        </p>
        <div className="flex flex-col gap-1 rounded-md border border-border bg-bg-card p-3">
          {volumenPorGrupo.map(({ grupo, series, mrv }) => (
            <div key={grupo} className="flex justify-between text-sm">
              <span className="text-gray-300">{grupo}</span>
              <span className="text-white">
                {Number.isInteger(series) ? series : series.toFixed(1)}{" "}
                <span className="text-gray-500">/ {mrv}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <TablaMetrica titulo="Frecuencia, por grupo muscular" filas={filasFrecuencia(frecuenciaPorGrupo)} />
      <TablaMetrica
        titulo="Recuperación, por grupo muscular"
        filas={filasRecuperacion(recuperacionPorGrupo)}
      />
      <TablaMetrica titulo="Intensidad (RIR), por día" filas={filasIntensidad(intensidadPorDia)} />
      <TablaMetrica
        titulo="Sostenibilidad, por día"
        filas={filasSostenibilidad(sostenibilidadPorDia)}
        total={{
          label: "Total semanal",
          valor: formatearMinutosSemana(minutosTotalesSemana(sostenibilidadPorDia)),
        }}
      />

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
          onClick={() => guardar(true)}
          className="flex-1 rounded-md bg-emerald-500 py-2.5 text-sm font-medium text-black disabled:opacity-50"
        >
          {guardando ? "Guardando..." : rutinaExistente ? "Guardar cambios" : "Guardar y usar"}
        </button>
      </div>
      <button
        type="button"
        disabled={guardando}
        onClick={() => guardar(false)}
        className="text-center text-xs text-gray-400 underline disabled:opacity-50"
      >
        Guardar sin activarla (seguir con mi rutina actual)
      </button>
    </div>
  );
}

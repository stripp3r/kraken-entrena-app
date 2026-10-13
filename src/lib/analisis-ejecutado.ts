// Análisis de lo que de verdad se ejecutó: todas las series (no solo el top
// set), el RIR, las bajadas de drop sets, el volumen real y el cumplimiento de
// lo prescrito. Es ADITIVO: no reemplaza a lib/analytics.ts (1RM, RM, PR,
// IRP), que sigue usando solo el top set por día y dejando las bajadas afuera.
//
// - "Serie" = una fila no-'drop' (normal o principal de drop set). Las bajadas
//   cuelgan de su principal (lib/dropset.ts) y suman volumen, nunca series.
// - "Serie efectiva" = serie con RIR cargado <= UMBRAL_SERIE_EFECTIVA. Las
//   series sin RIR no se pueden clasificar: se cuentan aparte (`sinRir`).

import { fechaISO } from "./fecha";
import { epley } from "./analytics";
import { pesoPorGrupo } from "./pentagono";
import { landmarksDeGrupo } from "./volumen-landmarks";
import { parsearSeriesReps } from "./parsear-series-reps";
import type { TipoSerie } from "./dropset";

export const UMBRAL_SERIE_EFECTIVA = 2;

export type LogCompleto = {
  id: number;
  peso: number | null;
  reps: number | null;
  rir: number | null;
  tipo_serie: TipoSerie;
  drop_de: number | null;
  created_at: string;
};

export type SerieSesion = { principal: LogCompleto; bajadas: LogCompleto[] };
export type Sesion = { fecha: string; series: SerieSesion[] };

const vol = (l: LogCompleto) => (l.peso && l.reps && l.peso > 0 && l.reps > 0 ? l.peso * l.reps : 0);
const esEfectiva = (l: LogCompleto) => l.rir !== null && l.rir <= UMBRAL_SERIE_EFECTIVA;

export function agruparSesiones(logs: LogCompleto[]): Sesion[] {
  const ordenados = [...logs].sort((a, b) => a.created_at.localeCompare(b.created_at) || a.id - b.id);
  const porDia = new Map<string, Sesion>();
  const serieDe = new Map<number, SerieSesion>();
  for (const l of ordenados) {
    if (l.tipo_serie === "drop") continue;
    const fecha = fechaISO(new Date(l.created_at));
    const sesion = porDia.get(fecha) ?? { fecha, series: [] };
    const serie = { principal: l, bajadas: [] };
    sesion.series.push(serie);
    serieDe.set(l.id, serie);
    porDia.set(fecha, sesion);
  }
  for (const l of ordenados) {
    if (l.tipo_serie !== "drop" || l.drop_de === null) continue;
    serieDe.get(l.drop_de)?.bajadas.push(l);
  }
  return [...porDia.values()].sort((a, b) => a.fecha.localeCompare(b.fecha));
}

export type ResumenSesion = {
  fecha: string;
  seriesTotales: number;
  seriesEfectivas: number;
  seriesSinRir: number;
  volumenPrincipal: number;
  volumenBajadas: number;
  volumenTotal: number;
  rirPromedio: number | null;
  caidaRepsPct: number | null; // negativo = bajaron las reps de la primera a la última serie
};

export function resumirSesion(s: Sesion): ResumenSesion {
  const principales = s.series.map((x) => x.principal);
  const volumenPrincipal = principales.reduce((a, l) => a + vol(l), 0);
  const volumenBajadas = s.series.reduce((a, x) => a + x.bajadas.reduce((b, l) => b + vol(l), 0), 0);
  const conRir = principales.filter((l) => l.rir !== null);
  const conReps = principales.filter((l) => l.reps && l.reps > 0);
  const primera = conReps[0]?.reps ?? null;
  const ultima = conReps[conReps.length - 1]?.reps ?? null;
  return {
    fecha: s.fecha,
    seriesTotales: principales.length,
    seriesEfectivas: principales.filter(esEfectiva).length,
    seriesSinRir: principales.length - conRir.length,
    volumenPrincipal,
    volumenBajadas,
    volumenTotal: volumenPrincipal + volumenBajadas,
    rirPromedio: conRir.length ? conRir.reduce((a, l) => a + (l.rir as number), 0) / conRir.length : null,
    caidaRepsPct:
      conReps.length >= 2 && primera && ultima ? Math.round(((ultima - primera) / primera) * 100) : null,
  };
}

export type Objetivo = {
  series: number;
  repsMax: number | null; // null si la prescripción no trae rango de reps ("al fallo")
  rirObjetivo: number | null; // null si la prescripción no habla de RIR
};

// `rirColumna` es routine_exercises.rir_objetivo (rutinas propias); si no está,
// se lee del texto solo cuando el texto menciona RIR (el parser devuelve 2 por
// defecto, y ese valor inventado no sirve para comparar).
export function objetivoDeEjercicio(seriesReps: string | null, rirColumna: number | null): Objetivo {
  const p = parsearSeriesReps(seriesReps);
  const tieneReps = /[x×X]\s*\d/.test(seriesReps ?? "");
  const tieneRir = /RIR/i.test(seriesReps ?? "");
  return {
    series: p.series,
    repsMax: tieneReps ? p.repsMax : null,
    rirObjetivo: rirColumna ?? (tieneRir ? p.rirObjetivo : null),
  };
}

export type EstadoProgresion = {
  tipo: "subir" | "estancado" | "progresando" | "pocos-datos";
  mensaje: string;
};

const mejorRm = (s: Sesion) =>
  Math.max(0, ...s.series.filter((x) => vol(x.principal) > 0).map((x) => epley(x.principal.peso as number, x.principal.reps as number)));

export function estadoProgresion(sesiones: Sesion[], objetivo: Objetivo): EstadoProgresion {
  if (sesiones.length < 3) {
    return { tipo: "pocos-datos", mensaje: "Con 3 sesiones registradas empiezo a evaluar tu progresión." };
  }
  const ultima = sesiones[sesiones.length - 1];
  const limiteRir = objetivo.rirObjetivo ?? UMBRAL_SERIE_EFECTIVA;
  if (objetivo.repsMax !== null) {
    const topeConEsfuerzo = ultima.series.some(
      (x) => (x.principal.reps ?? 0) >= (objetivo.repsMax as number) && x.principal.rir !== null && x.principal.rir <= limiteRir
    );
    if (topeConEsfuerzo) {
      return { tipo: "subir", mensaje: `Llegaste al tope del rango (${objetivo.repsMax} reps) con buen esfuerzo: probá subir la carga.` };
    }
  }
  if (sesiones.length >= 4) {
    const previas = sesiones.slice(0, -3);
    const recientes = sesiones.slice(-3);
    const rmPrevio = Math.max(...previas.map(mejorRm));
    const volPrevio = Math.max(...previas.map((s) => resumirSesion(s).volumenTotal));
    const mejoro = recientes.some(
      (s) => mejorRm(s) > rmPrevio * 1.005 || resumirSesion(s).volumenTotal > volPrevio * 1.005
    );
    if (!mejoro) {
      return { tipo: "estancado", mensaje: "Estancado: 3 sesiones sin mejorar el 1RM estimado ni el volumen." };
    }
  }
  return { tipo: "progresando", mensaje: "Venís progresando: todavía no hace falta cambiar nada." };
}

export function serieRirPorSesion(sesiones: Sesion[]): { fecha: string; valor: number }[] {
  return sesiones.flatMap((s) => {
    const r = resumirSesion(s).rirPromedio;
    return r === null ? [] : [{ fecha: s.fecha, valor: Math.round(r * 10) / 10 }];
  });
}

// ---------- semanal ----------

export function lunesDeSemana(fechaYMD: string): string {
  const d = new Date(`${fechaYMD}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}

export function sumarDias(fechaYMD: string, dias: number): string {
  const d = new Date(`${fechaYMD}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

export type EjercicioAnalizado = {
  dia: string;
  grupos: string[];
  objetivo: Objetivo;
  logs: LogCompleto[];
};

function seriesDeSemana(logs: LogCompleto[], lunes: string): LogCompleto[] {
  const domingo = sumarDias(lunes, 6);
  return logs.filter((l) => {
    if (l.tipo_serie === "drop") return false;
    const f = fechaISO(new Date(l.created_at));
    return f >= lunes && f <= domingo;
  });
}

export type VolumenGrupoSemana = {
  grupo: string;
  efectivas: number;
  sinRir: number;
  mev: number;
  mav: number;
  mrv: number;
  zona: "bajo-mev" | "mev-mav" | "mav-mrv" | "sobre-mrv";
};

export function volumenSemanalPorGrupo(ejercicios: EjercicioAnalizado[], lunes: string): VolumenGrupoSemana[] {
  const acumulado = new Map<string, { efectivas: number; sinRir: number }>();
  for (const e of ejercicios) {
    for (const [grupo] of pesoPorGrupo(e.grupos)) {
      if (!acumulado.has(grupo)) acumulado.set(grupo, { efectivas: 0, sinRir: 0 });
    }
    for (const l of seriesDeSemana(e.logs, lunes)) {
      for (const [grupo, peso] of pesoPorGrupo(e.grupos)) {
        const a = acumulado.get(grupo) as { efectivas: number; sinRir: number };
        if (l.rir === null) a.sinRir += peso;
        else if (esEfectiva(l)) a.efectivas += peso;
      }
    }
  }
  return [...acumulado.entries()]
    .map(([grupo, a]) => {
      const lm = landmarksDeGrupo(grupo);
      const zona: VolumenGrupoSemana["zona"] =
        a.efectivas < lm.mev ? "bajo-mev" : a.efectivas <= lm.mav ? "mev-mav" : a.efectivas <= lm.mrv ? "mav-mrv" : "sobre-mrv";
      return { grupo, ...a, ...lm, zona };
    })
    .sort((x, y) => y.efectivas / y.mrv - x.efectivas / x.mrv);
}

export type CumplimientoSemana = {
  entrenamientosHechos: number;
  entrenamientosPrevistos: number;
  seriesHechas: number;
  seriesPrevistas: number;
  rirVsObjetivo: number | null; // positivo = más lejos del fallo que lo prescrito
};

export function cumplimientoSemanal(
  ejercicios: EjercicioAnalizado[],
  diasPorSemana: number,
  lunes: string
): CumplimientoSemana {
  const diasHechos = new Set<string>();
  let seriesHechas = 0;
  let sumaDelta = 0;
  let nDelta = 0;
  for (const e of ejercicios) {
    const series = seriesDeSemana(e.logs, lunes);
    if (series.length) diasHechos.add(e.dia);
    seriesHechas += series.length;
    if (e.objetivo.rirObjetivo !== null) {
      for (const l of series) {
        if (l.rir === null) continue;
        sumaDelta += l.rir - e.objetivo.rirObjetivo;
        nDelta++;
      }
    }
  }
  return {
    entrenamientosHechos: diasHechos.size,
    entrenamientosPrevistos: diasPorSemana,
    seriesHechas,
    seriesPrevistas: ejercicios.reduce((a, e) => a + e.objetivo.series, 0),
    rirVsObjetivo: nDelta ? Math.round((sumaDelta / nDelta) * 10) / 10 : null,
  };
}

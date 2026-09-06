// Réplica de la lógica de la hoja "FORMULAS DB" del Excel original,
// adaptada a registros libres (con fecha) en vez de la grilla fija de
// 12 semanas. Ver plan / memoria del proyecto para el detalle de cada
// fórmula y su origen.
//
// Cuando se cargan varios sets el mismo día, se toma el "top set" (el de
// mayor 1RM estimado) de ese día como representativo — a pedido del
// usuario, para que un día con más series no pese más que uno con menos.

import { fechaISO } from "./fecha";

export type SetLog = {
  peso: number | null;
  reps: number | null;
  created_at: string;
};

type SetValido = { peso: number; reps: number; dia: string };

export type EstadisticasEjercicio = {
  rm1: number | null;
  rm6: number | null;
  rm8: number | null;
  rm10: number | null;
  rm12: number | null;
  meta10: number | null; // "1%+" sobre el 10RM
  meta12: number | null; // "1%+" sobre el 12RM
  irp: number | null; // Intensidad Relativa Promedio
  prMax: number | null;
  prMin: number | null;
  volMax: number | null;
  volMin: number | null;
  cantidadDias: number;
};

function epley(peso: number, reps: number) {
  return peso * (1 + reps / 30);
}

function aSetsValidos(logs: SetLog[]): SetValido[] {
  return logs
    .filter((l) => l.peso !== null && l.reps !== null && l.peso > 0 && l.reps > 0)
    .map((l) => ({
      peso: l.peso as number,
      reps: l.reps as number,
      dia: fechaISO(new Date(l.created_at)),
    }));
}

// Un solo set por día: el de mayor 1RM estimado (top set).
function topSetsPorDia(sets: SetValido[]): SetValido[] {
  const porDia = new Map<string, SetValido>();
  for (const s of sets) {
    const actual = porDia.get(s.dia);
    if (!actual || epley(s.peso, s.reps) > epley(actual.peso, actual.reps)) {
      porDia.set(s.dia, s);
    }
  }
  return [...porDia.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, s]) => s);
}

export function calcularEstadisticasEjercicio(logs: SetLog[]): EstadisticasEjercicio {
  const topSets = topSetsPorDia(aSetsValidos(logs));

  if (topSets.length === 0) {
    return {
      rm1: null,
      rm6: null,
      rm8: null,
      rm10: null,
      rm12: null,
      meta10: null,
      meta12: null,
      irp: null,
      prMax: null,
      prMin: null,
      volMax: null,
      volMin: null,
      cantidadDias: 0,
    };
  }

  const estimaciones1RM = topSets.map((s) => epley(s.peso, s.reps));
  const pesos = topSets.map((s) => s.peso);
  const volumenes = topSets.map((s) => s.peso * s.reps);

  const promedio = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

  const rm1 = promedio(estimaciones1RM);
  const rmMax = Math.max(...estimaciones1RM);
  const pesoPromedio = promedio(pesos);

  return {
    rm1,
    rm6: rm1 * 0.85,
    rm8: rm1 * 0.8,
    rm10: rm1 * 0.75,
    rm12: rm1 * 0.7,
    meta10: rm1 * 0.75 * 1.01,
    meta12: rm1 * 0.7 * 1.01,
    irp: rmMax > 0 ? pesoPromedio / rmMax : null,
    prMax: Math.max(...pesos),
    prMin: Math.min(...pesos),
    volMax: Math.max(...volumenes),
    volMin: Math.min(...volumenes),
    cantidadDias: topSets.length,
  };
}

export type PuntoSerie = { fecha: string; valor: number };

export function serieDeUnaRM(logs: SetLog[]): PuntoSerie[] {
  return topSetsPorDia(aSetsValidos(logs)).map((s) => ({
    fecha: s.dia,
    valor: Math.round(epley(s.peso, s.reps) * 10) / 10,
  }));
}

export function serieDeVolumen(logs: SetLog[]): PuntoSerie[] {
  return topSetsPorDia(aSetsValidos(logs)).map((s) => ({
    fecha: s.dia,
    valor: s.peso * s.reps,
  }));
}

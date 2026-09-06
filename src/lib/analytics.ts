// Réplica de la lógica de la hoja "FORMULAS DB" del Excel original,
// adaptada a registros libres (con fecha) en vez de la grilla fija de
// 12 semanas. Ver plan / memoria del proyecto para el detalle de cada
// fórmula y su origen.

export type SetLog = {
  peso: number | null;
  reps: number | null;
  created_at: string;
};

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
  cantidadSets: number;
};

function epley(peso: number, reps: number) {
  return peso * (1 + reps / 30);
}

export function calcularEstadisticasEjercicio(logs: SetLog[]): EstadisticasEjercicio {
  const validos = logs.filter(
    (l) => l.peso !== null && l.reps !== null && l.peso > 0 && l.reps > 0
  ) as { peso: number; reps: number; created_at: string }[];

  if (validos.length === 0) {
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
      cantidadSets: 0,
    };
  }

  const estimaciones1RM = validos.map((s) => epley(s.peso, s.reps));
  const pesos = validos.map((s) => s.peso);
  const volumenes = validos.map((s) => s.peso * s.reps);

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
    cantidadSets: validos.length,
  };
}

export type PuntoSerie = { fecha: string; valor: number };

export function serieDeUnaRM(logs: SetLog[]): PuntoSerie[] {
  return logs
    .filter((l) => l.peso !== null && l.reps !== null && l.peso > 0 && l.reps > 0)
    .map((l) => ({
      fecha: l.created_at.slice(0, 10),
      valor: Math.round(epley(l.peso as number, l.reps as number) * 10) / 10,
    }));
}

export function serieDeVolumen(logs: SetLog[]): PuntoSerie[] {
  return logs
    .filter((l) => l.peso !== null && l.reps !== null)
    .map((l) => ({
      fecha: l.created_at.slice(0, 10),
      valor: (l.peso as number) * (l.reps as number),
    }));
}

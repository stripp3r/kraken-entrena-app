import { segundosEntreSeries, type TipoEsfuerzo } from "@/lib/descanso";
import type { GrupoMuscular } from "@/lib/grupos-musculares";

export type EjercicioBorrador = {
  exerciseDefinitionId: number;
  tipoEsfuerzo: TipoEsfuerzo;
  series: number;
  repsMin: number;
  repsMax: number;
  rirObjetivo: number;
};

export type DiaBorrador = {
  dia: string;
  gruposMusculares: GrupoMuscular[];
  ejercicios: EjercicioBorrador[];
};

export type PentagonoScores = {
  volumen: number;
  frecuencia: number;
  recuperacion: number;
  intensidad: number;
  sostenibilidad: number;
};

// Mapea linealmente un valor a 0-100, con clamp en los extremos. `desde` y
// `hasta` pueden ir en cualquier orden (ej. "más es peor" se expresa con
// desde > hasta).
function mapear(valor: number, desde: number, hasta: number): number {
  if (desde === hasta) return 50;
  const t = (valor - desde) / (hasta - desde);
  return Math.round(Math.min(1, Math.max(0, t)) * 100);
}

const seriesPorGrupo = (dias: DiaBorrador[]): Map<GrupoMuscular, number> => {
  const mapa = new Map<GrupoMuscular, number>();
  for (const dia of dias) {
    const seriesDelDia = dia.ejercicios.reduce((acc, e) => acc + e.series, 0);
    for (const grupo of dia.gruposMusculares) {
      mapa.set(grupo, (mapa.get(grupo) ?? 0) + seriesDelDia);
    }
  }
  return mapa;
};

const diasPorGrupo = (dias: DiaBorrador[]): Map<GrupoMuscular, number[]> => {
  const mapa = new Map<GrupoMuscular, number[]>();
  dias.forEach((dia, indice) => {
    for (const grupo of dia.gruposMusculares) {
      const lista = mapa.get(grupo) ?? [];
      lista.push(indice);
      mapa.set(grupo, lista);
    }
  });
  return mapa;
};

function calcularVolumen(dias: DiaBorrador[]): number {
  const porGrupo = [...seriesPorGrupo(dias).values()];
  if (porGrupo.length === 0) return 0;
  const promedio = porGrupo.reduce((a, b) => a + b, 0) / porGrupo.length;
  return mapear(promedio, 0, 30);
}

function calcularFrecuencia(dias: DiaBorrador[]): number {
  const porGrupo = [...diasPorGrupo(dias).values()].map((d) => d.length);
  if (porGrupo.length === 0) return 0;
  const promedio = porGrupo.reduce((a, b) => a + b, 0) / porGrupo.length;
  return mapear(promedio, 1, 4);
}

function calcularRecuperacion(dias: DiaBorrador[]): number {
  const gaps: number[] = [];
  for (const indices of diasPorGrupo(dias).values()) {
    if (indices.length < 2) continue;
    for (let i = 1; i < indices.length; i++) {
      gaps.push(indices[i] - indices[i - 1] - 1);
    }
  }
  // Nadie repite grupo muscular en la semana -> recuperación perfecta.
  if (gaps.length === 0) return 100;
  const promedio = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  return mapear(promedio, 0, 3);
}

function calcularIntensidad(dias: DiaBorrador[]): number {
  const ejercicios = dias.flatMap((d) => d.ejercicios);
  if (ejercicios.length === 0) return 0;
  const puntajes = ejercicios.map((e) => {
    const porRir = mapear(5 - e.rirObjetivo, 0, 5);
    const repsMedio = (e.repsMin + e.repsMax) / 2;
    const porReps = mapear(repsMedio, 20, 3);
    return (porRir + porReps) / 2;
  });
  return Math.round(puntajes.reduce((a, b) => a + b, 0) / puntajes.length);
}

function calcularSostenibilidad(dias: DiaBorrador[]): number {
  if (dias.length === 0) return 0;
  const minutosPorDia = dias.map((dia) =>
    dia.ejercicios.reduce(
      (acc, e) => acc + (e.series * (segundosEntreSeries(e.tipoEsfuerzo) + 45)) / 60,
      0
    )
  );
  const duracionPromedio = minutosPorDia.reduce((a, b) => a + b, 0) / minutosPorDia.length;
  const porDias = mapear(dias.length, 6, 3);
  const porDuracion = mapear(duracionPromedio, 90, 45);
  return Math.round((porDias + porDuracion) / 2);
}

export function calcularPentagono(dias: DiaBorrador[]): PentagonoScores {
  return {
    volumen: calcularVolumen(dias),
    frecuencia: calcularFrecuencia(dias),
    recuperacion: calcularRecuperacion(dias),
    intensidad: calcularIntensidad(dias),
    sostenibilidad: calcularSostenibilidad(dias),
  };
}

export function calcularVolumenPorGrupo(dias: DiaBorrador[]): { grupo: GrupoMuscular; series: number }[] {
  return [...seriesPorGrupo(dias).entries()]
    .map(([grupo, series]) => ({ grupo, series }))
    .sort((a, b) => b.series - a.series);
}

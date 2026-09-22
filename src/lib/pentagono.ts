import { segundosEntreSeries, type TipoEsfuerzo } from "@/lib/descanso";
import type { GrupoMuscular } from "@/lib/grupos-musculares";

export type EjercicioBorrador = {
  exerciseDefinitionId: number;
  tipoEsfuerzo: TipoEsfuerzo;
  series: number;
  repsMin: number;
  repsMax: number;
  rirObjetivo: number;
  // Grupos musculares del ejercicio, en orden de importancia real (viene de
  // exercise_definitions.grupos_musculares): el primero es el músculo
  // objetivo/principal, el resto son secundarios -- ver `pesoPorGrupo`.
  gruposMusculares: string[];
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

// Músculo objetivo de un ejercicio (primero del array) = crédito completo de
// la serie; secundarios (sinergistas) = media serie. Ej.: un press inclinado
// con mancuernas clasificado ['Pecho','Hombros','Tríceps'] le suma 1 serie
// entera a Pecho y media a Hombros y a Tríceps -- no una serie entera a los
// tres, que es lo que hacía el cálculo viejo (agrupaba por día, no por
// ejercicio) y disparaba números como "Hombros: 42 series/semana".
const PESO_PRINCIPAL = 1;
const PESO_SECUNDARIO = 0.5;

function pesoPorGrupo(gruposMusculares: string[]): [string, number][] {
  return gruposMusculares.map((grupo, i) => [grupo, i === 0 ? PESO_PRINCIPAL : PESO_SECUNDARIO]);
}

const seriesPorGrupo = (dias: DiaBorrador[]): Map<string, number> => {
  const mapa = new Map<string, number>();
  for (const dia of dias) {
    for (const ejercicio of dia.ejercicios) {
      for (const [grupo, peso] of pesoPorGrupo(ejercicio.gruposMusculares)) {
        mapa.set(grupo, (mapa.get(grupo) ?? 0) + ejercicio.series * peso);
      }
    }
  }
  return mapa;
};

// A diferencia del volumen, frecuencia/recuperación son "¿este grupo recibió
// estímulo ese día?" -- ahí no pesa si fue principal o secundario, cualquiera
// de los dos cuenta como estímulo real a efectos de cuánto descanso necesita.
const diasPorGrupo = (dias: DiaBorrador[]): Map<string, number[]> => {
  const mapa = new Map<string, number[]>();
  dias.forEach((dia, indice) => {
    const gruposDelDia = new Set<string>();
    for (const ejercicio of dia.ejercicios) {
      for (const grupo of ejercicio.gruposMusculares) gruposDelDia.add(grupo);
    }
    for (const grupo of gruposDelDia) {
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

export function calcularVolumenPorGrupo(dias: DiaBorrador[]): { grupo: string; series: number }[] {
  return [...seriesPorGrupo(dias).entries()]
    .map(([grupo, series]) => ({ grupo, series }))
    .sort((a, b) => b.series - a.series);
}

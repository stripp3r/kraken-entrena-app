import { segundosEntreSeries, type TipoEsfuerzo } from "@/lib/descanso";
import type { GrupoMuscular } from "@/lib/grupos-musculares";
import { landmarksDeGrupo } from "@/lib/volumen-landmarks";

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

// Cada grupo tiene su propia banda de volumen productivo (MEV-MAV, distinta
// para pecho que para bíceps -- ver src/lib/volumen-landmarks.ts). El MRV
// NO se usa acá como techo: es el límite de recuperación, altamente
// individual, y para la gran mayoría de los naturales acercarse al MRV
// tabulado ya es sobreentrenamiento, no la zona óptima. La zona defendible
// a nivel general es MEV-MAV, así que el score de cada grupo es piecewise:
// - por debajo del MEV: 0-50 (claramente subdosificado)
// - entre MEV y MAV: 50-100 (zona bien dosificada, el "sweet spot")
// - en o por encima del MAV: 100 (pasarse no suma puntos extra en este eje
//   -- volumen extra no es gratis, pero tampoco se penaliza acá)
function scorePorGrupo(series: number, mev: number, mav: number): number {
  if (series <= mev) return mapear(series, 0, mev) * 0.5;
  if (series <= mav) return 50 + mapear(series, mev, mav) * 0.5;
  return 100;
}

function calcularVolumen(dias: DiaBorrador[]): number {
  const porGrupo = [...seriesPorGrupo(dias).entries()];
  if (porGrupo.length === 0) return 0;
  const puntajes = porGrupo.map(([grupo, series]) => {
    const { mev, mav } = landmarksDeGrupo(grupo);
    return scorePorGrupo(series, mev, mav);
  });
  const promedio = puntajes.reduce((a, b) => a + b, 0) / puntajes.length;
  return Math.round(promedio);
}

function calcularFrecuencia(dias: DiaBorrador[]): number {
  const porGrupo = [...diasPorGrupo(dias).values()].map((d) => d.length);
  if (porGrupo.length === 0) return 0;
  const promedio = porGrupo.reduce((a, b) => a + b, 0) / porGrupo.length;
  return mapear(promedio, 1, 4);
}

function calcularRecuperacion(dias: DiaBorrador[]): number {
  const n = dias.length;
  if (n === 0) return 0;
  // `dias` es una lista de días de ENTRENO (Día A, B, C...), no de días de
  // calendario -- una Full Body de 3 días no se entrena 3 días seguidos,
  // se reparte en la semana (ej. lunes/miércoles/viernes). Para pasar de
  // "posición en la lista" a "días de calendario de descanso" asumimos que
  // los N días de entreno se reparten parejo en una semana de 7 días
  // (separación = 7/N). Sin esto, cualquier rutina Full Body daba 0 en este
  // eje -- tocaba todos los grupos en TODOS los días de la lista, y el
  // cálculo viejo interpretaba "todos los días de la lista" como "todos los
  // días de la semana sin descanso", que es literal para un split de 6-7
  // días pero incorrecto para uno de 3.
  const separacionDias = 7 / n;
  const gaps: number[] = [];
  for (const indices of diasPorGrupo(dias).values()) {
    if (indices.length < 2) continue;
    for (let i = 1; i < indices.length; i++) {
      gaps.push((indices[i] - indices[i - 1]) * separacionDias - 1);
    }
  }
  // Nadie repite grupo muscular en la semana -> recuperación perfecta.
  if (gaps.length === 0) return 100;
  const promedio = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  return mapear(promedio, 0, 3);
}

// Solo RIR (proximidad al fallo) -- no reps. Mezclar rango de reps acá
// confundía intensidad de ESFUERZO (lo que de verdad maneja el estímulo de
// hipertrofia) con intensidad de CARGA (%1RM): reps bajas no dan más
// hipertrofia que reps altas si el esfuerzo está igualado, son proxies de
// cosas distintas (RIR -> hipertrofia, rango de reps -> sesgo a fuerza).
function calcularIntensidad(dias: DiaBorrador[]): number {
  const ejercicios = dias.flatMap((d) => d.ejercicios);
  if (ejercicios.length === 0) return 0;
  const puntajes = ejercicios.map((e) => mapear(5 - e.rirObjetivo, 0, 5));
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

export function calcularVolumenPorGrupo(
  dias: DiaBorrador[]
): { grupo: string; series: number; mev: number; mav: number; mrv: number }[] {
  return [...seriesPorGrupo(dias).entries()]
    .map(([grupo, series]) => ({ grupo, series, ...landmarksDeGrupo(grupo) }))
    .sort((a, b) => b.series / b.mav - a.series / a.mav);
}

export function calcularFrecuenciaPorGrupo(dias: DiaBorrador[]): { grupo: string; vecesPorSemana: number }[] {
  return [...diasPorGrupo(dias).entries()]
    .map(([grupo, indices]) => ({ grupo, vecesPorSemana: indices.length }))
    .sort((a, b) => b.vecesPorSemana - a.vecesPorSemana);
}

// `diasDescanso: null` = el grupo no se repite en la semana -- no hay gap
// que promediar, y es la mejor recuperación posible (cada estímulo tiene
// toda la semana para asentarse).
export function calcularRecuperacionPorGrupo(
  dias: DiaBorrador[]
): { grupo: string; diasDescanso: number | null }[] {
  const n = dias.length;
  const separacionDias = n > 0 ? 7 / n : 0;
  const resultado: { grupo: string; diasDescanso: number | null }[] = [];
  for (const [grupo, indices] of diasPorGrupo(dias).entries()) {
    if (indices.length < 2) {
      resultado.push({ grupo, diasDescanso: null });
      continue;
    }
    const gaps: number[] = [];
    for (let i = 1; i < indices.length; i++) {
      gaps.push((indices[i] - indices[i - 1]) * separacionDias - 1);
    }
    const promedio = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    resultado.push({ grupo, diasDescanso: Math.round(promedio * 10) / 10 });
  }
  return resultado.sort((a, b) => (a.diasDescanso ?? 99) - (b.diasDescanso ?? 99));
}

// Intensidad y Sostenibilidad no son "por grupo muscular" (no hay un RIR ni
// una duración por músculo) -- son del programa completo, así que acá el
// desglose que tiene sentido es por día, no por grupo.
export function calcularIntensidadPorDia(dias: DiaBorrador[]): { dia: string; rirPromedio: number }[] {
  return dias
    .filter((d) => d.ejercicios.length > 0)
    .map((d) => ({
      dia: d.dia,
      rirPromedio:
        Math.round((d.ejercicios.reduce((a, e) => a + e.rirObjetivo, 0) / d.ejercicios.length) * 10) / 10,
    }));
}

export function calcularSostenibilidadPorDia(dias: DiaBorrador[]): { dia: string; minutos: number }[] {
  return dias
    .filter((d) => d.ejercicios.length > 0)
    .map((d) => ({
      dia: d.dia,
      minutos: Math.round(
        d.ejercicios.reduce((acc, e) => acc + (e.series * (segundosEntreSeries(e.tipoEsfuerzo) + 45)) / 60, 0)
      ),
    }));
}

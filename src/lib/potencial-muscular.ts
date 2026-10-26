// Potencial muscular natural ESTIMADO a partir del esqueleto (altura, contorno de muñeca y de tobillo) y del
// porcentaje de grasa. Modelo de Casey Butt (libro "Your Muscular Potential", 4.ª edición, 2009).
//
// Las constantes salen de una implementación pública de la fórmula de la 4.ª edición
// (bonytobeastly.com/maximum-muscular-potential-calculator, verificada el 2026-10-26); NO se pudieron cotejar
// contra el libro. Control cruzado: con el ejemplo de esa misma página (6'2" y muñeca de 6,75 pulgadas) el brazo
// máximo da 16 pulgadas, que coincide con lo que dice la página.
//
// Es una ESTIMACIÓN: el modelo se armó con datos de atletas masculinos de élite del siglo pasado, es un promedio
// de lo que logran personas bien dotadas y no un techo, y no contempla genética muscular, hormonas ni años de
// entrenamiento. Una cifra más exacta requiere más análisis (composición corporal por DEXA, antropometría
// completa; el modelo de Fran Holway de relación músculo/hueso, por ejemplo, necesita DEXA).
// Funciones puras, en unidades métricas (cm / kg); internamente se trabaja en pulgadas y libras como el original.

const CM_POR_PULGADA = 2.54;
const KG_POR_LIBRA = 1 / 2.20462;

export type EntradaPotencial = {
  alturaCm: number;
  munecaCm: number;
  tobilloCm: number;
  grasaPct: number; // porcentaje de grasa al que se quiere estimar (el modelo es válido de 4 % a 12 %)
};

export type Rango = { valor: number; min: number; max: number };

export type PotencialMuscular = {
  masaMagraKg: number;
  pesoKg: Rango;
  cuelloCm: Rango;
  pechoCm: Rango;
  bicepsCm: Rango;
  antebrazoCm: Rango;
  muslosCm: Rango;
  gemelosCm: Rango;
};

const redondear = (n: number) => Math.round(n * 10) / 10;

function rango(valor: number, bajo: number, alto: number): Rango {
  return { valor: redondear(valor), min: redondear(valor * bajo), max: redondear(valor * alto) };
}

export function datosValidos(e: EntradaPotencial): boolean {
  return [e.alturaCm, e.munecaCm, e.tobilloCm, e.grasaPct].every((n) => Number.isFinite(n) && n > 0) && e.grasaPct < 40;
}

export function potencialMuscular(e: EntradaPotencial): PotencialMuscular {
  const altura = e.alturaCm / CM_POR_PULGADA;
  const muneca = e.munecaCm / CM_POR_PULGADA;
  const tobillo = e.tobilloCm / CM_POR_PULGADA;
  const gc = e.grasaPct;

  // Masa magra máxima (libras) y peso corporal a ese porcentaje de grasa.
  const masaMagraLb = altura * (muneca / 7.2546 + tobillo / 5.9772) * (gc / 450 + 1);
  const pesoLb = (masaMagraLb / (100 - gc)) * 100;

  // Perímetros máximos (pulgadas): cada uno depende de la muñeca o del tobillo y del porcentaje de grasa.
  const cuello = 2.2574 * muneca * (gc / 340 + 1);
  const pecho = 6.3138 * muneca * (gc / 340 + 1);
  const biceps = 2.3008 * muneca * (gc / 265 + 1);
  const antebrazo = 1.8514 * muneca * (gc / 340 + 1);
  const muslos = 2.6785 * tobillo * (gc / 190 + 1);
  const gemelos = 1.778 * tobillo * (gc / 210 + 1);

  const cm = (pulgadas: number) => pulgadas * CM_POR_PULGADA;
  return {
    masaMagraKg: redondear(masaMagraLb * KG_POR_LIBRA),
    pesoKg: rango(pesoLb * KG_POR_LIBRA, 0.95, 1.024),
    cuelloCm: rango(cm(cuello), 0.95, 1.034),
    pechoCm: rango(cm(pecho), 0.95, 1.01),
    bicepsCm: rango(cm(biceps), 0.95, 1.022),
    antebrazoCm: rango(cm(antebrazo), 0.95, 1.038),
    muslosCm: rango(cm(muslos), 0.95, 1.01),
    gemelosCm: rango(cm(gemelos), 0.95, 1.031),
  };
}

/** Porcentaje del potencial que ya se alcanzó con una medida actual (0 a 100+, con 1 decimal). */
export function porcentajeAlcanzado(actual: number | null | undefined, potencial: number): number | null {
  if (!actual || actual <= 0 || potencial <= 0) return null;
  return redondear((actual / potencial) * 100);
}

// ---------------------------------------------------------------------------------------------------------------
// Otros dos enfoques para comparar (todos son ESTIMACIONES, ver el aviso de arriba).
// ---------------------------------------------------------------------------------------------------------------

// Índice de masa libre de grasa (FFMI) normalizado, Kouri et al. 1995 (Clin J Sport Med):
//   FFMI = masa magra (kg) / altura(m)^2 + 6,1 × (1,8 − altura(m))
// El valor 25 es la referencia de límite natural más citada, pero se han reportado valores mayores en personas naturales.
export const FFMI_REFERENCIA = 25;

export type EntradaFfmi = { alturaCm: number; pesoKg: number; grasaPct: number };
export type ResultadoFfmi = {
  masaMagraActualKg: number;
  ffmiActual: number;
  masaMagraMaxKg: number; // masa magra con FFMI = 25
  pesoMaxKg: number; // con el mismo % de grasa actual
  kgPorGanar: number; // masa magra que falta para llegar a 25 (0 si ya lo alcanzó)
  porcentaje: number; // FFMI actual / 25
};

export function datosFfmiValidos(e: EntradaFfmi): boolean {
  return [e.alturaCm, e.pesoKg, e.grasaPct].every((n) => Number.isFinite(n) && n > 0) && e.grasaPct < 60 && e.alturaCm > 100 && e.alturaCm < 250;
}

export function ffmiPotencial(e: EntradaFfmi): ResultadoFfmi {
  const h = e.alturaCm / 100;
  const masaMagra = e.pesoKg * (1 - e.grasaPct / 100);
  const ffmiActual = masaMagra / (h * h) + 6.1 * (1.8 - h);
  const masaMagraMax = (FFMI_REFERENCIA - 6.1 * (1.8 - h)) * h * h;
  return {
    masaMagraActualKg: redondear(masaMagra),
    ffmiActual: redondear(ffmiActual),
    masaMagraMaxKg: redondear(masaMagraMax),
    pesoMaxKg: redondear(masaMagraMax / (1 - e.grasaPct / 100)),
    kgPorGanar: redondear(Math.max(0, masaMagraMax - masaMagra)),
    porcentaje: redondear((ffmiActual / FFMI_REFERENCIA) * 100),
  };
}

// Regla de Martin Berkhan (Leangains): el peso en definición extrema es aproximadamente la altura en cm menos 100 (en kg);
// el propio autor sugiere sumar entre 5 y 10 libras (2,3 a 4,5 kg) para el peso de todos los días. Es muy burda: no mira el esqueleto.
export type ResultadoBerkhan = {
  pesoDefinicionKg: number;
  pesoCotidianoMinKg: number;
  pesoCotidianoMaxKg: number;
};

export function berkhan(alturaCm: number): ResultadoBerkhan {
  const base = alturaCm - 100;
  return { pesoDefinicionKg: redondear(base), pesoCotidianoMinKg: redondear(base + 2.3), pesoCotidianoMaxKg: redondear(base + 4.5) };
}

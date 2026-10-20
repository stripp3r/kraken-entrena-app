// Conteo de repeticiones por PERIODICIDAD (reemplaza al contador por umbrales fijos).
//
// Una serie es un movimiento que se repite: la señal de una articulación sube y baja
// con un ritmo parejo. En vez de exigir una amplitud fija (que falla en ejercicios de
// poco recorrido, como un pushdown de tríceps), se miden los PICOS de la señal con una
// prominencia relativa a su propio rango, y se toma la corrida más larga de picos
// parejos (el resto son movimientos de acomodarse antes o después de la serie).
// Se validó repitiendo series reales guardadas (pose_sesiones_prueba).
//
// Todo son funciones puras sobre números: sin cámara, probables en una computadora.

export const HZ = 10; // las señales se muestrean a 10 Hz (una muestra cada 100 ms)

export type Pico = { i: number; t: number; prom: number; v: number };

export function suavizar(x: (number | null)[], ventana = 2): (number | null)[] {
  return x.map((_, i) => {
    let suma = 0;
    let n = 0;
    for (let j = Math.max(0, i - ventana); j <= Math.min(x.length - 1, i + ventana); j++) {
      const v = x[j];
      if (v !== null) {
        suma += v;
        n++;
      }
    }
    return n ? suma / n : null;
  });
}

const percentil = (valores: number[], p: number) => {
  const s = [...valores].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(p * s.length))];
};
const mediana = (a: number[]) => {
  const s = [...a].sort((x, y) => x - y);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

/** Picos con prominencia >= `prom` y separados al menos `dist` muestras (signo -1 busca valles). */
export function encontrarPicos(x: (number | null)[], prom: number, dist: number, signo: 1 | -1 = 1): Pico[] {
  const y = x.map((v) => (v === null ? null : signo * v));
  const candidatos: Pico[] = [];
  for (let i = 1; i < y.length - 1; i++) {
    const c = y[i];
    if (c === null || y[i - 1] === null || y[i + 1] === null) continue;
    if (!(c >= (y[i - 1] as number) && c > (y[i + 1] as number))) continue;
    let minIzq = c;
    for (let j = i - 1; j >= 0 && (y[j] === null || (y[j] as number) <= c); j--) if (y[j] !== null) minIzq = Math.min(minIzq, y[j] as number);
    let minDer = c;
    for (let j = i + 1; j < y.length && (y[j] === null || (y[j] as number) <= c); j++) if (y[j] !== null) minDer = Math.min(minDer, y[j] as number);
    const p = c - Math.max(minIzq, minDer);
    if (p >= prom) candidatos.push({ i, t: i / HZ, prom: p, v: signo * c });
  }
  candidatos.sort((a, b) => b.prom - a.prom);
  const elegidos: Pico[] = [];
  for (const c of candidatos) if (elegidos.every((e) => Math.abs(e.i - c.i) >= dist)) elegidos.push(c);
  return elegidos.sort((a, b) => a.i - b.i);
}

/** La corrida más larga de picos parejos (ritmo y prominencia parecidos). */
export function corridaPrincipal(picos: Pico[], maxGap = 1.8, minGap = 0.5): Pico[] {
  if (picos.length < 3) return [];
  const medProm = mediana(picos.map((p) => p.prom));
  const fuertes = picos.filter((p) => p.prom >= 0.55 * medProm);
  if (fuertes.length < 3) return [];
  const m = mediana(fuertes.slice(1).map((p, k) => p.t - fuertes[k].t));
  let mejor: Pico[] = [];
  let actual: Pico[] = [fuertes[0]];
  for (let k = 1; k < fuertes.length; k++) {
    const gap = fuertes[k].t - fuertes[k - 1].t;
    if (gap > maxGap * m || gap < minGap * m) {
      if (actual.length > mejor.length) mejor = actual;
      actual = [fuertes[k]];
    } else actual.push(fuertes[k]);
  }
  return actual.length > mejor.length ? actual : mejor;
}

export type ConteoSenal = {
  n: number;
  valido: boolean; // >= 4 picos con ritmo parejo
  rango: number; // rango robusto de la señal (p95 - p5)
  cv: number; // variación del intervalo entre picos (0 = perfectamente parejo)
  cvProm: number; // variación de la amplitud de los picos (0 = todas iguales)
  intervaloS: number; // intervalo típico entre repeticiones, en segundos
  picos: Pico[];
};

const VACIO: ConteoSenal = { n: 0, valido: false, rango: 0, cv: 1, cvProm: 1, intervaloS: 0, picos: [] };

/** Cuenta las repeticiones de UNA señal (muestras a 10 Hz; -1 = no visible). `piso` = rango mínimo para ser movimiento y no temblor. */
export function contarSenal(serie: number[], piso: number): ConteoSenal {
  const x = serie.map((v) => (v === -1 ? null : v));
  const s = suavizar(x, 2);
  const val = s.filter((v): v is number => v !== null);
  if (val.length < 25) return VACIO;
  const rango = percentil(val, 0.95) - percentil(val, 0.05);
  if (rango < piso) return { ...VACIO, rango };
  const dist = Math.round(0.6 * HZ);
  const picos = corridaPrincipal(encontrarPicos(s, 0.35 * rango, dist, 1));
  const valles = corridaPrincipal(encontrarPicos(s, 0.35 * rango, dist, -1));
  if (picos.length < 3 && valles.length < 3) return { ...VACIO, rango, n: Math.max(picos.length, valles.length), picos };
  // Corrección de bordes: cada repetición tiene un pico Y un valle, pero el REPOSO del principio y del
  // final de la serie (la persona está quieta antes y después) puede sumar o restar uno en el lado en
  // que se queda quieta. Se cuenta el lado de la EXCURSIÓN (el opuesto al reposo): si el reposo está
  // arriba se cuentan los valles; si está abajo, los picos; si no se sabe, el menor de los dos.
  const seg = Math.round(1.0 * HZ);
  const reposo = [...s.slice(0, seg), ...s.slice(-seg)].filter((v): v is number => v !== null);
  const bajo = percentil(val, 0.05);
  const q = reposo.length ? (mediana(reposo) - bajo) / rango : 0.5;
  const nP = picos.length;
  const nV = valles.length;
  let n: number;
  // Solo si la quietud es limpia (casi sin variación) se confía en de qué lado está el reposo; con un reposo
  // movido (lo habitual en series reales) se toma el menor de los dos conteos.
  const mr = reposo.length ? reposo.reduce((a, v) => a + v, 0) / reposo.length : 0;
  const desvio = reposo.length ? Math.sqrt(reposo.reduce((a, v) => a + (v - mr) ** 2, 0) / reposo.length) : rango;
  const reposoLimpio = reposo.length >= seg && desvio < 0.05 * rango;
  if (nP >= 3 && nV >= 3) n = reposoLimpio && q > 0.65 ? nV : reposoLimpio && q < 0.35 ? nP : Math.min(nP, nV);
  else n = Math.max(nP, nV);
  const guia = picos.length >= 3 ? picos : valles;
  const iv = guia.slice(1).map((p, k) => p.t - guia[k].t);
  const m = iv.reduce((a, b) => a + b, 0) / iv.length;
  const cv = iv.length > 1 ? Math.sqrt(iv.reduce((a, b) => a + (b - m) ** 2, 0) / iv.length) / m : 1;
  const proms = guia.map((p) => p.prom);
  const mp = proms.reduce((a, b) => a + b, 0) / proms.length;
  const cvProm = Math.sqrt(proms.reduce((a, b) => a + (b - mp) ** 2, 0) / proms.length) / mp;
  // Una corrida corta (4 a 6) puede salir por casualidad de un movimiento desordenado (gesticular, acomodar
  // las pesas): solo vale si es MUY pareja en ritmo y amplitud. Desde 7 repeticiones alcanza con ritmo parejo.
  const valido = n >= 4 && cv < 0.45 && (n >= 7 || (cv < 0.22 && cvProm < 0.3));
  return { n, valido, rango, cv, cvProm, intervaloS: m, picos: guia };
}

// ---- Resumen de calidad de la serie (rango, ritmo): todo sale de los mismos picos ----

export type CalidadSerie = {
  rangoIncompleto: boolean; // las últimas repeticiones recorren bastante menos que las primeras
  caidaRango: number; // 0..1: cuánto menos recorren las últimas respecto de las primeras
  enlentecimiento: number; // >1: las últimas repeticiones tardan más que las primeras
  tempoRapido: number; // cantidad de repeticiones muy rápidas (< 1 s)
  rirEstimado: number | null; // estimación (prueba) a partir del enlentecimiento; null si no hay datos
};

export function calidadDeSerie(picos: Pico[]): CalidadSerie {
  const sin: CalidadSerie = { rangoIncompleto: false, caidaRango: 0, enlentecimiento: 1, tempoRapido: 0, rirEstimado: null };
  if (picos.length < 5) return sin;
  const proms = picos.map((p) => p.prom);
  const prim = proms.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
  const ult = proms.slice(-3).reduce((a, b) => a + b, 0) / 3;
  const caidaRango = prim > 0 ? Math.max(0, 1 - ult / prim) : 0;
  const iv = picos.slice(1).map((p, k) => p.t - picos[k].t);
  const rapidas = iv.filter((d) => d < 1).length;
  const ivPrim = iv.slice(0, 3).reduce((a, b) => a + b, 0) / Math.min(3, iv.length);
  const ivUlt = iv.slice(-2).reduce((a, b) => a + b, 0) / Math.min(2, iv.length);
  const enlentecimiento = ivPrim > 0 ? ivUlt / ivPrim : 1;
  // Estimación orientativa: cuanto más se enlentece el final de la serie, más cerca del fallo.
  const rir = enlentecimiento >= 1.5 ? 0 : enlentecimiento >= 1.3 ? 1 : enlentecimiento >= 1.15 ? 2 : enlentecimiento >= 1.05 ? 3 : null;
  return { rangoIncompleto: caidaRango >= 0.3, caidaRango, enlentecimiento, tempoRapido: rapidas, rirEstimado: rir };
}

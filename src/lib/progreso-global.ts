import { epley } from "./analytics";
import { factorPesoCorporal, type ModalidadCarga } from "./carga";
import { fechaISO } from "./fecha";
import { pesoPorGrupo } from "./pentagono";
import { adaptarPesoCorporal, type LogSerie } from "./progreso-simple";
import { LEVANTAMIENTO_DE, nivelDeFuerza, type NivelFuerza, type Sexo } from "./estandares-fuerza";

// Panel global de progreso (prototipo, 2026-10-20). Responde tres preguntas sin pensar:
//   ¿progresé? (fuerza total, récords, mis levantamientos con nivel), ¿cómo voy de constancia?
//   (calendario) y ¿estoy equilibrado? (empuje/tracción, arriba/abajo). Funciones puras: se prueban con números.

export type LogCrudo = LogSerie & { lastre?: number | null; peso_corporal_ref?: number | null };

export type EjercicioGlobal = {
  id: number;
  nombre: string;
  grupos: string[];
  modalidad: ModalidadCarga;
  logs: LogCrudo[];
};

export type Sesion = { fecha: string; valor: number; peso: number | null; reps: number; lastre: number | null };

const dia = (iso: string) => fechaISO(new Date(iso));
const lunesDe = (fecha: string) => {
  const d = new Date(`${fecha}T12:00:00Z`);
  const dow = (d.getUTCDay() + 6) % 7; // lunes = 0
  d.setUTCDate(d.getUTCDate() - dow);
  return d.toISOString().slice(0, 10);
};
const sumarDias = (fecha: string, n: number) => {
  const d = new Date(`${fecha}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const diasEntre = (a: string, b: string) => Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 86_400_000);

// ---------- Sesiones por ejercicio ----------

/**
 * Una "fuerza" por entreno de cada ejercicio, comparable entre días:
 *  - con peso: el mayor 1RM estimado (Epley) de las series (las bajadas de un drop set no cuentan);
 *  - peso corporal: lo mismo sobre cuerpo+lastre con el cuerpo fijo (ver adaptarPesoCorporal), o repeticiones si nunca hubo lastre;
 *  - banda y tiempo: repeticiones.
 */
export function sesionesDe(ej: EjercicioGlobal): Sesion[] {
  let logs: LogSerie[] = ej.logs;
  if (ej.modalidad === "peso_corporal") logs = adaptarPesoCorporal(ej.logs, factorPesoCorporal(ej.id)).logs;
  else if (ej.modalidad !== "con_peso") logs = ej.logs.map((l) => ({ ...l, peso: null }));
  const crudoPorId = new Map(ej.logs.map((l) => [l.id, l]));
  const porDia = new Map<string, Sesion>();
  for (const l of logs) {
    if (l.tipo_serie === "drop" || !l.reps || l.reps <= 0) continue;
    const f = dia(l.created_at);
    const conPeso = l.peso !== null && l.peso > 0;
    const valor = conPeso ? epley(l.peso as number, Math.min(l.reps, 15)) : l.reps;
    const previa = porDia.get(f);
    if (!previa || valor > previa.valor) {
      porDia.set(f, { fecha: f, valor, peso: conPeso ? (l.peso as number) : null, reps: l.reps, lastre: crudoPorId.get(l.id)?.lastre ?? null });
    }
  }
  return [...porDia.values()].sort((a, b) => a.fecha.localeCompare(b.fecha));
}

// ---------- Fuerza total (índice encadenado) ----------

export type PuntoIndice = { semana: string; indice: number };
export type FuerzaTotal = {
  serie: PuntoIndice[]; // base 100 = cuando empezó
  cambioTotal: number; // % desde el inicio
  cambioUltimas8: number; // % en las últimas 8 semanas
  ritmoUltimas8: number; // % por mes en las últimas 8 semanas
  ritmoAntes: number; // % por mes en todo lo anterior
  ejerciciosSuben: number;
  ejerciciosTotal: number;
};

/**
 * Promedio de cuánto cambió la fuerza de los ejercicios que se entrenaron cada semana, encadenado
 * semana a semana (así un ejercicio nuevo no hace saltar el número). Base 100 al empezar.
 */
export function fuerzaTotal(ejercicios: EjercicioGlobal[], hoy: string): FuerzaTotal | null {
  const sesiones = ejercicios.map((e) => ({ e, s: sesionesDe(e) })).filter((x) => x.s.length >= 2);
  if (sesiones.length === 0) return null;
  // Para cada ejercicio, el valor máximo por semana y contra qué se compara (la sesión anterior).
  const cambiosPorSemana = new Map<string, number[]>();
  for (const { s } of sesiones) {
    const porSemana = new Map<string, number>();
    for (const x of s) {
      const w = lunesDe(x.fecha);
      porSemana.set(w, Math.max(porSemana.get(w) ?? 0, x.valor));
    }
    const semanas = [...porSemana.keys()].sort();
    for (let i = 1; i < semanas.length; i++) {
      const r = Math.max(0.7, Math.min(1.4, (porSemana.get(semanas[i]) as number) / (porSemana.get(semanas[i - 1]) as number)));
      (cambiosPorSemana.get(semanas[i]) ?? cambiosPorSemana.set(semanas[i], []).get(semanas[i])!).push(r);
    }
  }
  const semanasOrden = [...cambiosPorSemana.keys()].sort();
  if (semanasOrden.length === 0) return null;
  const primera = semanasOrden[0];
  const serie: PuntoIndice[] = [{ semana: sumarDias(primera, -7), indice: 100 }];
  let acum = 100;
  for (const w of semanasOrden) {
    const rs = cambiosPorSemana.get(w) as number[];
    acum *= rs.reduce((a, b) => a + b, 0) / rs.length;
    serie.push({ semana: w, indice: Math.round(acum * 10) / 10 });
  }
  const ultimo = serie[serie.length - 1].indice;
  const corte = sumarDias(hoy, -56);
  const antes = [...serie].filter((p) => p.semana <= corte).pop() ?? serie[0];
  const meses = (a: string, b: string) => Math.max(1 / 4, diasEntre(a, b) / 30);
  const cambioUltimas8 = antes.indice > 0 ? (ultimo / antes.indice - 1) * 100 : 0;
  const ritmoUltimas8 = cambioUltimas8 / meses(antes.semana, serie[serie.length - 1].semana);
  const cambioAntes = antes.indice / 100 - 1;
  const ritmoAntes = (cambioAntes * 100) / meses(serie[0].semana, antes.semana);
  const suben = sesiones.filter(({ s }) => {
    const n = Math.min(3, Math.floor(s.length / 2));
    const ini = s.slice(0, n).reduce((a, x) => a + x.valor, 0) / n;
    const fin = s.slice(-n).reduce((a, x) => a + x.valor, 0) / n;
    return fin > ini * 1.015;
  }).length;
  return { serie, cambioTotal: ultimo - 100, cambioUltimas8, ritmoUltimas8, ritmoAntes: antes === serie[0] ? ritmoUltimas8 : ritmoAntes, ejerciciosSuben: suben, ejerciciosTotal: sesiones.length };
}

export function veredicto(f: FuerzaTotal | null): { titulo: string; tono: "bien" | "estable" | "atencion"; detalle: string } {
  if (!f) return { titulo: "Todavía hay pocos datos", tono: "estable", detalle: "Con 2 o 3 entrenos de cada ejercicio ya te puedo decir cómo vas." };
  const c = f.cambioUltimas8;
  if (c >= 2) return { titulo: "¡Venís mejorando!", tono: "bien", detalle: `Estás más fuerte que hace 2 meses. ${f.ejerciciosSuben} de ${f.ejerciciosTotal} ejercicios subieron.` };
  if (c <= -3) return { titulo: "Bajaste un poco", tono: "atencion", detalle: "Tu fuerza está algo por debajo de hace 2 meses. Puede ser cansancio, un mal momento o pocos entrenos." };
  return { titulo: "Estás sosteniendo", tono: "estable", detalle: "Tu fuerza se mantiene igual que hace 2 meses. Para quien lleva tiempo entrenando, sostener ya es un logro." };
}

/** Frase sobre el ritmo propio, sin inventar una curva "esperable" (no hay una publicada confiable). */
export function fraseRitmo(f: FuerzaTotal): string {
  const antes = f.ritmoAntes;
  const ahora = f.ritmoUltimas8;
  const fmt = (n: number) => `${n >= 0 ? "+" : "−"}${Math.abs(n).toFixed(1).replace(".", ",")} %`;
  if (antes > 1 && ahora < antes * 0.6) return `Tu ritmo bajó de ${fmt(antes)} a ${fmt(ahora)} por mes. Es normal: cuanto más fuerte sos, más lento se sube.`;
  if (ahora > antes * 1.2 && ahora > 0.5) return `Tu ritmo subió: ${fmt(ahora)} por mes, más que antes (${fmt(antes)}).`;
  return `Tu ritmo: ${fmt(ahora)} por mes en los últimos 2 meses.`;
}

// ---------- Récords ----------

export type Record_ = { ejercicio: string; texto: string; fecha: string };

function textoSesion(ej: EjercicioGlobal, s: Sesion): string {
  if (ej.modalidad === "con_peso") return `${String(Math.round(s.peso as number * 10) / 10).replace(".", ",")} kg × ${s.reps}`;
  if (ej.modalidad === "peso_corporal") return s.lastre ? `${s.reps} reps con ${String(s.lastre).replace(".", ",")} kg de lastre` : `${s.reps} repeticiones`;
  return `${s.reps} repeticiones`;
}

/** Ejercicios en los que se superó el mejor valor anterior en los últimos `dias` días. */
export function recordes(ejercicios: EjercicioGlobal[], hoy: string, dias = 30): Record_[] {
  const desde = sumarDias(hoy, -dias);
  const out: Record_[] = [];
  for (const e of ejercicios) {
    const s = sesionesDe(e);
    let mejor = 0;
    let ultimo: Sesion | null = null;
    s.forEach((x, i) => {
      if (i > 0 && x.valor > mejor * 1.005 && x.fecha >= desde) ultimo = x;
      mejor = Math.max(mejor, x.valor);
    });
    if (ultimo) out.push({ ejercicio: e.nombre, texto: textoSesion(e, ultimo), fecha: (ultimo as Sesion).fecha });
  }
  return out.sort((a, b) => b.fecha.localeCompare(a.fecha));
}

// ---------- Mis levantamientos (con nivel) ----------

export type Levantamiento3 = {
  id: number;
  nombre: string;
  serie: number[]; // fuerza por entreno (últimos 12)
  cambio: number; // % entre los primeros y los últimos 3 entrenos
  mejor: string; // texto del mejor entreno
  nivel: (NivelFuerza & { unoRM: number }) | null;
};

/** Los 3 ejercicios con más historial (o los que se fijen), con su evolución y, si hay tabla, su nivel. */
export function misLevantamientos(
  ejercicios: EjercicioGlobal[],
  perfil: { sexo: Sexo | null; pesoCorporal: number | null },
  hoy: string,
  cuantos = 3
): Levantamiento3[] {
  const candidatos = ejercicios
    .map((e) => ({ e, s: sesionesDe(e) }))
    .filter((x) => x.s.length >= 3)
    .sort((a, b) => {
      // Primero los que tienen tabla de niveles y más entrenos, después el resto por cantidad de entrenos.
      const ta = LEVANTAMIENTO_DE[a.e.id] ? 1 : 0;
      const tb = LEVANTAMIENTO_DE[b.e.id] ? 1 : 0;
      return tb - ta || b.s.length - a.s.length;
    })
    .slice(0, cuantos);
  const desde = sumarDias(hoy, -56);
  return candidatos.map(({ e, s }) => {
    const n = Math.min(3, Math.floor(s.length / 2));
    const ini = s.slice(0, n).reduce((a, x) => a + x.valor, 0) / n;
    const fin = s.slice(-n).reduce((a, x) => a + x.valor, 0) / n;
    const mejorSesion = s.reduce((m, x) => (x.valor > m.valor ? x : m), s[0]);
    const lev = LEVANTAMIENTO_DE[e.id];
    let nivel: Levantamiento3["nivel"] = null;
    if (lev && perfil.sexo && perfil.pesoCorporal && e.modalidad === "con_peso") {
      const reciente = Math.max(...s.filter((x) => x.fecha >= desde).map((x) => x.valor), 0) || fin;
      nivel = { ...nivelDeFuerza(perfil.sexo, lev, perfil.pesoCorporal, reciente), unoRM: Math.round(reciente) };
    }
    return { id: e.id, nombre: e.nombre, serie: s.slice(-12).map((x) => x.valor), cambio: ini > 0 ? (fin / ini - 1) * 100 : 0, mejor: textoSesion(e, mejorSesion), nivel };
  });
}

// ---------- Constancia (calendario) ----------

export type DiaCalendario = { fecha: string; series: number; nivel: 0 | 1 | 2 | 3; futuro: boolean };
export type Constancia = { semanas: DiaCalendario[][]; entrenosPorSemana: number; semanasSeguidas: number; entrenosEn12: number };

export function constancia(ejercicios: EjercicioGlobal[], hoy: string, semanas = 12): Constancia {
  const seriesPorDia = new Map<string, number>();
  for (const e of ejercicios) {
    for (const l of e.logs) {
      if (l.tipo_serie === "drop") continue;
      const f = dia(l.created_at);
      seriesPorDia.set(f, (seriesPorDia.get(f) ?? 0) + 1);
    }
  }
  const lunesActual = lunesDe(hoy);
  const inicio = sumarDias(lunesActual, -7 * (semanas - 1));
  const grid: DiaCalendario[][] = [];
  const porSemana: number[] = [];
  for (let w = 0; w < semanas; w++) {
    const col: DiaCalendario[] = [];
    let cuenta = 0;
    for (let d = 0; d < 7; d++) {
      const fecha = sumarDias(inicio, w * 7 + d);
      const series = seriesPorDia.get(fecha) ?? 0;
      if (series > 0) cuenta++;
      col.push({ fecha, series, nivel: series === 0 ? 0 : series < 8 ? 1 : series < 15 ? 2 : 3, futuro: fecha > hoy });
    }
    grid.push(col);
    porSemana.push(cuenta);
  }
  // Semanas seguidas (hacia atrás desde la última semana COMPLETA) con 3 o más entrenos.
  let seguidas = 0;
  for (let w = semanas - 2; w >= 0 && porSemana[w] >= 3; w--) seguidas++;
  if (porSemana[semanas - 1] >= 3) seguidas++;
  const ult4 = porSemana.slice(-5, -1);
  return { semanas: grid, entrenosPorSemana: ult4.length ? Math.round((ult4.reduce((a, b) => a + b, 0) / ult4.length) * 10) / 10 : 0, semanasSeguidas: seguidas, entrenosEn12: porSemana.reduce((a, b) => a + b, 0) };
}

// ---------- Equilibrio ----------

const EMPUJE = new Set(["Pecho", "Tríceps", "Hombros"]);
const TRACCION = new Set(["Espalda", "Bíceps", "Trapecio", "Antebrazos"]);
const INFERIOR = new Set(["Cuádriceps", "Isquiotibiales", "Glúteos", "Pantorrillas", "Abductores"]);

export type Equilibrio = {
  empuje: number; // % del trabajo de tren superior
  traccion: number;
  superior: number; // % del trabajo total
  inferior: number;
  series: number;
  nota: string | null;
};

/** Reparto de las series de los últimos 28 días (cada ejercicio reparte entre sus grupos como en pentagono.ts). */
export function equilibrio(ejercicios: EjercicioGlobal[], hoy: string): Equilibrio | null {
  const desde = sumarDias(hoy, -28);
  let empuje = 0, traccion = 0, inferior = 0, core = 0, total = 0;
  for (const e of ejercicios) {
    const series = e.logs.filter((l) => l.tipo_serie !== "drop" && dia(l.created_at) >= desde).length;
    if (!series) continue;
    for (const [g, peso] of pesoPorGrupo(e.grupos)) {
      const v = series * peso;
      total += v;
      if (EMPUJE.has(g)) empuje += v;
      else if (TRACCION.has(g)) traccion += v;
      else if (INFERIOR.has(g)) inferior += v;
      else core += v;
    }
  }
  const superiorTotal = empuje + traccion;
  if (total === 0 || superiorTotal === 0) return null;
  const pEmpuje = Math.round((empuje / superiorTotal) * 100);
  const pSuperior = Math.round(((superiorTotal) / total) * 100);
  const dif = pEmpuje - (100 - pEmpuje);
  const nota = dif >= 25 ? "Hacés bastante más empuje que tracción." : dif <= -25 ? "Hacés bastante más tracción que empuje." : null;
  void core;
  void inferior;
  return { empuje: pEmpuje, traccion: 100 - pEmpuje, superior: pSuperior, inferior: 100 - pSuperior, series: Math.round(total), nota };
}

// ---------- Resumen de la semana ----------

export type ResumenSemana = { titulo: string; detalle: string; entrenos: number; series: number; records: number };

/** La última semana COMPLETA (lunes a domingo) contra el promedio de las 4 anteriores. */
export function resumenSemanal(ejercicios: EjercicioGlobal[], hoy: string): ResumenSemana | null {
  const lunesActual = lunesDe(hoy);
  const ini = sumarDias(lunesActual, -7);
  const fin = sumarDias(lunesActual, -1);
  const diasConSeries = new Map<string, number>();
  for (const e of ejercicios) for (const l of e.logs) {
    if (l.tipo_serie === "drop") continue;
    const f = dia(l.created_at);
    diasConSeries.set(f, (diasConSeries.get(f) ?? 0) + 1);
  }
  const contar = (a: string, b: string) => {
    let entrenos = 0, series = 0;
    for (const [f, n] of diasConSeries) if (f >= a && f <= b) { entrenos++; series += n; }
    return { entrenos, series };
  };
  const ult = contar(ini, fin);
  if (ult.entrenos === 0 && diasConSeries.size === 0) return null;
  const previas = [1, 2, 3, 4].map((k) => contar(sumarDias(ini, -7 * k), sumarDias(fin, -7 * k)));
  const prom = previas.reduce((a, p) => a + p.series, 0) / 4;
  const records = recordes(ejercicios, fin, 7).filter((r) => r.fecha >= ini && r.fecha <= fin).length;
  const rel = prom > 0 ? ult.series / prom : 1;
  const titulo = ult.entrenos === 0 ? "Semana de descanso" : rel >= 1.1 ? "Semana fuerte" : rel >= 0.8 ? "Semana normal" : "Semana liviana";
  const partes = [`${ult.entrenos} ${ult.entrenos === 1 ? "entreno" : "entrenos"}`, `${ult.series} series`];
  if (records > 0) partes.push(`${records} ${records === 1 ? "récord" : "récords"}`);
  return { titulo, detalle: partes.join(" · "), entrenos: ult.entrenos, series: ult.series, records };
}

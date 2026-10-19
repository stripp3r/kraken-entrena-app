import { epley } from "./analytics";
import { fechaISO } from "./fecha";
import { pesoPorGrupo } from "./pentagono";
import { landmarksDeGrupo } from "./volumen-landmarks";

// "Tu progreso" en simple (prototipo, 2026-10-19). Tres preguntas por ejercicio:
// ¿mejoró, quedó estable o bajó? -- con UNA frase que dice por qué. Usa TODAS las
// series (no solo la mejor), cuenta como mejora una serie de más, suma las bajadas de
// los drop sets como trabajo y trata los ejercicios sin peso (abdominales, banda)
// por repeticiones. Funciones puras: se prueban con números, sin base ni teléfono.
//
// Cómo se compara (decisión a validar con el coach):
// - "Últimos entrenos": los últimos n entrenos de ESE ejercicio contra los n anteriores
//   (n = 3, o menos si hay pocos). Se usan promedios para que un mal día no marque "bajó".
// - "Desde que empezaste": los primeros n entrenos contra los últimos n.
// Mejora = sube la fuerza (mejor serie), el trabajo total o la cantidad de series. Una
// diferencia chica es "estable" (para quien lleva años, la curva se aplana, así que los
// umbrales son bajos: ~1,5% de fuerza, 4% de trabajo, 1 serie).

export type TipoSerie = "normal" | "dropset" | "drop";
export type LogSerie = {
  id: number;
  peso: number | null;
  reps: number | null;
  rir: number | null;
  tipo_serie: TipoSerie;
  drop_de: number | null;
  created_at: string;
};

export type SesionResumen = {
  fecha: string;
  series: number; // series principales (las bajadas no son series)
  conPeso: boolean;
  mejorPeso: number; // peso de la mejor serie (mayor fuerza estimada)
  mejorReps: number;
  mejorFuerza: number; // fuerza estimada de la mejor serie (Epley)
  trabajo: number; // suma peso x reps de TODAS las series (con bajadas); sin peso: suma de reps
  repsTotales: number;
};

export type EstadoEjercicio = "mejoro" | "estable" | "bajo" | "sin-datos";
export type ResultadoEjercicio = { estado: EstadoEjercicio; frase: string; entrenos: number };

const valido = (n: number | null): n is number => n !== null && n > 0;

export function resumirSesiones(logs: LogSerie[]): SesionResumen[] {
  const porDia = new Map<string, LogSerie[]>();
  for (const l of [...logs].sort((a, b) => a.created_at.localeCompare(b.created_at))) {
    if (!valido(l.reps)) continue;
    const dia = fechaISO(new Date(l.created_at));
    porDia.set(dia, [...(porDia.get(dia) ?? []), l]);
  }
  return [...porDia.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fecha, filas]) => {
      const principales = filas.filter((f) => f.tipo_serie !== "drop");
      const conPeso = principales.some((f) => valido(f.peso));
      let mejor = { peso: 0, reps: 0, fuerza: 0 };
      for (const f of principales) {
        if (conPeso && valido(f.peso)) {
          const fuerza = epley(f.peso, f.reps as number);
          if (fuerza > mejor.fuerza) mejor = { peso: f.peso, reps: f.reps as number, fuerza };
        } else if (!conPeso && (f.reps as number) > mejor.reps) mejor = { peso: 0, reps: f.reps as number, fuerza: f.reps as number };
      }
      const repsTotales = filas.reduce((a, f) => a + (f.reps as number), 0);
      const trabajo = conPeso ? filas.reduce((a, f) => a + (valido(f.peso) ? f.peso * (f.reps as number) : 0), 0) : repsTotales;
      return { fecha, series: principales.length, conPeso, mejorPeso: mejor.peso, mejorReps: mejor.reps, mejorFuerza: mejor.fuerza, trabajo, repsTotales };
    });
}

const promedio = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const mediana = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const kgPlano = (n: number) => `${(Math.round(n * 2) / 2).toString().replace(".", ",")} kg`;
const pct = (nuevo: number, viejo: number) => (viejo > 0 ? (nuevo - viejo) / viejo : 0);

export function compararSesiones(previas: SesionResumen[], recientes: SesionResumen[], racha: number, base = 0): ResultadoEjercicio {
  const entrenos = previas.length + recientes.length;
  if (!previas.length || !recientes.length) return { estado: "sin-datos", frase: "Todavía hay pocos entrenos para comparar.", entrenos };

  const conPeso = recientes.some((s) => s.conPeso) && previas.some((s) => s.conPeso);
  const pFuerza = pct(promedio(recientes.map((s) => s.mejorFuerza)), promedio(previas.map((s) => s.mejorFuerza)));
  const pTrabajo = pct(promedio(recientes.map((s) => s.trabajo)), promedio(previas.map((s) => s.trabajo)));
  const dSeries = promedio(recientes.map((s) => s.series)) - promedio(previas.map((s) => s.series));

  const umbralFuerza = conPeso ? 0.015 : 0.05;
  const positivo = pFuerza >= umbralFuerza || pTrabajo >= 0.04 || dSeries >= 0.75;
  const negativo = pFuerza <= -0.03 || pTrabajo <= -0.08 || dSeries <= -0.75;
  let estado: EstadoEjercicio = "estable";
  if (positivo && !negativo) estado = "mejoro";
  else if (negativo && !positivo) estado = "bajo";
  else if (positivo && negativo) estado = pFuerza + pTrabajo * 0.5 >= 0 ? "mejoro" : "bajo";

  const pesoAntes = mediana(previas.map((s) => s.mejorPeso));
  const pesoAhora = mediana(recientes.map((s) => s.mejorPeso));
  const repsAntes = mediana(previas.map((s) => s.mejorReps));
  const repsAhora = mediana(recientes.map((s) => s.mejorReps));
  const seriesAntes = Math.round(promedio(previas.map((s) => s.series)));
  const seriesAhora = Math.round(promedio(recientes.map((s) => s.series)));
  const mismaCarga = Math.abs(pesoAhora - pesoAntes) / (pesoAntes || 1) < 0.01;
  const mismasReps = Math.abs(repsAhora - repsAntes) <= 1;
  const rep = (n: number) => (n === 1 ? "1 repetición" : `${n} repeticiones`);
  // Ejercicios de peso corporal: la carga incluye una parte fija del cuerpo (base); al
  // hablar con el usuario se muestra solo el lastre.
  const kg = (n: number) => (base > 0 ? (n - base < 0.25 ? "sin lastre" : `${kgPlano(n - base)} de lastre`) : kgPlano(n));

  let frase: string;
  if (estado === "mejoro") {
    if (conPeso && pesoAhora > pesoAntes && !mismaCarga && mismasReps) frase =
        base > 0
          ? pesoAntes - base < 0.25
            ? `Empezaste a usar ${kgPlano(pesoAhora - base)} de lastre con las mismas repeticiones.`
            : `Subiste el lastre de ${kgPlano(pesoAntes - base)} a ${kgPlano(pesoAhora - base)} con las mismas repeticiones.`
          : `Subiste de ${kg(pesoAntes)} a ${kg(pesoAhora)} con las mismas repeticiones.`;
    else if (repsAhora - repsAntes >= 1 && (mismaCarga || !conPeso)) frase = `Hiciste ${rep(Math.round(repsAhora - repsAntes))} más${conPeso ? " con el mismo peso" : " por serie"}.`;
    else if (seriesAhora > seriesAntes) frase = `Hiciste una serie más: ${seriesAhora} en vez de ${seriesAntes}${conPeso ? ", con el mismo peso" : ""}.`;
    else if (conPeso && pFuerza > 0) frase = `Tu mejor serie mejoró: de ${kg(pesoAntes)} × ${Math.round(repsAntes)} a ${kg(pesoAhora)} × ${Math.round(repsAhora)}.`;
    else frase = "Hiciste más trabajo en total que antes.";
  } else if (estado === "bajo") {
    if (conPeso && pesoAhora < pesoAntes && !mismaCarga) frase = `Bajaste de ${kg(pesoAntes)} a ${kg(pesoAhora)}. Puede ser cansancio.`;
    else if (repsAntes - repsAhora >= 1 && (mismaCarga || !conPeso)) frase = `Hiciste ${rep(Math.round(repsAntes - repsAhora))} menos${conPeso ? " con el mismo peso" : " por serie"}. Puede ser cansancio.`;
    else if (seriesAhora < seriesAntes) frase = `Hiciste una serie menos: ${seriesAhora} en vez de ${seriesAntes}.`;
    else frase = "Rendiste un poco menos que antes. Puede ser cansancio.";
  } else {
    const dato = conPeso ? `${kg(pesoAhora)} × ${Math.round(repsAhora)}` : `${Math.round(repsAhora)} repeticiones`;
    frase =
      racha >= 4
        ? `Llevás ${racha} entrenos con ${dato}. Es normal: con el tiempo el progreso se frena.${conPeso ? " Si te sobra fuerza, probá subir un poquito." : ""}`
        : `Igual que tus entrenos anteriores: ${dato}.`;
  }
  return { estado, frase, entrenos };
}

// Cantidad de entrenos seguidos (hasta el último) con la misma mejor serie.
function rachaIgual(sesiones: SesionResumen[]): number {
  const ultima = sesiones[sesiones.length - 1];
  let n = 0;
  for (let i = sesiones.length - 1; i >= 0; i--) {
    const s = sesiones[i];
    if (s.mejorPeso === ultima.mejorPeso && s.mejorReps === ultima.mejorReps && s.series === ultima.series) n++;
    else break;
  }
  return n;
}

export type Ancla = "ultimos" | "inicio";

export function evaluarEjercicio(logs: LogSerie[], ancla: Ancla, base = 0): ResultadoEjercicio {
  const sesiones = resumirSesiones(logs);
  const S = sesiones.length;
  if (S < 2) return { estado: "sin-datos", frase: "Todavía hay pocos entrenos para comparar.", entrenos: S };
  const n = Math.min(3, Math.floor(S / 2));
  const recientes = sesiones.slice(-n);
  const previas = ancla === "ultimos" ? sesiones.slice(-2 * n, -n) : sesiones.slice(0, n);
  return compararSesiones(previas, recientes, rachaIgual(sesiones), base);
}

// ---------- Resumen general ----------

export type ResumenGeneral = { mejoraron: number; estables: number; bajaron: number; titulo: string; tono: "bien" | "estable" | "atencion" };

export function resumirGeneral(estados: EstadoEjercicio[]): ResumenGeneral {
  const mejoraron = estados.filter((e) => e === "mejoro").length;
  const estables = estados.filter((e) => e === "estable").length;
  const bajaron = estados.filter((e) => e === "bajo").length;
  if (mejoraron + estables + bajaron === 0) return { mejoraron, estables, bajaron, titulo: "Cargá algunos entrenos para ver tu progreso.", tono: "estable" };
  if (mejoraron >= bajaron && mejoraron > 0) return { mejoraron, estables, bajaron, titulo: "¡Venís mejorando!", tono: "bien" };
  if (bajaron > mejoraron) return { mejoraron, estables, bajaron, titulo: "Esta vez hubo más retrocesos que mejoras.", tono: "atencion" };
  return { mejoraron, estables, bajaron, titulo: "Venís manteniendo tu nivel.", tono: "estable" };
}

// ---------- Medidas ----------

export type FilaMedida = { fecha: string; [campo: string]: string | number | null };
export type CambioMedida = { clave: string; etiqueta: string; unidad: string; actual: number; cambio: number; tendencia: "sube" | "baja" | "igual" };

const CAMPOS_MEDIDAS: [string, string, string][] = [
  ["peso", "Peso", "kg"],
  ["cintura", "Cintura", "cm"],
  ["caderas", "Caderas", "cm"],
  ["pecho", "Pecho", "cm"],
  ["brazo", "Brazo", "cm"],
  ["muslos", "Muslos", "cm"],
];

export function cambiosDeMedidas(filas: FilaMedida[]): CambioMedida[] {
  const ordenadas = [...filas].sort((a, b) => a.fecha.localeCompare(b.fecha));
  const salida: CambioMedida[] = [];
  for (const [clave, etiqueta, unidad] of CAMPOS_MEDIDAS) {
    const con = ordenadas.filter((f) => typeof f[clave] === "number" && (f[clave] as number) > 0);
    if (con.length < 2) continue;
    const primero = con[0][clave] as number;
    const actual = con[con.length - 1][clave] as number;
    const cambio = Math.round((actual - primero) * 10) / 10;
    salida.push({ clave, etiqueta, unidad, actual, cambio, tendencia: Math.abs(cambio) < 0.05 ? "igual" : cambio > 0 ? "sube" : "baja" });
  }
  return salida;
}

// ---------- Músculos trabajados (últimos 7 días) ----------

export type NivelMusculo = "poco" | "bien" | "mucho";
export type Musculo = { grupo: string; series: number; nivel: NivelMusculo; porcentaje: number };

export function musculosDeLaSemana(ejercicios: { grupos: string[]; logs: LogSerie[] }[], hoy: string): Musculo[] {
  const desde = new Date(`${hoy}T00:00:00Z`);
  desde.setUTCDate(desde.getUTCDate() - 6);
  const desdeISO = desde.toISOString().slice(0, 10);
  const acumulado = new Map<string, number>();
  for (const e of ejercicios) {
    const pesos = pesoPorGrupo(e.grupos);
    for (const [g] of pesos) if (!acumulado.has(g)) acumulado.set(g, 0);
    for (const l of e.logs) {
      if (l.tipo_serie === "drop") continue;
      const f = fechaISO(new Date(l.created_at));
      if (f < desdeISO || f > hoy) continue;
      for (const [g, peso] of pesos) acumulado.set(g, (acumulado.get(g) ?? 0) + peso);
    }
  }
  return [...acumulado.entries()]
    .map(([grupo, series]) => {
      const lm = landmarksDeGrupo(grupo);
      const nivel: NivelMusculo = series < lm.mev ? "poco" : series > lm.mrv ? "mucho" : "bien";
      return { grupo, series, nivel, porcentaje: Math.max(4, Math.min(100, Math.round((series / lm.mrv) * 100))) };
    })
    .sort((a, b) => b.series - a.series);
}

// ---------- Ejercicios de peso corporal ----------

type LogCrudo = Omit<LogSerie, "peso"> & { peso: number | null; lastre?: number | null; peso_corporal_ref?: number | null };

/**
 * Prepara los registros de un ejercicio de peso corporal para el motor:
 *  - Sin ningún lastre registrado: se compara solo por repeticiones (peso = null).
 *  - Con lastre: peso = parte fija del cuerpo + lastre. La parte fija usa SIEMPRE el
 *    mismo peso corporal (el más reciente), así bajar o subir de peso no se confunde
 *    con progresar o retroceder en el ejercicio.
 * Devuelve también la base, para que las frases hablen del lastre y no de la suma.
 */
export function adaptarPesoCorporal(logs: LogCrudo[], factor: number | null): { logs: LogSerie[]; base: number } {
  const hayLastre = logs.some((l) => (l.lastre ?? 0) > 0);
  if (!hayLastre) return { logs: logs.map((l) => ({ ...l, peso: null })), base: 0 };
  const refs = [...logs].reverse().find((l) => (l.peso_corporal_ref ?? 0) > 0)?.peso_corporal_ref ?? 0;
  const base = factor != null ? Math.round(factor * refs * 10) / 10 : 0;
  return { logs: logs.map((l) => ({ ...l, peso: base + (l.lastre ?? 0) > 0 ? base + (l.lastre ?? 0) : null })), base };
}

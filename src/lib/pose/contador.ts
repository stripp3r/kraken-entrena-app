// Contador UNIVERSAL de repeticiones con la cámara: sirve para cualquier ejercicio sin
// calibrarlo. Mira varias "señales" del cuerpo (ángulo de codos, rodillas, cadera,
// brazos, altura del cuerpo y cada lado por separado), cuenta los picos de ida y vuelta
// de cada una (lib/pose/picos.ts) y se queda con el número en el que más señales
// coinciden. Toda repetición es un movimiento de ida y vuelta de alguna articulación.
//
// Funciones puras sobre números (sin cámara): se prueban con datos sintéticos y con series
// reales guardadas.

import { PUNTO, angulo3D, type Punto, type Punto3 } from "./geometria";
import { HZ, calidadDeSerie, contarSenal, type CalidadSerie, type ConteoSenal } from "./picos";

export type NombreSenal =
  | "codos" | "rodillas" | "cadera" | "brazos" | "altura"
  | "codoIzq" | "codoDer" | "brazoIzq" | "brazoDer" | "rodillaIzq" | "rodillaDer";

const NOMBRES: NombreSenal[] = [
  "codos", "rodillas", "cadera", "brazos", "altura",
  "codoIzq", "codoDer", "brazoIzq", "brazoDer", "rodillaIzq", "rodillaDer",
];

// Rango mínimo de la señal para considerarla movimiento y no temblor (grados, o % del torso en "altura").
const PISO: Record<NombreSenal, number> = {
  codos: 15, rodillas: 15, cadera: 15, brazos: 15, altura: 6,
  codoIzq: 15, codoDer: 15, brazoIzq: 15, brazoDer: 15, rodillaIzq: 15, rodillaDer: 15,
};

// Más baja que antes (0,5): el modelo estima bien las articulaciones medio tapadas o cortadas por
// el borde, y exigir mucho obligaba a alejarse demasiado del teléfono.
const VISIBILIDAD_MINIMA = 0.3;
const CADA_MS_EVALUAR = 300;
const GAP_FIN_SERIE_S = 3; // sin repeticiones nuevas durante este tiempo (o 2,2 intervalos) = serie terminada

const aPunto3 = (p: Punto): Punto3 => ({ x: p.x, y: p.y, z: p.z ?? 0 });

// ---- Señales ----

function promedioValidos(valores: (number | null)[]): number | null {
  const v = valores.filter((n): n is number => n !== null);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
}

function visibleEn(mundo: Punto[], vis: Punto[] | undefined, i: number) {
  return Boolean(mundo[i]) && (vis?.[i]?.visibility ?? mundo[i]?.visibility ?? 1) >= VISIBILIDAD_MINIMA;
}

function angulo(mundo: Punto[], vis: Punto[] | undefined, a: number, b: number, c: number): number | null {
  if (!visibleEn(mundo, vis, a) || !visibleEn(mundo, vis, b) || !visibleEn(mundo, vis, c)) return null;
  return angulo3D(aPunto3(mundo[a]), aPunto3(mundo[b]), aPunto3(mundo[c]));
}

// Ángulo del segmento a->b respecto de la vertical (0 = colgando). Solo necesita esos dos puntos.
function anguloVertical(mundo: Punto[], vis: Punto[] | undefined, a: number, b: number): number | null {
  if (!visibleEn(mundo, vis, a) || !visibleEn(mundo, vis, b)) return null;
  const A = aPunto3(mundo[a]);
  const B = aPunto3(mundo[b]);
  const v = { x: B.x - A.x, y: B.y - A.y, z: B.z - A.z };
  const n = Math.hypot(v.x, v.y, v.z);
  if (n === 0) return null;
  return (Math.acos(Math.min(1, Math.max(-1, v.y / n))) * 180) / Math.PI;
}

export function calcularSenales(mundo: Punto[] | undefined, vis: Punto[] | undefined): Partial<Record<NombreSenal, number>> {
  if (!mundo) return {};
  const P = PUNTO;
  const s: Partial<Record<NombreSenal, number>> = {};
  const poner = (n: NombreSenal, v: number | null) => {
    if (v !== null) s[n] = v;
  };
  const codoIzq = angulo(mundo, vis, P.hombroIzq, P.codoIzq, P.munecaIzq);
  const codoDer = angulo(mundo, vis, P.hombroDer, P.codoDer, P.munecaDer);
  const rodIzq = angulo(mundo, vis, P.caderaIzq, P.rodillaIzq, P.tobilloIzq);
  const rodDer = angulo(mundo, vis, P.caderaDer, P.rodillaDer, P.tobilloDer);
  const brazoIzq = anguloVertical(mundo, vis, P.hombroIzq, P.codoIzq);
  const brazoDer = anguloVertical(mundo, vis, P.hombroDer, P.codoDer);
  poner("codos", promedioValidos([codoIzq, codoDer]));
  poner("rodillas", promedioValidos([rodIzq, rodDer]));
  poner("cadera", promedioValidos([
    angulo(mundo, vis, P.hombroIzq, P.caderaIzq, P.rodillaIzq),
    angulo(mundo, vis, P.hombroDer, P.caderaDer, P.rodillaDer),
  ]));
  // Brazos: ángulo del brazo (hombro->codo) respecto de la vertical. Sirve para elevaciones, vuelos y
  // presses; solo necesita hombros y codos en cuadro (no la cadera).
  poner("brazos", promedioValidos([brazoIzq, brazoDer]));
  poner("codoIzq", codoIzq);
  poner("codoDer", codoDer);
  poner("brazoIzq", brazoIzq);
  poner("brazoDer", brazoDer);
  poner("rodillaIzq", rodIzq);
  poner("rodillaDer", rodDer);

  // Altura del cuerpo (talones, saltos, burpees): y de la cadera en la imagen, en % del largo del torso.
  const imagen = vis ?? mundo;
  const cI = imagen[P.caderaIzq];
  const cD = imagen[P.caderaDer];
  const hI = imagen[P.hombroIzq];
  const hD = imagen[P.hombroDer];
  if (cI && cD && hI && hD && Math.min(cI.visibility ?? 1, cD.visibility ?? 1) >= VISIBILIDAD_MINIMA) {
    const yCadera = (cI.y + cD.y) / 2;
    const torso = Math.abs((hI.y + hD.y) / 2 - yCadera);
    if (torso > 0.05) s.altura = (-yCadera / torso) * 100; // sube = valor mayor
  }
  return s;
}

// ---- Elección del número ----

type Candidato = { nombre: string; conteo: ConteoSenal; n: number };

const mediana = (a: number[]) => {
  const s = [...a].sort((x, y) => x - y);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

/** Brazos/piernas por separado: ¿alternan (se suman) o van juntos (se toma el mayor)? */
function combinarLados(izq: ConteoSenal, der: ConteoSenal): ConteoSenal | null {
  if (izq.valido && der.valido) {
    const intervalo = (izq.intervaloS + der.intervaloS) / 2;
    const desfases = izq.picos.map((p) => Math.min(...der.picos.map((q) => Math.abs(q.t - p.t))));
    const alternan = mediana(desfases) / intervalo >= 0.3;
    if (!alternan) return izq.n >= der.n ? izq : der; // juntos: es la misma serie vista desde los dos lados
    const picos = [...izq.picos, ...der.picos].sort((a, b) => a.t - b.t);
    return { n: izq.n + der.n, valido: true, rango: Math.max(izq.rango, der.rango), cv: Math.max(izq.cv, der.cv), cvProm: Math.max(izq.cvProm, der.cvProm), intervaloS: intervalo / 2, picos };
  }
  if (izq.valido) return izq; // un solo lado se mueve (ejercicio unilateral)
  if (der.valido) return der;
  return null;
}

export type Confianza = "alta" | "media" | "baja";

type Decision = {
  repeticiones: number;
  senal: string | null;
  confianza: Confianza | null;
  conteo: ConteoSenal | null;
  // Último pico visto en CUALQUIER señal válida (para saber si la serie sigue en marcha) y ritmo típico.
  ultimoPicoS: number | null;
  intervaloS: number;
};

const SIN_DECISION: Decision = { repeticiones: 0, senal: null, confianza: null, conteo: null, ultimoPicoS: null, intervaloS: 0 };

function decidir(conteos: Partial<Record<NombreSenal, ConteoSenal>>): Decision {
  const lista: Candidato[] = [];
  const agregar = (nombre: string, c: ConteoSenal | null | undefined) => {
    if (c && c.valido) lista.push({ nombre, conteo: c, n: c.n });
  };
  for (const n of ["codos", "rodillas", "cadera", "brazos", "altura"] as const) agregar(n, conteos[n]);
  const pares: [string, NombreSenal, NombreSenal][] = [
    ["codos·lados", "codoIzq", "codoDer"],
    ["brazos·lados", "brazoIzq", "brazoDer"],
    ["rodillas·lados", "rodillaIzq", "rodillaDer"],
  ];
  for (const [nombre, a, b] of pares) {
    const ca = conteos[a];
    const cb = conteos[b];
    if (ca && cb) agregar(nombre, combinarLados(ca, cb));
  }
  if (lista.length === 0) return SIN_DECISION;
  // El número en el que más señales coinciden (±1).
  let mejor = lista[0];
  let mejorApoyo = 0;
  for (const c of lista) {
    const apoyo = lista.filter((o) => Math.abs(o.n - c.n) <= 1).length;
    // Si hay empate de apoyo, gana la señal con más repeticiones (una señal ajena al ejercicio, como las
    // rodillas en unos fondos, solo se mueve en parte de las repeticiones) y después la más pareja.
    const mejorQue = apoyo > mejorApoyo || (apoyo === mejorApoyo && (c.n > mejor.n || (c.n === mejor.n && c.conteo.cv < mejor.conteo.cv)));
    if (mejorQue) {
      mejor = c;
      mejorApoyo = apoyo;
    }
  }
  const grupo = lista.filter((o) => Math.abs(o.n - mejor.n) <= 1).map((o) => o.n);
  return {
    repeticiones: Math.round(mediana(grupo)),
    senal: mejor.nombre,
    confianza: mejorApoyo >= 3 ? "alta" : mejorApoyo === 2 ? "media" : "baja",
    conteo: mejor.conteo,
    ultimoPicoS: Math.max(...lista.map((c) => (c.conteo.picos.length ? c.conteo.picos[c.conteo.picos.length - 1].t : 0))),
    intervaloS: mediana(lista.map((c) => c.conteo.intervaloS)),
  };
}

// ---- Contador ----

export type EstadoContador = {
  repeticiones: number;
  senal: string | null; // la señal que se está contando
  confianza: Confianza | null; // cuántas señales coinciden con el número
  visible: boolean; // hay cuerpo detectado
  caminando: boolean; // el cuerpo se está desplazando (caminar): no se cuenta
  terminada: boolean; // ya contó una serie y pasó un rato sin repeticiones nuevas
  calidad: CalidadSerie | null; // rango, ritmo y RIR estimado (se calcula al terminar)
  mensaje: string;
};

export class ContadorUniversal {
  private series: Partial<Record<NombreSenal, number[]>> = {};
  private activo = false;
  private ultimaMuestra = -1e9;
  private ultimaEvaluacion = -1e9;
  private ultimaVista = 0;
  private centros: { t: number; x: number; y: number; torso: number }[] = [];
  private tCaminando = -1e9;
  private decision: Decision = SIN_DECISION;
  private congelada: EstadoContador | null = null;
  private ignorarFinHasta = -1; // tras reanudar, la serie solo vuelve a terminar si hay un pico posterior a este instante

  reset() {
    this.series = {};
    this.activo = false;
    this.ultimaMuestra = -1e9;
    this.ultimaEvaluacion = -1e9;
    this.decision = SIN_DECISION;
    this.congelada = null;
    this.ignorarFinHasta = -1;
    this.centros = [];
  }

  /** Sigue contando después de que se marcó el fin de serie (por ejemplo, una pausa larga dentro de la serie). */
  reanudar() {
    if (!this.congelada) return;
    this.ignorarFinHasta = this.decision.ultimoPicoS ?? -1;
    this.congelada = null;
  }

  /** Empieza a contar. Antes de esto solo se mira si el cuerpo está en cuadro. */
  empezar() {
    this.reset();
    this.activo = true;
  }

  /** Señales muestreadas (10 Hz) de la serie en curso; -1 = no visible en ese instante. */
  exportarTraza(): Partial<Record<NombreSenal, number[]>> {
    return this.series;
  }

  get contando() {
    return this.activo;
  }

  // Caminar o acercarse al teléfono mueve todo el cuerpo por la imagen: si el centro del torso se
  // desplaza más de medio torso en 1,5 s, se descarta lo acumulado (los pasos no son repeticiones).
  private revisarTraslacion(vis: Punto[] | undefined, tMs: number): boolean {
    const P = PUNTO;
    const pts = [P.hombroIzq, P.hombroDer, P.caderaIzq, P.caderaDer].map((i) => vis?.[i]);
    const ok = pts.every((q) => q && (q.visibility ?? 0) >= VISIBILIDAD_MINIMA);
    if (!ok) return false;
    const [hI, hD, cI, cD] = pts as Punto[];
    const x = (hI.x + hD.x + cI.x + cD.x) / 4;
    const y = (hI.y + hD.y + cI.y + cD.y) / 4;
    const torso = Math.hypot((hI.x + hD.x) / 2 - (cI.x + cD.x) / 2, (hI.y + hD.y) / 2 - (cI.y + cD.y) / 2);
    if (torso < 0.05) return false;
    this.centros.push({ t: tMs, x, y, torso });
    while (this.centros.length && tMs - this.centros[0].t > 1500) this.centros.shift();
    const a = this.centros[0];
    const horizontal = Math.abs(x - a.x) / torso;
    const total = Math.hypot(x - a.x, y - a.y) / torso;
    // Horizontal: caminar o girar; en vertical se tolera más (sentadillas, saltos).
    return horizontal > 0.5 || total > 1.1;
  }

  procesar(mundo: Punto[] | undefined, vis: Punto[] | undefined, tMs: number): EstadoContador {
    const senales = calcularSenales(mundo, vis);
    let caminando = false;
    if (this.activo && this.revisarTraslacion(vis, tMs)) {
      caminando = true;
      this.tCaminando = tMs;
    }
    if (tMs - this.tCaminando < 800) caminando = true;
    return this.avanzar(senales, caminando, tMs);
  }

  /** Igual que procesar() pero con las señales ya calculadas (repetir series guardadas, pruebas). */
  procesarSenales(senales: Partial<Record<NombreSenal, number>>, tMs: number): EstadoContador {
    return this.avanzar(senales, false, tMs);
  }

  private avanzar(senales: Partial<Record<NombreSenal, number>>, caminando: boolean, tMs: number): EstadoContador {
    const hay = Object.keys(senales).length > 0;
    if (hay) this.ultimaVista = tMs;
    const visible = tMs - this.ultimaVista < 1500;
    if (this.congelada) return { ...this.congelada, visible, caminando };

    if (this.activo) {
      // Se guarda una muestra cada 100 ms (10 Hz), -1 si la señal no se ve en ese instante.
      if (tMs - this.ultimaMuestra >= 1000 / HZ) {
        this.ultimaMuestra = tMs;
        if (caminando && this.decision.repeticiones < 4) {
          this.series = {}; // todavía no hay serie validada: lo acumulado era acomodarse/caminar
          this.decision = SIN_DECISION;
        } else {
          for (const n of NOMBRES) {
            const v = senales[n];
            (this.series[n] ??= []).push(caminando || v === undefined ? -1 : Math.round(v * 10) / 10);
          }
        }
      }
      if (tMs - this.ultimaEvaluacion >= CADA_MS_EVALUAR && (this.series.codos?.length ?? 0) >= 25) {
        this.ultimaEvaluacion = tMs;
        const conteos: Partial<Record<NombreSenal, ConteoSenal>> = {};
        for (const n of NOMBRES) conteos[n] = contarSenal(this.series[n] ?? [], PISO[n]);
        this.decision = decidir(conteos);
      }
    }

    const d = this.decision;
    const ahoraS = (this.series.codos?.length ?? 0) / HZ;
    const terminada =
      this.activo &&
      d.repeticiones >= 4 &&
      d.conteo !== null &&
      d.ultimoPicoS !== null &&
      d.ultimoPicoS > this.ignorarFinHasta &&
      ahoraS - d.ultimoPicoS > Math.max(GAP_FIN_SERIE_S, d.intervaloS * 2.2);
    const calidad = terminada && d.conteo ? calidadDeSerie(d.conteo.picos) : null;

    const estado: EstadoContador = {
      repeticiones: d.repeticiones,
      senal: d.senal,
      confianza: d.confianza,
      visible,
      caminando,
      terminada,
      calidad,
      mensaje: !visible
        ? "No te veo: ponete con el cuerpo entero en cuadro."
        : !this.activo
          ? "Te veo bien."
          : d.repeticiones === 0
            ? "Hacé la serie."
            : `${d.repeticiones} ${d.repeticiones === 1 ? "repetición" : "repeticiones"}`,
    };
    if (terminada) this.congelada = estado; // la serie terminó: lo que venga después (soltar las pesas) no cuenta
    return estado;
  }
}

// Contador UNIVERSAL de repeticiones con la cámara: sirve para cualquier ejercicio
// sin calibrarlo. En vez de saber qué ejercicio es, mira varias "señales" del cuerpo
// (ángulo de codos, rodillas, cadera, brazos y altura del cuerpo) y cuenta los
// vaivenes de la que más se mueve. Funciona porque toda repetición es un movimiento
// de ida y vuelta de alguna articulación.
//
// Funciones puras sobre números (sin cámara): se prueban con datos sintéticos.

import { PUNTO, angulo3D, type Punto, type Punto3 } from "./geometria";

export type NombreSenal = "codos" | "rodillas" | "cadera" | "brazos" | "altura";

// Amplitud mínima del vaivén para contarlo como repetición (grados, o % del largo
// del torso en "altura"). Bajo esto es temblor o un ajuste de postura.
const AMPLITUD_MINIMA: Record<NombreSenal, number> = {
  codos: 35,
  rodillas: 35,
  cadera: 30,
  brazos: 35,
  altura: 12,
};

// Más baja que antes (0,5): el modelo estima bien las articulaciones medio tapadas o cortadas
// por el borde, y con exigir mucho había que alejarse demasiado del teléfono.
const VISIBILIDAD_MINIMA = 0.3;
const DURACION_MINIMA_MS = 250; // una ida y vuelta no puede durar menos
const REPS_PARA_FIJAR = 4;
// Una repetición candidata no se cuenta sola: hacen falta CUATRO seguidas parecidas (misma
// amplitud y mismo ritmo, con margen humano). Un movimiento suelto -agacharse a agarrar las
// mancuernas, acomodar el celular, caminar, gesticular- casi nunca se repite igual cuatro veces.
// Una vez validada la serie, cada repetición nueva cuenta si se parece a las anteriores.
const RATIO_AMP = [0.7, 1.43] as const;
const RATIO_DUR = [0.65, 1.55] as const;
const RATIO_AMP_SERIE = [0.5, 2] as const;
const RATIO_DUR_SERIE = [0.4, 2.5] as const;
const REPS_PARA_VALIDAR = 4;
const RECHAZOS_PARA_PERDER_SERIE = 3;

const dentro = (r: number, [min, max]: readonly [number, number]) => r >= min && r <= max;

const aPunto3 = (p: Punto): Punto3 => ({ x: p.x, y: p.y, z: p.z ?? 0 });

// ---- Detector de ida y vuelta sobre una señal ----

class DetectorVaiven {
  private dir: 1 | -1 | 0 = 0; // sentido actual del movimiento (1: valor sube)
  private min = 0;
  private max = 0;
  private tMin = 0;
  private tMax = 0;
  private cand = 0; // extremo en el sentido actual
  private tCand = 0;
  private pivotes: { v: number; t: number }[] = [];
  private contada = false; // la repetición del par actual ya se contó
  private saltar = false; // tras contar, el próximo pivote es el nuevo punto de partida
  private iniciado = false;
  repeticiones = 0;
  suma = 0; // suma de amplitudes de las repeticiones contadas
  rangoReciente = 0;

  constructor(private readonly amplitudMinima: number) {}

  reset() {
    this.dir = 0;
    this.pivotes = [];
    this.contada = this.saltar = this.iniciado = false;
    this.cadena = [];
    this.validada = false;
    this.rechazos = 0;
    this.tUltimoCierre = null;
    this.repeticiones = 0;
    this.suma = 0;
    this.rangoReciente = 0;
  }

  get amplitudMedia() {
    return this.repeticiones ? this.suma / this.repeticiones : this.rangoReciente;
  }

  procesar(x: number, t: number) {
    const H = this.amplitudMinima * 0.5; // histéresis: cuánto hay que revertir para confirmar un extremo
    if (!this.iniciado) {
      this.iniciado = true;
      this.min = this.max = this.cand = x;
      this.tMin = this.tMax = this.tCand = t;
      return;
    }
    if (this.dir === 0) {
      if (x < this.min) [this.min, this.tMin] = [x, t];
      if (x > this.max) [this.max, this.tMax] = [x, t];
      this.rangoReciente = Math.max(this.rangoReciente * 0.99, this.max - this.min);
      if (x - this.min >= H) {
        this.pivotes = [{ v: this.min, t: this.tMin }];
        this.dir = 1;
        this.cand = x;
        this.tCand = t;
      } else if (this.max - x >= H) {
        this.pivotes = [{ v: this.max, t: this.tMax }];
        this.dir = -1;
        this.cand = x;
        this.tCand = t;
      }
      return;
    }
    if ((x - this.cand) * this.dir > 0) [this.cand, this.tCand] = [x, t];

    // ¿Se confirma un extremo? (el valor revirtió H desde el extremo)
    if ((this.cand - x) * this.dir >= H) {
      const pivote = { v: this.cand, t: this.tCand };
      this.dir = this.dir === 1 ? -1 : 1;
      this.cand = x;
      this.tCand = t;
      if (this.saltar) {
        this.pivotes = [pivote]; // nuevo punto de partida
        this.saltar = false;
        this.contada = false;
      } else {
        this.pivotes.push(pivote);
        if (this.pivotes.length > 2) this.pivotes.shift();
        if (this.pivotes.length === 2) {
          const swing = Math.abs(this.pivotes[1].v - this.pivotes[0].v);
          this.rangoReciente = Math.max(this.rangoReciente * 0.99, swing);
          // Un vaivén chico no es una repetición: el extremo nuevo pasa a ser el punto de partida.
          if (swing < this.amplitudMinima) this.pivotes = [this.pivotes[1]];
          else this.contada = false;
        }
      }
      return;
    }

    // Vuelta hacia el punto de partida: la repetición se cuenta al llegar cerca, sin esperar
    // a que el movimiento se invierta (si no, la última repetición nunca se contaría).
    if (this.pivotes.length === 2 && !this.contada) {
      const [p0, p1] = this.pivotes;
      const swing = Math.abs(p1.v - p0.v);
      const haciaInicio = (p0.v - p1.v) * this.dir > 0;
      if (swing >= this.amplitudMinima && haciaInicio && Math.abs(x - p0.v) <= swing * 0.25 && t - p0.t >= DURACION_MINIMA_MS) {
        this.registrarCandidata(swing, t);
        this.contada = true;
        this.saltar = true;
      }
    }
  }

  private cadena: { amp: number; dur: number | null }[] = [];
  private tUltimoCierre: number | null = null;
  private validada = false;
  private ampRef = 0;
  private durRef = 0;
  private rechazos = 0;

  private registrarCandidata(amp: number, t: number) {
    const dur = this.tUltimoCierre === null ? null : t - this.tUltimoCierre;
    this.tUltimoCierre = t;
    if (this.validada && dur !== null) {
      if (dentro(amp / this.ampRef, RATIO_AMP_SERIE) && dentro(dur / this.durRef, RATIO_DUR_SERIE)) {
        this.repeticiones += 1;
        this.suma += amp;
        this.ampRef = this.ampRef * 0.7 + amp * 0.3;
        this.durRef = this.durRef * 0.7 + dur * 0.3;
        this.rechazos = 0;
      } else if (++this.rechazos >= RECHAZOS_PARA_PERDER_SERIE) {
        this.validada = false;
        this.cadena = [];
        this.rechazos = 0;
      }
      return;
    }
    const prev = this.cadena[this.cadena.length - 1];
    const parecida =
      prev !== undefined &&
      dentro(amp / prev.amp, RATIO_AMP) &&
      (prev.dur === null || dur === null || dentro(dur / prev.dur, RATIO_DUR));
    this.cadena = parecida ? [...this.cadena, { amp, dur }] : [{ amp, dur }];
    if (this.cadena.length >= REPS_PARA_VALIDAR) {
      this.validada = true;
      this.repeticiones += this.cadena.length;
      this.suma += this.cadena.reduce((acc, c) => acc + c.amp, 0);
      this.ampRef = this.cadena.reduce((acc, c) => acc + c.amp, 0) / this.cadena.length;
      const durs = this.cadena.map((c) => c.dur).filter((d): d is number => d !== null);
      this.durRef = durs.reduce((a, b) => a + b, 0) / (durs.length || 1);
      this.cadena = [];
    }
  }
}

// ---- Señales ----

function promedioValidos(valores: (number | null)[]): number | null {
  const v = valores.filter((n): n is number => n !== null);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
}

function angulo(mundo: Punto[], vis: Punto[] | undefined, a: number, b: number, c: number): number | null {
  const visible = (i: number) => (vis?.[i]?.visibility ?? mundo[i]?.visibility ?? 1) >= VISIBILIDAD_MINIMA;
  if (!mundo[a] || !mundo[b] || !mundo[c] || !visible(a) || !visible(b) || !visible(c)) return null;
  return angulo3D(aPunto3(mundo[a]), aPunto3(mundo[b]), aPunto3(mundo[c]));
}

function anguloVertical(mundo: Punto[], vis: Punto[] | undefined, a: number, b: number): number | null {
  const visible = (i: number) => (vis?.[i]?.visibility ?? mundo[i]?.visibility ?? 1) >= VISIBILIDAD_MINIMA;
  if (!mundo[a] || !mundo[b] || !visible(a) || !visible(b)) return null;
  const A = aPunto3(mundo[a]);
  const B = aPunto3(mundo[b]);
  const v = { x: B.x - A.x, y: B.y - A.y, z: B.z - A.z };
  const n = Math.hypot(v.x, v.y, v.z);
  if (n === 0) return null;
  return (Math.acos(Math.min(1, Math.max(-1, v.y / n))) * 180) / Math.PI; // 0 = brazo colgando
}

export function calcularSenales(mundo: Punto[] | undefined, vis: Punto[] | undefined): Partial<Record<NombreSenal, number>> {
  if (!mundo) return {};
  const P = PUNTO;
  const s: Partial<Record<NombreSenal, number>> = {};
  const codos = promedioValidos([
    angulo(mundo, vis, P.hombroIzq, P.codoIzq, P.munecaIzq),
    angulo(mundo, vis, P.hombroDer, P.codoDer, P.munecaDer),
  ]);
  const rodillas = promedioValidos([
    angulo(mundo, vis, P.caderaIzq, P.rodillaIzq, P.tobilloIzq),
    angulo(mundo, vis, P.caderaDer, P.rodillaDer, P.tobilloDer),
  ]);
  const cadera = promedioValidos([
    angulo(mundo, vis, P.hombroIzq, P.caderaIzq, P.rodillaIzq),
    angulo(mundo, vis, P.hombroDer, P.caderaDer, P.rodillaDer),
  ]);
  // Brazos: ángulo del brazo (hombro->codo) respecto de la vertical. Sirve para elevaciones,
  // vuelos y presses; solo necesita hombros y codos en cuadro (no la cadera).
  const brazos = promedioValidos([
    anguloVertical(mundo, vis, P.hombroIzq, P.codoIzq),
    anguloVertical(mundo, vis, P.hombroDer, P.codoDer),
  ]);
  if (codos !== null) s.codos = codos;
  if (rodillas !== null) s.rodillas = rodillas;
  if (cadera !== null) s.cadera = cadera;
  if (brazos !== null) s.brazos = brazos;

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

// ---- Contador ----

export type EstadoContador = {
  repeticiones: number;
  senal: NombreSenal | null; // la señal que se está contando (se fija tras 2 repeticiones)
  visible: boolean; // hay cuerpo detectado
  mensaje: string;
};

const NOMBRES = Object.keys(AMPLITUD_MINIMA) as NombreSenal[];

export class ContadorUniversal {
  private detectores: Record<NombreSenal, DetectorVaiven> = this.crear();
  private suave: Partial<Record<NombreSenal, number>> = {};
  private fijada: NombreSenal | null = null;
  private ultimaVista = 0;

  private crear(): Record<NombreSenal, DetectorVaiven> {
    return Object.fromEntries(NOMBRES.map((n) => [n, new DetectorVaiven(AMPLITUD_MINIMA[n])])) as Record<NombreSenal, DetectorVaiven>;
  }

  private activo = false;
  private traza: Partial<Record<NombreSenal, number[]>> = {};
  private tUltimaTraza = -1;
  private t0 = 0;

  reset() {
    this.traza = {};
    this.tUltimaTraza = -1;
    this.detectores = this.crear();
    this.suave = {};
    this.fijada = null;
    this.activo = false;
  }

  /** Empieza a contar. Antes de esto solo se mira si el cuerpo está en cuadro. */
  empezar() {
    this.traza = {};
    this.tUltimaTraza = -1;
    this.t0 = 0;
    this.detectores = this.crear();
    this.suave = {};
    this.fijada = null;
    this.activo = true;
  }

  /** Señales muestreadas (10 Hz) de la serie en curso; -1 = no visible en ese instante. */
  exportarTraza(): Partial<Record<NombreSenal, number[]>> {
    return this.traza;
  }

  get contando() {
    return this.activo;
  }

  private mejor(): NombreSenal | null {
    let mejor: NombreSenal | null = null;
    let puntaje = 0;
    for (const n of NOMBRES) {
      const d = this.detectores[n];
      if (d.repeticiones === 0) continue;
      const p = (d.amplitudMedia / AMPLITUD_MINIMA[n]) * Math.min(d.repeticiones, 3);
      if (p > puntaje) {
        puntaje = p;
        mejor = n;
      }
    }
    return mejor;
  }

  procesar(mundo: Punto[] | undefined, vis: Punto[] | undefined, tMs: number): EstadoContador {
    const senales = calcularSenales(mundo, vis);
    const hay = Object.keys(senales).length > 0;
    if (hay) this.ultimaVista = tMs;
    // Traza para análisis offline: señales a ~10 Hz (solo números, sin video).
    if (this.activo && hay && tMs - this.tUltimaTraza >= 100) {
      if (this.tUltimaTraza < 0) this.t0 = tMs;
      this.tUltimaTraza = tMs;
      for (const n of NOMBRES) (this.traza[n] ??= []).push(senales[n] === undefined ? -1 : Math.round(senales[n]! * 10) / 10);
    }
    for (const n of NOMBRES) {
      if (!this.activo) break;
      const x = senales[n];
      if (x === undefined) continue;
      const previo = this.suave[n];
      const y = previo === undefined ? x : previo + (x - previo) * 0.45; // suavizado: baja el temblor sin retrasar de más
      this.suave[n] = y;
      this.detectores[n].procesar(y, tMs);
    }

    if (!this.fijada) {
      const m = this.mejor();
      if (m && this.detectores[m].repeticiones >= REPS_PARA_FIJAR) this.fijada = m;
    }
    const senal = this.fijada ?? this.mejor();
    const repeticiones = senal ? this.detectores[senal].repeticiones : 0;
    const visible = tMs - this.ultimaVista < 1500;
    return {
      repeticiones,
      senal,
      visible,
      mensaje: !visible
        ? "No te veo: ponete con el cuerpo entero en cuadro."
        : !this.activo
          ? "Te veo. Cuando estés listo, tocá Empezar."
          : repeticiones === 0
            ? "Hacé la serie."
            : `${repeticiones} ${repeticiones === 1 ? "repetición" : "repeticiones"}`,
    };
  }
}

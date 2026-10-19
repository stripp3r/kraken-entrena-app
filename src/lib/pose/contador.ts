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

const VISIBILIDAD_MINIMA = 0.5;
const DURACION_MINIMA_MS = 250; // una ida y vuelta no puede durar menos
const REPS_PARA_FIJAR = 2;

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
        this.repeticiones += 1;
        this.suma += swing;
        this.contada = true;
        this.saltar = true;
      }
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
  const brazos = promedioValidos([
    angulo(mundo, vis, P.caderaIzq, P.hombroIzq, P.codoIzq),
    angulo(mundo, vis, P.caderaDer, P.hombroDer, P.codoDer),
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

  reset() {
    this.detectores = this.crear();
    this.suave = {};
    this.fijada = null;
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
    for (const n of NOMBRES) {
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
      mensaje: !visible ? "No te veo: ponete con el cuerpo entero en cuadro." : repeticiones === 0 ? "Listo. Empezá la serie." : `${repeticiones} ${repeticiones === 1 ? "repetición" : "repeticiones"}`,
    };
  }
}

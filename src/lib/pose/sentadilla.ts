import { PUNTO, Suavizador, anguloEn, inclinacionVertical, visibilidad, type Punto } from "./geometria";

// Análisis de la SENTADILLA vista de costado (el teléfono apoyado a unos 2 m,
// cuerpo entero en cuadro). Prototipo: las reglas de abajo son referencias de
// biomecánica general y las tiene que ajustar el coach con su criterio.
//
// Qué mide, siempre del lado del cuerpo que la cámara ve mejor:
// - Ángulo de la rodilla (cadera-rodilla-tobillo): ~170-180 parado, ~90 con el
//   muslo paralelo al piso, menos si baja más.
// - Inclinación del torso respecto de la vertical (cadera -> hombro).
// Con eso: cuenta repeticiones, califica la profundidad al fondo de cada una y
// colorea el torso en vivo.

export type Color = "verde" | "amarillo" | "rojo" | "neutro";

export const UMBRALES_SENTADILLA = {
  // Rodilla (grados). Menor ángulo = más profunda.
  rodillaArriba: 160, // por encima se considera "parado"
  rodillaBajando: 150, // por debajo empieza el descenso
  repMinimaProfundidad: 140, // si no baja de acá no se cuenta como repetición
  profundidadVerde: 100, // <= 100: muslo paralelo o más abajo
  profundidadAmarillo: 120, // <= 120: casi, falta un poco
  // Torso (grados respecto de la vertical).
  torsoVerde: 50,
  torsoAmarillo: 65,
  // Visibilidad mínima de los puntos para fiarse del análisis.
  visibilidadMinima: 0.5,
  // Una repetición no puede durar menos que esto (evita contar temblores).
  duracionMinimaMs: 700,
  // Filtro de cuadros "glitch" (el detector a veces pierde un punto y el ángulo
  // salta): se ignora un cuadro cuyo ángulo de rodilla es físicamente imposible
  // en una sentadilla o que salta más que esto respecto del anterior. Si el
  // salto se mantiene varios cuadros seguidos, se acepta (es movimiento real).
  rodillaMinimaPosible: 30,
  saltoMaximoPorCuadro: 45,
  cuadrosGlitchTolerados: 4,
} as const;

export type ResultadoRep = {
  numero: number;
  anguloMinimo: number;
  inclinacionMaxima: number;
  profundidad: Color;
  torso: Color;
  veredicto: Color;
  mensaje: string;
};

export type EstadoSentadilla = {
  visible: boolean;
  lado: "izquierdo" | "derecho" | null;
  anguloRodilla: number | null;
  inclinacionTorso: number | null;
  fase: "arriba" | "bajando" | "subiendo";
  repeticiones: number;
  repeticionesBuenas: number;
  ultimaRep: ResultadoRep | null;
  // Colores en vivo de cada segmento del lado analizado.
  colores: { torso: Color; muslo: Color; pantorrilla: Color };
  // Índices de los puntos del lado analizado (para dibujar).
  puntos: { hombro: number; cadera: number; rodilla: number; tobillo: number } | null;
  mensaje: string;
};

const colorProfundidad = (angulo: number): Color =>
  angulo <= UMBRALES_SENTADILLA.profundidadVerde
    ? "verde"
    : angulo <= UMBRALES_SENTADILLA.profundidadAmarillo
      ? "amarillo"
      : "rojo";

const colorTorso = (grados: number): Color =>
  grados <= UMBRALES_SENTADILLA.torsoVerde ? "verde" : grados <= UMBRALES_SENTADILLA.torsoAmarillo ? "amarillo" : "rojo";

const peor = (a: Color, b: Color): Color => {
  const orden: Color[] = ["neutro", "verde", "amarillo", "rojo"];
  return orden[Math.max(orden.indexOf(a), orden.indexOf(b))];
};

export class AnalizadorSentadilla {
  private rodilla = new Suavizador(0.45);
  private torso = new Suavizador(0.35);
  private ladoActual: "izquierdo" | "derecho" | null = null;
  private fase: EstadoSentadilla["fase"] = "arriba";
  private reps = 0;
  private buenas = 0;
  private minRodilla = 180;
  private maxTorso = 0;
  private inicioDescensoMs = 0;
  private ultima: ResultadoRep | null = null;
  private ultimoCrudo: number | null = null;
  private glitchSeguidos = 0;
  private ultimoEstado: EstadoSentadilla | null = null;

  reset() {
    this.ultimoCrudo = null;
    this.glitchSeguidos = 0;
    this.ultimoEstado = null;
    this.rodilla.reset();
    this.torso.reset();
    this.ladoActual = null;
    this.fase = "arriba";
    this.reps = 0;
    this.buenas = 0;
    this.minRodilla = 180;
    this.maxTorso = 0;
    this.ultima = null;
  }

  // `landmarks`: los 33 puntos de UNA persona (coordenadas normalizadas).
  // `tMs`: reloj en milisegundos (creciente).
  procesar(landmarks: Punto[] | undefined, tMs: number): EstadoSentadilla {
    const vacio = (mensaje: string): EstadoSentadilla => ({
      visible: false,
      lado: this.ladoActual,
      anguloRodilla: null,
      inclinacionTorso: null,
      fase: this.fase,
      repeticiones: this.reps,
      repeticionesBuenas: this.buenas,
      ultimaRep: this.ultima,
      colores: { torso: "neutro", muslo: "neutro", pantorrilla: "neutro" },
      puntos: null,
      mensaje,
    });

    if (!landmarks || landmarks.length < 29) return vacio("No te veo. Pasá a cuadro, de costado.");

    const izq = [PUNTO.hombroIzq, PUNTO.caderaIzq, PUNTO.rodillaIzq, PUNTO.tobilloIzq];
    const der = [PUNTO.hombroDer, PUNTO.caderaDer, PUNTO.rodillaDer, PUNTO.tobilloDer];
    const media = (idx: number[]) => idx.reduce((s, i) => s + visibilidad(landmarks[i]), 0) / idx.length;
    const minimo = (idx: number[]) => Math.min(...idx.map((i) => visibilidad(landmarks[i])));

    const lado = media(izq) >= media(der) ? "izquierdo" : "derecho";
    const idx = lado === "izquierdo" ? izq : der;
    if (minimo(idx) < UMBRALES_SENTADILLA.visibilidadMinima) {
      return vacio("No te veo entero. Alejá el teléfono y ponete de costado.");
    }
    // Si cambió de lado, se reinician los suavizados (las referencias cambian).
    if (this.ladoActual && this.ladoActual !== lado) {
      this.rodilla.reset();
      this.torso.reset();
    }
    this.ladoActual = lado;

    const [iH, iC, iR, iT] = idx;
    const hombro = landmarks[iH];
    const cadera = landmarks[iC];
    const rodillaP = landmarks[iR];
    const tobillo = landmarks[iT];

    const crudo = anguloEn(cadera, rodillaP, tobillo);
    const imposible = crudo < UMBRALES_SENTADILLA.rodillaMinimaPosible;
    const salto = this.ultimoCrudo !== null && Math.abs(crudo - this.ultimoCrudo) > UMBRALES_SENTADILLA.saltoMaximoPorCuadro;
    if ((imposible || salto) && this.ultimoEstado && this.glitchSeguidos < UMBRALES_SENTADILLA.cuadrosGlitchTolerados) {
      this.glitchSeguidos += 1;
      return this.ultimoEstado; // se repite el último estado bueno
    }
    this.glitchSeguidos = 0;
    this.ultimoCrudo = crudo;
    const angRod = this.rodilla.push(crudo);
    const incl = this.torso.push(inclinacionVertical(cadera, hombro));
    const U = UMBRALES_SENTADILLA;

    // --- Máquina de estados de la repetición ---
    let mensaje = "Listo. Empezá a bajar.";
    if (this.fase === "arriba") {
      if (angRod < U.rodillaBajando) {
        this.fase = "bajando";
        this.inicioDescensoMs = tMs;
        this.minRodilla = angRod;
        this.maxTorso = incl;
      }
    } else {
      this.minRodilla = Math.min(this.minRodilla, angRod);
      this.maxTorso = Math.max(this.maxTorso, incl);
      if (this.fase === "bajando" && angRod > this.minRodilla + 8) this.fase = "subiendo";
      if (this.fase === "subiendo" && angRod < this.minRodilla) this.fase = "bajando";

      if (angRod >= U.rodillaArriba) {
        const duro = tMs - this.inicioDescensoMs;
        if (this.minRodilla < U.repMinimaProfundidad && duro >= U.duracionMinimaMs) {
          this.cerrarRepeticion();
        }
        this.fase = "arriba";
        this.minRodilla = 180;
        this.maxTorso = 0;
      }
    }

    // --- Colores en vivo ---
    // Torso: siempre en vivo. Muslo: va tomando el color de la profundidad que
    // lleva alcanzada EN ESTA repetición (gris mientras no llegó a nada).
    const enMovimiento = this.fase !== "arriba";
    const torsoColor = colorTorso(incl);
    const musloColor: Color = enMovimiento && this.minRodilla <= U.profundidadAmarillo ? colorProfundidad(this.minRodilla) : "neutro";

    if (enMovimiento) {
      if (torsoColor === "rojo") mensaje = "Espalda muy inclinada: subí el pecho.";
      else if (this.fase === "bajando" && this.minRodilla > U.profundidadAmarillo) mensaje = "Seguí bajando.";
      else if (musloColor === "amarillo") mensaje = "Casi: bajá un poco más.";
      else if (musloColor === "verde") mensaje = "Buena profundidad. Ahora subí.";
    } else if (this.ultima) {
      mensaje = this.ultima.mensaje;
    }

    const estadoActual: EstadoSentadilla = {
      visible: true,
      lado,
      anguloRodilla: angRod,
      inclinacionTorso: incl,
      fase: this.fase,
      repeticiones: this.reps,
      repeticionesBuenas: this.buenas,
      ultimaRep: this.ultima,
      colores: { torso: torsoColor, muslo: musloColor, pantorrilla: "neutro" },
      puntos: { hombro: iH, cadera: iC, rodilla: iR, tobillo: iT },
      mensaje,
    };
    this.ultimoEstado = estadoActual;
    return estadoActual;
  }

  private cerrarRepeticion() {
    this.reps += 1;
    const profundidad = colorProfundidad(this.minRodilla);
    const torso = colorTorso(this.maxTorso);
    const veredicto = peor(profundidad, torso);
    if (veredicto === "verde") this.buenas += 1;

    const partes: string[] = [];
    if (profundidad === "rojo") partes.push("profundidad corta");
    else if (profundidad === "amarillo") partes.push("bajá un poco más");
    if (torso === "rojo") partes.push("espalda muy inclinada");
    else if (torso === "amarillo") partes.push("cuidá la inclinación de la espalda");

    this.ultima = {
      numero: this.reps,
      anguloMinimo: Math.round(this.minRodilla),
      inclinacionMaxima: Math.round(this.maxTorso),
      profundidad,
      torso,
      veredicto,
      mensaje: veredicto === "verde" ? `Rep ${this.reps}: bien hecha.` : `Rep ${this.reps}: ${partes.join(", ")}.`,
    };
  }
}

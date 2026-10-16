import {
  PUNTO,
  Suavizador,
  SuavizadorRobusto,
  aVec,
  angulo3D,
  escalar,
  inclinacionVertical3D,
  norma,
  punto,
  restar,
  sumar,
  visibilidad,
  type Punto,
  type Punto3,
} from "./geometria";

// Análisis de la SENTADILLA desde cualquier ángulo del teléfono (de costado o de
// frente), con el cuerpo entero en cuadro. Usa los puntos 3D del modelo, así los
// ángulos no dependen de desde dónde se mira. PROTOTIPO: los umbrales son
// referencias de biomecánica general y los ajusta el coach con su criterio.
//
// Qué evalúa, con su color en vivo:
// - Torso (inclinación respecto de la vertical)           -> segmento hombro-cadera
// - Cabeza (oreja-hombro-cadera: cuello neutro)           -> segmento oreja-hombro
// - Rodillas hacia adentro (solo de frente)               -> muslos y pantorrillas
// - Ancho de los pies (solo de frente)                    -> pantorrillas
// - Profundidad (al fondo de cada repetición)             -> muslo, un instante al terminar
// Cuenta TODAS las repeticiones (también las cortas o malas, marcadas en rojo) y
// arma un resumen de la serie con lo que hay que corregir.

export type Color = "verde" | "amarillo" | "rojo" | "neutro";
export type ClaveProblema = "profundidad" | "torso" | "cabeza" | "rodillas" | "pies";

export const UMBRALES_SENTADILLA = {
  // Rodilla (grados, ángulo 3D cadera-rodilla-tobillo). Menor = más profunda.
  rodillaBajando: 150, // por debajo de esto puede estar bajando
  repMinimaProfundidad: 150, // si no baja de acá, no hubo repetición
  profundidadVerde: 100, // <= 100: muslo paralelo o más abajo
  profundidadAmarillo: 120,
  // Torso (grados respecto de la vertical).
  torsoVerde: 50,
  torsoAmarillo: 65,
  // Cabeza: ángulo oreja-hombro-cadera (180 = alineada con el torso).
  // Calibrado con datos reales del modelo (video de sentadilla): una persona neutra mide ~140-150
  // parada y ~135 en el fondo (la profundidad del oído en 3D es ruidosa), así que 125/105 evita
  // falsas alarmas. PROVISORIO: la línea de diagnóstico muestra el valor real para ajustarlo.
  cabezaVerde: 125,
  cabezaAmarillo: 105,
  // Rodillas hacia adentro, como fracción del largo del muslo.
  valgoVerde: 0.08,
  valgoAmarillo: 0.16,
  // Pies: separación de tobillos / separación de hombros.
  piesVerdeMin: 0.75,
  piesVerdeMax: 1.8,
  piesAmarilloMin: 0.55,
  piesAmarilloMax: 2.2,
  // Qué tan "de frente" está el cuerpo para evaluar rodillas y pies (0 = de lado, 1 = de frente).
  frontalMinimo: 0.75, // para entrar en vista de frente
  frontalSalir: 0.6, // para volver a vista de lado (histéresis: evita que cambie cuadro a cuadro)
  // Saltos de un cuadro al siguiente que se consideran fallas del detector.
  saltoTorsoPorCuadro: 40,
  saltoCabezaPorCuadro: 45,
  saltoValgoPorCuadro: 0.35,
  // Visibilidad mínima de los puntos para fiarse de ellos.
  visibilidadMinima: 0.5,
  visibilidadCabeza: 0.3,
  // Detección de repeticiones por giros del movimiento (sirve para repeticiones rápidas).
  bajadaParaIniciar: 15, // grados que tiene que caer desde el punto más alto para empezar a bajar
  subidaParaMarcarSubiendo: 12,
  rebote: 12, // si baja de nuevo esta cantidad antes de cerrar, sigue siendo la misma bajada
  subidaParaCerrar: 40, // grados que tiene que subir desde el fondo para cerrar la repetición
  cierreMinimo: 125,
  cierreMaximo: 165,
  duracionMinimaMs: 300,
  // Filtro de cuadros "glitch": ángulo imposible o salto brusco de un cuadro al siguiente.
  rodillaMinimaPosible: 30,
  saltoMaximoPorCuadro: 55,
  cuadrosGlitchTolerados: 4,
  // Cuánto se destaca en el muslo el resultado de profundidad al terminar una repetición.
  destelloProfundidadMs: 1500,
} as const;

export type SegmentoDibujo = { desde: number; hasta: number; color: Color };

export type ResultadoRep = {
  numero: number;
  anguloMinimo: number;
  profundidad: Color;
  torso: Color;
  cabeza: Color;
  rodillas: Color;
  pies: Color;
  veredicto: Color;
  problemas: ClaveProblema[];
  mensaje: string;
};

export type EstadoSentadilla = {
  visible: boolean;
  lado: "izquierdo" | "derecho" | null;
  vista: "frente" | "lado" | null;
  anguloRodilla: number | null;
  inclinacionTorso: number | null;
  fase: "arriba" | "bajando" | "subiendo";
  repeticiones: number;
  repeticionesBuenas: number;
  ultimaRep: ResultadoRep | null;
  segmentos: SegmentoDibujo[];
  // El peor color en vivo (sin contar la profundidad): para el borde de alerta.
  alerta: Color;
  // Valores crudos (suavizados) de cada medida, para ajustar umbrales: torso y cabeza en
  // grados, rodillas hacia adentro como fracción del muslo, pies como separación de
  // tobillos / hombros, y qué tan de frente está el cuerpo (0 lado, 1 frente).
  metricas: { torso: number | null; cabeza: number | null; valgo: number | null; pies: number | null; frontalidad: number | null };
  mensaje: string;
};

export type ProblemaResumen = { clave: ClaveProblema; reps: number; rojas: number; texto: string; consejo: string };

export type ResumenSerie = {
  repeticiones: number;
  buenas: number;
  porcentajeBuenas: number;
  calificacion: Color;
  problemas: ProblemaResumen[];
  titulo: string;
};

const COLORES_ORDEN: Color[] = ["neutro", "verde", "amarillo", "rojo"];
const peor = (...cs: Color[]): Color => COLORES_ORDEN[Math.max(...cs.map((c) => COLORES_ORDEN.indexOf(c)))];

const colorProfundidad = (angulo: number): Color =>
  angulo <= UMBRALES_SENTADILLA.profundidadVerde ? "verde" : angulo <= UMBRALES_SENTADILLA.profundidadAmarillo ? "amarillo" : "rojo";
const colorTorso = (grados: number): Color =>
  grados <= UMBRALES_SENTADILLA.torsoVerde ? "verde" : grados <= UMBRALES_SENTADILLA.torsoAmarillo ? "amarillo" : "rojo";
const colorCabeza = (grados: number): Color =>
  grados >= UMBRALES_SENTADILLA.cabezaVerde ? "verde" : grados >= UMBRALES_SENTADILLA.cabezaAmarillo ? "amarillo" : "rojo";
const colorValgo = (ratio: number): Color =>
  ratio <= UMBRALES_SENTADILLA.valgoVerde ? "verde" : ratio <= UMBRALES_SENTADILLA.valgoAmarillo ? "amarillo" : "rojo";
const colorPies = (ratio: number): Color => {
  const U = UMBRALES_SENTADILLA;
  if (ratio >= U.piesVerdeMin && ratio <= U.piesVerdeMax) return "verde";
  if (ratio >= U.piesAmarilloMin && ratio <= U.piesAmarilloMax) return "amarillo";
  return "rojo";
};

const TEXTOS: Record<ClaveProblema, { texto: string; consejo: string }> = {
  profundidad: { texto: "Profundidad corta", consejo: "Bajá más: apuntá a que el muslo llegue paralelo al piso." },
  torso: { texto: "Torso muy inclinado", consejo: "Mantené el pecho arriba y la espalda firme durante todo el movimiento." },
  cabeza: { texto: "Cabeza fuera de posición", consejo: "Mantené la cabeza neutra, mirando al frente: sin dejarla caer ni echarla atrás." },
  rodillas: { texto: "Rodillas hacia adentro", consejo: "Empujá las rodillas hacia afuera, siguiendo la línea de los pies." },
  pies: { texto: "Pies mal ubicados", consejo: "Separá los pies al ancho de los hombros (un poco más está bien)." },
};

const MENSAJE_VIVO: Record<Exclude<ClaveProblema, "profundidad">, { rojo: string; amarillo: string }> = {
  rodillas: { rojo: "¡Rodillas hacia adentro! Empujalas hacia afuera.", amarillo: "Cuidá que las rodillas no se cierren." },
  torso: { rojo: "¡Espalda muy inclinada! Subí el pecho.", amarillo: "Cuidá la inclinación del torso." },
  cabeza: { rojo: "¡Cabeza fuera de posición! Mirá al frente.", amarillo: "Mantené la cabeza neutra." },
  pies: { rojo: "¡Pies mal ubicados! Ponelos al ancho de los hombros.", amarillo: "Ajustá el ancho de los pies." },
};

type Metricas = {
  torso: number | null;
  cabeza: number | null;
  valgo: number | null;
  pies: number | null;
};

export class AnalizadorSentadilla {
  private rodilla = new Suavizador(0.6);
  private torso = new SuavizadorRobusto(0.5, UMBRALES_SENTADILLA.saltoTorsoPorCuadro);
  private cabeza = new SuavizadorRobusto(0.5, UMBRALES_SENTADILLA.saltoCabezaPorCuadro);
  private valgo = new SuavizadorRobusto(0.5, UMBRALES_SENTADILLA.saltoValgoPorCuadro);
  private frontalSuave = new Suavizador(0.3);
  private enFrente = false;
  private ladoActual: "izquierdo" | "derecho" | null = null;

  private fase: "esperando" | "bajando" | "subiendo" = "esperando";
  private maxEsperando = 0;
  private minRep = 180;
  // Mínimo del ángulo SIN suavizar durante la repetición: el suavizado atenúa los extremos en
  // las repeticiones rápidas y haría parecer la bajada menos profunda de lo que fue.
  private minCrudoRep = 180;
  private maxSubida = 0;
  private inicioMs = 0;
  private peoresRep: Record<Exclude<ClaveProblema, "profundidad">, Color> = { torso: "neutro", cabeza: "neutro", rodillas: "neutro", pies: "neutro" };

  private reps = 0;
  private buenas = 0;
  private ultima: ResultadoRep | null = null;
  private finUltimaRepMs = -1e9;
  private conteoProblemas: Record<ClaveProblema, { reps: number; rojas: number }> = this.problemasVacios();

  private ultimoCrudo: number | null = null;
  private glitchSeguidos = 0;
  private ultimoEstado: EstadoSentadilla | null = null;

  private problemasVacios() {
    return {
      profundidad: { reps: 0, rojas: 0 },
      torso: { reps: 0, rojas: 0 },
      cabeza: { reps: 0, rojas: 0 },
      rodillas: { reps: 0, rojas: 0 },
      pies: { reps: 0, rojas: 0 },
    };
  }

  reset() {
    this.rodilla.reset();
    this.torso.reset();
    this.cabeza.reset();
    this.valgo.reset();
    this.frontalSuave.reset();
    this.enFrente = false;
    this.ladoActual = null;
    this.fase = "esperando";
    this.maxEsperando = 0;
    this.minRep = 180;
    this.minCrudoRep = 180;
    this.maxSubida = 0;
    this.reps = 0;
    this.buenas = 0;
    this.ultima = null;
    this.finUltimaRepMs = -1e9;
    this.conteoProblemas = this.problemasVacios();
    this.ultimoCrudo = null;
    this.glitchSeguidos = 0;
    this.ultimoEstado = null;
    this.reiniciarPeores();
  }

  private reiniciarPeores() {
    this.peoresRep = { torso: "neutro", cabeza: "neutro", rodillas: "neutro", pies: "neutro" };
  }

  // `landmarks`: los 33 puntos de la imagen (normalizados). `mundo`: los 33 puntos
  // 3D en metros (opcional; sin ellos se usa la imagen). `tMs`: reloj creciente.
  // `aspecto`: ancho/alto del video, solo para corregir la imagen cuando no hay `mundo`.
  procesar(landmarks: Punto[] | undefined, tMs: number, mundo?: Punto[], aspecto = 1): EstadoSentadilla {
    const U = UMBRALES_SENTADILLA;
    const vacio = (mensaje: string): EstadoSentadilla => ({
      visible: false,
      lado: this.ladoActual,
      vista: null,
      anguloRodilla: null,
      inclinacionTorso: null,
      fase: this.fase === "esperando" ? "arriba" : this.fase,
      repeticiones: this.reps,
      repeticionesBuenas: this.buenas,
      ultimaRep: this.ultima,
      segmentos: [],
      alerta: "neutro",
      metricas: { torso: null, cabeza: null, valgo: null, pies: null, frontalidad: null },
      mensaje,
    });

    if (!landmarks || landmarks.length < 29) return vacio("No te veo. Pasá a cuadro con el cuerpo entero.");

    const izq = [PUNTO.hombroIzq, PUNTO.caderaIzq, PUNTO.rodillaIzq, PUNTO.tobilloIzq];
    const der = [PUNTO.hombroDer, PUNTO.caderaDer, PUNTO.rodillaDer, PUNTO.tobilloDer];
    const media = (idx: number[]) => idx.reduce((s, i) => s + visibilidad(landmarks[i]), 0) / idx.length;
    const minimo = (idx: number[]) => Math.min(...idx.map((i) => visibilidad(landmarks[i])));

    const lado = media(izq) >= media(der) ? "izquierdo" : "derecho";
    const idx = lado === "izquierdo" ? izq : der;
    if (minimo(idx) < U.visibilidadMinima) return vacio("No te veo entero. Alejá el teléfono para que entre todo el cuerpo.");
    if (this.ladoActual && this.ladoActual !== lado) {
      this.rodilla.reset();
      this.torso.reset();
      this.cabeza.reset();
    }
    this.ladoActual = lado;

    const P = (i: number): Punto3 => (mundo && mundo[i] ? aVec(mundo[i]) : aVec(landmarks[i], aspecto));
    const vis = (i: number) => visibilidad(landmarks[i]);
    const [iH, iC, iR, iT] = idx;
    const iOreja = lado === "izquierdo" ? PUNTO.orejaIzq : PUNTO.orejaDer;

    // --- Ángulos principales (3D) ---
    const crudo = angulo3D(P(iC), P(iR), P(iT));
    const imposible = crudo < U.rodillaMinimaPosible;
    const salto = this.ultimoCrudo !== null && Math.abs(crudo - this.ultimoCrudo) > U.saltoMaximoPorCuadro;
    if ((imposible || salto) && this.ultimoEstado && this.glitchSeguidos < U.cuadrosGlitchTolerados) {
      this.glitchSeguidos += 1;
      return this.ultimoEstado;
    }
    this.glitchSeguidos = 0;
    this.ultimoCrudo = crudo;
    const angRod = this.rodilla.push(crudo);
    const incl = this.torso.push(inclinacionVertical3D(P(iC), P(iH)));

    // --- Cabeza ---
    let neck: number | null = null;
    if (vis(iOreja) >= U.visibilidadCabeza) neck = this.cabeza.push(angulo3D(P(iOreja), P(iH), P(iC)));

    // --- Vista de frente: rodillas y pies ---
    const ambosLados = minimo(izq) >= U.visibilidadMinima && minimo(der) >= U.visibilidadMinima;
    const ejeCadera = restar(P(PUNTO.caderaDer), P(PUNTO.caderaIzq));
    const frontalidadCruda = norma(ejeCadera) > 0 ? Math.abs(ejeCadera.x) / norma(ejeCadera) : 0;
    const frontalidad = this.frontalSuave.push(frontalidadCruda);
    // Histéresis: entra en "de frente" con frontalMinimo y sale recién con frontalSalir.
    this.enFrente = ambosLados && (this.enFrente ? frontalidad >= U.frontalSalir : frontalidad >= U.frontalMinimo);
    const deFrente = this.enFrente;
    let valgo: number | null = null;
    let pies: number | null = null;
    if (deFrente) {
      const lat = escalar(ejeCadera, 1 / norma(ejeCadera));
      const valgoPierna = (iCad: number, iRod: number, iTob: number, signo: 1 | -1) => {
        const cad = P(iCad);
        const rod = P(iRod);
        const d = restar(P(iTob), cad);
        const dd = punto(d, d);
        if (dd === 0) return 0;
        const t = punto(restar(rod, cad), d) / dd;
        const sobreLinea = sumar(cad, escalar(d, t));
        const desvio = punto(restar(rod, sobreLinea), lat) * signo;
        const muslo = norma(restar(rod, cad));
        return muslo > 0 ? desvio / muslo : 0;
      };
      const vi = valgoPierna(PUNTO.caderaIzq, PUNTO.rodillaIzq, PUNTO.tobilloIzq, 1);
      const vd = valgoPierna(PUNTO.caderaDer, PUNTO.rodillaDer, PUNTO.tobilloDer, -1);
      valgo = this.valgo.push(Math.max(vi, vd, -1));
      const hombros = Math.abs(P(PUNTO.hombroDer).x - P(PUNTO.hombroIzq).x);
      if (hombros > 0) pies = Math.abs(P(PUNTO.tobilloDer).x - P(PUNTO.tobilloIzq).x) / hombros;
    } else {
      this.valgo.reset();
    }

    const m: Metricas = { torso: incl, cabeza: neck, valgo, pies };
    // Parado (esperando la próxima repetición) se muestra todo en verde: el ancho de los pies, la
    // cabeza y las rodillas solo son confiables y relevantes mientras se hace el movimiento.
    const enMov = this.fase !== "esperando" || angRod < U.rodillaBajando;
    const colTorso: Color = enMov ? colorTorso(incl) : "verde";
    const colCabeza: Color = !enMov ? "verde" : neck === null ? "neutro" : colorCabeza(neck);
    const colValgo: Color = !enMov ? "verde" : valgo === null ? "neutro" : colorValgo(valgo);
    const colPies: Color = !enMov ? "verde" : pies === null ? "neutro" : colorPies(pies);

    // --- Máquina de estados de la repetición (por giros del movimiento) ---
    this.actualizarRepeticion(angRod, crudo, tMs, { torso: colTorso, cabeza: colCabeza, rodillas: colValgo, pies: colPies });

    // --- Colores en vivo ---
    const destello = tMs - this.finUltimaRepMs < U.destelloProfundidadMs && this.ultima && this.ultima.profundidad !== "verde";
    const colPierna: Color = destello ? (this.ultima as ResultadoRep).profundidad : colValgo === "neutro" ? "verde" : colValgo;
    const colPantorrilla: Color = peor(colValgo === "neutro" ? "verde" : colValgo, colPies === "neutro" ? "verde" : colPies);
    const colTorsoDib: Color = colTorso;
    const colCabezaDib: Color = colCabeza === "neutro" ? "verde" : colCabeza;

    const lados: [number, number, number, number, number][] = [[iH, iC, iR, iT, iOreja]];
    if (deFrente) {
      const otro = lado === "izquierdo" ? der : izq;
      lados.push([otro[0], otro[1], otro[2], otro[3], lado === "izquierdo" ? PUNTO.orejaDer : PUNTO.orejaIzq]);
    }
    const segmentos: SegmentoDibujo[] = [];
    for (const [h, c, r, t, o] of lados) {
      segmentos.push({ desde: h, hasta: c, color: colTorsoDib });
      if (vis(o) >= U.visibilidadCabeza) segmentos.push({ desde: o, hasta: h, color: colCabezaDib });
      segmentos.push({ desde: c, hasta: r, color: colPierna });
      segmentos.push({ desde: r, hasta: t, color: colPantorrilla });
    }

    const alerta = peor(colTorso, colCabeza, colValgo, colPies);

    // --- Mensaje ---
    let mensaje = "Listo. Empezá a bajar.";
    const orden: Exclude<ClaveProblema, "profundidad">[] = ["rodillas", "torso", "cabeza", "pies"];
    const colores = { torso: colTorso, cabeza: colCabeza, rodillas: colValgo, pies: colPies };
    const rojo = orden.find((k) => colores[k] === "rojo");
    const amarillo = orden.find((k) => colores[k] === "amarillo");
    const enMovimiento = this.fase !== "esperando";
    if (rojo) mensaje = MENSAJE_VIVO[rojo].rojo;
    else if (amarillo) mensaje = MENSAJE_VIVO[amarillo].amarillo;
    else if (enMovimiento) {
      if (this.fase === "bajando" && this.minRep > U.profundidadAmarillo) mensaje = "Seguí bajando.";
      else if (colorProfundidad(this.minRep) === "amarillo") mensaje = "Casi: bajá un poco más.";
      else if (colorProfundidad(this.minRep) === "verde") mensaje = "Buena profundidad. Ahora subí.";
    } else if (this.ultima) mensaje = this.ultima.mensaje;

    const estado: EstadoSentadilla = {
      visible: true,
      lado,
      vista: deFrente ? "frente" : "lado",
      anguloRodilla: angRod,
      inclinacionTorso: m.torso,
      fase: this.fase === "esperando" ? "arriba" : this.fase,
      repeticiones: this.reps,
      repeticionesBuenas: this.buenas,
      ultimaRep: this.ultima,
      segmentos,
      alerta,
      metricas: { torso: m.torso, cabeza: m.cabeza, valgo: m.valgo, pies: m.pies, frontalidad },
      mensaje,
    };
    this.ultimoEstado = estado;
    return estado;
  }

  private actualizarRepeticion(
    ang: number,
    crudo: number,
    tMs: number,
    cols: Record<Exclude<ClaveProblema, "profundidad">, Color>
  ) {
    const U = UMBRALES_SENTADILLA;
    if (this.fase !== "esperando") {
      for (const k of ["torso", "cabeza", "rodillas", "pies"] as const) this.peoresRep[k] = peor(this.peoresRep[k], cols[k]);
      this.minCrudoRep = Math.min(this.minCrudoRep, crudo);
    }

    if (this.fase === "esperando") {
      this.maxEsperando = Math.max(this.maxEsperando, ang);
      if (ang < U.rodillaBajando && ang <= this.maxEsperando - U.bajadaParaIniciar) {
        this.fase = "bajando";
        this.minRep = ang;
        this.minCrudoRep = crudo;
        this.inicioMs = tMs;
        this.reiniciarPeores();
        for (const k of ["torso", "cabeza", "rodillas", "pies"] as const) this.peoresRep[k] = cols[k];
      }
    } else if (this.fase === "bajando") {
      this.minRep = Math.min(this.minRep, ang);
      if (ang >= this.minRep + U.subidaParaMarcarSubiendo) {
        this.fase = "subiendo";
        this.maxSubida = ang;
      }
    } else {
      this.maxSubida = Math.max(this.maxSubida, ang);
      if (ang <= this.maxSubida - U.rebote) {
        this.fase = "bajando";
        this.minRep = Math.min(this.minRep, ang);
      } else {
        const cierre = Math.min(U.cierreMaximo, Math.max(U.cierreMinimo, this.minRep + U.subidaParaCerrar));
        if (ang >= cierre) {
          if (this.minRep < U.repMinimaProfundidad && tMs - this.inicioMs >= U.duracionMinimaMs) this.cerrarRepeticion(tMs);
          this.fase = "esperando";
          this.maxEsperando = ang;
          this.minRep = 180;
          this.minCrudoRep = 180;
        }
      }
    }
  }

  private cerrarRepeticion(tMs: number) {
    this.reps += 1;
    this.finUltimaRepMs = tMs;
    const fondo = Math.min(this.minRep, this.minCrudoRep);
    const profundidad = colorProfundidad(fondo);
    const p = this.peoresRep;
    const colores: Record<ClaveProblema, Color> = { profundidad, torso: p.torso, cabeza: p.cabeza, rodillas: p.rodillas, pies: p.pies };
    const veredicto = peor(...Object.values(colores));
    if (veredicto === "verde" || veredicto === "neutro") this.buenas += 1;

    const problemas = (Object.keys(colores) as ClaveProblema[]).filter((k) => colores[k] === "amarillo" || colores[k] === "rojo");
    for (const k of problemas) {
      this.conteoProblemas[k].reps += 1;
      if (colores[k] === "rojo") this.conteoProblemas[k].rojas += 1;
    }

    this.ultima = {
      numero: this.reps,
      anguloMinimo: Math.round(fondo),
      profundidad,
      torso: p.torso,
      cabeza: p.cabeza,
      rodillas: p.rodillas,
      pies: p.pies,
      veredicto,
      problemas,
      mensaje:
        problemas.length === 0
          ? `Rep ${this.reps}: bien hecha.`
          : `Rep ${this.reps}: ${problemas.map((k) => TEXTOS[k].texto.toLowerCase()).join(", ")}.`,
    };
    this.reiniciarPeores();
  }

  // Resumen de la serie hasta ahora, para mostrar al terminar.
  resumen(): ResumenSerie {
    const problemas: ProblemaResumen[] = (Object.keys(this.conteoProblemas) as ClaveProblema[])
      .filter((k) => this.conteoProblemas[k].reps > 0)
      .map((k) => ({ clave: k, reps: this.conteoProblemas[k].reps, rojas: this.conteoProblemas[k].rojas, ...TEXTOS[k] }))
      .sort((a, b) => b.rojas - a.rojas || b.reps - a.reps);
    const porcentajeBuenas = this.reps > 0 ? Math.round((this.buenas / this.reps) * 100) : 0;
    const calificacion: Color =
      this.reps === 0 ? "neutro" : problemas.some((x) => x.rojas > 0) ? "rojo" : problemas.length > 0 ? "amarillo" : "verde";
    const titulo =
      this.reps === 0
        ? "No se contó ninguna repetición."
        : calificacion === "verde"
          ? "¡Serie limpia! Todas las repeticiones bien hechas."
          : calificacion === "amarillo"
            ? "Buena serie, con detalles para corregir."
            : "Hay cosas importantes para corregir antes de seguir.";
    return { repeticiones: this.reps, buenas: this.buenas, porcentajeBuenas, calificacion, problemas, titulo };
  }
}

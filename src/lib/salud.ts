export type Genero = "masculino" | "femenino";

export type MedicionSalud = {
  peso: number | null;
  altura: number | null;
  cuello: number | null;
  cintura: number | null;
  caderas: number | null;
};

export type ClasificacionIMC =
  | "Bajo Peso"
  | "Peso Normal"
  | "Sobrepeso"
  | "Obesidad Clase 1"
  | "Obesidad Clase 2"
  | "Obesidad Clase 3";

export type ClasificacionGrasa =
  | "Error"
  | "Grasa Esencial"
  | "Atletas"
  | "Fitness"
  | "Promedio"
  | "Obesidad";

export type ClasificacionMasaMagra = "Bajo" | "Estándar" | "Alto" | "Riesgoso";

export type ClasificacionGrasaVisceral = "Estándar" | "Alto" | "Riesgoso";

export type EstadisticasSalud = {
  imc: number;
  imcClasificacion: ClasificacionIMC;
  grasaCorporal: number;
  grasaClasificacion: ClasificacionGrasa;
  masaMagraKg: number;
  masaMagraPorcentaje: number;
  masaMagraClasificacion: ClasificacionMasaMagra;
  indiceGrasaVisceral: number;
  grasaVisceralClasificacion: ClasificacionGrasaVisceral;
};

/** Requiere peso, altura, cuello, cintura y caderas cargados. */
export function tieneDatosSuficientes(m: MedicionSalud): boolean {
  return (
    m.peso !== null &&
    m.altura !== null &&
    m.cuello !== null &&
    m.cintura !== null &&
    m.caderas !== null
  );
}

function clasificarIMC(imc: number): ClasificacionIMC {
  if (imc < 18.5) return "Bajo Peso";
  if (imc < 25) return "Peso Normal";
  if (imc < 30) return "Sobrepeso";
  if (imc < 35) return "Obesidad Clase 1";
  if (imc < 40) return "Obesidad Clase 2";
  return "Obesidad Clase 3";
}

function clasificarGrasa(porcentaje: number, genero: Genero): ClasificacionGrasa {
  if (genero === "masculino") {
    if (porcentaje < 2) return "Error";
    if (porcentaje <= 5) return "Grasa Esencial";
    if (porcentaje <= 13) return "Atletas";
    if (porcentaje <= 17) return "Fitness";
    if (porcentaje <= 24) return "Promedio";
    return "Obesidad";
  }
  if (porcentaje < 10) return "Error";
  if (porcentaje <= 13) return "Grasa Esencial";
  if (porcentaje <= 20) return "Atletas";
  if (porcentaje <= 24) return "Fitness";
  if (porcentaje <= 31) return "Promedio";
  return "Obesidad";
}

function clasificarMasaMagra(porcentaje: number, genero: Genero): ClasificacionMasaMagra {
  const fraccion = porcentaje / 100;
  if (genero === "masculino") {
    if (fraccion < 0.7) return "Bajo";
    if (fraccion <= 0.85) return "Estándar";
    if (fraccion <= 0.95) return "Alto";
    return "Riesgoso";
  }
  if (fraccion < 0.65) return "Bajo";
  if (fraccion <= 0.8) return "Estándar";
  if (fraccion <= 0.9) return "Alto";
  return "Riesgoso";
}

function clasificarGrasaVisceral(ratio: number, genero: Genero): ClasificacionGrasaVisceral {
  if (genero === "masculino") {
    if (ratio <= 0.9) return "Estándar";
    if (ratio <= 0.95) return "Alto";
    return "Riesgoso";
  }
  if (ratio <= 0.85) return "Estándar";
  if (ratio <= 0.9) return "Alto";
  return "Riesgoso";
}

/**
 * Replica exacta de las fórmulas de la hoja "FORMULAS DB" / "PROGRESO A" del
 * Excel original: % de grasa por el método US Navy (log10 sobre cm, tal cual
 * lo usaba el Excel), IMC clásico, masa magra derivada del % de grasa, e
 * índice de grasa visceral aproximado por cintura/cadera (WHR).
 */
export function calcularEstadisticasSalud(
  m: MedicionSalud,
  genero: Genero
): EstadisticasSalud | null {
  if (!tieneDatosSuficientes(m)) return null;
  const peso = m.peso as number;
  const altura = m.altura as number;
  const cuello = m.cuello as number;
  const cintura = m.cintura as number;
  const caderas = m.caderas as number;

  const alturaM = altura * 0.01;
  const imc = peso / (alturaM * alturaM);

  const grasaCorporal =
    genero === "masculino"
      ? 86.01 * Math.log10(cintura - cuello) - 70.041 * Math.log10(altura) + 36.76
      : 163.205 * Math.log10(cintura + caderas - cuello) -
        97.684 * Math.log10(altura) -
        78.387;

  const masaMagraKg = peso - (peso * grasaCorporal) / 100;
  const masaMagraPorcentaje = 100 - grasaCorporal;

  const indiceGrasaVisceral = cintura / caderas;

  return {
    imc,
    imcClasificacion: clasificarIMC(imc),
    grasaCorporal,
    grasaClasificacion: clasificarGrasa(grasaCorporal, genero),
    masaMagraKg,
    masaMagraPorcentaje,
    masaMagraClasificacion: clasificarMasaMagra(masaMagraPorcentaje, genero),
    indiceGrasaVisceral,
    grasaVisceralClasificacion: clasificarGrasaVisceral(indiceGrasaVisceral, genero),
  };
}

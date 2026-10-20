// Interpreta lo que la persona dice al terminar una serie ("setenta kilos, RIR dos",
// "diez de lastre", "doce repeticiones") y lo convierte en campos de la ficha.
// Funciones puras: se prueban con texto, sin micrófono.

import type { ModalidadCarga } from "./carga";

export type DatosDictados = { peso?: number; lastre?: number; rir?: number; reps?: number };

const UNIDADES: Record<string, number> = {
  cero: 0, un: 1, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9,
  diez: 10, once: 11, doce: 12, trece: 13, catorce: 14, quince: 15, dieciseis: 16, diecisiete: 17, dieciocho: 18, diecinueve: 19,
  veinte: 20, veintiuno: 21, veintidos: 22, veintitres: 23, veinticuatro: 24, veinticinco: 25, veintiseis: 26, veintisiete: 27, veintiocho: 28, veintinueve: 29,
};
const DECENAS: Record<string, number> = { treinta: 30, cuarenta: 40, cincuenta: 50, sesenta: 60, setenta: 70, ochenta: 80, noventa: 90 };
const CENTENAS: Record<string, number> = { cien: 100, ciento: 100, doscientos: 200, trescientos: 300 };

const sinTildes = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Pasa números dichos con palabras a dígitos: "setenta y cinco coma cinco" -> "75,5". */
export function palabrasADigitos(texto: string): string {
  const t = sinTildes(texto.toLowerCase()).replace(/[.,;:!?¡¿]/g, (c) => (c === "." || c === "," ? c : " "));
  const tokens = t.split(/\s+/).filter(Boolean);
  const salida: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const w = tokens[i];
    const esNumero = (x: string) => x in UNIDADES || x in DECENAS || x in CENTENAS;
    if (!esNumero(w)) {
      salida.push(w);
      continue;
    }
    // Junta "ciento veinte", "setenta y cinco"
    let valor = 0;
    let j = i;
    while (j < tokens.length) {
      const x = tokens[j];
      if (x in CENTENAS) valor += CENTENAS[x];
      else if (x in DECENAS) valor += DECENAS[x];
      else if (x in UNIDADES) valor += UNIDADES[x];
      else if (x === "y" && j + 1 < tokens.length && tokens[j + 1] in UNIDADES && valor % 10 === 0 && valor > 0) {
        j++;
        continue;
      } else break;
      j++;
    }
    let texto2 = String(valor);
    // "coma cinco" -> decimales
    if ((tokens[j] === "coma" || tokens[j] === "punto") && tokens[j + 1] in UNIDADES) {
      texto2 += `,${UNIDADES[tokens[j + 1]]}`;
      j += 2;
    } else if (tokens[j] === "y" && tokens[j + 1] === "medio") {
      texto2 += ",5";
      j += 2;
    }
    salida.push(texto2);
    i = j - 1;
  }
  return salida.join(" ");
}

const num = (s: string) => Number(s.replace(",", "."));

/** Extrae peso / lastre / RIR / reps del texto dictado. */
export function interpretarDictado(texto: string, modalidad: ModalidadCarga): DatosDictados {
  const t = palabrasADigitos(texto).replace(/\s+/g, " ");
  const out: DatosDictados = {};
  const rir = t.match(/\brir\s*(?:de\s*)?(\d)\b/) ?? t.match(/\b(\d)\s*(?:de\s*)?rir\b/) ?? t.match(/reserva\s*(?:de\s*)?(\d)\b/);
  if (rir) out.rir = Number(rir[1]);
  const reps = t.match(/\b(\d{1,3})\s*(?:repeticiones|repeticion|reps|rep)\b/);
  if (reps) out.reps = Number(reps[1]);
  const lastre = t.match(/\b(\d+(?:[.,]\d+)?)\s*(?:kilos?|kg)?\s*(?:de\s*)?lastre\b/) ?? t.match(/\blastre\s*(?:de\s*)?(\d+(?:[.,]\d+)?)/);
  const kilos = t.match(/\b(\d+(?:[.,]\d+)?)\s*(?:kilos?|kg|kilogramos?)\b/);
  if (lastre) out.lastre = num(lastre[1]);
  else if (kilos) {
    // En ejercicios de peso corporal, "diez kilos" es el lastre; en los demás, el peso.
    if (modalidad === "peso_corporal") out.lastre = num(kilos[1]);
    else if (modalidad === "con_peso") out.peso = num(kilos[1]);
  }
  return out;
}

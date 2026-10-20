// Niveles de fuerza por levantamiento: 1RM en kg según peso corporal y sexo.
// Fuente: StrengthLog (strengthlog.com, tablas "strength standards (kg)" de sentadilla, peso muerto,
// press banca y press militar). Cada nivel es el porcentaje de levantadores de esa base que supera:
// Principiante ~5 %, Novicio ~25 %, Intermedio ~50 %, Avanzado ~75 %, Élite ~95 %.
// Se guardan los pesos corporales de 50 a 120 kg de a 10 y se interpola linealmente entre ellos
// (por debajo de 50 o encima de 120 se usa el extremo). Es una referencia orientativa, no un diagnóstico.

export type Sexo = "masculino" | "femenino";
export type Levantamiento = "banca" | "sentadilla" | "peso_muerto" | "press_militar";
export type NombreNivel = "Inicial" | "Principiante" | "Novicio" | "Intermedio" | "Avanzado" | "Élite";

// [peso corporal, principiante, novicio, intermedio, avanzado, élite]
type Fila = [number, number, number, number, number, number];

const TABLAS: Record<Sexo, Record<Levantamiento, Fila[]>> = {
  masculino: {
    banca: [[50, 24, 38, 47, 55, 86], [60, 36, 52, 64, 76, 108], [70, 46, 64, 78, 94, 127], [80, 54, 74, 90, 109, 143], [90, 62, 83, 101, 123, 158], [100, 69, 91, 111, 135, 170], [110, 75, 99, 120, 146, 182], [120, 81, 105, 128, 156, 193]],
    sentadilla: [[50, 36, 57, 70, 80, 97], [60, 44, 70, 87, 102, 129], [70, 51, 80, 100, 120, 157], [80, 57, 89, 112, 137, 180], [90, 63, 97, 123, 151, 201], [100, 67, 104, 132, 164, 219], [110, 72, 110, 140, 175, 236], [120, 76, 116, 148, 186, 252]],
    peso_muerto: [[50, 47, 72, 96, 113, 132], [60, 57, 87, 114, 136, 164], [70, 66, 100, 129, 155, 192], [80, 73, 111, 142, 172, 216], [90, 79, 121, 154, 187, 236], [100, 85, 130, 164, 200, 255], [110, 91, 137, 174, 212, 272], [120, 95, 145, 182, 223, 288]],
    press_militar: [[50, 21, 29, 34, 37, 43], [60, 25, 35, 42, 47, 57], [70, 29, 41, 48, 55, 69], [80, 32, 45, 53, 62, 79], [90, 35, 49, 58, 69, 88], [100, 37, 53, 63, 74, 96], [110, 39, 56, 67, 79, 103], [120, 41, 59, 70, 84, 110]],
  },
  femenino: {
    banca: [[40, 17, 27, 35, 39, 53], [50, 20, 30, 39, 46, 65], [60, 22, 33, 42, 51, 75], [70, 24, 35, 45, 56, 83], [80, 26, 37, 47, 60, 91], [90, 27, 39, 49, 63, 97], [100, 29, 41, 51, 67, 103], [110, 30, 42, 53, 69, 108], [120, 31, 44, 54, 72, 113]],
    sentadilla: [[40, 20, 40, 58, 73, 91], [50, 22, 44, 63, 80, 105], [60, 24, 48, 67, 85, 117], [70, 26, 51, 70, 90, 127], [80, 28, 53, 73, 93, 135], [90, 29, 55, 75, 97, 143], [100, 31, 57, 77, 100, 150], [110, 32, 59, 79, 103, 156], [120, 33, 60, 81, 105, 162]],
    peso_muerto: [[40, 34, 51, 66, 84, 107], [50, 36, 58, 74, 95, 122], [60, 38, 64, 81, 103, 135], [70, 39, 69, 86, 111, 145], [80, 41, 73, 91, 117, 154], [90, 42, 77, 96, 122, 163], [100, 43, 80, 99, 127, 170], [110, 44, 83, 103, 132, 176], [120, 45, 86, 106, 136, 182]],
    press_militar: [[40, 12, 20, 24, 28, 33], [50, 13, 22, 27, 31, 39], [60, 14, 23, 28, 34, 43], [70, 15, 24, 30, 36, 47], [80, 16, 25, 31, 38, 50], [90, 16, 26, 32, 40, 53], [100, 17, 27, 33, 41, 56], [110, 18, 27, 34, 43, 58], [120, 18, 28, 35, 44, 60]],
  },
};

// Qué ejercicios del catálogo cuentan para cada levantamiento (con barra, es lo que miden las tablas).
export const LEVANTAMIENTO_DE: Record<number, Levantamiento> = {
  32: "banca", 269: "banca", 271: "banca", // press banco plano con barra (y variantes de agarre / pies)
  123: "sentadilla", // sentadilla con barra
  59: "peso_muerto", 241: "peso_muerto", // peso muerto (convencional y sumo)
  169: "press_militar", // press de hombro sentado con barra
};

const NOMBRES: NombreNivel[] = ["Inicial", "Principiante", "Novicio", "Intermedio", "Avanzado", "Élite"];

function umbrales(sexo: Sexo, lev: Levantamiento, pesoCorporal: number): number[] {
  const tabla = TABLAS[sexo][lev];
  if (pesoCorporal <= tabla[0][0]) return tabla[0].slice(1);
  const ultima = tabla[tabla.length - 1];
  if (pesoCorporal >= ultima[0]) return ultima.slice(1);
  for (let i = 0; i < tabla.length - 1; i++) {
    const [a, b] = [tabla[i], tabla[i + 1]];
    if (pesoCorporal >= a[0] && pesoCorporal <= b[0]) {
      const f = (pesoCorporal - a[0]) / (b[0] - a[0]);
      return a.slice(1).map((v, k) => v + (b[k + 1] - v) * f);
    }
  }
  return ultima.slice(1);
}

export type NivelFuerza = {
  nivel: NombreNivel;
  siguiente: NombreNivel | null;
  siguienteKg: number | null; // 1RM que falta alcanzar para el próximo nivel
  progreso: number; // 0..1 dentro del tramo actual
  indice: number; // 0..5 (para dibujar la barra)
};

/** Nivel de un 1RM estimado (kg) para un peso corporal y sexo. */
export function nivelDeFuerza(sexo: Sexo, lev: Levantamiento, pesoCorporal: number, uno_rm: number): NivelFuerza {
  const u = umbrales(sexo, lev, pesoCorporal); // [princ, novicio, interm, avanzado, élite]
  let k = 0; // 0 = por debajo de Principiante (Inicial)
  while (k < u.length && uno_rm >= u[k]) k++;
  const nivel = NOMBRES[k];
  if (k >= u.length) return { nivel, siguiente: null, siguienteKg: null, progreso: 1, indice: 5 };
  const piso = k === 0 ? 0 : u[k - 1];
  const progreso = Math.max(0, Math.min(1, (uno_rm - piso) / (u[k] - piso)));
  return { nivel, siguiente: NOMBRES[k + 1], siguienteKg: Math.ceil(u[k]), progreso, indice: k + progreso };
}

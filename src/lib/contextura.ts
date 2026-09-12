import type { Genero } from "@/lib/salud";

export type Contextura = "Chica" | "Mediana" | "Grande";

// Relación altura/muñeca -- método clásico de clasificación de contextura
// ósea, independiente de las fórmulas de Salud (esas no usan la muñeca).
export function clasificarContextura(alturaCm: number, munecaCm: number, genero: Genero): Contextura {
  const ratio = alturaCm / munecaCm;
  if (genero === "masculino") {
    if (ratio > 10.4) return "Chica";
    if (ratio >= 9.6) return "Mediana";
    return "Grande";
  }
  if (ratio > 10.9) return "Chica";
  if (ratio >= 9.9) return "Mediana";
  return "Grande";
}

// Fórmula de Devine (peso ideal base), ajustada ±10% según la contextura.
function pesoIdealBaseKg(alturaCm: number, genero: Genero): number {
  const pulgadas = alturaCm / 2.54;
  const pulgadasSobre5Pies = Math.max(0, pulgadas - 60);
  return genero === "masculino"
    ? 50 + 2.3 * pulgadasSobre5Pies
    : 45.5 + 2.3 * pulgadasSobre5Pies;
}

export function calcularContexturaYPesoIdeal(
  alturaCm: number,
  munecaCm: number,
  genero: Genero
): { contextura: Contextura; pesoIdealKg: number } {
  const contextura = clasificarContextura(alturaCm, munecaCm, genero);
  const base = pesoIdealBaseKg(alturaCm, genero);
  const factor = contextura === "Chica" ? 0.9 : contextura === "Grande" ? 1.1 : 1;
  return { contextura, pesoIdealKg: Math.round(base * factor * 10) / 10 };
}

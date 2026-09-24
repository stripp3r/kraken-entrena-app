import type { AnalisisRutina } from "@/lib/analisis-rutina";

// Convierte los desgloses crudos de pentagono.ts al formato {label, valor}
// que espera <TablaMetrica>, con el mismo criterio de texto en las 3
// pantallas que los muestran (wizard, análisis individual, comparador).
export function filasFrecuencia(datos: AnalisisRutina["frecuenciaPorGrupo"]) {
  return datos.map(({ grupo, vecesPorSemana }) => ({
    label: grupo,
    valor: `${vecesPorSemana}x/semana`,
  }));
}

export function filasRecuperacion(datos: AnalisisRutina["recuperacionPorGrupo"]) {
  return datos.map(({ grupo, diasDescanso }) => ({
    label: grupo,
    valor: `${diasDescanso} días`,
  }));
}

export function filasIntensidad(datos: AnalisisRutina["intensidadPorDia"]) {
  return datos.map(({ dia, rirPromedio }) => ({
    label: `Día ${dia}`,
    valor: `RIR ${rirPromedio}`,
  }));
}

export function filasSostenibilidad(datos: AnalisisRutina["sostenibilidadPorDia"]) {
  return datos.map(({ dia, minutos }) => ({
    label: `Día ${dia}`,
    valor: `~${minutos} min`,
  }));
}

// Suma de los minutos de todos los días de entreno de la semana -- separado
// del desglose por día porque responde una pregunta distinta ("¿cuánto
// tiempo de gimnasio me pide esta rutina en total?"), no "por sesión".
export function minutosTotalesSemana(datos: AnalisisRutina["sostenibilidadPorDia"]): number {
  return datos.reduce((acc, d) => acc + d.minutos, 0);
}

export function formatearMinutosSemana(minutos: number): string {
  const horas = Math.round((minutos / 60) * 10) / 10;
  return `~${minutos} min (~${horas} h)`;
}

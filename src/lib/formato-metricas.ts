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
    valor: diasDescanso === null ? "No se repite" : `${diasDescanso} días`,
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

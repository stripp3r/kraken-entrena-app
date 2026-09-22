// Las rutinas armadas por el coach (Kraken Split, Full Body, etc.) guardan
// `series_reps` como texto libre ("3 x 10-12", "3 x 8-12 (RIR 0-1)", "3 x 15
// por lado") en vez de columnas numéricas -- así se cargaron desde el
// arranque de la app y no vale la pena reescribir a mano ~200 filas para
// una función de análisis. Esto extrae lo que puede de ese texto (mejor
// esfuerzo, no exacto) y cae en valores por defecto razonables cuando no
// puede -- así "Análisis" siempre muestra algo en vez de romperse con texto
// raro o con las rutinas que no tienen `series_reps` cargado en absoluto.
export type SeriesRepsParseado = {
  series: number;
  repsMin: number;
  repsMax: number;
  rirObjetivo: number;
};

const POR_DEFECTO: SeriesRepsParseado = { series: 3, repsMin: 8, repsMax: 12, rirObjetivo: 2 };

export function parsearSeriesReps(texto: string | null | undefined): SeriesRepsParseado {
  if (!texto) return { ...POR_DEFECTO };

  const principal = texto.match(/(\d+)\s*(?:-\s*(\d+))?\s*[x×X]\s*([\d\s-]+)/);
  if (!principal) return { ...POR_DEFECTO };

  const [, serieDesde, serieHasta, repsCrudo] = principal;
  const series = serieHasta
    ? Math.round((Number(serieDesde) + Number(serieHasta)) / 2)
    : Number(serieDesde);

  // Series descendentes ("15-12-10") o rangos ("8-12") -- nos quedamos con
  // el mínimo y el máximo de todos los números que aparecen.
  const numerosReps = (repsCrudo.match(/\d+/g) ?? []).map(Number);
  const repsMin = numerosReps.length ? Math.min(...numerosReps) : POR_DEFECTO.repsMin;
  const repsMax = numerosReps.length ? Math.max(...numerosReps) : POR_DEFECTO.repsMax;

  const rir = texto.match(/RIR\s*(\d+)\s*(?:-\s*(\d+))?/i);
  const rirObjetivo = rir
    ? rir[2]
      ? (Number(rir[1]) + Number(rir[2])) / 2
      : Number(rir[1])
    : POR_DEFECTO.rirObjetivo;

  return {
    series: series || POR_DEFECTO.series,
    repsMin,
    repsMax: Math.max(repsMax, repsMin),
    rirObjetivo,
  };
}

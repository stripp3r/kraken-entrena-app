"use client";

import {
  calcularEstadisticasSalud,
  tieneDatosSuficientes,
  type Genero,
  type MedicionSalud,
} from "@/lib/salud";

function num(n: number, decimales = 1) {
  return n.toFixed(decimales);
}

const COLOR_BUENO = "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
const COLOR_MEDIO = "border-yellow-500/30 bg-yellow-500/10 text-yellow-300";
const COLOR_MALO = "border-red-500/30 bg-red-500/10 text-red-300";

function colorIMC(c: string) {
  if (c === "Peso Normal") return COLOR_BUENO;
  if (c === "Bajo Peso" || c === "Sobrepeso") return COLOR_MEDIO;
  return COLOR_MALO;
}

function colorGrasa(c: string) {
  if (c === "Fitness" || c === "Atletas") return COLOR_BUENO;
  if (c === "Promedio" || c === "Grasa Esencial") return COLOR_MEDIO;
  return COLOR_MALO;
}

function colorEstandar(c: string) {
  if (c === "Estándar") return COLOR_BUENO;
  if (c === "Alto" || c === "Bajo") return COLOR_MEDIO;
  return COLOR_MALO;
}

function Metrica({
  titulo,
  valor,
  clasificacion,
  color,
  explicacion,
}: {
  titulo: string;
  valor: string;
  clasificacion: string;
  color: string;
  explicacion: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-bg-card p-4">
      <p className="mb-1 text-[11px] uppercase tracking-wide text-gray-500">{titulo}</p>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-2xl text-white">{valor}</span>
        <span className={`rounded-full border px-2.5 py-1 text-xs ${color}`}>
          {clasificacion}
        </span>
      </div>
      <p className="text-xs text-gray-500">{explicacion}</p>
    </div>
  );
}

export function ProgresoSalud({
  medicion,
  genero,
}: {
  medicion: MedicionSalud;
  genero: Genero;
}) {
  if (!tieneDatosSuficientes(medicion)) {
    return (
      <div className="rounded-lg border border-border bg-bg-card p-4 text-center">
        <p className="text-sm text-gray-500">
          Para calcular tus valores de salud necesitamos peso, altura, cuello,
          cintura y caderas. Cargalos en{" "}
          <span className="text-white">Perfil → Mis medidas</span>.
        </p>
      </div>
    );
  }

  const stats = calcularEstadisticasSalud(medicion, genero);
  if (!stats) return null;

  return (
    <div className="flex flex-col gap-4">
      <Metrica
        titulo="IMC (Índice de masa corporal)"
        valor={num(stats.imc)}
        clasificacion={stats.imcClasificacion}
        color={colorIMC(stats.imcClasificacion)}
        explicacion="Relaciona tu peso con tu altura. Es una referencia general y rápida, no distingue entre masa muscular y grasa."
      />
      <Metrica
        titulo="Grasa corporal (%)"
        valor={`${num(stats.grasaCorporal)}%`}
        clasificacion={stats.grasaClasificacion}
        color={colorGrasa(stats.grasaClasificacion)}
        explicacion="Estimado a partir de tu cintura, cuello (y caderas si sos mujer). Te ayuda a ver la composición corporal más allá del peso en la balanza."
      />
      <Metrica
        titulo="Masa magra"
        valor={`${num(stats.masaMagraKg)} kg`}
        clasificacion={stats.masaMagraClasificacion}
        color={colorEstandar(stats.masaMagraClasificacion)}
        explicacion="Es tu peso sin contar la grasa corporal (músculo, huesos, órganos, agua). Ver que se mantenga o crezca es una buena señal en un proceso de pérdida de grasa."
      />
      <Metrica
        titulo="Índice de grasa visceral"
        valor={num(stats.indiceGrasaVisceral, 2)}
        clasificacion={stats.grasaVisceralClasificacion}
        color={colorEstandar(stats.grasaVisceralClasificacion)}
        explicacion="Relación cintura/cadera. Un valor alto se asocia a más grasa acumulada alrededor de los órganos, un factor de riesgo cardiovascular."
      />

      <p className="rounded-lg border border-border bg-bg-card p-4 text-xs text-gray-500">
        <strong className="text-gray-400">Importante:</strong> estos valores
        son estimaciones a partir de medidas corporales, no un diagnóstico
        médico. Sirven como referencia para ver tu tendencia en el tiempo, no
        como un número para obsesionarse. Ante cualquier duda de salud,
        consultá a un profesional.
      </p>
    </div>
  );
}

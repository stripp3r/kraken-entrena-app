import { adaptarPesoCorporal, type FilaMedida, type LogSerie } from "./progreso-simple";

// Datos de DEMOSTRACIÓN para la pantalla de prueba "Tu progreso" (/progreso/prueba?demo=1).
// No se guardan en ninguna base: se generan en el momento, con un caso de cada tipo:
// mejora por peso, mejora por una serie de más, estable (meseta), baja, ejercicio sin
// peso (por repeticiones), mejora con drop set y mejora por repeticiones.

type Plan = { nombre: string; grupos: string[]; sesiones: { peso: number | null; reps: number; series: number; drop?: boolean }[] };

const dias = (n: number) => {
  const d = new Date();
  d.setUTCHours(13, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - n);
  return d;
};

const repetir = <T,>(x: T, n: number) => Array.from({ length: n }, () => x);

const PLANES: Plan[] = [
  {
    nombre: "Press banco plano",
    grupos: ["Pecho", "Tríceps"],
    sesiones: [55, 55, 57.5, 57.5, 60, 60, 60, 62.5, 62.5, 62.5].map((peso) => ({ peso, reps: 8, series: 3 })),
  },
  {
    nombre: "Dorsales en polea",
    grupos: ["Espalda", "Bíceps"],
    sesiones: [...repetir({ peso: 45, reps: 10, series: 3 }, 6), ...repetir({ peso: 45, reps: 10, series: 4 }, 4)],
  },
  { nombre: "Sentadilla con barra", grupos: ["Cuádriceps", "Glúteos"], sesiones: repetir({ peso: 70, reps: 8, series: 3 }, 8) },
  {
    nombre: "Remo con barra",
    grupos: ["Espalda", "Bíceps", "Trapecio"],
    sesiones: [50, 50, 50, 50, 50, 47.5, 47.5, 45, 45, 45].map((peso) => ({ peso, reps: 8, series: 3 })),
  },
  {
    nombre: "Abdominales en banco",
    grupos: ["Abdominales"],
    sesiones: [15, 15, 16, 16, 18, 18, 20, 20, 22, 22].map((reps) => ({ peso: null, reps, series: 3 })),
  },
  {
    nombre: "Elevación lateral con mancuernas",
    grupos: ["Hombros"],
    sesiones: [12, 12, 12, 12, 12, 12, 14, 14, 14, 14].map((peso) => ({ peso, reps: 12, series: 3, drop: true })),
  },
  {
    nombre: "Curl de bíceps con mancuernas",
    grupos: ["Bíceps"],
    sesiones: [10, 10, 10, 10, 12, 12, 12, 12, 12, 12].map((peso, i) => ({ peso, reps: i < 4 ? 12 : 10, series: 3 })),
  },
];

export type EjercicioDemo = { nombre: string; grupos: string[]; logs: LogSerie[]; base?: number };

export function ejerciciosDemo(): EjercicioDemo[] {
  let id = 1;
  const normales = PLANES.map((p) => ({
    nombre: p.nombre,
    grupos: p.grupos,
    logs: p.sesiones.flatMap((s, i) => {
      const fecha = dias((p.sesiones.length - 1 - i) * 3 + (i === p.sesiones.length - 1 ? 0 : 0));
      const filas: LogSerie[] = [];
      for (let k = 0; k < s.series; k++) {
        const t = new Date(fecha.getTime() + k * 120_000);
        const idPrincipal = id++;
        const ultima = k === s.series - 1;
        filas.push({
          id: idPrincipal,
          peso: s.peso,
          reps: s.reps,
          rir: 1,
          tipo_serie: s.drop && ultima ? "dropset" : "normal",
          drop_de: null,
          created_at: t.toISOString(),
        });
        if (s.drop && ultima && s.peso) {
          filas.push({ id: id++, peso: Math.round(s.peso * 0.8 * 2) / 2, reps: s.reps - 3, rir: null, tipo_serie: "drop", drop_de: idPrincipal, created_at: new Date(t.getTime() + 60_000).toISOString() });
        }
      }
      return filas;
    }),
  }));
  return [...normales, dominadasDemo()];
}

// Dominadas (peso corporal): empezó sin lastre y pasó a 2,5 y 5 kg de lastre con las mismas repeticiones.
function dominadasDemo(): EjercicioDemo {
  const lastres = [0, 0, 0, 2.5, 2.5, 2.5, 5, 5];
  const crudos = lastres.flatMap((lastre, i) =>
    [0, 1, 2].map((k) => ({
      id: 9000 + i * 10 + k,
      peso: null,
      reps: 8,
      rir: 1,
      lastre,
      peso_corporal_ref: 80,
      tipo_serie: "normal" as const,
      drop_de: null,
      created_at: new Date(dias((lastres.length - 1 - i) * 3).getTime() + k * 120_000).toISOString(),
    }))
  );
  const { logs, base } = adaptarPesoCorporal(crudos, 1);
  return { nombre: "Dominadas (con lastre)", grupos: ["Espalda", "Bíceps"], logs, base };
}

export function medidasDemo(): FilaMedida[] {
  const f = (n: number) => dias(n).toISOString().slice(0, 10);
  return [
    { fecha: f(60), peso: 80.5, cintura: 87, caderas: 98, pecho: 100, brazo: 36, muslos: 58 },
    { fecha: f(30), peso: 79.6, cintura: 85.5, caderas: 98, pecho: 100.5, brazo: 36, muslos: 58.2 },
    { fecha: f(2), peso: 78.5, cintura: 84, caderas: 97.5, pecho: 101, brazo: 36, muslos: 58.5 },
  ];
}

// Detecta ejercicios del catálogo que tienen la MISMA imagen animada bajo nombres distintos. Solo lectura: no toca la
// base ni el bucket. Diagnóstico del 2026-10-30 (migración 112): el hash MD5 del archivo NO alcanza -- dos re-exports
// del mismo GIF casi nunca son idénticos byte a byte --, por eso se compara el CONTENIDO: un hash perceptual (dHash de
// 64 bits) de 4 cuadros de la animación (0, 25, 50 y 75 %) y la distancia de Hamming promedio entre dos ejercicios
// (0 = misma animación, 64 = nada que ver).
//
//   node scripts/detectar-ejercicios-duplicados.mjs                       -> pares sospechosos del catálogo entero
//   node scripts/detectar-ejercicios-duplicados.mjs --umbral 8            -> más permisivo (por defecto 6)
//   node scripts/detectar-ejercicios-duplicados.mjs --candidato "x.gif"   -> ANTES de subir un ejercicio nuevo: lo
//                                                                            compara contra TODO el catálogo
//
// Cómo leer el resultado: distancia <= 2 es casi seguro la misma animación; 3 a 6 hay que mirar los dos a ojo (a
// veces es el mismo ejercicio con otra ilustración, a veces solo se parecen porque usan la misma máquina o el mismo
// fondo, sobre todo los de banda elástica). Además hay que leer los nombres: "agarre o implemento distinto SIEMPRE es
// un ejercicio separado" (regla del coach, CLAUDE.md > Auditoría del catálogo). Fusionar = migración nueva que
// redirige routine_exercises/workout_logs/alternativa_id al que queda (ver migración 112) + agregar el id viejo a
// src/lib/ejercicios-fusionados.ts.
//
// Lee la service role key de .env.local (nunca se imprime ni se copia).

import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(join(RAIZ, "package.json"));
const sharp = require("sharp");
const { createClient } = require("@supabase/supabase-js");

const args = process.argv.slice(2);
const valor = (flag) => {
  const i = args.indexOf(flag);
  return i === -1 ? null : args[i + 1] ?? null;
};
const UMBRAL = Number(valor("--umbral") ?? 6);
const CANDIDATO = valor("--candidato");
const POSICIONES = [0, 0.25, 0.5, 0.75];

function leerEnv() {
  const env = {};
  for (const linea of readFileSync(join(RAIZ, ".env.local"), "utf8").split(/\r?\n/)) {
    const m = linea.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && m[2].trim()) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

// dHash de 64 bits de un cuadro: escala de grises 9x8, cada bit compara un píxel con el de su derecha.
async function dhash(buf, pagina) {
  const { data } = await sharp(buf, { page: pagina, pages: 1 }).greyscale().resize(9, 8, { fit: "fill" }).raw().toBuffer({ resolveWithObject: true });
  let bits = "";
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) bits += data[y * 9 + x] > data[y * 9 + x + 1] ? "1" : "0";
  return bits;
}

async function huella(buf) {
  const { pages } = await sharp(buf, { animated: true }).metadata();
  const n = pages || 1;
  const hs = [];
  for (const p of POSICIONES) hs.push(await dhash(buf, Math.min(n - 1, Math.floor(n * p))));
  return { sha: createHash("sha1").update(buf).digest("hex"), hs };
}

const hamming = (a, b) => {
  let n = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) n++;
  return n;
};
const distancia = (a, b) => a.hs.reduce((s, h, i) => s + hamming(h, b.hs[i]), 0) / a.hs.length;

async function enParalelo(items, trabajo, hilos = 6) {
  const cola = [...items];
  await Promise.all(
    Array.from({ length: hilos }, async () => {
      while (cola.length) await trabajo(cola.shift());
    })
  );
}

async function contarUso(sb, tabla) {
  const porId = {};
  for (let desde = 0; ; desde += 1000) {
    const { data, error } = await sb.from(tabla).select("exercise_definition_id").range(desde, desde + 999);
    if (error) throw error;
    for (const f of data) porId[f.exercise_definition_id] = (porId[f.exercise_definition_id] ?? 0) + 1;
    if (data.length < 1000) break;
  }
  return porId;
}

const env = leerEnv();
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const { data: ejercicios, error } = await sb.from("exercise_definitions").select("id, nombre, categoria, imagen_url").order("id");
if (error) throw error;
const [rutinas, logs] = await Promise.all([contarUso(sb, "routine_exercises"), contarUso(sb, "workout_logs")]);
const etiqueta = (e) => `${e.id} «${e.nombre}» [${e.categoria ?? "-"}] (rutinas ${rutinas[e.id] ?? 0}, series ${logs[e.id] ?? 0})`;

console.log(`Bajando y analizando ${ejercicios.length} imágenes del catálogo...`);
const huellas = new Map();
const fallos = [];
await enParalelo(ejercicios.filter((e) => e.imagen_url), async (e) => {
  try {
    const r = await fetch(e.imagen_url);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    huellas.set(e.id, await huella(Buffer.from(await r.arrayBuffer())));
  } catch (err) {
    fallos.push(`${e.id} ${e.nombre}: ${err.message}`);
  }
});
if (fallos.length) console.log(`No se pudieron analizar ${fallos.length}:\n  ${fallos.join("\n  ")}`);

if (CANDIDATO) {
  const mia = await huella(readFileSync(CANDIDATO));
  const cercanos = ejercicios
    .filter((e) => huellas.has(e.id))
    .map((e) => ({ e, d: huellas.get(e.id).sha === mia.sha ? 0 : distancia(mia, huellas.get(e.id)) }))
    .filter(({ d }) => d <= UMBRAL)
    .sort((a, b) => a.d - b.d);
  console.log(`\n== ${CANDIDATO}`);
  if (!cercanos.length) console.log(`Sin parecidos en el catálogo (distancia <= ${UMBRAL}). Se puede cargar.`);
  for (const { e, d } of cercanos) console.log(`  ${d.toFixed(1).padStart(4)}  ${etiqueta(e)}`);
  process.exit(0);
}

// 1) archivos idénticos byte a byte
const porSha = new Map();
for (const [id, h] of huellas) porSha.set(h.sha, [...(porSha.get(h.sha) ?? []), id]);
const identicos = [...porSha.values()].filter((g) => g.length > 1);
const porId = new Map(ejercicios.map((e) => [e.id, e]));
console.log(`\n== Mismo archivo byte a byte: ${identicos.length} grupos`);
for (const g of identicos) console.log("  " + g.map((id) => etiqueta(porId.get(id))).join("  ==  "));

// 2) misma animación (distancia perceptual)
const ids = [...huellas.keys()];
const pares = [];
for (let i = 0; i < ids.length; i++) {
  for (let j = i + 1; j < ids.length; j++) {
    if (huellas.get(ids[i]).sha === huellas.get(ids[j]).sha) continue;
    const d = distancia(huellas.get(ids[i]), huellas.get(ids[j]));
    if (d <= UMBRAL) pares.push({ a: ids[i], b: ids[j], d });
  }
}
pares.sort((x, y) => x.d - y.d);
console.log(`\n== Animaciones casi iguales (distancia <= ${UMBRAL}; 0 = idéntica): ${pares.length} pares`);
for (const p of pares) console.log(`  ${p.d.toFixed(1).padStart(4)}  ${etiqueta(porId.get(p.a))}  ~  ${etiqueta(porId.get(p.b))}`);
console.log("\nRecordatorio: mirar cada par a ojo y leer los nombres antes de fusionar (agarre o implemento distinto = ejercicio separado).");

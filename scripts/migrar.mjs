// Aplica una migración de supabase/migration_NNN_*.sql contra producción desde la
// terminal, con red de seguridad. Diseño y reglas de uso: CLAUDE.md, sección
// "Aplicar migraciones desde la terminal".
//
//   node scripts/migrar.mjs supabase/migration_098_x.sql --dry
//   node scripts/migrar.mjs supabase/migration_098_x.sql
//   node scripts/migrar.mjs supabase/migration_098_x.sql --permitir-destructivo
//   node scripts/migrar.mjs supabase/migration_096_x.sql supabase/migration_097_y.sql --solo-registrar
//
//   --dry                  solo analiza (y consulta, de solo lectura, si ya estaba aplicada)
//   --permitir-destructivo seguir aunque haya DROP TABLE/SCHEMA/COLUMN, TRUNCATE, DELETE/UPDATE sin WHERE
//   --forzar               re-aplicar una migración que ya figura como aplicada
//   --solo-registrar       anotar como aplicadas migraciones que se corrieron a mano (no ejecuta SQL)
//
// Antes de ejecutar hace `node scripts/backup-supabase.mjs --forzar`; si falla, no migra.
// Usa SUPABASE_ACCESS_TOKEN de .env.local (nunca se imprime ni se copia).

import { readFileSync, existsSync } from "node:fs";
import { join, dirname, resolve, relative, basename, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const CARPETA_SQL = join(RAIZ, "supabase");

// ---------- análisis del SQL ----------

// Parte en sentencias respetando comentarios, strings, identificadores entre comillas y $tag$...$tag$.
// Devuelve [{ sql, mascara }]: `mascara` es la sentencia sin comentarios y con el contenido de los
// strings en blanco, para buscar palabras clave sin falsos positivos.
export function partirSentencias(sql) {
  const sentencias = [];
  let crudo = "";
  let mascara = "";
  let i = 0;
  const n = sql.length;
  const cerrar = () => {
    if (mascara.trim()) sentencias.push({ sql: crudo.trim(), mascara: mascara.replace(/\s+/g, " ").trim() });
    crudo = "";
    mascara = "";
  };
  while (i < n) {
    const c = sql[i];
    const dos = sql.slice(i, i + 2);
    if (dos === "--") {
      const fin = sql.indexOf("\n", i);
      const hasta = fin === -1 ? n : fin;
      crudo += sql.slice(i, hasta);
      mascara += " ";
      i = hasta;
    } else if (dos === "/*") {
      let prof = 1;
      let j = i + 2;
      while (j < n && prof > 0) {
        if (sql.slice(j, j + 2) === "/*") { prof++; j += 2; }
        else if (sql.slice(j, j + 2) === "*/") { prof--; j += 2; }
        else j++;
      }
      crudo += sql.slice(i, j);
      mascara += " ";
      i = j;
    } else if (c === "'" || c === '"') {
      let j = i + 1;
      while (j < n) {
        if (sql[j] === c) {
          if (sql[j + 1] === c) { j += 2; continue; }
          break;
        }
        j++;
      }
      j = Math.min(j + 1, n);
      crudo += sql.slice(i, j);
      mascara += c === "'" ? "''" : sql.slice(i, j); // identificadores se conservan
      i = j;
    } else if (c === "$") {
      const m = sql.slice(i).match(/^\$([A-Za-z_][A-Za-z0-9_]*)?\$/);
      if (m) {
        const cierre = sql.indexOf(m[0], i + m[0].length);
        const j = cierre === -1 ? n : cierre + m[0].length;
        const cuerpo = sql.slice(i, j);
        crudo += cuerpo;
        // Los cuerpos se conservan para DO (hay que analizarlos); en funciones/otros se anulan.
        mascara += /^\s*DO\b/i.test(mascara) ? " " + enmascararTexto(cuerpo.slice(m[0].length, cuerpo.length - m[0].length)) + " " : " $$ ";
        i = j;
      } else {
        crudo += c; mascara += c; i++;
      }
    } else if (c === ";") {
      crudo += c;
      cerrar();
      i++;
    } else {
      crudo += c; mascara += c; i++;
    }
  }
  cerrar();
  return sentencias;
}

function enmascararTexto(t) {
  return partirSentencias(t).map((s) => s.mascara).join("; ");
}

const REGLAS_DESTRUCTIVAS = [
  [/\bDROP\s+TABLE\b/i, "DROP TABLE"],
  [/\bDROP\s+SCHEMA\b/i, "DROP SCHEMA"],
  [/\bDROP\s+COLUMN\b/i, "DROP COLUMN"],
  [/\bTRUNCATE\b/i, "TRUNCATE"],
];

export function analizar(sql) {
  const sentencias = partirSentencias(sql);
  const destructivas = [];
  const tablas = new Set();
  const resumen = sentencias.map((s, idx) => {
    const m = s.mascara;
    let motivo = null;
    for (const [re, nombre] of REGLAS_DESTRUCTIVAS) if (re.test(m)) { motivo = nombre; break; }
    if (!motivo && /\bDELETE\s+FROM\b/i.test(m) && !/\bWHERE\b/i.test(m)) motivo = "DELETE sin WHERE";
    if (!motivo && /(^|[\s;(])UPDATE\s+[^\s]+\s+SET\b/i.test(m) && !/\bWHERE\b/i.test(m)) motivo = "UPDATE sin WHERE";
    const tabla = m.match(/\b(?:TABLE|INTO|FROM|UPDATE|TRUNCATE)\s+(?:IF\s+(?:NOT\s+)?EXISTS\s+)?(?:ONLY\s+)?((?:"?[\w]+"?\.)?"?[\w]+"?)/i);
    if (tabla) tablas.add(tabla[1].replace(/"/g, ""));
    if (motivo) destructivas.push({ n: idx + 1, motivo, sql: s.sql });
    return { n: idx + 1, verbo: m.split(" ").slice(0, 3).join(" "), motivo };
  });
  return { sentencias: resumen, destructivas, tablas: [...tablas] };
}

// ---------- entorno y API ----------

function leerEnv() {
  const env = {};
  for (const linea of readFileSync(join(RAIZ, ".env.local"), "utf8").split(/\r?\n/)) {
    const m = linea.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && m[2].trim()) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

function cliente() {
  const env = leerEnv();
  const token = env.SUPABASE_ACCESS_TOKEN;
  const ref = (env.NEXT_PUBLIC_SUPABASE_URL || "").match(/^https:\/\/([a-z0-9]+)\.supabase\.co/)?.[1];
  if (!token) throw new Error("Falta SUPABASE_ACCESS_TOKEN en .env.local (el coach lo crea en supabase.com/dashboard/account/tokens).");
  if (!ref) throw new Error("No se pudo sacar el ref del proyecto de NEXT_PUBLIC_SUPABASE_URL.");
  return async function consulta(query) {
    const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    const texto = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${texto.slice(0, 500).split(token).join("***")}`);
    return JSON.parse(texto);
  };
}

const CREAR_REGISTRO = `
create table if not exists public.migraciones_aplicadas (
  nombre text primary key,
  huella text not null,
  aplicada_en timestamptz not null default now(),
  modo text not null default 'script'
);
alter table public.migraciones_aplicadas enable row level security;
`;

const lit = (s) => `'${String(s).replace(/'/g, "''")}'`;

// ---------- CLI ----------

function validarArchivo(arg) {
  const ruta = resolve(process.cwd(), arg);
  const rel = relative(CARPETA_SQL, ruta);
  if (rel.startsWith("..") || rel.includes(sep) || !/^migration_\d+_.+\.sql$/.test(basename(ruta))) {
    throw new Error(`Solo se aceptan supabase/migration_NNN_*.sql de este repo (recibido: ${arg})`);
  }
  if (!existsSync(ruta)) throw new Error(`No existe: ${arg}`);
  const sql = readFileSync(ruta, "utf8");
  return { nombre: basename(ruta), sql, huella: createHash("sha256").update(sql).digest("hex").slice(0, 16) };
}

async function yaAplicada(consulta, nombre) {
  try {
    const filas = await consulta(`select huella, aplicada_en from public.migraciones_aplicadas where nombre = ${lit(nombre)}`);
    return filas[0] || null;
  } catch {
    return null; // la tabla todavía no existe
  }
}

async function main() {
  const args = process.argv.slice(2);
  const flags = new Set(args.filter((a) => a.startsWith("--")));
  const archivos = args.filter((a) => !a.startsWith("--"));
  const conocidos = new Set(["--dry", "--permitir-destructivo", "--forzar", "--solo-registrar"]);
  for (const f of flags) if (!conocidos.has(f)) throw new Error(`Opción desconocida: ${f}`);
  if (!archivos.length) throw new Error("Uso: node scripts/migrar.mjs supabase/migration_NNN_x.sql [--dry|--solo-registrar|--permitir-destructivo|--forzar]");
  const migraciones = archivos.map(validarArchivo);
  const consulta = cliente();

  if (flags.has("--solo-registrar")) {
    await consulta(CREAR_REGISTRO);
    for (const m of migraciones) {
      await consulta(
        `insert into public.migraciones_aplicadas (nombre, huella, modo) values (${lit(m.nombre)}, ${lit(m.huella)}, 'manual')
         on conflict (nombre) do update set huella = excluded.huella, modo = 'manual'`
      );
      console.log(`Registrada como aplicada: ${m.nombre} (huella ${m.huella})`);
    }
    return;
  }

  for (const m of migraciones) {
    const a = analizar(m.sql);
    console.log(`\n== ${m.nombre}  (huella ${m.huella})`);
    console.log(`Sentencias: ${a.sentencias.length}   Tablas tocadas: ${a.tablas.join(", ") || "(ninguna detectada)"}`);
    for (const s of a.sentencias) console.log(`  ${String(s.n).padStart(3)}. ${s.verbo}${s.motivo ? `   <-- DESTRUCTIVA: ${s.motivo}` : ""}`);

    const previa = await yaAplicada(consulta, m.nombre);
    if (previa) console.log(`Ya figura aplicada el ${previa.aplicada_en} (huella ${previa.huella}${previa.huella === m.huella ? "" : " — el archivo cambió desde entonces"}).`);

    if (flags.has("--dry")) { console.log("--dry: no se ejecuta nada."); continue; }
    if (previa && !flags.has("--forzar")) throw new Error(`${m.nombre} ya está aplicada; usar --forzar para repetirla.`);
    if (a.destructivas.length && !flags.has("--permitir-destructivo")) {
      throw new Error(`Operaciones destructivas detectadas (${a.destructivas.map((d) => `#${d.n} ${d.motivo}`).join(", ")}). Confirmar con el coach y repetir con --permitir-destructivo.`);
    }

    console.log("Backup previo...");
    const bk = spawnSync(process.execPath, [join(RAIZ, "scripts", "backup-supabase.mjs"), "--forzar"], { cwd: RAIZ, stdio: "inherit" });
    if (bk.status !== 0) throw new Error("El backup falló; no se migra.");

    await consulta(CREAR_REGISTRO);
    // Una sola consulta multi-sentencia: Postgres la corre en una transacción implícita (todo o nada).
    await consulta(m.sql);
    await consulta(
      `insert into public.migraciones_aplicadas (nombre, huella, modo) values (${lit(m.nombre)}, ${lit(m.huella)}, 'script')
       on conflict (nombre) do update set huella = excluded.huella, aplicada_en = now(), modo = 'script'`
    );
    console.log(`Aplicada y registrada: ${m.nombre}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error(`ERROR  ${e.message}`);
    process.exit(1);
  });
}

// Backup completo y gratuito de KRAKEN Entrena (Supabase), pensado para correr
// solo en la compu del coach (Programador de tareas de Windows) y dejar un .zip
// en Google Drive. Costo: $0 (el plan gratis de Supabase no trae backups).
//
//   node scripts/backup-supabase.mjs            -> backup si no hay uno de las últimas 20 h
//   node scripts/backup-supabase.mjs --forzar   -> backup ahora mismo
//
// Qué guarda: todas las tablas del esquema public (JSON), la lista de usuarios
// de Auth, y los archivos de los buckets PRIVADOS (PDFs, fotos de evolución).
// Los buckets públicos (GIFs y videos de ejercicios, ~370 MB) solo se listan:
// son reemplazables desde las carpetas locales del coach.
// NO guarda los hashes de contraseña (la API de Auth no los expone): si hubiera
// que reconstruir, la gente entra con "Olvidé mi contraseña" o con Google/Facebook.
//
// Lee la service role key de .env.local (nunca se copia a otro lado).

import { readFileSync, mkdirSync, writeFileSync, existsSync, readdirSync, rmSync, statSync, appendFileSync, copyFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { tmpdir, homedir } from "node:os";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const FORZAR = process.argv.includes("--forzar");
const HORAS_MINIMAS_ENTRE_BACKUPS = 20;
const DIAS_A_CONSERVAR = 30; // además se conserva para siempre el backup del día 1 de cada mes
const DRIVE = "G:\\Mi unidad";

function leerEnv() {
  const env = {};
  for (const linea of readFileSync(join(RAIZ, ".env.local"), "utf8").split(/\r?\n/)) {
    const m = linea.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && m[2].trim()) env[m[1]] = m[2].trim(); // la última línea con valor gana
  }
  return env;
}

const env = leerEnv();
const URL_BASE = env.NEXT_PUBLIC_SUPABASE_URL;
const CLAVE = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_BASE || !CLAVE) throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");

const CABECERAS = { apikey: CLAVE, Authorization: `Bearer ${CLAVE}` };

function carpetaDestino() {
  if (process.env.BACKUP_DESTINO) return { ruta: process.env.BACKUP_DESTINO, enDrive: true };
  if (existsSync(DRIVE)) return { ruta: join(DRIVE, "KRAKEN BACKUPS APP"), enDrive: true };
  return { ruta: join(homedir(), "KRAKEN BACKUPS APP"), enDrive: false };
}

const ahora = new Date();
const pad = (n) => String(n).padStart(2, "0");
const sello = `${ahora.getFullYear()}-${pad(ahora.getMonth() + 1)}-${pad(ahora.getDate())}_${pad(ahora.getHours())}${pad(ahora.getMinutes())}`;

const { ruta: DESTINO, enDrive } = carpetaDestino();
mkdirSync(DESTINO, { recursive: true });
const LOG_LOCAL = join(process.env.LOCALAPPDATA || tmpdir(), "kraken-backup.log");

function registrar(msg) {
  appendFileSync(LOG_LOCAL, `[${ahora.toISOString()}] ${msg}\n`);
  console.log(msg);
}

function estado(texto) {
  writeFileSync(join(DESTINO, "ULTIMO_BACKUP.txt"), `${texto}\n(${ahora.toLocaleString("es-AR", { hour12: false })})\n`);
}

async function pedir(ruta, opciones = {}) {
  const res = await fetch(`${URL_BASE}${ruta}`, { ...opciones, headers: { ...CABECERAS, ...(opciones.headers || {}) } });
  if (!res.ok) throw new Error(`${opciones.method || "GET"} ${ruta} -> HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
  return res;
}

async function tablasPublicas() {
  const esquema = await (await pedir("/rest/v1/")).json();
  return Object.entries(esquema.definitions || {}).map(([nombre, def]) => ({
    nombre,
    ordenarPorId: Boolean(def.properties && def.properties.id),
  }));
}

async function volcarTabla(t, carpeta) {
  const filas = [];
  let total = null;
  const POR_PAGINA = 1000;
  for (let desde = 0; ; desde += POR_PAGINA) {
    const orden = t.ordenarPorId ? "&order=id.asc" : "";
    const res = await pedir(`/rest/v1/${t.nombre}?select=*${orden}`, {
      headers: { Range: `${desde}-${desde + POR_PAGINA - 1}`, Prefer: "count=exact" },
    });
    const pagina = await res.json();
    total = Number((res.headers.get("content-range") || "").split("/")[1]);
    filas.push(...pagina);
    if (pagina.length < POR_PAGINA) break;
  }
  if (Number.isFinite(total) && total !== filas.length) {
    throw new Error(`Tabla ${t.nombre}: la base dice ${total} filas pero se bajaron ${filas.length}`);
  }
  writeFileSync(join(carpeta, `${t.nombre}.json`), JSON.stringify(filas, null, 1));
  return filas.length;
}

async function volcarUsuarios(carpeta) {
  const usuarios = [];
  for (let pagina = 1; ; pagina++) {
    const res = await (await pedir(`/auth/v1/admin/users?page=${pagina}&per_page=1000`)).json();
    const lote = res.users || [];
    usuarios.push(...lote);
    if (lote.length < 1000) break;
  }
  writeFileSync(join(carpeta, "auth_users.json"), JSON.stringify(usuarios, null, 1));
  return usuarios.length;
}

async function listarObjetos(bucket, prefijo = "") {
  const archivos = [];
  for (let offset = 0; ; offset += 1000) {
    const lote = await (
      await pedir(`/storage/v1/object/list/${encodeURIComponent(bucket)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prefix: prefijo, limit: 1000, offset }),
      })
    ).json();
    for (const o of lote) {
      const ruta = prefijo ? `${prefijo}/${o.name}` : o.name;
      if (o.id === null) archivos.push(...(await listarObjetos(bucket, ruta))); // es una carpeta
      else archivos.push({ ruta, bytes: Number(o.metadata?.size ?? 0) });
    }
    if (lote.length < 1000) break;
  }
  return archivos;
}

async function volcarStorage(carpeta) {
  mkdirSync(carpeta, { recursive: true });
  const buckets = await (await pedir("/storage/v1/bucket")).json();
  const resumen = [];
  for (const b of buckets) {
    const objetos = await listarObjetos(b.name);
    const bytes = objetos.reduce((s, o) => s + o.bytes, 0);
    if (b.public) {
      writeFileSync(join(carpeta, `LISTA_${b.name}.json`), JSON.stringify(objetos, null, 1));
      resumen.push({ bucket: b.name, publico: true, archivos: objetos.length, bytes, descargados: false });
      continue;
    }
    for (const o of objetos) {
      const dest = join(carpeta, b.name, ...o.ruta.split("/"));
      mkdirSync(dirname(dest), { recursive: true });
      const res = await pedir(`/storage/v1/object/${encodeURIComponent(b.name)}/${o.ruta.split("/").map(encodeURIComponent).join("/")}`);
      writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    }
    resumen.push({ bucket: b.name, publico: false, archivos: objetos.length, bytes, descargados: true });
  }
  return resumen;
}

function ultimoBackupReciente() {
  const zips = readdirSync(DESTINO).filter((f) => /^backup-.*\.zip$/.test(f));
  if (!zips.length) return null;
  const masNuevo = Math.max(...zips.map((f) => statSync(join(DESTINO, f)).mtimeMs));
  const horas = (Date.now() - masNuevo) / 3600000;
  return horas < HORAS_MINIMAS_ENTRE_BACKUPS ? horas : null;
}

function podar() {
  const limite = Date.now() - DIAS_A_CONSERVAR * 86400000;
  for (const f of readdirSync(DESTINO)) {
    const m = f.match(/^backup-(\d{4})-(\d{2})-(\d{2})_\d{4}\.zip$/);
    if (!m) continue;
    const esDia1 = m[3] === "01";
    if (!esDia1 && new Date(`${m[1]}-${m[2]}-${m[3]}T12:00:00`).getTime() < limite) rmSync(join(DESTINO, f));
  }
}

const LEEME = `BACKUP DE KRAKEN ENTRENA
========================
db/*.json            Una tabla por archivo (esquema public de Supabase).
auth_users.json      Usuarios de Auth (ids, emails, proveedor). SIN contraseñas.
storage/<bucket>/    Archivos de los buckets privados (PDFs, fotos).
LISTA_<bucket>.json  Nombres de los buckets públicos (GIFs/videos): no se copian,
                     están en las carpetas locales de staging del repo.
manifest.json        Cantidades de filas/archivos de este backup.

CÓMO RESTAURAR (en un proyecto de Supabase nuevo o vaciado)
1. Crear el esquema corriendo en orden supabase/migration_*.sql del repo.
2. Usuarios: crearlos con la Admin API (POST /auth/v1/admin/users) conservando el
   "id" de auth_users.json, con email_confirm=true y una contraseña cualquiera;
   cada persona entra con "Olvidé mi contraseña" o con Google/Facebook.
3. Tablas: insertar cada db/*.json por la REST API con la service role key, en
   orden de dependencias (productos, routines, exercise_definitions,
   routine_exercises, profiles, el resto).
4. Archivos: subir storage/<bucket>/ a su bucket con la Storage API.
`;

async function main() {
  if (!FORZAR) {
    const horas = ultimoBackupReciente();
    if (horas !== null) {
      registrar(`Ya hay un backup de hace ${horas.toFixed(1)} h; no se repite (usar --forzar para hacerlo igual).`);
      return;
    }
  }

  const trabajo = join(tmpdir(), `kraken-backup-${sello}`);
  rmSync(trabajo, { recursive: true, force: true });
  const carpetaDb = join(trabajo, "db");
  mkdirSync(carpetaDb, { recursive: true });

  const filasPorTabla = {};
  for (const t of await tablasPublicas()) filasPorTabla[t.nombre] = await volcarTabla(t, carpetaDb);
  const usuarios = await volcarUsuarios(trabajo);
  const storage = await volcarStorage(join(trabajo, "storage"));

  writeFileSync(
    join(trabajo, "manifest.json"),
    JSON.stringify({ fecha: ahora.toISOString(), proyecto: URL_BASE, filasPorTabla, usuariosAuth: usuarios, storage }, null, 2)
  );
  writeFileSync(join(trabajo, "LEEME.txt"), LEEME);

  // tar.exe de Windows con ruta absoluta: según desde dónde se lance, "tar" a
  // secas puede ser el de Git (GNU), que interpreta "G:\..." como un host remoto.
  // Se comprime en una carpeta local y recién después se copia a Drive.
  const tarWindows = join(process.env.SystemRoot || "C:\\Windows", "System32", "tar.exe");
  const zipTemporal = join(tmpdir(), `backup-${sello}.zip`);
  execFileSync(tarWindows, ["-a", "-c", "-f", zipTemporal, "-C", trabajo, "."]);
  const zip = join(DESTINO, `backup-${sello}.zip`);
  copyFileSync(zipTemporal, zip);
  rmSync(zipTemporal, { force: true });
  rmSync(trabajo, { recursive: true, force: true });
  podar();

  const totalFilas = Object.values(filasPorTabla).reduce((a, b) => a + b, 0);
  const kb = Math.round(statSync(zip).size / 1024);
  const donde = enDrive ? "Google Drive" : "SOLO ESTA COMPU (Google Drive no estaba disponible)";
  const msg = `OK  backup-${sello}.zip  (${kb} KB, ${totalFilas} filas en ${Object.keys(filasPorTabla).length} tablas, ${usuarios} usuarios) -> ${donde}`;
  estado(msg);
  registrar(msg);
}

main().catch((e) => {
  const msg = `ERROR  ${e.message}`;
  try {
    estado(msg);
  } catch {
    /* si ni siquiera se puede escribir el estado, queda el log local */
  }
  registrar(msg);
  process.exit(1);
});

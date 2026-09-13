// Sube GIFs al bucket "ejercicios" y los enlaza automáticamente al ejercicio
// correspondiente (por nombre), sin tocar el dashboard de Supabase ni el
// SQL Editor.
//
// Uso:
//   node scripts/asignar-gifs.js "ruta/a/una/carpeta/con/gifs"
//
// Cada archivo de la carpeta tiene que llamarse EXACTAMENTE como el
// ejercicio en la base (mismo criterio que ya usamos para los videos), por
// ejemplo:  "Meadows Row.gif",  "Curl femoral.gif"
//
// Requiere que .env.local tenga, además de NEXT_PUBLIC_SUPABASE_URL, la
// variable SUPABASE_SERVICE_ROLE_KEY (Supabase Dashboard -> Settings ->
// API -> service_role). Esa clave nunca se comparte por chat -- se pega
// una sola vez directo en .env.local, a mano.

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

function cargarEnvLocal() {
  const rutaEnv = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(rutaEnv)) return;
  for (const linea of fs.readFileSync(rutaEnv, "utf8").split("\n")) {
    const match = linea.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const [, clave, valorCrudo] = match;
    if (process.env[clave] !== undefined) continue;
    process.env[clave] = valorCrudo.replace(/^["']|["']$/g, "");
  }
}

cargarEnvLocal();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = "ejercicios";
const EXTENSIONES_VALIDAS = /\.(gif|png|jpe?g|webp)$/i;
const CONTENT_TYPES = { ".gif": "image/gif", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" };

async function main() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error(
      "Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local.\n" +
        "Buscá la service_role key en Supabase Dashboard -> Settings -> API y pegala en .env.local (nunca por chat)."
    );
    process.exit(1);
  }

  const carpeta = process.argv[2];
  if (!carpeta) {
    console.error('Uso: node scripts/asignar-gifs.js "ruta/a/carpeta"');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const archivos = fs.readdirSync(carpeta).filter((f) => EXTENSIONES_VALIDAS.test(f));

  if (archivos.length === 0) {
    console.log("No encontré imágenes (.gif/.png/.jpg/.webp) en esa carpeta.");
    return;
  }

  console.log(`Encontré ${archivos.length} archivo(s). Subiendo...\n`);

  for (const archivo of archivos) {
    const nombreEjercicio = path.parse(archivo).name;
    const ext = path.extname(archivo).toLowerCase();
    const buffer = fs.readFileSync(path.join(carpeta, archivo));

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(archivo, buffer, { contentType: CONTENT_TYPES[ext], upsert: true });

    if (uploadError) {
      console.error(`✗ ${archivo}: error al subir -- ${uploadError.message}`);
      continue;
    }

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(archivo);

    const { data: actualizados, error: dbError } = await supabase
      .from("exercise_definitions")
      .update({ imagen_url: pub.publicUrl })
      .eq("nombre", nombreEjercicio)
      .select("id");

    if (dbError) {
      console.error(`✗ ${nombreEjercicio}: se subió el archivo pero no pude enlazarlo -- ${dbError.message}`);
    } else if (!actualizados || actualizados.length === 0) {
      console.warn(`⚠ "${nombreEjercicio}" no coincide con ningún ejercicio de la base -- revisá el nombre del archivo.`);
    } else {
      console.log(`✓ ${nombreEjercicio}`);
    }
  }
}

main();

// Alta completa de un cliente de Mentoría/entrenamiento privado, de punta a
// punta, en UN SOLO comando: crea (o reutiliza) sus ejercicios, su rutina
// privada, le da el golden pass, le otorga acceso a la rutina, sube su guía
// alimenticia en PDF y la linkea a su cuenta.
//
// Reemplaza el proceso anterior (subir GIFs a mano por el Dashboard + subir
// el PDF al bucket con un nombre exacto + correr una migración SQL) por un
// único paso, pensado para poder repetirse con 10, 50 o 100 clientes sin que
// el coach tenga que tocar Supabase directamente cada vez.
//
// Uso:
//   node scripts/alta-cliente.js "clientes/santiago-pelotti.json"
//
// Formato del JSON de un cliente: ver clientes/EJEMPLO.json
//
// Requiere (una sola vez, no por cliente) que .env.local tenga
// NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY (Supabase Dashboard ->
// Settings -> API -> service_role). Esa clave nunca se comparte por chat --
// se pega una sola vez directo en .env.local, a mano.

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
    // Si la clave aparece más de una vez en el archivo, gana la ÚLTIMA
    // ocurrencia no vacía (ej. una línea vieja vacía seguida de la real).
    const valor = valorCrudo.replace(/^["']|["']$/g, "");
    if (valor === "" && process.env[clave] !== undefined) continue;
    process.env[clave] = valor;
  }
}
cargarEnvLocal();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const BUCKET_EJERCICIOS = "ejercicios";
const BUCKET_GUIAS = "guias-alimenticias";

// Saca tildes/ñ y caracteres raros para nombres de archivo en Storage --
// mismo motivo que el bug ya documentado en CLAUDE.md (subir con tilde
// falla por el Dashboard; por las dudas, tampoco los generamos acá).
function nombreArchivoSeguro(nombre) {
  return nombre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error(
      "Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local.\n" +
        "Esto se configura UNA SOLA VEZ (Supabase Dashboard -> Settings -> API -> service_role), nunca por chat."
    );
    process.exit(1);
  }

  const rutaJson = process.argv[2];
  if (!rutaJson) {
    console.error('Uso: node scripts/alta-cliente.js "clientes/nombre-cliente.json"');
    process.exit(1);
  }

  const cliente = JSON.parse(fs.readFileSync(rutaJson, "utf8"));
  const baseDir = path.dirname(path.resolve(rutaJson));
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  console.log(`\n=== Alta de ${cliente.nombre_rutina} (${cliente.email}) ===\n`);

  // ============ 1. USUARIO ============
  const { data: userId, error: errUser } = await supabase.rpc("buscar_usuario_por_email", {
    p_email: cliente.email.toLowerCase(),
  });
  if (errUser) throw errUser;
  if (!userId) {
    console.error(
      `✗ No existe ninguna cuenta con el email ${cliente.email}. El cliente tiene que registrarse ` +
        "en la app primero (con este mismo email) -- volvé a correr el script después."
    );
    process.exit(1);
  }
  console.log(`✓ Cuenta encontrada (${userId})`);

  // ============ 2. EJERCICIOS (reusa por nombre, crea si hace falta) ============
  const idsPorNombre = {};
  for (const ej of cliente.ejercicios) {
    const { data: existente, error: errBuscar } = await supabase
      .from("exercise_definitions")
      .select("id")
      .eq("nombre", ej.nombre)
      .maybeSingle();
    if (errBuscar) throw errBuscar;

    if (existente) {
      idsPorNombre[ej.nombre] = existente.id;
      console.log(`- ${ej.nombre}: ya existía en el catálogo, se reutiliza`);
      continue;
    }

    let imagenUrl = null;
    if (ej.gif_local_path) {
      const rutaGif = path.resolve(baseDir, ej.gif_local_path);
      const archivo = nombreArchivoSeguro(ej.nombre) + path.extname(rutaGif).toLowerCase();
      const buffer = fs.readFileSync(rutaGif);
      const { error: errUpload } = await supabase.storage
        .from(BUCKET_EJERCICIOS)
        .upload(archivo, buffer, { contentType: "image/gif", upsert: true });
      if (errUpload) throw errUpload;
      imagenUrl = supabase.storage.from(BUCKET_EJERCICIOS).getPublicUrl(archivo).data.publicUrl;
    } else {
      console.warn(`  ⚠ "${ej.nombre}" es nuevo y no trae gif_local_path -- imagen_url va a quedar sin cargar.`);
    }

    const { data: creado, error: errInsert } = await supabase
      .from("exercise_definitions")
      .insert({
        nombre: ej.nombre,
        categoria: ej.categoria,
        imagen_url: imagenUrl,
        video_url: ej.video_url ?? null,
        como_hacerlo: ej.como_hacerlo,
        tipo_esfuerzo: ej.tipo_esfuerzo,
        unilateral: !!ej.unilateral,
      })
      .select("id")
      .single();
    if (errInsert) throw errInsert;

    idsPorNombre[ej.nombre] = creado.id;
    console.log(`✓ ${ej.nombre}: creado${imagenUrl ? " (con gif)" : ""}`);
  }

  // ============ 3. RUTINA PRIVADA ============
  let { data: rutina } = await supabase
    .from("routines")
    .select("id")
    .eq("nombre", cliente.nombre_rutina)
    .maybeSingle();

  if (!rutina) {
    const { data: creada, error: errRutina } = await supabase
      .from("routines")
      .insert({
        nombre: cliente.nombre_rutina,
        descripcion: cliente.descripcion_rutina ?? null,
        dias: cliente.dias,
        es_privada: true,
      })
      .select("id")
      .single();
    if (errRutina) throw errRutina;
    rutina = creada;
    console.log(`✓ Rutina "${cliente.nombre_rutina}" creada`);
  } else {
    console.log(`- Rutina "${cliente.nombre_rutina}": ya existía, se reutiliza`);
  }

  // ============ 4. EJERCICIOS DE LA RUTINA (día/orden) ============
  // El JSON solo tiene que listar en "ejercicios" los que son NUEVOS (o que
  // se quieran actualizar). Cualquier otro nombre referenciado en
  // "rutina_exercises" se busca directo en el catálogo ya existente.
  for (const re of cliente.rutina_exercises) {
    let exerciseDefId = idsPorNombre[re.ejercicio_nombre];

    if (!exerciseDefId) {
      const { data: existente, error: errBuscar } = await supabase
        .from("exercise_definitions")
        .select("id")
        .eq("nombre", re.ejercicio_nombre)
        .maybeSingle();
      if (errBuscar) throw errBuscar;
      if (existente) {
        exerciseDefId = existente.id;
        idsPorNombre[re.ejercicio_nombre] = existente.id;
      }
    }

    if (!exerciseDefId) {
      console.error(
        `✗ "${re.ejercicio_nombre}" no está ni en el JSON ni en el catálogo existente -- se saltea. ` +
          "Agregalo a la lista \"ejercicios\" del JSON con su gif_local_path."
      );
      continue;
    }

    const { data: existente } = await supabase
      .from("routine_exercises")
      .select("id")
      .eq("routine_id", rutina.id)
      .eq("dia", re.dia)
      .eq("orden", re.orden)
      .maybeSingle();

    if (existente) {
      await supabase
        .from("routine_exercises")
        .update({ exercise_definition_id: exerciseDefId, series_reps: re.series_reps ?? null })
        .eq("id", existente.id);
      console.log(`- Día ${re.dia} #${re.orden}: actualizado (${re.ejercicio_nombre})`);
    } else {
      await supabase.from("routine_exercises").insert({
        routine_id: rutina.id,
        dia: re.dia,
        orden: re.orden,
        exercise_definition_id: exerciseDefId,
        series_reps: re.series_reps ?? null,
      });
      console.log(`✓ Día ${re.dia} #${re.orden}: ${re.ejercicio_nombre}`);
    }
  }

  // ============ 5. PREMIUM (golden pass de mentoría) ============
  const premium = cliente.premium ?? { origen: "mentoria", golden_perpetuo: true };
  const { error: errPremium } = await supabase
    .from("profiles")
    .update({ premium_origen: premium.origen, golden_perpetuo: !!premium.golden_perpetuo })
    .eq("id", userId);
  if (errPremium) throw errPremium;
  console.log(`✓ Acceso premium (${premium.origen}${premium.golden_perpetuo ? ", perpetuo" : ""}) otorgado`);

  // ============ 6. ACCESO A LA RUTINA PRIVADA ============
  const { error: errAcceso } = await supabase
    .from("profile_routine_access")
    .upsert({ user_id: userId, routine_id: rutina.id }, { onConflict: "user_id,routine_id" });
  if (errAcceso) throw errAcceso;
  console.log(`✓ Acceso a la rutina otorgado`);

  // ============ 7. GUÍA ALIMENTICIA (PDF) ============
  if (cliente.guia_pdf_local_path) {
    const rutaPdf = path.resolve(baseDir, cliente.guia_pdf_local_path);
    const archivoPdf = nombreArchivoSeguro(cliente.nombre_rutina) + ".pdf";
    const buffer = fs.readFileSync(rutaPdf);
    const { error: errUploadPdf } = await supabase.storage
      .from(BUCKET_GUIAS)
      .upload(archivoPdf, buffer, { contentType: "application/pdf", upsert: true });
    if (errUploadPdf) throw errUploadPdf;

    const { error: errGuia } = await supabase
      .from("guias_alimenticias")
      .upsert(
        { user_id: userId, pdf_storage_path: archivoPdf, actualizada_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );
    if (errGuia) throw errGuia;
    console.log(`✓ Guía alimenticia subida y linkeada (${archivoPdf})`);
  } else {
    console.log("- Sin guia_pdf_local_path en el JSON -- no se subió ninguna guía.");
  }

  console.log(`\n=== Listo. ${cliente.nombre_rutina} ya puede ver todo en la app. ===\n`);
}

main().catch((err) => {
  console.error("\n✗ Error:", err.message ?? err);
  process.exit(1);
});

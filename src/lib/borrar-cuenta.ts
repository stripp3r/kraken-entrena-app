import { createAdminClient } from "@/lib/supabase/admin";
import { buscarUsuarioPorEmail, cancelarSuscripcion } from "@/lib/solicitudes";

// Borrado COMPLETO de una cuenta y todo lo suyo (derecho de supresión, Ley
// 25.326; es lo que promete https://fit.krakenbrand.com/eliminar-datos).
// SERVER-ONLY, destructivo e irreversible: solo lo invoca el coach/la
// automatización, por import directo o por POST /api/admin/cuentas (protegido
// con ADMIN_API_SECRET). Con `soloVerificar: true` NO borra nada: devuelve qué
// borraría.
//
// Orden (cada paso asume que el anterior salió bien; si algo falla se corta
// antes de tocar la cuenta, así se puede reintentar):
//  1. Cancela en el proveedor cualquier suscripción activa/pausada. Si no, la
//     persona seguiría pagando una cuenta que ya no existe.
//  2. Borra sus archivos de Storage (fotos de evolución y guía alimenticia).
//  3. Borra las rutinas que armó ella misma ("Crea tu rutina").
//  4. Anonimiza `compras`: queda SOLO monto, moneda, fecha y estado (registro
//     mínimo de pagos por obligación contable/legal), sin email ni usuario.
//  5. Borra el usuario de auth: el resto (perfil, mediciones, registros de
//     entrenamiento y cardio, historial y acceso a rutinas, suscripciones,
//     aceptaciones, guía) cae por `on delete cascade`.
//
// Lo que NO se borra a propósito: `solicitudes_baja_arrepentimiento` (es el
// registro que la Disposición 954/2025 obliga a llevar) y las rutinas
// privadas que el coach armó para esa persona (programación del coach, no
// datos de la persona; se informan en `rutinasPrivadasDelCoach` por si se
// quieren borrar a mano).
//
// Tokens de Google/Facebook: la app NO guarda provider_token ni
// provider_refresh_token (solo se usan para iniciar sesión, y el login pide
// únicamente email y perfil básico), así que no hay nada que revocar contra
// Google ni la API de Graph. Ver "Cumplimiento legal" en CLAUDE.md.

const ANONIMO = "eliminado@eliminado.invalid";

async function listarArchivosDeCarpeta(bucket: string, carpeta: string): Promise<string[]> {
  const admin = createAdminClient();
  const rutas: string[] = [];
  for (let desde = 0; ; desde += 100) {
    const { data, error } = await admin.storage.from(bucket).list(carpeta, { limit: 100, offset: desde });
    if (error || !data?.length) break;
    // Entradas sin `id` son subcarpetas; las fotos viven directo en la carpeta.
    rutas.push(...data.filter((f) => f.id).map((f) => `${carpeta}/${f.name}`));
    if (data.length < 100) break;
  }
  return rutas;
}

export async function borrarCuentaCompleta({
  email,
  soloVerificar = false,
}: {
  email: string;
  soloVerificar?: boolean;
}) {
  const admin = createAdminClient();
  const emailNorm = email.trim().toLowerCase();

  const userId = await buscarUsuarioPorEmail(emailNorm);
  if (!userId) return { error: `No existe una cuenta con el email ${emailNorm}` };

  // --- Qué hay para borrar ---
  const [{ data: subs }, { data: fotos }, { data: guia }, { data: accesos }, { data: comprasPropias }] =
    await Promise.all([
      admin.from("suscripciones").select("id, proveedor, proveedor_sub_id, estado").eq("user_id", userId),
      admin.from("progress_photos").select("storage_path").eq("user_id", userId),
      admin.from("guias_alimenticias").select("pdf_storage_path").eq("user_id", userId).maybeSingle(),
      admin.from("profile_routine_access").select("routine_id").eq("user_id", userId),
      admin.from("compras").select("id").eq("user_id", userId),
    ]);

  const idsRutinas = (accesos ?? []).map((a) => a.routine_id as number);
  const { data: rutinas } = idsRutinas.length
    ? await admin.from("routines").select("id, creada_por_usuario, es_privada").in("id", idsRutinas)
    : { data: [] as { id: number; creada_por_usuario: boolean; es_privada: boolean }[] };
  const rutinasPropias = (rutinas ?? []).filter((r) => r.creada_por_usuario).map((r) => r.id);
  const rutinasPrivadasDelCoach = (rutinas ?? [])
    .filter((r) => r.es_privada && !r.creada_por_usuario)
    .map((r) => r.id);

  const archivosFotos = new Set<string>([
    ...(fotos ?? []).map((f) => f.storage_path as string),
    ...(await listarArchivosDeCarpeta("progress-photos", userId)),
  ]);

  // Compras todavía sin reclamar (user_id null) hechas con ESTE email.
  const { data: sinReclamar } = await admin.from("compras").select("id, email_comprador").is("user_id", null);
  const comprasPorEmail = (sinReclamar ?? [])
    .filter((c) => c.email_comprador?.trim().toLowerCase() === emailNorm)
    .map((c) => c.id as number);

  const subsPorCancelar = (subs ?? []).filter((s) => s.estado === "activa" || s.estado === "pausada");

  const resumen = {
    userId,
    suscripcionesPorCancelar: subsPorCancelar.length,
    fotosDeEvolucion: archivosFotos.size,
    guiaAlimenticia: Boolean(guia?.pdf_storage_path),
    rutinasPropiasABorrar: rutinasPropias.length,
    comprasAAnonimizar: (comprasPropias?.length ?? 0) + comprasPorEmail.length,
    rutinasPrivadasDelCoach,
  };

  if (soloVerificar) return { ok: true, soloVerificar: true, resumen };

  // 1) Suscripciones en el proveedor.
  if (subsPorCancelar.length) {
    const baja = await cancelarSuscripcion({ email: emailNorm });
    if (baja.error || baja.ok === false) {
      return { error: "No se pudo cancelar la suscripción en el proveedor; no se borró nada.", detalle: baja, resumen };
    }
  }

  // 2) Storage.
  if (archivosFotos.size) {
    const { error } = await admin.storage.from("progress-photos").remove([...archivosFotos]);
    if (error) return { error: `No se pudieron borrar las fotos: ${error.message}`, resumen };
  }
  if (guia?.pdf_storage_path) {
    const { error } = await admin.storage.from("guias-alimenticias").remove([guia.pdf_storage_path]);
    if (error) return { error: `No se pudo borrar la guía: ${error.message}`, resumen };
  }

  // 3) Rutinas armadas por la propia persona.
  if (rutinasPropias.length) {
    const { error } = await admin.from("routines").delete().in("id", rutinasPropias);
    if (error) return { error: `No se pudieron borrar sus rutinas: ${error.message}`, resumen };
  }

  // 4) Compras: solo monto/moneda/fecha/estado, sin datos personales.
  const idsCompras = [...(comprasPropias ?? []).map((c) => c.id as number), ...comprasPorEmail];
  if (idsCompras.length) {
    const { error } = await admin
      .from("compras")
      .update({ email_comprador: ANONIMO, user_id: null })
      .in("id", idsCompras);
    if (error) return { error: `No se pudieron anonimizar las compras: ${error.message}`, resumen };
  }

  // 5) El usuario (cascade al resto).
  const { error: errUsuario } = await admin.auth.admin.deleteUser(userId);
  if (errUsuario) return { error: `No se pudo borrar el usuario: ${errUsuario.message}`, resumen };

  return { ok: true, borrada: true, resumen };
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cambiarRutinaActiva } from "@/app/entrenamiento/actions";
import { permisos } from "@/lib/premium";
import { contarRutinasCreadasPorUsuario } from "@/lib/limite-rutinas-creadas";
import { validarRutina, type DiaRutina } from "@/lib/validar-rutina";
import type { GrupoMuscular } from "@/lib/grupos-musculares";

const LETRAS_DIA = ["A", "B", "C", "D", "E", "F", "G"];

// Tope duro por usuario, también para los planes sin límite: la escritura se hace con service role, así que un script
// con una cuenta válida podría llenar la tabla de rutinas.
const MAX_RUTINAS_CREADAS = 50;

const ERROR_GUARDAR = "No se pudo guardar tu rutina. Probá de nuevo en unos segundos.";
const ERROR_EJERCICIO_INEXISTENTE = "Alguno de los ejercicios ya no está disponible. Quitalo y elegilo de nuevo.";

export type EjercicioGuardar = {
  exerciseDefinitionId: number;
  series: number;
  repsMin: number;
  repsMax: number;
  rirObjetivo: number;
};

export type DiaGuardar = {
  gruposMusculares: GrupoMuscular[];
  ejercicios: EjercicioGuardar[];
};

// Tipo explícito (en vez del inferido) para que la pantalla pueda distinguir error / guardado con `"error" in resultado`.
// `activada: false` = la rutina quedó guardada pero no se pudo dejar como activa.
export type ResultadoGuardado = { error: string } | { ok: true; routineId: number; activada: boolean };

type Admin = ReturnType<typeof createAdminClient>;

function armarFilas(routineId: number, dias: DiaRutina[]) {
  return {
    ejercicios: dias.flatMap((dia, indiceDia) =>
      dia.ejercicios.map((ej, indiceEjercicio) => ({
        routine_id: routineId,
        dia: LETRAS_DIA[indiceDia],
        orden: indiceEjercicio + 1,
        exercise_definition_id: ej.exerciseDefinitionId,
        series_reps: `${ej.series} x ${ej.repsMin}-${ej.repsMax}`,
        rir_objetivo: ej.rirObjetivo,
      }))
    ),
    dias: dias.map((dia, indiceDia) => ({
      routine_id: routineId,
      dia: LETRAS_DIA[indiceDia],
      grupos_musculares: dia.gruposMusculares,
    })),
  };
}

// La base rechaza un ejercicio que no existe (clave foránea), pero recién al insertar: con la rutina ya creada. Se
// revisa antes para devolver un mensaje claro y no dejar nada a medias.
async function hayEjercicioInexistente(admin: Admin, dias: DiaRutina[]): Promise<boolean> {
  const ids = [...new Set(dias.flatMap((d) => d.ejercicios.map((e) => e.exerciseDefinitionId)))];
  const { data, error } = await admin.from("exercise_definitions").select("id").in("id", ids);
  if (error) {
    console.error("[crear-rutina] no se pudo verificar los ejercicios", error.message);
    return true;
  }
  return (data ?? []).length !== ids.length;
}

// El usuario nunca escribe estas tablas directo (no hay policy de
// insert/update para "authenticated" en routines/routine_exercises/
// routine_dias/profile_routine_access, mismo patrón que el desbloqueo
// manual de rutinas -- ver migración 021) -- todo pasa por acá, que valida
// y arma la rutina completa con el cliente admin (service role).
export async function guardarRutinaCreada(
  nombre: string,
  dias: DiaGuardar[],
  activar: boolean = true
): Promise<ResultadoGuardado> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tenés que iniciar sesión de nuevo." };
  }

  const validada = validarRutina(nombre, dias);
  if (!validada.ok) {
    return { error: validada.error };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("premium_hasta, golden_perpetuo, premium_origen")
    .eq("id", user.id)
    .single();

  // Revalidado acá server-side además de en page.tsx -- ese chequeo solo
  // bloquea la UI antes de abrir el wizard, esta es la protección real
  // contra un POST directo a esta action.
  const { limiteRutinasCreadas } = permisos(profile);
  if (limiteRutinasCreadas === 0) {
    return { error: "Crea tu rutina no está disponible con tu plan actual -- seguí la rutina de tu programa." };
  }
  const yaCreadas = await contarRutinasCreadasPorUsuario(supabase, user.id);
  if (limiteRutinasCreadas !== null && yaCreadas >= limiteRutinasCreadas) {
    return { error: "Ya usaste tu rutina de prueba del Free Trial. Mejorá tu plan para crear más." };
  }
  if (yaCreadas >= MAX_RUTINAS_CREADAS) {
    return { error: `Llegaste al máximo de ${MAX_RUTINAS_CREADAS} rutinas propias. Borrá alguna que no uses.` };
  }

  const admin = createAdminClient();

  if (await hayEjercicioInexistente(admin, validada.dias)) {
    return { error: ERROR_EJERCICIO_INEXISTENTE };
  }

  const { data: routine, error: errorRoutine } = await admin
    .from("routines")
    .insert({
      nombre: validada.nombre,
      descripcion: "Rutina armada por el usuario en \"Crea tu rutina\".",
      dias: validada.dias.length,
      es_privada: true,
      creada_por_usuario: true,
    })
    .select("id")
    .single();

  if (errorRoutine || !routine) {
    console.error("[crear-rutina] no se pudo crear la rutina", errorRoutine?.message);
    return { error: ERROR_GUARDAR };
  }

  const routineId = routine.id as number;
  const filas = armarFilas(routineId, validada.dias);

  // Si algo falla de acá en adelante se borra la rutina entera (el on delete cascade se lleva sus ejercicios, días
  // y accesos): antes quedaba una rutina a medio armar que nadie podía ver ni borrar.
  const deshacer = async (motivo: string) => {
    console.error("[crear-rutina] se deshace la rutina", routineId, motivo);
    const { error } = await admin.from("routines").delete().eq("id", routineId);
    if (error) console.error("[crear-rutina] NO se pudo deshacer la rutina", routineId, error.message);
    return { error: ERROR_GUARDAR };
  };

  const [{ error: errorEjercicios }, { error: errorDias }] = await Promise.all([
    admin.from("routine_exercises").insert(filas.ejercicios),
    admin.from("routine_dias").insert(filas.dias),
  ]);
  if (errorEjercicios || errorDias) {
    return deshacer(errorEjercicios?.message ?? errorDias?.message ?? "sin detalle");
  }

  const { error: errorAcceso } = await admin
    .from("profile_routine_access")
    .insert({ user_id: user.id, routine_id: routineId });
  if (errorAcceso) {
    return deshacer(errorAcceso.message);
  }

  // Reutiliza el mismo flujo que "Cambiar rutina activa" (cierra el stint
  // vigente en profile_routine_history y abre uno nuevo) en vez de tocar
  // profiles.routine_id directo -- así Progreso > Historial también refleja
  // esta rutina como cualquier otra. Es opcional: guardar una rutina no
  // tiene por qué significar "dejá de usar la que ya tenés activa" -- el
  // usuario puede guardarla para más adelante y seguir con la actual.
  // Si activarla falla, la rutina YA está guardada: se avisa sin devolver error, así la pantalla no deja el borrador
  // para reintentar (cada reintento crearía otra copia).
  if (activar) {
    const resultadoActivar = await cambiarRutinaActiva(routineId);
    if (resultadoActivar.error) {
      console.error("[crear-rutina] rutina guardada pero no se pudo activar", routineId, resultadoActivar.error);
      return { ok: true, routineId, activada: false };
    }
  }

  return { ok: true, routineId, activada: activar };
}

// Edita una rutina ya creada por el propio usuario -- mismo criterio de
// ownership que borrarRutinaCreada (creada_por_usuario + acceso en
// profile_routine_access), revalidado acá server-side. Reemplaza TODO el
// contenido (borra y recarga routine_exercises/routine_dias) en vez de
// intentar un diff fila por fila -- es mucho más simple y no hay riesgo
// para el historial: workout_logs apunta a exercise_definition_id, nunca a
// routine_exercises.id, así que borrar y recrear las filas de scheduling
// no corta el progreso de ningún ejercicio.
// Como son varias escrituras sin transacción, antes de borrar se guarda una copia de lo que había y, si el guardado
// falla a mitad de camino, se restaura: la rutina nunca queda vacía.
export async function actualizarRutinaCreada(
  routineId: number,
  nombre: string,
  dias: DiaGuardar[],
  activar: boolean
): Promise<ResultadoGuardado> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tenés que iniciar sesión de nuevo." };
  }

  const [{ data: rutina }, { data: acceso }] = await Promise.all([
    supabase.from("routines").select("id, creada_por_usuario").eq("id", routineId).maybeSingle(),
    supabase
      .from("profile_routine_access")
      .select("routine_id")
      .eq("user_id", user.id)
      .eq("routine_id", routineId)
      .maybeSingle(),
  ]);

  if (!rutina || !rutina.creada_por_usuario) {
    return { error: "Esta rutina no se puede editar." };
  }
  if (!acceso) {
    return { error: "Esta rutina no te pertenece." };
  }

  const validada = validarRutina(nombre, dias);
  if (!validada.ok) {
    return { error: validada.error };
  }

  const admin = createAdminClient();

  if (await hayEjercicioInexistente(admin, validada.dias)) {
    return { error: ERROR_EJERCICIO_INEXISTENTE };
  }

  const [
    { data: rutinaAntes, error: errorLeerRutina },
    { data: ejerciciosAntes, error: errorLeerEjercicios },
    { data: diasAntes, error: errorLeerDias },
  ] = await Promise.all([
    admin.from("routines").select("nombre, dias").eq("id", routineId).single(),
    admin
      .from("routine_exercises")
      .select("routine_id, dia, orden, exercise_definition_id, series_reps, rir_objetivo")
      .eq("routine_id", routineId),
    admin.from("routine_dias").select("routine_id, dia, grupos_musculares").eq("routine_id", routineId),
  ]);
  if (errorLeerRutina || errorLeerEjercicios || errorLeerDias || !rutinaAntes || !ejerciciosAntes || !diasAntes) {
    console.error(
      "[crear-rutina] no se pudo leer la rutina a editar",
      routineId,
      errorLeerRutina?.message ?? errorLeerEjercicios?.message ?? errorLeerDias?.message
    );
    return { error: ERROR_GUARDAR };
  }

  const reemplazarContenido = async (ejercicios: object[], diasFilas: object[]) => {
    const [{ error: errorBorrarEjercicios }, { error: errorBorrarDias }] = await Promise.all([
      admin.from("routine_exercises").delete().eq("routine_id", routineId),
      admin.from("routine_dias").delete().eq("routine_id", routineId),
    ]);
    if (errorBorrarEjercicios || errorBorrarDias) return errorBorrarEjercicios ?? errorBorrarDias;
    const [{ error: errorEjercicios }, { error: errorDias }] = await Promise.all([
      admin.from("routine_exercises").insert(ejercicios),
      admin.from("routine_dias").insert(diasFilas),
    ]);
    return errorEjercicios ?? errorDias ?? null;
  };

  const restaurar = async (motivo: string) => {
    console.error("[crear-rutina] falló la edición, se restaura la rutina", routineId, motivo);
    const [falloContenido, { error: falloEncabezado }] = await Promise.all([
      reemplazarContenido(ejerciciosAntes, diasAntes),
      admin.from("routines").update({ nombre: rutinaAntes.nombre, dias: rutinaAntes.dias }).eq("id", routineId),
    ]);
    if (falloContenido || falloEncabezado) {
      console.error("[crear-rutina] NO se pudo restaurar la rutina", routineId, falloContenido?.message ?? falloEncabezado?.message);
    }
    return { error: ERROR_GUARDAR };
  };

  const filas = armarFilas(routineId, validada.dias);
  const falloContenido = await reemplazarContenido(filas.ejercicios, filas.dias);
  if (falloContenido) {
    return restaurar(falloContenido.message);
  }

  const { error: errorRutina } = await admin
    .from("routines")
    .update({ nombre: validada.nombre, dias: validada.dias.length })
    .eq("id", routineId);
  if (errorRutina) {
    return restaurar(errorRutina.message);
  }

  if (activar) {
    const resultadoActivar = await cambiarRutinaActiva(routineId);
    if (resultadoActivar.error) {
      console.error("[crear-rutina] rutina editada pero no se pudo activar", routineId, resultadoActivar.error);
      return { ok: true, routineId, activada: false };
    }
  }

  return { ok: true, routineId, activada: activar };
}

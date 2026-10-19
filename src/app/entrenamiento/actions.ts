"use server";

import { createClient } from "@/lib/supabase/server";
import { hoyISO, inicioDelDiaArgentinaUTC } from "@/lib/fecha";
import { rutinaIncluidaEnPlan } from "@/lib/premium";
import { ladoOpuesto, ladoPendiente } from "@/lib/lado-pendiente";
import type { TipoSerie } from "@/lib/dropset";
import { modalidadValida, type ModalidadCarga } from "@/lib/carga";
import { esUsuarioDePrototipos } from "@/lib/prototipos";

export type SetInput = {
  peso: number | null;
  reps: number | null;
  rir: number | null;
  // Modalidades de carga (lib/carga.ts): kg extra en ejercicios de peso corporal
  // y duración en los de tiempo.
  lastre?: number | null;
  segundos?: number | null;
  lado?: "derecho" | "izquierdo" | null;
  // Drop sets (ver lib/dropset.ts): 'dropset' = serie principal de un drop
  // set, 'drop' = una bajada (requiere dropDe, el id de la principal).
  tipo?: TipoSerie;
  dropDe?: number | null;
};

const MAX_BAJADAS_POR_SERIE = 5;

export async function registrarSets(exerciseDefinitionId: number, sets: SetInput[], dia?: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tenés que iniciar sesión de nuevo." };
  }

  // El lado de un set unilateral NO se toma del que manda el cliente: se
  // asigna acá, contando lo ya registrado hoy para este ejercicio (mismo
  // criterio y misma ventana de "hoy" que usa la pantalla para mostrarlo --
  // ver lib/lado-pendiente.ts). Si el cliente quedó desactualizado (app en
  // segundo plano varios minutos, refresh que todavía no llegó) la base
  // igual queda siempre alternando derecho/izquierdo, sin duplicar un lado.
  let proximoLado: ReturnType<typeof ladoPendiente> | null = null;
  if (sets.some((s) => s.lado)) {
    const { data: previos, error: errorPrevios } = await supabase
      .from("workout_logs")
      .select("lado")
      .eq("user_id", user.id)
      .eq("exercise_definition_id", exerciseDefinitionId)
      .gte("created_at", inicioDelDiaArgentinaUTC().toISOString());

    if (errorPrevios) {
      return { error: errorPrevios.message };
    }
    proximoLado = ladoPendiente(previos ?? []);
  }

  // Una bajada solo puede colgar de una serie principal de drop set de ESTE
  // usuario y de ESTE ejercicio, y con un máximo de bajadas: se valida acá
  // porque el cliente puede mandar cualquier id.
  const bajadas = sets.filter((s) => s.tipo === "drop");
  if (bajadas.length > 0) {
    const padreIds = [...new Set(bajadas.map((s) => s.dropDe))];
    if (padreIds.length !== 1 || padreIds[0] == null || sets.some((s) => s.tipo !== "drop")) {
      return { error: "Las bajadas tienen que pertenecer a una sola serie con drop set." };
    }
    const { data: padre } = await supabase
      .from("workout_logs")
      .select("id")
      .eq("id", padreIds[0])
      .eq("user_id", user.id)
      .eq("exercise_definition_id", exerciseDefinitionId)
      .eq("tipo_serie", "dropset")
      .maybeSingle();
    if (!padre) {
      return { error: "No encontramos la serie principal de ese drop set." };
    }
    const { count } = await supabase
      .from("workout_logs")
      .select("id", { count: "exact", head: true })
      .eq("drop_de", padreIds[0]);
    if ((count ?? 0) + bajadas.length > MAX_BAJADAS_POR_SERIE) {
      return { error: "Ese drop set ya tiene el máximo de bajadas." };
    }
  }

  // La modalidad de carga sale de la base, no del cliente: decide qué columnas se
  // guardan. Si la columna todavía no existe (migración 103), todo es "con_peso".
  const { modalidad, pesoCorporal } = await modalidadYPesoCorporal(supabase, user.id, exerciseDefinitionId);

  const filas = sets
    .filter((s) => s.peso !== null || s.reps !== null || s.rir !== null || s.lastre != null || s.segundos != null)
    .map((s) => {
      let lado: "derecho" | "izquierdo" | null = null;
      if (s.lado && proximoLado) {
        lado = proximoLado;
        proximoLado = ladoOpuesto(proximoLado);
      }
      const tipo: TipoSerie = s.tipo === "dropset" || s.tipo === "drop" ? s.tipo : "normal";
      return {
        user_id: user.id,
        exercise_definition_id: exerciseDefinitionId,
        peso: modalidad === "con_peso" ? s.peso : null,
        reps: modalidad === "tiempo" ? null : s.reps,
        rir: s.rir,
        lado,
        dia: dia ?? null,
        ...(modalidad === "peso_corporal"
          ? { lastre: s.lastre ?? null, peso_corporal_ref: pesoCorporal }
          : modalidad === "tiempo"
            ? { segundos: s.segundos ?? null }
            : {}),
        // Las filas comunes no mandan estas columnas: así registrar una serie
        // normal sigue funcionando aunque la migración 096 no esté corrida.
        ...(tipo !== "normal" ? { tipo_serie: tipo, drop_de: tipo === "drop" ? s.dropDe : null } : {}),
      };
    });

  if (filas.length === 0) {
    return { error: "Cargá al menos un dato en algún set." };
  }

  const { error } = await supabase.from("workout_logs").insert(filas);

  if (error) {
    return { error: error.message };
  }

  return { ok: true };
}

async function modalidadYPesoCorporal(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  exerciseDefinitionId: number
): Promise<{ modalidad: ModalidadCarga; pesoCorporal: number | null }> {
  const { data: def, error } = await supabase
    .from("exercise_definitions")
    .select("modalidad_carga")
    .eq("id", exerciseDefinitionId)
    .maybeSingle();
  const modalidad = error ? "con_peso" : modalidadValida(def?.modalidad_carga);
  if (modalidad !== "peso_corporal") return { modalidad, pesoCorporal: null };
  // Peso del usuario al registrar: la última medición que tenga cargada en Medidas.
  const { data: med } = await supabase
    .from("body_measurements")
    .select("peso")
    .eq("user_id", userId)
    .not("peso", "is", null)
    .order("fecha", { ascending: false })
    .limit(1)
    .maybeSingle();
  return { modalidad, pesoCorporal: med?.peso ?? null };
}

// PROTOTIPO (cámara): guarda los NÚMEROS de una serie contada con la cámara (señales a ~10 Hz,
// lo que contó el algoritmo y lo que quedó tras corregir) para ajustar el conteo con datos
// reales. No hay video. Solo para cuentas de prototipos (lib/prototipos.ts).
export async function guardarSesionPose(datos: {
  exerciseId: number | null;
  camara: string;
  fps: number | null;
  contado: number;
  final: number;
  senal: string | null;
  senales: Record<string, number[]>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !esUsuarioDePrototipos(user.email)) return { error: "No autorizado." };
  // Tope de tamaño: ~15 minutos de serie a 10 Hz, 5 señales.
  const total = Object.values(datos.senales).reduce((a, v) => a + v.length, 0);
  if (total > 50000) return { error: "Serie demasiado larga." };
  const { error } = await supabase.from("pose_sesiones_prueba").insert({
    user_id: user.id,
    exercise_definition_id: datos.exerciseId,
    camara: datos.camara.slice(0, 20),
    fps: datos.fps,
    contado: datos.contado,
    final: datos.final,
    senal: datos.senal,
    senales: datos.senales,
  });
  if (error) return { error: error.message };
  return { ok: true };
}

export async function editarSet(logId: number, set: SetInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tenés que iniciar sesión de nuevo." };
  }

  const { error } = await supabase
    .from("workout_logs")
    .update({
      peso: set.peso,
      reps: set.reps,
      rir: set.rir,
      // Solo si vienen (ejercicios de peso corporal / tiempo): no tocan filas comunes.
      ...(set.lastre !== undefined ? { lastre: set.lastre } : {}),
      ...(set.segundos !== undefined ? { segundos: set.segundos } : {}),
    })
    .eq("id", logId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { ok: true };
}

export async function finalizarEntrenamientoDia(dia: string, routineId: number | null) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tenés que iniciar sesión de nuevo." };
  }

  const { error } = await supabase.from("entrenamientos_finalizados").upsert(
    {
      user_id: user.id,
      routine_id: routineId,
      dia,
      fecha: hoyISO(),
    },
    { onConflict: "user_id,dia,fecha" }
  );

  if (error) {
    return { error: error.message };
  }

  return { ok: true };
}

// Separado de guardarPerfil (perfil/datos/actions.ts) a propósito: cambiar de
// rutina activa deja un registro en profile_routine_history (para el
// Historial en Progreso), algo que no debe pasar cada vez que el usuario
// solo edita nombre/edad/etc. Vive acá porque conceptualmente es una acción
// de Entrenamiento, no de Perfil.
export async function cambiarRutinaActiva(routineId: number) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tenés que iniciar sesión de nuevo." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("routine_id, premium_hasta, golden_perpetuo, premium_origen")
    .eq("id", user.id)
    .single();

  if (profile?.routine_id === routineId) {
    return { ok: true };
  }

  const { data: rutina } = await supabase
    .from("routines")
    .select("nombre, es_privada")
    .eq("id", routineId)
    .maybeSingle();

  if (!rutina) {
    return { error: "Esa rutina no existe." };
  }

  // Las rutinas privadas (armadas a medida para una sola cuenta) siempre
  // necesitan acceso explícito, sin importar el nivel de acceso del
  // usuario -- si no, cualquier cuenta con acceso a la app podría
  // "adivinar" el id y cambiarse a una rutina que no le pertenece. Para
  // rutinas PÚBLICAS, solo Founder/Golden navega el catálogo libremente,
  // y Free Trial solo las 3 estandarizadas -- el resto necesita acceso
  // explícito también (ver `rutinaIncluidaEnPlan` en lib/premium.ts).
  if (!rutinaIncluidaEnPlan(profile, rutina)) {
    const { data: acceso } = await supabase
      .from("profile_routine_access")
      .select("routine_id")
      .eq("user_id", user.id)
      .eq("routine_id", routineId)
      .maybeSingle();

    if (!acceso) {
      return { error: "Todavía no tenés esa rutina desbloqueada." };
    }
  }

  const hoy = hoyISO();

  const { error: cierreError } = await supabase
    .from("profile_routine_history")
    .update({ fecha_fin: hoy })
    .eq("user_id", user.id)
    .is("fecha_fin", null);

  if (cierreError) {
    return { error: cierreError.message };
  }

  const { error: aperturaError } = await supabase
    .from("profile_routine_history")
    .insert({ user_id: user.id, routine_id: routineId, fecha_inicio: hoy });

  if (aperturaError) {
    return { error: aperturaError.message };
  }

  const { error: perfilError } = await supabase
    .from("profiles")
    .update({ routine_id: routineId, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (perfilError) {
    return { error: perfilError.message };
  }

  return { ok: true };
}

export async function borrarSet(logId: number) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tenés que iniciar sesión de nuevo." };
  }

  const { error } = await supabase
    .from("workout_logs")
    .delete()
    .eq("id", logId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { ok: true };
}

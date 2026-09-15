import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/back-link";
import { fechaLegible, inicioDelDiaArgentinaUTC } from "@/lib/fecha";
import type { Lado } from "@/lib/descanso";

const LETRAS_DIA = ["A", "B", "C", "D", "E", "F", "G"];

function fechaHoraLegible(iso: string) {
  const fecha = new Date(iso);
  return `${fecha.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  })} ${fecha.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  })}`;
}

function labelLado(lado: Lado | null) {
  if (lado === "derecho") return "Lado derecho";
  if (lado === "izquierdo") return "Lado izquierdo";
  return null;
}

export default async function HistorialDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const historyId = Number(id);

  if (!Number.isInteger(historyId)) {
    notFound();
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: historial } = await supabase
    .from("profile_routine_history")
    .select("id, routine_id, fecha_inicio, fecha_fin, routines(nombre, dias)")
    .eq("id", historyId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!historial) {
    notFound();
  }

  const rutina = Array.isArray(historial.routines) ? historial.routines[0] : historial.routines;

  const periodo = (
    <p className="mb-6 text-center text-sm text-gray-500">
      Desde el {fechaLegible(historial.fecha_inicio)}
      {historial.fecha_fin ? ` hasta el ${fechaLegible(historial.fecha_fin)}` : " (activa)"}
    </p>
  );

  if (!historial.routine_id || !rutina) {
    return (
      <main className="flex flex-1 flex-col items-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="relative mb-2">
            <BackLink href="/progreso/historial" />
            <h1 className="text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
              REGISTRO
            </h1>
          </div>
          {periodo}
          <p className="text-center text-sm text-gray-500">
            Esa rutina ya no existe, así que no podemos mostrar el detalle.
          </p>
        </div>
      </main>
    );
  }

  const { data: routineExercises } = await supabase
    .from("routine_exercises")
    .select("dia, orden, exercise_definition_id, series_reps, exercise_definitions(nombre)")
    .eq("routine_id", historial.routine_id)
    .order("dia", { ascending: true })
    .order("orden", { ascending: true });

  const ejerciciosPorDia = new Map<
    string,
    { id: number; nombre: string; series_reps: string | null }[]
  >();
  for (const re of routineExercises ?? []) {
    if (re.exercise_definition_id === null) continue;
    const def = Array.isArray(re.exercise_definitions)
      ? re.exercise_definitions[0]
      : re.exercise_definitions;
    const lista = ejerciciosPorDia.get(re.dia) ?? [];
    lista.push({
      id: re.exercise_definition_id,
      nombre: def?.nombre ?? "",
      series_reps: re.series_reps ?? null,
    });
    ejerciciosPorDia.set(re.dia, lista);
  }

  const exerciseIds = [
    ...new Set((routineExercises ?? []).map((re) => re.exercise_definition_id).filter((id): id is number => id !== null)),
  ];

  const desde = inicioDelDiaArgentinaUTC(historial.fecha_inicio);
  const hasta = historial.fecha_fin
    ? new Date(inicioDelDiaArgentinaUTC(historial.fecha_fin).getTime() + 86_400_000)
    : null;

  let logsQuery = supabase
    .from("workout_logs")
    .select("exercise_definition_id, peso, reps, rir, lado, created_at")
    .eq("user_id", user.id)
    .in("exercise_definition_id", exerciseIds)
    .gte("created_at", desde.toISOString())
    .order("created_at", { ascending: true });

  if (hasta) {
    logsQuery = logsQuery.lt("created_at", hasta.toISOString());
  }

  const { data: logs } = exerciseIds.length
    ? await logsQuery
    : { data: [] as { exercise_definition_id: number | null; peso: number | null; reps: number | null; rir: number | null; lado: Lado | null; created_at: string }[] };

  const logsPorEjercicio = new Map<number, typeof logs>();
  for (const log of logs ?? []) {
    if (log.exercise_definition_id === null) continue;
    const lista = logsPorEjercicio.get(log.exercise_definition_id) ?? [];
    lista.push(log);
    logsPorEjercicio.set(log.exercise_definition_id, lista);
  }

  const dias = LETRAS_DIA.slice(0, rutina.dias).filter((d) => ejerciciosPorDia.has(d));

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="relative mb-2">
          <BackLink href="/progreso/historial" />
          <h1 className="text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
            {rutina.nombre.toUpperCase()}
          </h1>
        </div>
        {periodo}

        {dias.length === 0 ? (
          <p className="text-center text-sm text-gray-500">
            Esta rutina todavía no tiene ejercicios cargados.
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            {dias.map((dia) => (
              <div key={dia}>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                  Día {dia}
                </p>
                <div className="flex flex-col gap-3">
                  {(ejerciciosPorDia.get(dia) ?? []).map((ej) => {
                    const logsEj = logsPorEjercicio.get(ej.id) ?? [];
                    return (
                      <div
                        key={ej.id}
                        className="rounded-lg border border-border bg-bg-card p-3"
                      >
                        <h2 className="text-sm font-medium text-white">{ej.nombre}</h2>
                        {ej.series_reps && (
                          <p className="mt-0.5 text-[11px] text-gray-500">{ej.series_reps}</p>
                        )}
                        {logsEj.length === 0 ? (
                          <p className="mt-2 text-xs text-gray-600">Sin registros.</p>
                        ) : (
                          <div className="mt-2 flex flex-col gap-1 border-t border-border pt-2">
                            {logsEj.map((log, i) => (
                              <p key={i} className="text-sm text-gray-300">
                                {fechaHoraLegible(log.created_at)} — {log.peso ?? "-"}kg ×{" "}
                                {log.reps ?? "-"} (RIR {log.rir ?? "-"})
                                {log.lado && (
                                  <span className="text-gray-500"> · {labelLado(log.lado)}</span>
                                )}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

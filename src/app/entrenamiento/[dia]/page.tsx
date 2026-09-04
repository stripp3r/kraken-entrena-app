import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { registrarSet } from "../actions";

const DIAS_VALIDOS = ["A", "B", "C", "D"];

export default async function DiaEntrenamientoPage({
  params,
  searchParams,
}: {
  params: Promise<{ dia: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { dia: diaParam } = await params;
  const { ok, error } = await searchParams;
  const dia = diaParam.toUpperCase();

  if (!DIAS_VALIDOS.includes(dia)) {
    notFound();
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: exercises } = await supabase
    .from("exercises")
    .select("id, nombre, video_url, imagen_url, orden, techniques(nombre, descripcion)")
    .eq("dia", dia)
    .order("orden", { ascending: true });

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
          DÍA {dia}
        </h1>
        <Link
          href="/entrenamiento"
          className="mb-8 block text-center text-sm text-gray-500 underline"
        >
          Cambiar de día
        </Link>

        {ok && (
          <p className="mb-4 rounded-lg bg-bg-card px-4 py-2 text-center text-sm text-gray-300">
            Set registrado ✓
          </p>
        )}
        {error && <p className="mb-4 text-center text-sm text-red-400">{error}</p>}

        {!exercises || exercises.length === 0 ? (
          <p className="text-center text-sm text-gray-500">
            Todavía no hay ejercicios cargados para este día.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {exercises.map((ex) => {
              const technique = Array.isArray(ex.techniques)
                ? ex.techniques[0]
                : ex.techniques;

              return (
                <div
                  key={ex.id}
                  className="rounded-lg border border-border bg-bg-card p-4"
                >
                  {ex.imagen_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={ex.imagen_url}
                      alt={ex.nombre}
                      className="mb-3 h-40 w-full rounded-md object-cover"
                    />
                  )}

                  <h2 className="text-lg font-medium text-white">{ex.nombre}</h2>

                  {technique && (
                    <p className="mt-1 text-xs text-gray-500">
                      Técnica: <span className="text-gray-300">{technique.nombre}</span>
                    </p>
                  )}

                  {ex.video_url && (
                    <a
                      href={ex.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block text-xs text-gray-400 underline"
                    >
                      Ver video
                    </a>
                  )}

                  <form className="mt-3 flex items-end gap-2">
                    <input type="hidden" name="exercise_id" value={ex.id} />
                    <input type="hidden" name="dia" value={dia} />

                    <div className="flex flex-1 flex-col gap-1">
                      <label className="text-[11px] text-gray-500">Peso</label>
                      <input
                        name="peso"
                        type="number"
                        step="0.5"
                        inputMode="decimal"
                        className="w-full rounded-md border border-border bg-bg px-2 py-1.5 text-sm text-white outline-none focus:border-border-strong"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <label className="text-[11px] text-gray-500">Reps</label>
                      <input
                        name="reps"
                        type="number"
                        inputMode="numeric"
                        className="w-full rounded-md border border-border bg-bg px-2 py-1.5 text-sm text-white outline-none focus:border-border-strong"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <label className="text-[11px] text-gray-500">RIR</label>
                      <input
                        name="rir"
                        type="number"
                        inputMode="numeric"
                        className="w-full rounded-md border border-border bg-bg px-2 py-1.5 text-sm text-white outline-none focus:border-border-strong"
                      />
                    </div>

                    <button
                      formAction={registrarSet}
                      className="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-black"
                    >
                      +Set
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

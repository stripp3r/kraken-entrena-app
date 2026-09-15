import Link from "next/link";

const URL_PLANES = "https://kraken-fitness-web.vercel.app/#planes";

type Routine = { id: number; nombre: string; dias: number; descripcion: string | null };

export function RutinaHub({
  routineIdActual,
  rutinaActiva,
  routines,
  idsDesbloqueados,
}: {
  routineIdActual: number | null;
  rutinaActiva: { nombre: string; dias: number } | null;
  routines: Routine[];
  idsDesbloqueados: number[];
}) {
  const desbloqueadas = new Set(idsDesbloqueados);
  const paraAdquirir = routines.filter((r) => r.id !== routineIdActual && !desbloqueadas.has(r.id));

  return (
    <div className="flex flex-col gap-8">
      {rutinaActiva ? (
        <Link
          href="/entrenamiento/dias"
          className="flex items-center justify-between gap-3 rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-5 py-4 transition-colors hover:border-emerald-500 active:bg-emerald-500/20"
        >
          <div>
            <p className="text-xs uppercase tracking-wide text-emerald-300">Tu rutina activa</p>
            <p className="mt-1 text-lg font-medium text-white">
              {rutinaActiva.nombre} ({rutinaActiva.dias} días)
            </p>
          </div>
          <span className="shrink-0 text-sm text-emerald-300">Ver días →</span>
        </Link>
      ) : (
        <Link
          href="/entrenamiento/rutinas"
          className="flex items-center justify-between gap-3 rounded-lg border border-amber-400/60 bg-amber-400/10 px-5 py-4 transition-colors hover:border-amber-400 active:bg-amber-400/20"
        >
          <div>
            <p className="text-xs uppercase tracking-wide text-amber-300">Sin rutina activa</p>
            <p className="mt-1 text-lg font-medium text-white">Elegí tu rutina</p>
          </div>
          <span className="shrink-0 text-sm text-amber-300">Ver rutinas →</span>
        </Link>
      )}

      {paraAdquirir.length > 0 && (
        <div>
          <p className="mb-3 text-sm text-gray-500">Adquirir otras rutinas</p>
          <div className="flex flex-col gap-3">
            {paraAdquirir.map((r) => (
              <div
                key={r.id}
                className="relative overflow-hidden rounded-lg border border-border bg-bg-card px-4 py-3"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-2 -top-2 text-5xl opacity-10"
                >
                  🔒
                </span>
                <p className="text-sm font-medium text-gray-300">
                  {r.nombre} ({r.dias} días)
                </p>
                {r.descripcion && (
                  <p className="mt-0.5 text-xs text-gray-500">{r.descripcion}</p>
                )}
                <a
                  href={URL_PLANES}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block rounded-full bg-white px-4 py-1.5 text-xs font-medium text-black transition-opacity hover:opacity-90"
                >
                  Adquirir
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

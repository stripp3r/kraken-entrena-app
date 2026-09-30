import Link from "next/link";

export function RutinaHub({
  rutinaActiva,
}: {
  rutinaActiva: { nombre: string; dias: number } | null;
}) {
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
          <span className="shrink-0 text-3xl font-light text-emerald-300">›</span>
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
          <span className="shrink-0 text-3xl font-light text-amber-300">›</span>
        </Link>
      )}
    </div>
  );
}

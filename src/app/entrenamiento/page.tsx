import Link from "next/link";

const DIAS = [
  { id: "A", label: "Día A" },
  { id: "B", label: "Día B" },
  { id: "C", label: "Día C" },
  { id: "D", label: "Día D" },
];

export default function EntrenamientoPage() {
  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
          ENTRENAMIENTO
        </h1>

        <div className="flex flex-col gap-3">
          {DIAS.map((dia) => (
            <Link
              key={dia.id}
              href={`/entrenamiento/${dia.id}`}
              className="rounded-lg border border-border bg-bg-card px-5 py-4 text-center text-lg text-white transition-colors hover:border-border-strong"
            >
              {dia.label}
            </Link>
          ))}
        </div>

        <Link
          href="/"
          className="mt-8 block text-center text-sm text-gray-500 underline"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}

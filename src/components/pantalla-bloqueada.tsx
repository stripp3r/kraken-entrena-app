import Link from "next/link";
import { BackLink } from "@/components/back-link";

// Pantalla completa para una función que el plan actual del usuario no
// incluye (hoy: Free Trial contra Alimentación, Mi evolución, Mis PDFs,
// Historial, Cardio). Reutilizable para cualquier categoría futura que
// necesite el mismo tratamiento -- ver "Free Trial" en CLAUDE.md.
export function PantallaBloqueada({
  titulo,
  volverA,
  texto,
}: {
  titulo: string;
  volverA: string;
  texto: string;
}) {
  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="relative mb-2 flex items-center justify-center">
          <BackLink href={volverA} />
          <h1 className="text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
            {titulo}
          </h1>
        </div>
        <div className="mt-8 flex flex-col items-center gap-4 text-center">
          <img src="/section-icons/bloqueado.png" alt="" className="h-16 w-16" />
          <p className="text-sm text-gray-400">{texto}</p>
          <Link
            href="/golden"
            className="rounded-full bg-amber-400 px-6 py-3 text-sm font-medium text-black"
          >
            Conocer Golden
          </Link>
        </div>
      </div>
    </main>
  );
}

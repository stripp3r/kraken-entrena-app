import Link from "next/link";

export function TrialBanner({ dias }: { dias: number }) {
  const urgente = dias <= 7;
  return (
    <Link
      href="/golden"
      className={`block px-4 py-1.5 text-center text-xs ${
        urgente
          ? "bg-amber-500/10 text-amber-300"
          : "bg-emerald-500/10 text-emerald-300"
      }`}
    >
      Prueba gratis · te {dias === 1 ? "queda 1 día" : `quedan ${dias} días`} · pasate a Golden
    </Link>
  );
}

import Link from "next/link";

export default function CompraGraciasPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="w-full max-w-sm">
        <h1 className="mb-3 font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
          ¡GRACIAS!
        </h1>
        <p className="mb-8 text-sm text-gray-400">
          Tu pago se acreditó. Entrá a la app y registrate con el mismo email
          que usaste para pagar: tu rutina queda desbloqueada sola y el PDF lo
          descargás desde Perfil → Mis PDFs.
        </p>
        <Link
          href="/login"
          className="inline-block rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-opacity hover:opacity-90"
        >
          Entrar a la app
        </Link>
      </div>
    </main>
  );
}

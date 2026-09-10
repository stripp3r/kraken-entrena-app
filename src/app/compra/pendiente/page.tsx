export default function CompraPendientePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="w-full max-w-sm">
        <h1 className="mb-3 font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
          PAGO PENDIENTE
        </h1>
        <p className="text-sm text-gray-400">
          Tu pago está en revisión (algunos medios, como Rapipago o Pago
          Fácil, tardan hasta 2 días hábiles en acreditarse). En cuanto se
          confirme, entrá a la app y registrate con el mismo email que usaste
          para pagar: la rutina queda desbloqueada sola y el PDF lo descargás
          desde Perfil → Mis PDFs.
        </p>
      </div>
    </main>
  );
}

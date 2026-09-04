export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <img src="/kraken-mark.png" alt="KRAKEN" className="h-16 w-16" />
      <h1 className="font-[family-name:var(--font-display)] text-5xl tracking-wide text-white">
        KRAKEN ENTRENA
      </h1>
      <p className="max-w-xs text-gray-300">
        Tu rutina, tu progreso y tus técnicas, en el celular.
      </p>
      <p className="mt-8 rounded-full border border-border-strong bg-bg-card px-4 py-2 text-sm text-gray-500">
        Instalá esta página en tu pantalla de inicio — el resto llega en breve.
      </p>
    </main>
  );
}

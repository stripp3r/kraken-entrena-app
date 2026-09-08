export default function CompraErrorPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="w-full max-w-sm">
        <h1 className="mb-3 font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
          NO SE PUDO PROCESAR
        </h1>
        <p className="text-sm text-gray-400">
          Tu pago no se completó (rechazado o cancelado). No se te cobró
          nada. Podés volver a intentarlo desde el sitio.
        </p>
      </div>
    </main>
  );
}

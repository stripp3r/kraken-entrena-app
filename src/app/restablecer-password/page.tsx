import { RestablecerPasswordCliente } from "@/components/restablecer-password-cliente";

export default async function RestablecerPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
          CONTRASEÑA NUEVA
        </h1>
        <p className="mb-8 text-center text-sm text-gray-500">
          Ingresá el código de 8 dígitos que te mandamos por mail y elegí tu contraseña nueva.
        </p>

        <RestablecerPasswordCliente emailInicial={email} />
      </div>
    </main>
  );
}

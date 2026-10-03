import { RestablecerPasswordCliente } from "@/components/restablecer-password-cliente";

// Sin chequeo de sesión server-side a propósito: el link del mail llega acá
// con los tokens en el fragmento de la URL (#access_token=...), que nunca
// se envía al servidor -- todo el procesamiento es client-side, ver
// RestablecerPasswordCliente.
export default function RestablecerPasswordPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
          CONTRASEÑA NUEVA
        </h1>
        <p className="mb-8 text-center text-sm text-gray-500">Elegí tu contraseña nueva.</p>

        <RestablecerPasswordCliente />
      </div>
    </main>
  );
}

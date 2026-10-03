import Link from "next/link";
import { pedirRecuperacion } from "./actions";

export default function OlvidePasswordPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
          RECUPERAR CONTRASEÑA
        </h1>
        <p className="mb-8 text-center text-sm text-gray-500">
          Ingresá el email con el que te registraste y te mandamos un código de 8
          dígitos para crear una contraseña nueva.
        </p>

        <form className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm text-gray-300">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="rounded-lg border border-border bg-bg-card px-4 py-2.5 text-white outline-none focus:border-border-strong"
            />
          </div>

          <button
            formAction={pedirRecuperacion}
            className="mt-2 rounded-full bg-white px-5 py-3 font-medium text-black transition-opacity hover:opacity-90"
          >
            Mandarme el código
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          <Link href="/login" className="text-gray-300 underline">
            Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </main>
  );
}

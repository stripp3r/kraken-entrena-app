import Link from "next/link";
import { PasswordInput } from "@/components/password-input";
import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
          KRAKEN ENTRENA
        </h1>

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

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm text-gray-300">
              Contraseña
            </label>
            <PasswordInput id="password" name="password" required />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            formAction={login}
            className="mt-2 rounded-full bg-white px-5 py-3 font-medium text-black transition-opacity hover:opacity-90"
          >
            Entrar
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          ¿Todavía no tenés cuenta?{" "}
          <Link href="/registro" className="text-gray-300 underline">
            Registrate
          </Link>
        </p>
      </div>
    </main>
  );
}

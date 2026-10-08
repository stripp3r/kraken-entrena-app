import Link from "next/link";
import { PasswordInput } from "@/components/password-input";
import { InstalarApp } from "@/components/instalar-app";
import { BotonesSociales } from "@/components/botones-sociales";
import { LinksLegales } from "@/components/links-legales";
import { signup } from "../login/actions";
import { URL_PRIVACIDAD, URL_TERMINOS } from "@/lib/legal";

export default async function RegistroPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; email?: string; next?: string }>;
}) {
  const { error, email, next } = await searchParams;

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
          CREAR CUENTA
        </h1>

        <InstalarApp />

        <form className="flex flex-col gap-4">
          {next && <input type="hidden" name="next" value={next} />}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm text-gray-300">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={email ?? ""}
              required
              className="rounded-lg border border-border bg-bg-card px-4 py-2.5 text-white outline-none focus:border-border-strong"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm text-gray-300">
              Contraseña
            </label>
            <PasswordInput id="password" name="password" required minLength={6} />
          </div>

          <label className="flex items-start gap-3 text-sm text-gray-300">
            <input type="checkbox" name="acepto" required className="mt-0.5 h-4 w-4 shrink-0 accent-orange-500" />
            <span>
              Acepto los{" "}
              <a href={URL_TERMINOS} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 text-white">
                Términos y Condiciones
              </a>{" "}
              y la{" "}
              <a href={URL_PRIVACIDAD} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 text-white">
                Política de Privacidad
              </a>
              .
            </span>
          </label>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            formAction={signup}
            className="mt-2 rounded-full bg-white px-5 py-3 font-medium text-black transition-opacity hover:opacity-90"
          >
            Crear cuenta
          </button>
        </form>

        <BotonesSociales next={next} />
        <p className="mt-3 text-center text-xs text-gray-600">
          Si entrás con Google o Facebook, te vamos a pedir aceptar los Términos y la Política de
          Privacidad antes de seguir.
        </p>

        <p className="mt-6 text-center text-sm text-gray-500">
          ¿Ya tenés cuenta?{" "}
          <Link
            href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
            className="text-gray-300 underline"
          >
            Entrá
          </Link>
        </p>

        <LinksLegales />
      </div>
    </main>
  );
}

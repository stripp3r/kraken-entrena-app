import { aceptarTerminos } from "./actions";
import { logout } from "../login/actions";
import { URL_PRIVACIDAD, URL_TERMINOS } from "@/lib/legal";

// Pantalla de aceptación obligatoria: la ve quien entró con Google/Facebook
// por primera vez, quien ya tenía cuenta antes de que existiera la
// aceptación, y todos cuando cambia VERSION_LEGAL. El proxy manda acá a
// cualquier usuario logueado sin aceptación vigente (ver middleware.ts).
export default async function AceptarTerminosPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;
  const link = "underline underline-offset-2 text-white";

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-3 text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
          ANTES DE SEGUIR
        </h1>
        <p className="mb-6 text-center text-sm text-gray-400">
          Para usar KRAKEN Entrena tenés que aceptar los Términos y Condiciones y la Política de
          Privacidad. Podés leerlos antes de aceptar.
        </p>

        <form className="flex flex-col gap-4">
          {next && <input type="hidden" name="next" value={next} />}

          <label className="flex items-start gap-3 rounded-lg border border-border bg-bg-card px-4 py-3 text-sm text-gray-300">
            <input type="checkbox" name="acepto" required className="mt-0.5 h-4 w-4 shrink-0 accent-orange-500" />
            <span>
              Acepto los{" "}
              <a href={URL_TERMINOS} target="_blank" rel="noopener noreferrer" className={link}>
                Términos y Condiciones
              </a>{" "}
              y la{" "}
              <a href={URL_PRIVACIDAD} target="_blank" rel="noopener noreferrer" className={link}>
                Política de Privacidad
              </a>
              .
            </span>
          </label>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            formAction={aceptarTerminos}
            className="rounded-full bg-white px-5 py-3 font-medium text-black transition-opacity hover:opacity-90"
          >
            Aceptar y continuar
          </button>

          <button formAction={logout} formNoValidate className="text-center text-sm text-gray-500 underline">
            No acepto, cerrar sesión
          </button>
        </form>
      </div>
    </main>
  );
}

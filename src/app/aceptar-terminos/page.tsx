import { redirect } from "next/navigation";
import { aceptarTerminos } from "./actions";
import { logout } from "../login/actions";
import { URL_PRIVACIDAD, URL_TERMINOS } from "@/lib/legal";
import { createClient } from "@/lib/supabase/server";
import { rutaSiguienteSegura } from "@/lib/next-redirect";
import {
  ACEPTACIONES_REQUERIDAS,
  TEXTO_MAYOR_18,
  TEXTO_TRANSFERENCIA,
  TIPO_ACEPTACION,
  TIPO_MAYOR_18,
  TIPO_TRANSFERENCIA,
  aceptacionesFaltantes,
} from "@/lib/aceptacion-legal-version";

// Pantalla de aceptación obligatoria: la ve quien entró con Google/Facebook
// por primera vez, quien ya tenía cuenta antes de que existiera una
// aceptación, y todos cuando cambia alguna versión (aceptacion-legal-version.ts).
// El proxy manda acá a cualquier usuario logueado al que le falte una
// aceptación vigente (ver lib/supabase/middleware.ts) y esta pantalla muestra
// SOLO las casillas que le faltan: quien ya aceptó los Términos y solo no
// dio el consentimiento de transferencia ve una sola casilla.
export default async function AceptarTerminosPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;
  const link = "underline underline-offset-2 text-white";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: registradas } = await supabase
    .from("aceptaciones_legales")
    .select("tipo, version")
    .eq("user_id", user.id)
    .in("tipo", ACEPTACIONES_REQUERIDAS.map((a) => a.tipo));
  const faltan = new Set(aceptacionesFaltantes(registradas ?? []).map((f) => f.tipo as string));

  // Si ya no falta nada (entró acá a mano), no hay nada que pedir.
  if (faltan.size === 0) redirect(rutaSiguienteSegura(next ?? null) ?? "/");

  const casilla = "flex items-start gap-3 rounded-lg border border-border bg-bg-card px-4 py-3 text-sm text-gray-300";
  const check = "mt-0.5 h-4 w-4 shrink-0 accent-orange-500";

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-3 text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
          ANTES DE SEGUIR
        </h1>
        <p className="mb-6 text-center text-sm text-gray-400">
          Para usar KRAKEN Entrena necesitamos que confirmes lo siguiente. Podés leer los textos antes de aceptar.
        </p>

        <form className="flex flex-col gap-4">
          {next && <input type="hidden" name="next" value={next} />}

          {faltan.has(TIPO_ACEPTACION) && (
            <label className={casilla}>
              <input type="checkbox" name="acepto" required className={check} />
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
          )}

          {faltan.has(TIPO_MAYOR_18) && (
            <label className={casilla}>
              <input type="checkbox" name="mayor18" required className={check} />
              <span>{TEXTO_MAYOR_18}</span>
            </label>
          )}

          {faltan.has(TIPO_TRANSFERENCIA) && (
            <label className={casilla}>
              <input type="checkbox" name="transferencia" required className={check} />
              <span>
                {TEXTO_TRANSFERENCIA}{" "}
                <a href={URL_PRIVACIDAD} target="_blank" rel="noopener noreferrer" className={link}>
                  Ver Política de Privacidad
                </a>
              </span>
            </label>
          )}

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

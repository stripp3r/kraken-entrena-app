import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { diasRestantesTrial, esGoldenTier } from "@/lib/premium";
import { linkWhatsapp } from "@/lib/contacto";
import { URL_PLANES } from "@/lib/legal";
import { MODO_TIENDA } from "@/lib/modo-tienda";

// Pantalla INFORMATIVA del acceso de la cuenta. La app no cobra ni muestra precios
// (decisión del coach, 2026-10-17): los planes y la suscripción se compran en el
// sitio web. Esta ruta se conserva porque el proxy manda acá a quien tiene el acceso
// vencido y porque el cobro la usa de retorno. En la versión de tienda
// (NEXT_PUBLIC_MODO_TIENDA=1) no hay ningún enlace a comprar.
export default async function AccesoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("profiles")
    .select("premium_hasta, golden_perpetuo, premium_origen")
    .eq("id", user.id)
    .single();

  const dias = diasRestantesTrial(perfil);
  const esGolden = esGoldenTier(perfil);

  const estado = esGolden
    ? perfil?.golden_perpetuo
      ? "Tenés acceso total, sin vencimiento."
      : "Tenés tu suscripción activa. Se renueva sola."
    : dias != null
      ? `Estás en la prueba gratis: te ${dias === 1 ? "queda 1 día" : `quedan ${dias} días`}.`
      : perfil?.premium_origen === "compra"
        ? "Tu acceso incluye lo de tu plan."
        : "Tu acceso terminó.";

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
          TU ACCESO
        </h1>
        <p className="mb-6 text-center text-sm text-gray-400">{estado}</p>

        <div className="flex flex-col gap-3">
          <Link href="/" className="block rounded-full bg-white px-5 py-3 text-center text-sm font-medium text-black">
            Entrar a la app
          </Link>
          {!MODO_TIENDA && !esGolden && (
            <a
              href={URL_PLANES}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-full border border-border-strong px-5 py-3 text-center text-sm text-white"
            >
              Gestionar mi plan en el sitio web
            </a>
          )}
          <a
            href={linkWhatsapp("Hola KRAKEN, necesito ayuda con mi acceso a la app")}
            target="_blank"
            rel="noopener noreferrer"
            className="text-center text-xs text-gray-500 underline underline-offset-2"
          >
            Ayuda con mi acceso
          </a>
        </div>
      </div>
    </main>
  );
}

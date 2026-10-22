import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { diasRestantesTrial, esGoldenTier, esPremium } from "@/lib/premium";
import { linkWhatsapp } from "@/lib/contacto";
import { URL_GOLDEN, URL_MENTORIAS, URL_PLANES } from "@/lib/legal";
import { MODO_TIENDA } from "@/lib/modo-tienda";
import { obtenerUsuario } from "@/lib/supabase/usuario";

// Pantalla "Tu acceso". La app no cobra ni muestra precios (decisión del coach,
// 2026-10-17): los planes y la suscripción se compran en el sitio web. Esta ruta se
// conserva porque el proxy manda acá a quien tiene el acceso vencido y porque el
// cobro la usa de retorno.
//
// - Con acceso vigente: informa el estado y deja entrar a la app.
// - Con el acceso vencido (ej. terminó la prueba gratis): botón principal para ir al
//   sitio web a elegir plan y accesos directos a Golden, Mentoría y Planes
//   autoguiados. NO hay "Entrar a la app" (el proxy lo devolvería acá en círculo).
// - Versión de tienda (NEXT_PUBLIC_MODO_TIENDA=1): sin ningún enlace a comprar.
const ENLACE = "text-center text-sm text-gray-400 underline underline-offset-2";

const OPCIONES = [
  { titulo: "KRAKEN Golden", detalle: "Acceso completo a todas las rutinas", href: URL_GOLDEN },
  { titulo: "Mentoría personalizada", detalle: "Rutina a medida y seguimiento conmigo", href: URL_MENTORIAS },
  { titulo: "Planes autoguiados", detalle: "Rutina + PDF orientado a tu objetivo", href: URL_PLANES },
];

export default async function AccesoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await obtenerUsuario(supabase);

  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("profiles")
    .select("premium_hasta, golden_perpetuo, premium_origen")
    .eq("id", user.id)
    .single();

  const tieneAcceso = esPremium(perfil);
  const esGolden = esGoldenTier(perfil);
  const dias = diasRestantesTrial(perfil);
  const eraPrueba = !perfil?.premium_origen || perfil.premium_origen === "trial";

  const estado = tieneAcceso
    ? esGolden
      ? perfil?.golden_perpetuo
        ? "Tenés acceso total, sin vencimiento."
        : "Tenés tu suscripción activa. Se renueva sola."
      : dias != null
        ? `Estás en la prueba gratis: te ${dias === 1 ? "queda 1 día" : `quedan ${dias} días`}.`
        : "Tu acceso incluye lo de tu plan."
    : eraPrueba
      ? "Tu prueba gratis terminó."
      : "Tu acceso terminó.";

  const ayuda = (
    <a
      href={linkWhatsapp("Hola KRAKEN, necesito ayuda con mi acceso a la app")}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 text-center text-xs text-gray-500 underline underline-offset-2"
    >
      Ayuda con mi acceso
    </a>
  );

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
          TU ACCESO
        </h1>

        {tieneAcceso ? (
          <>
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
              {ayuda}
            </div>
          </>
        ) : (
          <>
            <p className="mb-6 text-center text-sm text-gray-400">
              {estado}
              {!MODO_TIENDA && (
                <>
                  <br />
                  Elegí cómo seguir en nuestro sitio web.
                </>
              )}
            </p>

            {!MODO_TIENDA && (
              <>
                <a
                  href={URL_PLANES}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-full bg-white px-5 py-3.5 text-center text-black transition-opacity hover:opacity-90"
                >
                  <span className="block text-[15px] font-medium">Elegir mi plan en el sitio web</span>
                  <span className="block text-[11.5px] text-gray-600">Se abre fit.krakenbrand.com</span>
                </a>

                <p className="mb-2 mt-6 text-[11px] uppercase tracking-wide text-gray-600">O andá directo a</p>
                <div className="flex flex-col gap-2">
                  {OPCIONES.map((o) => (
                    <a
                      key={o.titulo}
                      href={o.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-bg-card px-4 py-3 transition-colors hover:border-border-strong"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">{o.titulo}</p>
                        <p className="mt-0.5 text-xs text-gray-500">{o.detalle}</p>
                      </div>
                      <span className="shrink-0 text-2xl font-light leading-none text-gray-500">›</span>
                    </a>
                  ))}
                </div>
              </>
            )}

            <div className="mt-5 flex flex-col gap-2">
              <Link href="/perfil/recuperar-compra" className={ENLACE}>
                ¿Ya compraste y no ves tu plan?
              </Link>
              <Link href="/perfil" className={ENLACE}>
                Ir a mi perfil
              </Link>
              {ayuda}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { diasRestantesTrial } from "@/lib/premium";

const INCLUYE = [
  "Todas las rutinas del catálogo (y las que se sumen)",
  "Registro de series y todo el análisis de Progreso",
  "Medidas corporales, Salud y Evolución con fotos",
  "Cardio",
  "Los PDF de los planes y los videos de cursos",
];

type PrecioPlan = { precio_ars: number | null; precio_usd: number | null; activo: boolean | null };

function BotonesPago({
  frecuencia,
  tieneArs,
  tieneUsd,
}: {
  frecuencia: "anual" | "mensual";
  tieneArs: boolean;
  tieneUsd: boolean;
}) {
  return (
    <div className="mt-3 flex flex-col gap-2">
      {tieneArs && (
        <a
          href={`/api/checkout/golden/mercadopago?frecuencia=${frecuencia}`}
          className="w-full rounded-full bg-[#009ee3] px-5 py-2.5 text-center text-sm font-medium text-white"
        >
          Suscribirme con Mercado Pago
        </a>
      )}
      {tieneUsd && (
        <a
          href={`/api/checkout/golden/paypal?frecuencia=${frecuencia}`}
          className="w-full rounded-full bg-[#ffc439] px-5 py-2.5 text-center text-sm font-medium text-[#003087]"
        >
          Suscribirme con PayPal
        </a>
      )}
    </div>
  );
}

export default async function GoldenPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const admin = createAdminClient();
  const [{ data: perfil }, { data: productos }] = await Promise.all([
    supabase
      .from("profiles")
      .select("premium_hasta, golden_perpetuo, premium_origen")
      .eq("id", user.id)
      .single(),
    // productos tiene RLS sin policy para authenticated -> se lee con admin.
    admin
      .from("productos")
      .select("slug, precio_ars, precio_usd, activo")
      .in("slug", ["golden-anual", "golden-mensual"]),
  ]);

  const anual = productos?.find((p) => p.slug === "golden-anual") as PrecioPlan | undefined;
  const mensual = productos?.find((p) => p.slug === "golden-mensual") as PrecioPlan | undefined;

  const anualListo = Boolean(anual?.activo && (anual.precio_ars || anual.precio_usd));
  const mensualListo = Boolean(mensual?.activo && (mensual.precio_ars || mensual.precio_usd));

  const dias = diasRestantesTrial(perfil);
  // "Ya sos Golden" (nada que comprar) es distinto de "tenés acceso" --
  // durante la prueba gratis también tenés acceso, pero igual tiene que
  // poder pasarse a Golden si quiere, sin esperar a que se corte.
  const esGolden = Boolean(perfil?.golden_perpetuo || perfil?.premium_origen === "golden");

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
          KRAKEN GOLDEN
        </h1>

        {esGolden ? (
          <>
            <p className="mb-6 text-center text-sm text-gray-400">
              {perfil?.golden_perpetuo
                ? "Tenés acceso total, sin vencimiento."
                : "Ya sos Golden. Tu suscripción se renueva sola."}
            </p>
            <Link
              href="/"
              className="block rounded-full bg-white px-5 py-3 text-center text-sm font-medium text-black"
            >
              Entrar a la app
            </Link>
          </>
        ) : (
          <>
            <p className="mb-6 text-center text-sm text-gray-400">
              {dias != null
                ? `Estás en la prueba gratis (te quedan ${dias} ${dias === 1 ? "día" : "días"}). Pasate a Golden cuando quieras, sin esperar a que se corte.`
                : "Tu prueba gratis terminó. Con Golden desbloqueás todo de nuevo."}
            </p>

            <ul className="mb-6 flex flex-col gap-2">
              {INCLUYE.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-gray-300">
                  <span className="text-emerald-400">✓</span>
                  {item}
                </li>
              ))}
            </ul>

            {!anualListo && !mensualListo && (
              <>
                <p className="mb-4 text-center text-xs text-gray-500">
                  La suscripción va a estar disponible muy pronto.
                </p>
                <button
                  type="button"
                  disabled
                  className="w-full rounded-full bg-white px-5 py-3 text-sm font-medium text-black opacity-50"
                >
                  Suscribirme (próximamente)
                </button>
              </>
            )}

            {anualListo && (
              <div className="relative mb-3 rounded-lg border-2 border-amber-400/60 bg-bg-card px-4 pb-4 pt-5 text-center">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-amber-400 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wide text-black">
                  Recomendado · ahorrás ~25%
                </span>

                {anual?.precio_usd && (
                  <p className="text-2xl font-bold text-white">
                    USD {anual.precio_usd}
                    <span className="text-sm font-normal text-gray-400">/año</span>
                  </p>
                )}
                {anual?.precio_usd && (
                  <p className="mb-1 text-xs text-gray-500">
                    equivale a USD {(anual.precio_usd / 12).toFixed(2)}/mes
                  </p>
                )}
                {anual?.precio_ars && (
                  <p className="mt-2 text-lg font-medium text-white">
                    ${anual.precio_ars.toLocaleString("es-AR")} ARS
                    <span className="text-sm font-normal text-gray-400">/año</span>
                  </p>
                )}
                {anual?.precio_ars && (
                  <p className="text-xs text-gray-500">
                    equivale a ${Math.round(anual.precio_ars / 12).toLocaleString("es-AR")} ARS/mes
                  </p>
                )}

                <BotonesPago
                  frecuencia="anual"
                  tieneArs={Boolean(anual?.precio_ars)}
                  tieneUsd={Boolean(anual?.precio_usd)}
                />
              </div>
            )}

            {mensualListo && (
              <div className="rounded-lg border border-border bg-bg-card px-4 py-4 text-center">
                <p className="mb-1 text-sm text-gray-400">¿Preferís pagar mes a mes?</p>
                {mensual?.precio_usd && (
                  <p className="text-lg font-medium text-white">
                    USD {mensual.precio_usd}
                    <span className="text-sm font-normal text-gray-400">/mes</span>
                  </p>
                )}
                {mensual?.precio_ars && (
                  <p className="text-sm text-gray-300">
                    ${mensual.precio_ars.toLocaleString("es-AR")} ARS/mes
                  </p>
                )}

                <BotonesPago
                  frecuencia="mensual"
                  tieneArs={Boolean(mensual?.precio_ars)}
                  tieneUsd={Boolean(mensual?.precio_usd)}
                />
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

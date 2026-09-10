import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { esPremium, diasRestantesTrial } from "@/lib/premium";

const INCLUYE = [
  "Todas las rutinas del catálogo (y las que se sumen)",
  "Registro de series y todo el análisis de Progreso",
  "Medidas corporales, Salud y Evolución con fotos",
  "Cardio",
  "Los PDF de los planes y los videos de cursos",
];

export default async function GoldenPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: perfil }, { data: golden }] = await Promise.all([
    supabase
      .from("profiles")
      .select("premium_hasta, golden_perpetuo")
      .eq("id", user.id)
      .single(),
    supabase
      .from("productos")
      .select("precio_ars, precio_usd, activo")
      .eq("slug", "golden-anual")
      .maybeSingle(),
  ]);

  const premium = esPremium(perfil);
  const dias = diasRestantesTrial(perfil);
  const precioListo = Boolean(golden?.activo && (golden?.precio_ars || golden?.precio_usd));

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
          KRAKEN GOLDEN
        </h1>

        {premium ? (
          <>
            <p className="mb-6 text-center text-sm text-gray-400">
              {perfil?.golden_perpetuo
                ? "Tenés acceso total, sin vencimiento."
                : dias != null
                  ? `Estás en la prueba gratis. Te quedan ${dias} ${dias === 1 ? "día" : "días"}.`
                  : "Tenés acceso completo."}
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
              Tu prueba gratis terminó. Con Golden desbloqueás todo de nuevo, con
              renovación anual automática.
            </p>

            <ul className="mb-6 flex flex-col gap-2">
              {INCLUYE.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-gray-300">
                  <span className="text-emerald-400">✓</span>
                  {item}
                </li>
              ))}
            </ul>

            {precioListo ? (
              <>
                <div className="mb-4 rounded-lg border border-border bg-bg-card px-4 py-3 text-center">
                  <p className="text-lg font-medium text-white">
                    {golden?.precio_usd ? `USD ${golden.precio_usd}` : ""}
                    {golden?.precio_usd && golden?.precio_ars ? " · " : ""}
                    {golden?.precio_ars ? `$${golden.precio_ars} ARS` : ""}
                  </p>
                  <p className="text-xs text-gray-500">por año, se renueva solo</p>
                </div>

                <div className="flex flex-col gap-2">
                  {golden?.precio_ars ? (
                    <a
                      href="/api/checkout/golden/mercadopago"
                      className="w-full rounded-full bg-[#009ee3] px-5 py-3 text-center text-sm font-medium text-white"
                    >
                      Suscribirme con Mercado Pago
                    </a>
                  ) : null}
                  {golden?.precio_usd ? (
                    <a
                      href="/api/checkout/golden/paypal"
                      className="w-full rounded-full bg-[#ffc439] px-5 py-3 text-center text-sm font-medium text-[#003087]"
                    >
                      Suscribirme con PayPal
                    </a>
                  ) : null}
                </div>
              </>
            ) : (
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
          </>
        )}
      </div>
    </main>
  );
}

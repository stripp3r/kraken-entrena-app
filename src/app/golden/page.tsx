import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { diasRestantesTrial } from "@/lib/premium";
import { SelectorPlanGolden } from "@/components/selector-plan-golden";

const INCLUYE = [
  "Todas las rutinas del catálogo (y las que se sumen)",
  "Registro de series y todo el análisis de Progreso",
  "Medidas corporales, Salud y Evolución con fotos",
  "Cardio",
  "Los PDF de los planes y los videos de cursos",
];

type PrecioPlan = { precio_ars: number | null; precio_usd: number | null; activo: boolean | null };

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

            {anualListo || mensualListo ? (
              <SelectorPlanGolden
                mensual={mensualListo ? { ars: mensual!.precio_ars, usd: mensual!.precio_usd } : null}
                anual={anualListo ? { ars: anual!.precio_ars, usd: anual!.precio_usd } : null}
              />
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

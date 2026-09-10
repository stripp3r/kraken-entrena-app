import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DatosPersonales } from "@/components/datos-personales";
import { BackLink } from "@/components/back-link";
import { diasRestantesTrial } from "@/lib/premium";

function etiquetaSuscripcion(
  profile: { golden_perpetuo?: boolean | null; premium_hasta?: string | null } | null,
  sub: { proximo_cobro?: string | null } | null
): string {
  if (profile?.golden_perpetuo) return "Golden · Founder";
  if (sub) {
    return sub.proximo_cobro
      ? `Golden · renueva ${sub.proximo_cobro.split("-").reverse().join("/")}`
      : "Golden";
  }
  const dias = diasRestantesTrial(profile);
  if (dias != null) {
    return `Prueba gratis · ${dias === 1 ? "queda 1 día" : `quedan ${dias} días`}`;
  }
  return "Sin suscripción";
}

export default async function PerfilDatosPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: sub }] = await Promise.all([
    supabase.from("profiles").select("*, routines(nombre, dias)").eq("id", user.id).single(),
    supabase
      .from("suscripciones")
      .select("proximo_cobro")
      .eq("user_id", user.id)
      .eq("estado", "activa")
      .maybeSingle(),
  ]);

  const rutina = profile
    ? Array.isArray(profile.routines)
      ? profile.routines[0]
      : profile.routines
    : null;

  const suscripcion = etiquetaSuscripcion(profile ?? null, sub ?? null);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="relative mb-2">
          <BackLink href="/perfil" />
          <h1 className="text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
            DATOS PERSONALES
          </h1>
        </div>
        <p className="mb-8 text-center text-sm text-gray-500">
          Completá tus datos para armar tu programa.
        </p>

        <DatosPersonales
          profile={profile ?? null}
          rutina={rutina ?? null}
          suscripcion={suscripcion}
          error={error}
        />
      </div>
    </main>
  );
}

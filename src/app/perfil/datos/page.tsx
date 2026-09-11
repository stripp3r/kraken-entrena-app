import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DatosPersonales } from "@/components/datos-personales";
import { BackLink } from "@/components/back-link";
import { diasRestantesTrial, type Suscripcion } from "@/lib/premium";

const ddmm = (iso?: string | null) => (iso ? iso.split("-").reverse().join("/") : "");

function etiquetaSuscripcion(
  profile: {
    golden_perpetuo?: boolean | null;
    premium_hasta?: string | null;
    premium_origen?: string | null;
  } | null,
  sub: {
    estado?: string | null;
    proximo_cobro?: string | null;
    cancelada_al?: string | null;
    frecuencia?: string | null;
  } | null
): Suscripcion {
  if (profile?.golden_perpetuo) return { texto: "Golden · Founder", tono: "oro" };

  const etiquetaFrecuencia = sub?.frecuencia === "mensual" ? " (mensual)" : "";

  if (sub && sub.estado !== "vencida") {
    if (sub.estado === "pausada") {
      return { texto: `Golden${etiquetaFrecuencia} · pago pendiente`, tono: "pendiente" };
    }
    if (sub.estado === "cancelada") {
      return {
        texto: sub.cancelada_al
          ? `Golden${etiquetaFrecuencia} · hasta ${ddmm(sub.cancelada_al)}`
          : `Golden${etiquetaFrecuencia} · cancelada`,
        tono: "oro",
      };
    }
    return {
      texto: sub.proximo_cobro
        ? `Golden${etiquetaFrecuencia} · renueva ${ddmm(sub.proximo_cobro)}`
        : `Golden${etiquetaFrecuencia}`,
      tono: "oro",
    };
  }

  const dias = diasRestantesTrial(profile);
  if (dias != null) {
    if (profile?.premium_origen === "compra") {
      return {
        texto: `Acceso por compra · hasta ${ddmm(profile.premium_hasta)}`,
        tono: "compra",
      };
    }
    return {
      texto: `Prueba gratis · ${dias === 1 ? "queda 1 día" : `quedan ${dias} días`}`,
      tono: "prueba",
    };
  }
  return { texto: "Sin suscripción", tono: "ninguna" };
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
      .select("estado, proximo_cobro, cancelada_al, frecuencia")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
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

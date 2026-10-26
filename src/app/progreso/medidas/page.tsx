import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProgresoMedidas } from "@/components/progreso-medidas";
import { BackLink } from "@/components/back-link";
import { GateSalud } from "@/components/gate-salud";
import { obtenerUsuario } from "@/lib/supabase/usuario";

export default async function ProgresoMedidasPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await obtenerUsuario(supabase);

  if (!user) {
    redirect("/login");
  }

  const { data: historial } = await supabase
    .from("body_measurements")
    .select(
      "fecha, peso, cuello, hombros, pecho, brazo, antebrazo, cintura, caderas, muslos, gemelos"
    )
    .eq("user_id", user.id)
    .order("fecha", { ascending: true });

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <GateSalud volverA="/progreso" />
      <div className="w-full max-w-sm">
        <div className="relative mb-6">
          <BackLink href="/progreso" />
          <h1 className="text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
            MEDIDAS
          </h1>
        </div>

        <Link
          href="/medidas/potencial?desde=progreso"
          className="mb-5 flex items-center justify-between rounded-lg border border-emerald-700 bg-emerald-950/40 px-4 py-3 text-sm text-white transition-colors hover:border-emerald-500"
        >
          <span>
            Potencial muscular estimado
            <span className="mt-0.5 block text-[11px] text-gray-400">Cuánto músculo natural puede sostener tu estructura</span>
          </span>
          <span className="text-2xl font-light leading-none text-emerald-400">›</span>
        </Link>

        {!historial || historial.length === 0 ? (
          <p className="text-center text-sm text-gray-500">
            Todavía no cargaste medidas. Andá a Perfil → Mis medidas para
            empezar.
          </p>
        ) : (
          <ProgresoMedidas historial={historial} />
        )}
      </div>
    </main>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MedicionForm } from "@/components/medicion-form";
import { GuiaMedidas } from "@/components/guia-medidas";
import { BackLink } from "@/components/back-link";
import { GateSalud } from "@/components/gate-salud";
import { obtenerUsuario } from "@/lib/supabase/usuario";

export default async function MedidasPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await obtenerUsuario(supabase);

  if (!user) {
    redirect("/login");
  }

  const { data: historial } = await supabase
    .from("body_measurements")
    .select("*")
    .eq("user_id", user.id)
    .order("fecha", { ascending: false });

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <GateSalud volverA="/" />
      <div className="w-full max-w-sm">
        <div className="relative mb-2">
          <BackLink href="/perfil" />
          <h1 className="text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
            TUS MEDIDAS
          </h1>
        </div>
        <p className="mb-6 text-center text-sm text-gray-500">
          No te obsesiones con &quot;la medida perfecta&quot; — la salud y el bienestar
          no se definen únicamente por medidas corporales. Enfocate en tu
          propio progreso, no en un ideal.
        </p>

        <div className="flex flex-col gap-4">
          <MedicionForm historial={historial ?? []} />
          <Link
            href="/medidas/potencial"
            className="flex items-center justify-between rounded-lg border border-border bg-bg-card px-4 py-3 text-sm text-white transition-colors hover:border-border-strong"
          >
            <span>
              Potencial muscular estimado
              <span className="mt-0.5 block text-[11px] text-gray-500">Cuánto músculo natural puede sostener tu estructura</span>
            </span>
            <span className="text-2xl font-light leading-none text-gray-500">›</span>
          </Link>
          <GuiaMedidas />
        </div>
      </div>
    </main>
  );
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProgresoMedidas } from "@/components/progreso-medidas";
import { BackLink } from "@/components/back-link";

export default async function ProgresoMedidasPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: historial } = await supabase
    .from("body_measurements")
    .select("fecha, peso, cuello, hombros, pecho, brazo, cintura, caderas, muslos")
    .eq("user_id", user.id)
    .order("fecha", { ascending: true });

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="relative mb-6">
          <BackLink href="/progreso" />
          <h1 className="text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
            MEDIDAS
          </h1>
        </div>

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

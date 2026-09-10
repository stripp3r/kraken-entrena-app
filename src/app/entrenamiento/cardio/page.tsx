import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/back-link";
import { CardioCliente } from "@/components/cardio-cliente";
import { hoyISO } from "@/lib/fecha";

export default async function CardioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: medida }, { data: sesiones }] = await Promise.all([
    supabase
      .from("body_measurements")
      .select("peso")
      .eq("user_id", user.id)
      .not("peso", "is", null)
      .order("fecha", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("cardio_logs")
      .select("id, fecha, actividad, duracion_min, distancia_km, calorias_estimadas")
      .eq("user_id", user.id)
      .order("fecha", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="relative mb-2 flex items-center justify-center">
          <BackLink href="/entrenamiento" />
          <h1 className="text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
            CARDIO
          </h1>
        </div>
        <p className="mb-6 text-center text-sm text-gray-500">
          Cargá tus sesiones de cardio a mano. La app te devuelve una estimación
          aproximada de calorías.
        </p>

        <CardioCliente
          hoy={hoyISO()}
          tienePeso={medida?.peso != null}
          sesiones={sesiones ?? []}
        />
      </div>
    </main>
  );
}

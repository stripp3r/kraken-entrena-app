import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProgresoSalud } from "@/components/progreso-salud";
import { BackLink } from "@/components/back-link";

export default async function ProgresoSaludPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: historial }] = await Promise.all([
    supabase.from("profiles").select("sexo").eq("id", user.id).single(),
    supabase
      .from("body_measurements")
      .select("fecha, peso, altura, cuello, cintura, caderas")
      .eq("user_id", user.id)
      .order("fecha", { ascending: true }),
  ]);

  const genero = profile?.sexo === "femenino" ? "femenino" : "masculino";

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="relative mb-2">
          <BackLink href="/progreso" />
          <h1 className="text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
            SALUD
          </h1>
        </div>
        <p className="mb-6 text-center text-sm text-gray-500">
          Evolución de tus valores de salud a partir de tus medidas cargadas.
        </p>

        <ProgresoSalud historial={historial ?? []} genero={genero} />
      </div>
    </main>
  );
}

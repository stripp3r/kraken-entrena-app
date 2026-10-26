import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MedidasAnalisis } from "@/components/medidas-analisis";
import { BackLink } from "@/components/back-link";
import { GateSalud } from "@/components/gate-salud";
import { obtenerUsuario } from "@/lib/supabase/usuario";

export default async function ProgresoMedidasPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await obtenerUsuario(supabase);

  if (!user) {
    redirect("/login");
  }

  const [{ data: historial }, { data: perfil }] = await Promise.all([
    supabase
      .from("body_measurements")
      .select("fecha, peso, altura, cuello, hombros, pecho, brazo, antebrazo, cintura, caderas, muslos, gemelos, muneca")
      .eq("user_id", user.id)
      .order("fecha", { ascending: true }),
    supabase.from("profiles").select("sexo").eq("id", user.id).single(),
  ]);

  const filas = historial ?? [];
  // Para el potencial: de cada medida, el valor más reciente que esté cargado (no todas se cargan siempre).
  const ultimo = (campo: "peso" | "altura" | "cuello" | "pecho" | "brazo" | "antebrazo" | "muslos" | "gemelos" | "muneca"): number | null => {
    for (let i = filas.length - 1; i >= 0; i--) {
      const v = filas[i][campo];
      if (typeof v === "number" && v > 0) return v;
    }
    return null;
  };

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <GateSalud volverA="/progreso" />
      <div className="w-full max-w-sm">
        <div className="relative mb-6">
          <BackLink href="/progreso" />
          <h1 className="text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">MEDIDAS</h1>
        </div>

        <MedidasAnalisis
          historial={filas}
          sexo={perfil?.sexo === "femenino" ? "femenino" : perfil?.sexo === "masculino" ? "masculino" : null}
          tabInicial={tab === "potencial" ? "potencial" : "comparar"}
          ultima={{
            altura: ultimo("altura"),
            muneca: ultimo("muneca"),
            peso: ultimo("peso"),
            cuello: ultimo("cuello"),
            pecho: ultimo("pecho"),
            brazo: ultimo("brazo"),
            antebrazo: ultimo("antebrazo"),
            muslos: ultimo("muslos"),
            gemelos: ultimo("gemelos"),
          }}
        />
      </div>
    </main>
  );
}

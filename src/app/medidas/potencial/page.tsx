import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { obtenerUsuario } from "@/lib/supabase/usuario";
import { BackLink } from "@/components/back-link";
import { GateSalud } from "@/components/gate-salud";
import { PotencialMuscularCliente } from "@/components/potencial-muscular-cliente";

// Potencial muscular natural estimado (ver lib/potencial-muscular.ts). Toma las medidas de la última carga en Medidas.
export default async function PotencialMuscularPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await obtenerUsuario(supabase);
  if (!user) redirect("/login");

  const [{ data: filas }, { data: perfil }] = await Promise.all([
    supabase
      .from("body_measurements")
      .select("fecha, peso, altura, cuello, pecho, brazo, antebrazo, muslos, gemelos, muneca")
      .eq("user_id", user.id)
      .order("fecha", { ascending: false })
      .limit(30),
    supabase.from("profiles").select("sexo").eq("id", user.id).single(),
  ]);

  // Para cada medida se toma el valor más reciente que esté cargado (no todas se cargan siempre).
  const ultimo = (campo: "peso" | "altura" | "cuello" | "pecho" | "brazo" | "antebrazo" | "muslos" | "gemelos" | "muneca"): number | null => {
    const f = (filas ?? []).find((x) => typeof x[campo] === "number" && (x[campo] as number) > 0);
    return f ? (f[campo] as number) : null;
  };

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <GateSalud volverA="/" />
      <div className="w-full max-w-sm">
        <div className="relative mb-2">
          <BackLink href="/medidas" />
          <h1 className="text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">POTENCIAL MUSCULAR</h1>
        </div>
        <p className="mb-5 text-center text-xs text-gray-500">Estimación de cuánto músculo natural puede sostener tu estructura</p>
        <PotencialMuscularCliente
          sexo={perfil?.sexo === "femenino" ? "femenino" : perfil?.sexo === "masculino" ? "masculino" : null}
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

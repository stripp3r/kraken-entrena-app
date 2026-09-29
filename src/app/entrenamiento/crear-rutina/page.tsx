import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/back-link";
import { CrearRutinaCliente } from "@/components/crear-rutina-cliente";
import { PantallaBloqueada } from "@/components/pantalla-bloqueada";
import { esTrial } from "@/lib/premium";
import { contarRutinasCreadasPorUsuario } from "@/lib/limite-rutinas-creadas";

const LIMITE_RUTINAS_TRIAL = 1;

export default async function CrearRutinaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("premium_hasta, golden_perpetuo, premium_origen")
    .eq("id", user.id)
    .single();

  if (esTrial(profile)) {
    const yaCreadas = await contarRutinasCreadasPorUsuario(supabase, user.id);
    if (yaCreadas >= LIMITE_RUTINAS_TRIAL) {
      return (
        <PantallaBloqueada
          titulo="CREA TU RUTINA"
          volverA="/entrenamiento"
          texto="Ya usaste tu rutina de prueba del Free Trial. Mejorá tu plan para crear más."
        />
      );
    }
  }

  const { data: catalogo } = await supabase
    .from("exercise_definitions")
    .select("id, nombre, imagen_url, tipo_esfuerzo, grupos_musculares")
    .order("nombre", { ascending: true });

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="relative mb-6 flex items-center justify-center">
          <BackLink href="/entrenamiento" />
          <h1 className="text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
            CREA TU RUTINA
          </h1>
        </div>
        <CrearRutinaCliente catalogo={catalogo ?? []} />
      </div>
    </main>
  );
}

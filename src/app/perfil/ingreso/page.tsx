import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/back-link";
import { GateSalud } from "@/components/gate-salud";
import { FormularioIngresoCliente } from "./formulario-ingreso-cliente";

// Formulario de ingreso de las mentorías (anamnesis). Los campos de salud son
// opcionales y el consentimiento específico se pide antes (GateSalud).
export default async function IngresoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: inicial } = await supabase
    .from("formularios_ingreso")
    .select("objetivo, experiencia, dias_por_semana, minutos_por_sesion, lugar, equipamiento, disponibilidad, restricciones, habitos, comentarios")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <GateSalud volverA="/perfil" />
      <div className="w-full max-w-sm">
        <div className="relative mb-2 flex items-center justify-center">
          <BackLink href="/perfil" />
          <h1 className="text-center font-[family-name:var(--font-display)] text-3xl tracking-wide text-white">
            FORMULARIO DE INGRESO
          </h1>
        </div>
        <p className="mb-6 text-center text-sm text-gray-500">
          Con esto armamos tu plan personalizado. Los campos con * son los necesarios; el resto es opcional.
        </p>
        <FormularioIngresoCliente inicial={inicial} />
      </div>
    </main>
  );
}

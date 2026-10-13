import { createClient } from "@/lib/supabase/server";
import { tieneConsentimientoSalud } from "@/lib/consentimiento-salud";
import { ConsentimientoSaludGate } from "@/components/consentimiento-salud-gate";

// Se pone dentro de cualquier pantalla donde se cargan o ven datos de salud
// (peso, medidas, fotos, lesiones): si la persona todavía no dio el
// consentimiento específico, muestra el pop-up que tapa la pantalla.
export async function GateSalud({ volverA = "/" }: { volverA?: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  if (await tieneConsentimientoSalud(supabase, user.id)) return null;
  return <ConsentimientoSaludGate volverA={volverA} />;
}

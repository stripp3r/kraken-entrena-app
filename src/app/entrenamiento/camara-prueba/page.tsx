import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/back-link";
import { CamaraSentadilla } from "@/components/camara-sentadilla";
import { esUsuarioDePrototipos } from "@/lib/prototipos";

// PROTOTIPO: análisis de la sentadilla en tiempo real con la cámara. Solo lo ven
// las cuentas de lib/prototipos.ts (aparece como "Cámara prueba" en Inicio).
export default async function CamaraPruebaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  // Prototipo: solo para las cuentas habilitadas (lib/prototipos.ts).
  if (!esUsuarioDePrototipos(user.email)) redirect("/");

  return (
    <main className="flex flex-1 flex-col items-center px-2 py-6">
      <div className="w-full max-w-md">
        <div className="relative mb-2 flex items-center justify-center">
          <BackLink href="/entrenamiento" />
          <h1 className="text-center font-[family-name:var(--font-display)] text-3xl tracking-wide text-white">
            CÁMARA: SENTADILLA
          </h1>
        </div>
        <p className="mb-3 text-center text-xs text-gray-500">Prototipo de prueba</p>

        <CamaraSentadilla />
      </div>
    </main>
  );
}

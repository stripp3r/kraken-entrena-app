import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ProgresoPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
      <h1 className="mb-3 font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
        PROGRESO
      </h1>
      <p className="max-w-xs text-sm text-gray-500">
        Acá vas a ver el análisis de tu progreso: fuerza y volumen por
        ejercicio y de forma general, a medida que vayas cargando
        entrenamientos. Llega pronto.
      </p>
    </main>
  );
}

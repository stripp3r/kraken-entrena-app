import Link from "next/link";
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
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
          PROGRESO
        </h1>

        <div className="flex flex-col gap-3">
          <Link
            href="/medidas"
            className="rounded-lg border border-border bg-bg-card px-5 py-4 text-center text-lg text-white transition-colors hover:border-border-strong"
          >
            Mis medidas
          </Link>
          <Link
            href="/evolucion"
            className="rounded-lg border border-border bg-bg-card px-5 py-4 text-center text-lg text-white transition-colors hover:border-border-strong"
          >
            Fotos de evolución
          </Link>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Los gráficos de carga y fuerza por ejercicio llegan pronto acá.
        </p>
      </div>
    </main>
  );
}

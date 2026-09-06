import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ProgresoSaludPage() {
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
        SALUD
      </h1>
      <p className="max-w-xs text-sm text-gray-500">
        IMC, % de grasa y demás valores estimados llegan pronto acá — todavía
        tengo que revisar esas fórmulas puntuales del Excel.
      </p>

      <Link href="/progreso" className="mt-8 text-sm text-gray-500 underline">
        Volver a Progreso
      </Link>
    </main>
  );
}

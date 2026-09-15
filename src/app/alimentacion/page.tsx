import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AlimentacionPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("golden_perpetuo, premium_origen")
    .eq("id", user.id)
    .single();

  const esGolden = Boolean(profile?.golden_perpetuo) || profile?.premium_origen === "golden";

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
          ALIMENTACIÓN
        </h1>

        {!esGolden ? (
          <div className="mt-8 flex flex-col items-center gap-4 text-center">
            <p className="text-sm text-gray-400">
              Esta sección es un beneficio exclusivo de KRAKEN Golden o la Mentoría personalizada.
            </p>
            <Link
              href="/golden"
              className="rounded-full bg-amber-400 px-6 py-3 text-sm font-medium text-black"
            >
              Conocer Golden
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <Link
              href="/alimentacion/calculadora"
              className="flex items-center gap-4 rounded-lg border border-border bg-bg-card px-5 py-3 text-lg text-white transition-colors hover:border-border-strong"
            >
              <img src="/section-icons/alimentacion.png" alt="" className="h-14 w-14 rounded-xl" />
              Calculadora de calorías
            </Link>
            <Link
              href="/alimentacion/guia"
              className="flex items-center gap-4 rounded-lg border border-border bg-bg-card px-5 py-3 text-lg text-white transition-colors hover:border-border-strong"
            >
              <img src="/section-icons/pdfs.png" alt="" className="h-14 w-14 rounded-xl" />
              Guía alimenticia
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

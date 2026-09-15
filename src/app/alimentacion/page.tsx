import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/back-link";
import { CalculadoraCalorias } from "@/components/calculadora-calorias";

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
        <div className="relative mb-2">
          <BackLink href="/perfil" />
          <h1 className="text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
            ALIMENTACIÓN
          </h1>
        </div>

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
          <>
            <div className="mb-6 rounded-lg border border-border-strong bg-bg-card p-4">
              <p className="text-xs leading-relaxed text-gray-400">
                Esta información es orientativa y educativa, calculada con fórmulas estándar
                (Mifflin-St Jeor). <strong className="text-gray-300">No es un plan
                nutricional personalizado ni reemplaza la consulta con un nutricionista o
                médico matriculado.</strong> KRAKEN Fitness no se responsabiliza por
                decisiones tomadas únicamente en base a esta estimación. Si tenés alguna
                condición de salud, consultá primero con un profesional.
              </p>
            </div>

            <CalculadoraCalorias />
          </>
        )}
      </div>
    </main>
  );
}

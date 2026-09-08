import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/back-link";

const LETRAS_DIA = ["A", "B", "C", "D", "E", "F", "G"];

export default async function DiasEntrenamientoPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("routine_id, routines(nombre, dias)")
    .eq("id", user.id)
    .single();

  const routine = Array.isArray(profile?.routines) ? profile.routines[0] : profile?.routines;

  if (!profile?.routine_id || !routine) {
    redirect("/entrenamiento");
  }

  const dias = LETRAS_DIA.slice(0, routine.dias);

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="relative mb-2">
          <BackLink href="/entrenamiento" />
          <h1 className="text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
            ENTRENAMIENTO
          </h1>
        </div>
        <p className="mb-8 text-center text-sm text-gray-500">{routine.nombre}</p>

        <div className="flex flex-col gap-3">
          {dias.map((letra) => (
            <Link
              key={letra}
              href={`/entrenamiento/${letra}`}
              className="rounded-lg border border-border bg-bg-card px-5 py-4 text-center text-lg text-white transition-colors hover:border-border-strong"
            >
              Día {letra}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

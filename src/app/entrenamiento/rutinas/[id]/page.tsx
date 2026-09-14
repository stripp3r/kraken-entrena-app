import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/back-link";
import { esPremium } from "@/lib/premium";

const LETRAS_DIA = ["A", "B", "C", "D", "E", "F", "G"];

export default async function RutinaPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const routineId = Number(id);

  if (!Number.isInteger(routineId)) {
    notFound();
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: routine }, { data: acceso }] = await Promise.all([
    supabase
      .from("profiles")
      .select("premium_hasta, golden_perpetuo")
      .eq("id", user.id)
      .single(),
    supabase.from("routines").select("id, nombre, dias, descripcion").eq("id", routineId).maybeSingle(),
    supabase
      .from("profile_routine_access")
      .select("routine_id")
      .eq("user_id", user.id)
      .eq("routine_id", routineId)
      .maybeSingle(),
  ]);

  if (!routine) {
    notFound();
  }

  const desbloqueada = esPremium(profile) || Boolean(acceso);
  if (!desbloqueada) {
    redirect("/entrenamiento/rutinas");
  }

  const dias = LETRAS_DIA.slice(0, routine.dias);

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="relative mb-2 flex items-center justify-center">
          <BackLink href="/entrenamiento/rutinas" />
          <h1 className="text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
            {routine.nombre.toUpperCase()}
          </h1>
        </div>
        {routine.descripcion && (
          <p className="mb-6 text-center text-sm text-gray-500">{routine.descripcion}</p>
        )}

        <div className="flex flex-col gap-3">
          {dias.map((letra) => (
            <Link
              key={letra}
              href={`/entrenamiento/rutinas/${routine.id}/${letra}`}
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

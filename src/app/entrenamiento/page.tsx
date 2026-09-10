import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RutinaHub } from "@/components/rutina-hub";
import { esPremium } from "@/lib/premium";

export default async function EntrenamientoPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: routines }, { data: acceso }] = await Promise.all([
    supabase
      .from("profiles")
      .select("routine_id, premium_hasta, golden_perpetuo, routines(nombre, dias)")
      .eq("id", user.id)
      .single(),
    supabase
      .from("routines")
      .select("id, nombre, dias, descripcion")
      .order("dias", { ascending: true }),
    supabase.from("profile_routine_access").select("routine_id").eq("user_id", user.id),
  ]);

  const rutinaActiva = Array.isArray(profile?.routines) ? profile.routines[0] : profile?.routines;
  // Con prueba/Golden vigente, todas las rutinas están disponibles. Sin eso,
  // solo las compradas sueltas (profile_routine_access) -- aunque en la
  // práctica el middleware ya no deja llegar acá a un usuario sin premium.
  const idsDesbloqueados = esPremium(profile)
    ? new Set((routines ?? []).map((r) => r.id))
    : new Set((acceso ?? []).map((a) => a.routine_id));

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
          ENTRENAMIENTO
        </h1>

        <RutinaHub
          routineIdActual={profile?.routine_id ?? null}
          rutinaActiva={rutinaActiva ? { nombre: rutinaActiva.nombre, dias: rutinaActiva.dias } : null}
          routines={routines ?? []}
          idsDesbloqueados={[...idsDesbloqueados]}
        />

        <Link
          href="/entrenamiento/cardio"
          className="mt-8 flex items-center gap-4 rounded-lg border border-border bg-bg-card px-5 py-3 text-lg text-white transition-colors hover:border-border-strong"
        >
          <img src="/section-icons/cardio.png" alt="" className="h-14 w-14 rounded-xl" />
          Cardio
        </Link>
      </div>
    </main>
  );
}

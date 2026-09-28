import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RutinaHub } from "@/components/rutina-hub";
import { tieneCatalogoCompleto } from "@/lib/premium";

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
      .select("routine_id, premium_hasta, golden_perpetuo, premium_origen, role, routines(nombre, dias)")
      .eq("id", user.id)
      .single(),
    supabase
      .from("routines")
      .select("id, nombre, dias, descripcion")
      .order("dias", { ascending: true }),
    supabase.from("profile_routine_access").select("routine_id").eq("user_id", user.id),
  ]);

  const rutinaActiva = Array.isArray(profile?.routines) ? profile.routines[0] : profile?.routines;
  // Solo Founder/Golden real (pago o trial) ve el catálogo completo como
  // desbloqueado. Mentoría y compras sueltas solo ven SU/S rutina/s vía
  // profile_routine_access -- ver `tieneCatalogoCompleto` en lib/premium.ts.
  const idsDesbloqueados = tieneCatalogoCompleto(profile)
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
          href="/entrenamiento/rutinas"
          className="mt-8 flex items-center gap-4 rounded-lg border border-border bg-bg-card px-5 py-3 text-lg text-white transition-colors hover:border-border-strong"
        >
          <img src="/section-icons/rutinas-adquiridas.png" alt="" className="h-14 w-14 rounded-xl" />
          Rutinas adquiridas
        </Link>

        <Link
          href="/entrenamiento/cardio"
          className="mt-3 flex items-center gap-4 rounded-lg border border-border bg-bg-card px-5 py-3 text-lg text-white transition-colors hover:border-border-strong"
        >
          <img src="/section-icons/cardio.png" alt="" className="h-14 w-14 rounded-xl" />
          Cardio
        </Link>

        <Link
          href="/entrenamiento/crear-rutina"
          className="mt-3 flex items-center gap-4 rounded-lg border border-border bg-bg-card px-5 py-3 text-lg text-white transition-colors hover:border-border-strong"
        >
          <img src="/section-icons/crear-rutina.png" alt="" className="h-14 w-14 rounded-xl" />
          Crea tu rutina
        </Link>

        {profile?.role === "coach" && (
          <Link
            href="/coach"
            className="mt-3 flex items-center gap-4 rounded-lg border border-sky-500/40 bg-sky-500/10 px-5 py-3 text-lg text-sky-200 transition-colors hover:border-sky-500"
          >
            Vista de coach
          </Link>
        )}
      </div>
    </main>
  );
}

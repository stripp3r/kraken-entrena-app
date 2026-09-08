import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RutinaHub } from "@/components/rutina-hub";

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
      .select("routine_id, routines(nombre, dias)")
      .eq("id", user.id)
      .single(),
    supabase
      .from("routines")
      .select("id, nombre, dias, descripcion")
      .order("dias", { ascending: true }),
    supabase.from("profile_routine_access").select("routine_id").eq("user_id", user.id),
  ]);

  const rutinaActiva = Array.isArray(profile?.routines) ? profile.routines[0] : profile?.routines;
  const idsDesbloqueados = new Set((acceso ?? []).map((a) => a.routine_id));

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
      </div>
    </main>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CambiarRutinaEntrenamiento } from "@/components/cambiar-rutina-entrenamiento";

const LETRAS_DIA = ["A", "B", "C", "D", "E", "F", "G"];

export default async function EntrenamientoPage() {
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
    redirect("/perfil/datos?error=" + encodeURIComponent("Elegí tu rutina para poder entrenar."));
  }

  const dias = LETRAS_DIA.slice(0, routine.dias);

  const { data: routines } = await supabase
    .from("routines")
    .select("id, nombre, dias")
    .order("dias", { ascending: true });

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
          ENTRENAMIENTO
        </h1>

        <CambiarRutinaEntrenamiento
          routineIdActual={profile.routine_id}
          rutinaActual={{ nombre: routine.nombre, dias: routine.dias }}
          routines={routines ?? []}
        />

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

        <Link
          href="/"
          className="mt-8 block text-center text-sm text-gray-500 underline"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}

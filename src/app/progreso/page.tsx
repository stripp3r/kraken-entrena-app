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

  const { data: profile } = await supabase
    .from("profiles")
    .select("sexo")
    .eq("id", user.id)
    .single();

  const genero = profile?.sexo === "femenino" ? "femenino" : "masculino";

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
          PROGRESO
        </h1>

        <div className="flex flex-col gap-3">
          <Link
            href="/progreso/medidas"
            className="flex items-center gap-4 rounded-lg border border-border bg-bg-card px-5 py-3 text-lg text-white transition-colors hover:border-border-strong"
          >
            <img
              src={`/section-icons/medidas-${genero}.png`}
              alt=""
              className="h-14 w-14 rounded-xl"
            />
            Medidas
          </Link>
          <Link
            href="/progreso/entrenamiento"
            className="flex items-center gap-4 rounded-lg border border-border bg-bg-card px-5 py-3 text-lg text-white transition-colors hover:border-border-strong"
          >
            <img
              src="/section-icons/analisis-entrenamiento.png"
              alt=""
              className="h-14 w-14 rounded-xl"
            />
            Entrenamiento
          </Link>
          <Link
            href="/progreso/salud"
            className="flex items-center gap-4 rounded-lg border border-border bg-bg-card px-5 py-3 text-lg text-white transition-colors hover:border-border-strong"
          >
            <img src="/section-icons/salud.png" alt="" className="h-14 w-14 rounded-xl" />
            Salud
          </Link>
        </div>
      </div>
    </main>
  );
}

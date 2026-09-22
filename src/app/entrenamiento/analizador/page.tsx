import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/back-link";
import { AnalizadorCliente } from "@/components/analizador-cliente";
import { calcularAnalisisRutina } from "@/lib/analisis-rutina";
import { esPremium } from "@/lib/premium";

export default async function AnalizadorPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: routines }, { data: acceso }] = await Promise.all([
    supabase.from("profiles").select("premium_hasta, golden_perpetuo").eq("id", user.id).single(),
    supabase.from("routines").select("id, nombre, dias").order("dias", { ascending: true }),
    supabase.from("profile_routine_access").select("routine_id").eq("user_id", user.id),
  ]);

  const idsDesbloqueados = esPremium(profile)
    ? new Set((routines ?? []).map((r) => r.id))
    : new Set((acceso ?? []).map((a) => a.routine_id));

  const adquiridas = (routines ?? []).filter((r) => idsDesbloqueados.has(r.id));

  const rutinas = await Promise.all(
    adquiridas.map(async (r) => {
      const { pentagono, volumenPorGrupo } = await calcularAnalisisRutina(supabase, r.id);
      return { id: r.id, nombre: r.nombre, dias: r.dias, pentagono, volumenPorGrupo };
    })
  );

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="relative mb-2 flex items-center justify-center">
          <BackLink href="/entrenamiento/crear-rutina" />
          <h1 className="text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
            ANALIZADOR
          </h1>
        </div>
        <p className="mb-6 text-center text-sm text-gray-500">
          Elegí hasta 3 rutinas para comparar su pentágono, como en el comparador de jugadores de un
          videojuego de fútbol.
        </p>

        {rutinas.length === 0 ? (
          <p className="text-center text-sm text-gray-500">Todavía no tenés ninguna rutina desbloqueada.</p>
        ) : (
          <AnalizadorCliente rutinas={rutinas} />
        )}
      </div>
    </main>
  );
}

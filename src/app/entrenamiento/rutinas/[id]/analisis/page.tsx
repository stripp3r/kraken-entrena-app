import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/back-link";
import { PentagonoChart } from "@/components/pentagono-chart";
import { TablaMetrica } from "@/components/tabla-metrica";
import { calcularAnalisisRutina } from "@/lib/analisis-rutina";
import { filasFrecuencia, filasRecuperacion, filasIntensidad, filasSostenibilidad } from "@/lib/formato-metricas";
import { esPremium } from "@/lib/premium";

export default async function AnalisisRutinaPage({ params }: { params: Promise<{ id: string }> }) {
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
    supabase.from("profiles").select("premium_hasta, golden_perpetuo").eq("id", user.id).single(),
    supabase.from("routines").select("id, nombre").eq("id", routineId).maybeSingle(),
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

  const { pentagono, volumenPorGrupo, frecuenciaPorGrupo, recuperacionPorGrupo, intensidadPorDia, sostenibilidadPorDia } =
    await calcularAnalisisRutina(supabase, routineId);

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="relative mb-2 flex items-center justify-center">
          <BackLink href={`/entrenamiento/rutinas/${routine.id}`} />
          <h1 className="text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
            ANÁLISIS
          </h1>
        </div>
        <p className="mb-6 text-center text-sm text-gray-500">{routine.nombre}</p>

        <p className="mb-4 text-center text-xs text-gray-500">
          Series, reps y RIR de esta rutina son estimados a partir de cómo está cargada -- puede no
          ser 100% exacto. El grupo muscular de cada ejercicio sí es siempre el real.
        </p>

        <div>
          <p className="mb-2 text-center text-sm text-gray-400">Cómo se compara esta rutina</p>
          <div className="rounded-md border border-border bg-bg-card p-3">
            <PentagonoChart series={[{ label: routine.nombre, color: "#10b981", scores: pentagono }]} />
          </div>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-sm text-gray-400">
            Series por semana, por grupo muscular <span className="text-gray-500">(vs. MRV)</span>
          </p>
          <div className="flex flex-col gap-1 rounded-md border border-border bg-bg-card p-3">
            {volumenPorGrupo.map(({ grupo, series, mrv }) => (
              <div key={grupo} className="flex justify-between text-sm">
                <span className="text-gray-300">{grupo}</span>
                <span className="text-white">
                  {Number.isInteger(series) ? series : series.toFixed(1)}{" "}
                  <span className="text-gray-500">/ {mrv}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <TablaMetrica titulo="Frecuencia, por grupo muscular" filas={filasFrecuencia(frecuenciaPorGrupo)} />
        <TablaMetrica
          titulo="Recuperación, por grupo muscular"
          filas={filasRecuperacion(recuperacionPorGrupo)}
        />
        <TablaMetrica titulo="Intensidad (RIR), por día" filas={filasIntensidad(intensidadPorDia)} />
        <TablaMetrica titulo="Sostenibilidad, por día" filas={filasSostenibilidad(sostenibilidadPorDia)} />

        <div className="mt-6">
          <Link
            href="/entrenamiento/analizador"
            className="block rounded-md border border-border-strong py-2.5 text-center text-sm text-gray-300 transition-colors hover:border-emerald-500"
          >
            Comparar con otra rutina
          </Link>
        </div>
      </div>
    </main>
  );
}

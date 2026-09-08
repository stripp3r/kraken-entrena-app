import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function fechaLegible(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default async function HistorialPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: historial } = await supabase
    .from("profile_routine_history")
    .select("id, fecha_inicio, fecha_fin, routines(nombre, dias)")
    .eq("user_id", user.id)
    .order("fecha_inicio", { ascending: false });

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
          HISTORIAL
        </h1>
        <p className="mb-6 text-center text-sm text-gray-500">
          Las rutinas que tuviste activas a lo largo del tiempo.
        </p>

        {!historial || historial.length === 0 ? (
          <p className="text-center text-sm text-gray-500">
            Todavía no elegiste ninguna rutina.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {historial.map((h) => {
              const rutina = Array.isArray(h.routines) ? h.routines[0] : h.routines;
              return (
                <div
                  key={h.id}
                  className="rounded-lg border border-border bg-bg-card px-4 py-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">
                      {rutina ? `${rutina.nombre} (${rutina.dias} días)` : "Rutina"}
                    </span>
                    {!h.fecha_fin && (
                      <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300">
                        Activa
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Desde el {fechaLegible(h.fecha_inicio)}
                    {h.fecha_fin ? ` hasta el ${fechaLegible(h.fecha_fin)}` : ""}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        <Link
          href="/progreso"
          className="mt-8 block text-center text-sm text-gray-500 underline"
        >
          Volver a Progreso
        </Link>
      </div>
    </main>
  );
}

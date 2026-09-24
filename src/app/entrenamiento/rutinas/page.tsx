import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/back-link";
import { BorrarRutinaBoton } from "@/components/borrar-rutina-boton";
import { esPremium } from "@/lib/premium";

export default async function RutinasAdquiridasPage() {
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
      .select("routine_id, premium_hasta, golden_perpetuo")
      .eq("id", user.id)
      .single(),
    supabase
      .from("routines")
      .select("id, nombre, dias, descripcion, creada_por_usuario")
      .order("dias", { ascending: true }),
    supabase.from("profile_routine_access").select("routine_id").eq("user_id", user.id),
  ]);

  const idsDesbloqueados = esPremium(profile)
    ? new Set((routines ?? []).map((r) => r.id))
    : new Set((acceso ?? []).map((a) => a.routine_id));

  const adquiridas = (routines ?? []).filter((r) => idsDesbloqueados.has(r.id));

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="relative mb-2 flex items-center justify-center">
          <BackLink href="/entrenamiento" />
          <h1 className="text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
            RUTINAS ADQUIRIDAS
          </h1>
        </div>
        <p className="mb-6 text-center text-sm text-gray-500">
          Mirá cómo es cada rutina antes de decidir si te cambiás.
        </p>

        {adquiridas.length === 0 ? (
          <p className="text-center text-sm text-gray-500">
            Todavía no tenés ninguna rutina desbloqueada.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {adquiridas.map((r) => (
              <div
                key={r.id}
                className="rounded-lg border border-border bg-bg-card transition-colors hover:border-border-strong"
              >
                <Link
                  href={`/entrenamiento/rutinas/${r.id}`}
                  className="flex items-center justify-between px-4 py-3 active:bg-bg"
                >
                  <div>
                    <p className="text-sm text-white">
                      {r.nombre}
                      {r.id === profile?.routine_id && (
                        <span className="ml-2 text-[11px] text-emerald-400">· activa</span>
                      )}
                    </p>
                    {r.descripcion && <p className="mt-0.5 text-xs text-gray-500">{r.descripcion}</p>}
                  </div>
                  <span className="text-xs text-gray-500">Ver →</span>
                </Link>
                {r.creada_por_usuario && (
                  <div className="flex justify-end gap-3 border-t border-border px-4 py-2">
                    <Link href={`/entrenamiento/rutinas/${r.id}/editar`} className="text-xs text-gray-400 underline">
                      Editar
                    </Link>
                    <BorrarRutinaBoton routineId={r.id} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

import Link from "next/link";
import { BackLink } from "@/components/back-link";
import { requireCoach } from "@/lib/auth/coach";

type ClientePerfil = {
  id: string;
  nombre: string | null;
  apellido: string | null;
  routine_id: number | null;
  routines: { nombre: string } | { nombre: string }[] | null;
};

export default async function CoachPage() {
  const { supabase } = await requireCoach();

  const { data: clientes } = await supabase
    .from("profiles")
    .select("id, nombre, apellido, routine_id, routines(nombre)")
    .eq("role", "client")
    .order("nombre", { ascending: true });

  const lista = (clientes ?? []) as ClientePerfil[];

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="relative mb-2">
          <BackLink href="/entrenamiento" />
          <h1 className="text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
            VISTA DE COACH
          </h1>
        </div>
        <p className="mb-8 text-center text-sm text-gray-500">
          Elegí un cliente para ver su rutina tal cual la ve él. Solo lectura.
        </p>

        {lista.length === 0 ? (
          <p className="text-center text-sm text-gray-500">
            Todavía no hay clientes registrados.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {lista.map((c) => {
              const routine = Array.isArray(c.routines) ? c.routines[0] : c.routines;
              return (
                <Link
                  key={c.id}
                  href={`/coach/${c.id}`}
                  className="rounded-lg border border-border bg-bg-card px-5 py-3 text-white transition-colors hover:border-border-strong"
                >
                  <p className="text-lg">
                    {c.nombre ?? "Sin nombre"} {c.apellido ?? ""}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {routine ? routine.nombre : "Sin rutina asignada"}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

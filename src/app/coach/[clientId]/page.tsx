import Link from "next/link";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/back-link";
import { requireCoach } from "@/lib/auth/coach";

const LETRAS_DIA = ["A", "B", "C", "D", "E", "F", "G"];

export default async function CoachClientePage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { supabase } = await requireCoach();
  const { clientId } = await params;

  const { data: cliente } = await supabase
    .from("profiles")
    .select("nombre, apellido, routine_id, routines(nombre, dias)")
    .eq("id", clientId)
    .eq("role", "client")
    .maybeSingle();

  if (!cliente) {
    notFound();
  }

  const routine = Array.isArray(cliente.routines) ? cliente.routines[0] : cliente.routines;

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="relative mb-2">
          <BackLink href="/coach" />
          <h1 className="text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
            {cliente.nombre ?? "Cliente"} {cliente.apellido ?? ""}
          </h1>
        </div>

        {!cliente.routine_id || !routine ? (
          <p className="mt-8 text-center text-sm text-gray-500">
            Este cliente no tiene una rutina asignada todavía.
          </p>
        ) : (
          <>
            <p className="mb-8 text-center text-sm text-gray-500">{routine.nombre}</p>
            <div className="flex flex-col gap-3">
              {LETRAS_DIA.slice(0, routine.dias).map((letra) => (
                <Link
                  key={letra}
                  href={`/coach/${clientId}/${letra}`}
                  className="rounded-lg border border-border bg-bg-card px-5 py-4 text-center text-lg text-white transition-colors hover:border-border-strong"
                >
                  Día {letra}
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

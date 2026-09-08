import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DatosPersonales } from "@/components/datos-personales";
import { CambiarRutina } from "@/components/cambiar-rutina";

export default async function PerfilDatosPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: routines } = await supabase
    .from("routines")
    .select("id, nombre, dias")
    .order("dias", { ascending: true });

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
          DATOS PERSONALES
        </h1>
        <p className="mb-8 text-center text-sm text-gray-500">
          Completá tus datos para armar tu programa.
        </p>

        <DatosPersonales profile={profile ?? null} error={error} />

        <div className="mt-4">
          <CambiarRutina routineIdActual={profile?.routine_id ?? null} routines={routines ?? []} />
        </div>

        <Link
          href="/perfil"
          className="mt-6 block text-center text-sm text-gray-500 underline"
        >
          Volver a Perfil
        </Link>
      </div>
    </main>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/back-link";
import { CrearRutinaCliente } from "@/components/crear-rutina-cliente";

export default async function CrearRutinaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: catalogo } = await supabase
    .from("exercise_definitions")
    .select("id, nombre, imagen_url, tipo_esfuerzo, grupos_musculares")
    .order("nombre", { ascending: true });

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="relative mb-6 flex items-center justify-center">
          <BackLink href="/entrenamiento" />
          <h1 className="text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
            CREA TU RUTINA
          </h1>
        </div>
        <Link
          href="/entrenamiento/rutinas"
          className="mb-6 block text-center text-xs text-gray-500 underline"
        >
          ¿Preferís analizar una rutina que ya tenés en vez de crear una nueva?
        </Link>
        <CrearRutinaCliente catalogo={catalogo ?? []} />
      </div>
    </main>
  );
}

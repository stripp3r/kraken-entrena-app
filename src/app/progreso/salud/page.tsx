import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProgresoSalud } from "@/components/progreso-salud";

export default async function ProgresoSaludPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: ultimaMedicion }] = await Promise.all([
    supabase.from("profiles").select("sexo").eq("id", user.id).single(),
    supabase
      .from("body_measurements")
      .select("peso, altura, cuello, cintura, caderas")
      .eq("user_id", user.id)
      .order("fecha", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const genero = profile?.sexo === "femenino" ? "femenino" : "masculino";

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
          SALUD
        </h1>
        <p className="mb-6 text-center text-sm text-gray-500">
          Valores estimados a partir de tu última medición cargada.
        </p>

        <ProgresoSalud
          medicion={{
            peso: ultimaMedicion?.peso ?? null,
            altura: ultimaMedicion?.altura ?? null,
            cuello: ultimaMedicion?.cuello ?? null,
            cintura: ultimaMedicion?.cintura ?? null,
            caderas: ultimaMedicion?.caderas ?? null,
          }}
          genero={genero}
        />

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

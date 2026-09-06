import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "../login/actions";

export default async function PerfilPage() {
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
          PERFIL
        </h1>

        <div className="flex flex-col gap-3">
          <Link
            href="/perfil/datos"
            className="flex items-center gap-4 rounded-lg border border-border bg-bg-card px-5 py-3 text-lg text-white transition-colors hover:border-border-strong"
          >
            <img
              src={`/section-icons/datos-${genero}.png`}
              alt=""
              className="h-14 w-14 rounded-xl"
            />
            Datos personales
          </Link>
          <Link
            href="/medidas"
            className="flex items-center gap-4 rounded-lg border border-border bg-bg-card px-5 py-3 text-lg text-white transition-colors hover:border-border-strong"
          >
            <img
              src={`/section-icons/medidas-${genero}.png`}
              alt=""
              className="h-14 w-14 rounded-xl"
            />
            Mis medidas
          </Link>
          <Link
            href="/evolucion"
            className="flex items-center gap-4 rounded-lg border border-border bg-bg-card px-5 py-3 text-lg text-white transition-colors hover:border-border-strong"
          >
            <img src="/section-icons/evolucion.png" alt="" className="h-14 w-14 rounded-xl" />
            Mi evolución
          </Link>
        </div>

        <form>
          <button
            formAction={logout}
            className="mt-8 block w-full text-center text-sm text-gray-500 underline"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </main>
  );
}

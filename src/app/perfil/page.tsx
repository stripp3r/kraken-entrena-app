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

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
          PERFIL
        </h1>

        <div className="flex flex-col gap-3">
          <Link
            href="/perfil/datos"
            className="rounded-lg border border-border bg-bg-card px-5 py-4 text-center text-lg text-white transition-colors hover:border-border-strong"
          >
            Datos personales
          </Link>
          <Link
            href="/medidas"
            className="rounded-lg border border-border bg-bg-card px-5 py-4 text-center text-lg text-white transition-colors hover:border-border-strong"
          >
            Mis medidas
          </Link>
          <Link
            href="/evolucion"
            className="rounded-lg border border-border bg-bg-card px-5 py-4 text-center text-lg text-white transition-colors hover:border-border-strong"
          >
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

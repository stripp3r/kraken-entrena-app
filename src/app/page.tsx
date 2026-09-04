import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "./login/actions";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("nombre")
    .eq("id", user.id)
    .single();

  if (!profile?.nombre) {
    redirect("/perfil");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <img src="/kraken-mark.png" alt="KRAKEN" className="h-16 w-16" />
      <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
        HOLA, {profile.nombre.toUpperCase()}
      </h1>
      <p className="max-w-xs text-gray-300">
        Tu rutina, tu progreso y tus técnicas llegan pronto acá.
      </p>

      <Link
        href="/perfil"
        className="mt-8 rounded-full border border-border-strong bg-bg-card px-5 py-2.5 text-sm text-gray-300"
      >
        Editar mi perfil
      </Link>

      <form>
        <button formAction={logout} className="mt-2 text-sm text-gray-500 underline">
          Cerrar sesión
        </button>
      </form>
    </main>
  );
}

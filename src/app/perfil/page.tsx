import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "../login/actions";
import { permisos } from "@/lib/premium";
import { LinksLegales } from "@/components/links-legales";

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
    .select("sexo, premium_hasta, golden_perpetuo, premium_origen, tiene_pdfs_nuevos")
    .eq("id", user.id)
    .single();

  const genero = profile?.sexo === "femenino" ? "femenino" : "masculino";
  const perm = permisos(profile);

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
              src="/section-icons/datos-personales.png"
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
            className={`flex items-center gap-4 rounded-lg border border-border bg-bg-card px-5 py-3 text-lg transition-colors hover:border-border-strong ${perm.evolucion ? "text-white" : "text-gray-500"}`}
          >
            <img
              src={perm.evolucion ? "/section-icons/evolucion.png" : "/section-icons/bloqueado.png"}
              alt=""
              className="h-14 w-14 rounded-xl"
            />
            Mi evolución
          </Link>
          <Link
            href="/perfil/recursos"
            className={`flex items-center gap-4 rounded-lg border border-border bg-bg-card px-5 py-3 text-lg transition-colors hover:border-border-strong ${perm.misPdfs ? "text-white" : "text-gray-500"}`}
          >
            <div className="relative shrink-0">
              <img
                src={perm.misPdfs ? "/section-icons/pdfs.png" : "/section-icons/bloqueado.png"}
                alt=""
                className="h-14 w-14 rounded-xl"
              />
              {perm.misPdfs && profile?.tiene_pdfs_nuevos && (
                <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-bg-card bg-emerald-400" />
              )}
            </div>
            Mis PDFs
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

        <LinksLegales eliminarDatos className="mt-8" />
      </div>
    </main>
  );
}

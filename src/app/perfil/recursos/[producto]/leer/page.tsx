import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/back-link";
import { PantallaBloqueada } from "@/components/pantalla-bloqueada";
import { VisorPdf } from "@/components/visor-pdf";
import { permisos } from "@/lib/premium";
import { productoPdfConAcceso } from "@/lib/pdf-acceso";

// Visor de solo lectura del PDF de un plan autoguiado (reemplaza al botón
// "Descargar PDF"). Los bytes los entrega la ruta ../pdf/route.ts.
export default async function LeerPdfPage({ params }: { params: Promise<{ producto: string }> }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("premium_hasta, golden_perpetuo, premium_origen")
    .eq("id", user.id)
    .single();

  if (!permisos(profile).misPdfs) {
    return (
      <PantallaBloqueada
        titulo="MIS PDFS"
        volverA="/perfil"
        texto="Mis PDFs no está disponible con tu plan actual. Se habilita al comprar un plan."
      />
    );
  }

  const { producto: slug } = await params;
  const acceso = await productoPdfConAcceso(user.id, slug);
  if (!acceso) notFound();

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="relative mb-4 flex items-center justify-center px-8">
          <BackLink href="/perfil/recursos" />
          <h1 className="text-center font-[family-name:var(--font-display)] text-3xl tracking-wide text-white">
            {acceso.nombre.toUpperCase()}
          </h1>
        </div>
        <VisorPdf src={`/perfil/recursos/${encodeURIComponent(acceso.slug)}/pdf`} marcaDeAgua={user.email ?? ""} />
      </div>
    </main>
  );
}

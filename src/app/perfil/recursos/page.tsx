import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { BackLink } from "@/components/back-link";
import { PantallaBloqueada } from "@/components/pantalla-bloqueada";
import { permisos } from "@/lib/premium";
import { tienePdfComprado } from "@/lib/pdf-acceso";
import { URL_PLANES } from "@/lib/legal";
import { MODO_TIENDA } from "@/lib/modo-tienda";
import { obtenerUsuario } from "@/lib/supabase/usuario";

type ProductoConPdf = { id: number; nombre: string; slug: string };

export default async function RecursosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await obtenerUsuario(supabase);

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("premium_hasta, golden_perpetuo, premium_origen, tiene_pdfs_nuevos")
    .eq("id", user.id)
    .single();

  // Con un PDF comprado se ve esta pantalla aunque el acceso a la app haya
  // vencido (el PDF no depende de los 3 meses). Sin PDF comprado, vale el plan.
  if (!permisos(profile).misPdfs && !(await tienePdfComprado(user.id))) {
    return (
      <PantallaBloqueada
        titulo="MIS PDFS"
        volverA="/perfil"
        texto="Mis PDFs no está disponible con tu acceso actual."
      />
    );
  }

  // Apaga el distintivo de "hay novedades" la primera vez que el usuario
  // entra acá después de que una compra le sumó un PDF nuevo -- ver
  // procesarCompraAprobada() en lib/compras.ts, que lo prende.
  if (profile?.tiene_pdfs_nuevos) {
    await supabase.from("profiles").update({ tiene_pdfs_nuevos: false }).eq("id", user.id);
  }

  const admin = createAdminClient();

  // Directo contra `compras`: tenés el PDF si pagaste ese producto puntual,
  // sin importar de dónde te venga el acceso a las rutinas que desbloquea
  // (ver la nota en actions.ts sobre por qué esto ya no sale de
  // profile_routine_access).
  const { data: compras } = await admin
    .from("compras")
    .select("productos(id, nombre, slug, pdf_storage_path)")
    .eq("user_id", user.id)
    .eq("estado", "aprobado");

  const vistos = new Set<number>();
  const productos: ProductoConPdf[] = [];

  for (const compra of compras ?? []) {
    const producto = compra.productos as unknown as {
      id: number;
      nombre: string;
      slug: string;
      pdf_storage_path: string | null;
    } | null;

    if (producto?.pdf_storage_path && !vistos.has(producto.id)) {
      vistos.add(producto.id);
      productos.push({ id: producto.id, nombre: producto.nombre, slug: producto.slug });
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="relative mb-8 flex items-center justify-center">
          <BackLink href="/perfil" />
          <h1 className="text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
            MIS PDFS
          </h1>
        </div>

        {productos.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-bg-card px-5 py-6 text-center">
            <p className="text-sm text-gray-400">
              {MODO_TIENDA
                ? "Todavía no tenés ningún PDF disponible."
                : "Todavía no tenés ningún PDF disponible. Se habilitan solos con tu plan autoguiado, para leer dentro de la app."}
            </p>
            {!MODO_TIENDA && (
              <a
                href={URL_PLANES}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-border-strong px-6 py-3 text-sm font-medium text-white"
              >
                Ver planes en el sitio web
              </a>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {productos.map((producto) => (
              <div
                key={producto.id}
                className="flex items-center justify-between rounded-lg border border-border bg-bg-card px-4 py-3"
              >
                <span className="text-sm text-white">{producto.nombre}</span>
                <Link
                  href={`/perfil/recursos/${encodeURIComponent(producto.slug)}/leer`}
                  className="rounded-full bg-white px-4 py-1.5 text-xs font-medium text-black transition-opacity hover:opacity-90"
                >
                  Leer PDF
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

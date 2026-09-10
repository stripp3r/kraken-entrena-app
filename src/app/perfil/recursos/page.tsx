import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { BackLink } from "@/components/back-link";
import { DescargarPdfBoton } from "@/components/descargar-pdf-boton";

type ProductoConPdf = { id: number; nombre: string };

export default async function RecursosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const admin = createAdminClient();

  // Directo contra `compras`: tenés el PDF si pagaste ese producto puntual,
  // sin importar de dónde te venga el acceso a las rutinas que desbloquea
  // (ver la nota en actions.ts sobre por qué esto ya no sale de
  // profile_routine_access).
  const { data: compras } = await admin
    .from("compras")
    .select("productos(id, nombre, pdf_storage_path)")
    .eq("user_id", user.id)
    .eq("estado", "aprobado");

  const vistos = new Set<number>();
  const productos: ProductoConPdf[] = [];

  for (const compra of compras ?? []) {
    const producto = compra.productos as unknown as {
      id: number;
      nombre: string;
      pdf_storage_path: string | null;
    } | null;

    if (producto?.pdf_storage_path && !vistos.has(producto.id)) {
      vistos.add(producto.id);
      productos.push({ id: producto.id, nombre: producto.nombre });
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
          <div className="rounded-lg border border-border bg-bg-card px-5 py-4 text-center">
            <p className="text-sm text-gray-400">
              Todavía no tenés ningún PDF disponible. Se habilitan solos al comprar un plan.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {productos.map((producto) => (
              <div
                key={producto.id}
                className="flex items-center justify-between rounded-lg border border-border bg-bg-card px-4 py-3"
              >
                <span className="text-sm text-white">{producto.nombre}</span>
                <DescargarPdfBoton productoId={producto.id} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

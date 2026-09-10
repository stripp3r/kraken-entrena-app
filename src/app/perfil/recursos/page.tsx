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

  const { data: accesos } = await admin
    .from("profile_routine_access")
    .select("routine_id")
    .eq("user_id", user.id);

  const routineIds = accesos?.map((a) => a.routine_id) ?? [];

  let productos: ProductoConPdf[] = [];

  if (routineIds.length) {
    const { data: relaciones } = await admin
      .from("producto_rutinas")
      .select("productos(id, nombre, pdf_storage_path)")
      .in("routine_id", routineIds);

    const vistos = new Set<number>();
    for (const relacion of relaciones ?? []) {
      const producto = relacion.productos as unknown as {
        id: number;
        nombre: string;
        pdf_storage_path: string | null;
      } | null;

      if (producto?.pdf_storage_path && !vistos.has(producto.id)) {
        vistos.add(producto.id);
        productos.push({ id: producto.id, nombre: producto.nombre });
      }
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

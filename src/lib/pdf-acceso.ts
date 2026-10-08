import { createAdminClient } from "@/lib/supabase/admin";

// Único chequeo de "¿este usuario puede leer el PDF de este producto?":
// tiene una compra APROBADA (compras.estado = 'aprobado') de ese producto y
// el producto tiene un archivo cargado. Si la compra se revoca
// (revocarCompra, estado = 'revocado') el acceso cae solo, sin tocar nada
// más. Usado por la página del visor y por la ruta que entrega los bytes.
export async function productoPdfConAcceso(userId: string, slug: string) {
  const admin = createAdminClient();

  const { data: producto } = await admin
    .from("productos")
    .select("id, nombre, slug, pdf_storage_path")
    .eq("slug", slug)
    .maybeSingle();

  if (!producto?.pdf_storage_path) return null;

  const { data: compra } = await admin
    .from("compras")
    .select("id")
    .eq("user_id", userId)
    .eq("producto_id", producto.id)
    .eq("estado", "aprobado")
    .limit(1)
    .maybeSingle();

  if (!compra) return null;

  return { nombre: producto.nombre as string, slug: producto.slug as string, path: producto.pdf_storage_path as string };
}

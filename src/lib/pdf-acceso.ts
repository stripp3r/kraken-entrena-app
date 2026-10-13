import { createAdminClient } from "@/lib/supabase/admin";

// Único chequeo de "¿este usuario puede leer el PDF de este producto?":
// tiene una compra APROBADA (compras.estado = 'aprobado') de ese producto y
// el producto tiene un archivo cargado. Si la compra se revoca
// (revocarCompra, estado = 'revocado') el acceso cae solo, sin tocar nada
// más. Usado por la página del visor y por la ruta que entrega los bytes.
//
// IMPORTANTE (decisión del coach, 2026-10-13): el PDF comprado se puede leer
// SIEMPRE que la compra esté aprobada, aunque el acceso a la app
// (premium_hasta, los 3 meses de la compra) haya vencido y la persona no
// renueve ni pase a Golden. El PDF es de solo lectura dentro de la app, nunca
// se descarga. Por eso este chequeo NO mira permisos()/premium_hasta.
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

// ¿Tiene al menos un PDF comprado y vigente? Para mostrar Mis PDFs aunque el
// acceso a la app haya vencido.
export async function tienePdfComprado(userId: string): Promise<boolean> {
  const { data } = await createAdminClient()
    .from("compras")
    .select("productos(pdf_storage_path)")
    .eq("user_id", userId)
    .eq("estado", "aprobado");
  return (data ?? []).some((c) => {
    const p = (Array.isArray(c.productos) ? c.productos[0] : c.productos) as { pdf_storage_path: string | null } | null;
    return Boolean(p?.pdf_storage_path);
  });
}

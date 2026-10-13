"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { confirmarCodigoReclamo, solicitarCodigoReclamo } from "@/lib/reclamo-compra";

async function usuarioActual() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function pedirCodigoCompra(emailCompra: string) {
  const user = await usuarioActual();
  if (!user) return { error: "Tenés que iniciar sesión de nuevo." };
  return solicitarCodigoReclamo(user.id, emailCompra);
}

export async function confirmarCodigoCompra(emailCompra: string, codigo: string) {
  const user = await usuarioActual();
  if (!user) return { error: "Tenés que iniciar sesión de nuevo." };
  const r = await confirmarCodigoReclamo(user.id, emailCompra, codigo);
  if ("ok" in r && r.ok) revalidatePath("/", "layout");
  return r;
}

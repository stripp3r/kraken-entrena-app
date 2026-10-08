"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// El usuario confirma que leyó y aceptó el aviso de cambio de precio. Se
// inserta con SU sesión (RLS: solo puede insertar filas con su propio
// user_id); si ya estaba confirmado (doble click) no pasa nada.
export async function confirmarAvisoPrecio(avisoId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tenés que iniciar sesión de nuevo." };

  const { error } = await supabase
    .from("avisos_precio_confirmaciones")
    .upsert({ user_id: user.id, aviso_id: avisoId }, { onConflict: "user_id,aviso_id", ignoreDuplicates: true });

  if (error) return { error: "No pudimos guardar tu confirmación. Probá de nuevo." };

  revalidatePath("/", "layout");
  return { ok: true };
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { rechazarAvisoPrecio } from "@/lib/aviso-precio-servidor";

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

// "No acepto el nuevo precio": se cancela la renovación de la suscripción (la
// persona conserva el acceso hasta el fin del período ya pagado) y no se le
// cobra el precio nuevo. Ver lib/aviso-precio-servidor.ts.
export async function rechazarNuevoPrecio(avisoId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tenés que iniciar sesión de nuevo." };

  const r = await rechazarAvisoPrecio(user.id, avisoId);
  if ("error" in r && r.error) return { error: r.error };

  revalidatePath("/", "layout");
  return { ok: true, accesoHasta: "accesoHasta" in r ? r.accesoHasta : null };
}

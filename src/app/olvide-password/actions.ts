"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function pedirRecuperacion(formData: FormData) {
  const email = formData.get("email") as string;
  const supabase = await createClient();
  const headersList = await headers();
  const protocolo = headersList.get("x-forwarded-proto") ?? "http";
  const origin = `${protocolo}://${headersList.get("host")}`;

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/restablecer-password`,
  });

  // Se manda directo a cargar el código -- no hay que confirmarle a quien
  // completa el formulario si ese email está o no registrado en la app
  // (por eso no se chequea el resultado de resetPasswordForEmail acá).
  redirect(`/restablecer-password?email=${encodeURIComponent(email)}`);
}

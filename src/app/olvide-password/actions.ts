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

  // Mismo mensaje exista o no esa cuenta -- no hay que confirmarle a quien
  // completa el formulario si un email está o no registrado en la app.
  redirect("/olvide-password?enviado=1");
}

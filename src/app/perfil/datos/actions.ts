"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { rutaSiguienteSegura } from "@/lib/next-redirect";

export async function guardarPerfil(formData: FormData) {
  const supabase = await createClient();
  const next = rutaSiguienteSegura(formData.get("next"));

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      nombre: formData.get("nombre") as string,
      apellido: formData.get("apellido") as string,
      sexo: formData.get("sexo") as string,
      fecha_nacimiento: (formData.get("fecha_nacimiento") as string) || null,
      objetivo: formData.get("objetivo") as string,
      actividad_fisica: formData.get("actividad_fisica") as string,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    const sufijoNext = next ? `&next=${encodeURIComponent(next)}` : "";
    redirect(`/perfil/datos?error=${encodeURIComponent(error.message)}${sufijoNext}`);
  }

  revalidatePath("/");
  redirect(next ?? "/");
}

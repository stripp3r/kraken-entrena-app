"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function guardarPerfil(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const edadRaw = formData.get("edad") as string;

  const { error } = await supabase
    .from("profiles")
    .update({
      nombre: formData.get("nombre") as string,
      apellido: formData.get("apellido") as string,
      sexo: formData.get("sexo") as string,
      edad: edadRaw ? Number(edadRaw) : null,
      objetivo: formData.get("objetivo") as string,
      actividad_fisica: formData.get("actividad_fisica") as string,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    redirect(`/perfil?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  redirect("/");
}

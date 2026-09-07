"use server";

import { createClient } from "@/lib/supabase/server";

export async function subirFotoProgreso(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tenés que iniciar sesión de nuevo." };
  }

  const fecha = formData.get("fecha") as string;
  const tipo = formData.get("tipo") as "frontal" | "lateral" | "trasera";
  const file = formData.get("file") as File | null;

  if (!file || file.size === 0) {
    return { error: "Elegí una foto para subir." };
  }

  const extension = file.name.split(".").pop() || "jpg";
  const storagePath = `${user.id}/${fecha}-${tipo}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("progress-photos")
    .upload(storagePath, file, { upsert: true });

  if (uploadError) {
    return { error: uploadError.message };
  }

  const { error } = await supabase.from("progress_photos").upsert(
    { user_id: user.id, fecha, tipo, storage_path: storagePath },
    { onConflict: "user_id,fecha,tipo" }
  );

  if (error) {
    return { error: error.message };
  }

  return { ok: true };
}

export async function borrarFotoProgreso(id: number, storagePath: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tenés que iniciar sesión de nuevo." };
  }

  await supabase.storage.from("progress-photos").remove([storagePath]);

  const { error } = await supabase
    .from("progress_photos")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { ok: true };
}

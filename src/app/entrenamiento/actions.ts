"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function registrarSet(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const exerciseId = Number(formData.get("exercise_id"));
  const dia = formData.get("dia") as string;
  const pesoRaw = formData.get("peso") as string;
  const repsRaw = formData.get("reps") as string;
  const rirRaw = formData.get("rir") as string;

  const { error } = await supabase.from("workout_logs").insert({
    user_id: user.id,
    exercise_id: exerciseId,
    peso: pesoRaw ? Number(pesoRaw) : null,
    reps: repsRaw ? Number(repsRaw) : null,
    rir: rirRaw ? Number(rirRaw) : null,
  });

  if (error) {
    redirect(`/entrenamiento/${dia}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/entrenamiento/${dia}`);
  redirect(`/entrenamiento/${dia}?ok=1`);
}

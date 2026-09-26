import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireCoach() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "coach") {
    redirect("/entrenamiento");
  }

  return { supabase, user };
}

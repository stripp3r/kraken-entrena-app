"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { rutaSiguienteSegura } from "@/lib/next-redirect";

export async function login(formData: FormData) {
  const supabase = await createClient();
  const next = rutaSiguienteSegura(formData.get("next"));

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) {
    const sufijoNext = next ? `&next=${encodeURIComponent(next)}` : "";
    redirect(`/login?error=${encodeURIComponent(error.message)}${sufijoNext}`);
  }

  revalidatePath("/", "layout");
  redirect(next ?? "/");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const next = rutaSiguienteSegura(formData.get("next"));

  const { error } = await supabase.auth.signUp({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) {
    const sufijoNext = next ? `&next=${encodeURIComponent(next)}` : "";
    redirect(`/registro?error=${encodeURIComponent(error.message)}${sufijoNext}`);
  }

  revalidatePath("/", "layout");
  // Un usuario recién registrado siempre pasa primero por Datos personales
  // (lo exige el resto de la app, ver page.tsx de Inicio) -- "next" recién
  // se usa después de completar ese paso, no en vez de él.
  redirect(next ? `/perfil/datos?next=${encodeURIComponent(next)}` : "/perfil/datos");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

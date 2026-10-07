"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { rutaSiguienteSegura } from "@/lib/next-redirect";

const PROVEEDORES_SOCIALES = ["google", "facebook"] as const;

// "Continuar con Google / Facebook" (login Y registro: con OAuth son lo mismo,
// si la cuenta no existe Supabase la crea). Flujo PKCE: acá se arma la URL
// del proveedor y se guarda el code_verifier en cookie; al volver, la ruta
// /auth/callback canjea el código por la sesión. `next` viaja en la URL de
// retorno para no perder a dónde iba el usuario (ej. un checkout).
//
// El proveedor llega como primer argumento atado con `.bind(null, "google")`
// en botones-sociales.tsx, NO como name/value del botón: React pisa el `name`
// de un <button formAction={...}> con su propio id de acción, así que un
// <button name="provider" value="google"> nunca le llega al servidor.
export async function loginConProveedor(proveedor: string, formData: FormData) {
  const next = rutaSiguienteSegura(formData.get("next"));
  const sufijoNext = next ? `&next=${encodeURIComponent(next)}` : "";

  if (!PROVEEDORES_SOCIALES.some((p) => p === proveedor)) {
    redirect(`/login?error=${encodeURIComponent("Proveedor no válido.")}${sufijoNext}`);
  }

  const headersList = await headers();
  const protocolo = headersList.get("x-forwarded-proto") ?? "http";
  const origin = `${protocolo}://${headersList.get("host")}`;
  const retorno = `${origin}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ""}`;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: proveedor as (typeof PROVEEDORES_SOCIALES)[number],
    options: { redirectTo: retorno },
  });

  if (error || !data.url) {
    redirect(
      `/login?error=${encodeURIComponent("No pudimos conectar con ese servicio. Probá de nuevo.")}${sufijoNext}`
    );
  }

  redirect(data.url);
}

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

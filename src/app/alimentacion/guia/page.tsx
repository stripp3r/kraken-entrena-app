import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/back-link";

export default async function GuiaAlimenticiaPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("golden_perpetuo, premium_origen")
    .eq("id", user.id)
    .single();

  const esGolden = Boolean(profile?.golden_perpetuo) || profile?.premium_origen === "golden";
  if (!esGolden) {
    redirect("/alimentacion");
  }

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="relative mb-2">
          <BackLink href="/alimentacion" />
          <h1 className="text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
            GUÍA ALIMENTICIA
          </h1>
        </div>
        <p className="mt-6 text-center text-sm text-gray-500">
          Todavía no tenés una guía alimenticia asignada. Esto es parte de la Mentoría
          personalizada — si ya la tenés, tu coach te la va a cargar acá.
        </p>
      </div>
    </main>
  );
}

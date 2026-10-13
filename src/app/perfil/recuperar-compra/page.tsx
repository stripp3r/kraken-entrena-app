import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/back-link";
import { linkWhatsapp } from "@/lib/contacto";
import { RecuperarCompraCliente } from "./recuperar-compra-cliente";

export default async function RecuperarCompraPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="relative mb-6 flex items-center justify-center">
          <BackLink href="/perfil" />
          <h1 className="text-center font-[family-name:var(--font-display)] text-3xl tracking-wide text-white">
            ¿YA COMPRASTE?
          </h1>
        </div>
        <RecuperarCompraCliente />
        <p className="mt-8 text-center text-xs text-gray-600">
          ¿No tenés acceso a ese email?{" "}
          <a
            href={linkWhatsapp("Hola! Compré un plan pero no lo veo en mi cuenta de la app.")}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 underline underline-offset-2"
          >
            Escribinos por WhatsApp
          </a>
          .
        </p>
      </div>
    </main>
  );
}

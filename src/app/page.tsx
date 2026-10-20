import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { obtenerSuscripcion, TONO_SUSCRIPCION_CLASES } from "@/lib/premium";
import { CompartirAppBoton } from "@/components/compartir-app-boton";
import { linkWhatsapp } from "@/lib/contacto";
import { URL_PLANES, URL_SITIO_WEB, URL_MENTORIAS } from "@/lib/legal";
import { MODO_TIENDA } from "@/lib/modo-tienda";
import { esUsuarioDePrototipos } from "@/lib/prototipos";

const WHATSAPP_SOPORTE = linkWhatsapp("Hola KRAKEN, tengo un problema con la app");

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: sub }] = await Promise.all([
    supabase
      .from("profiles")
      .select("nombre, golden_perpetuo, premium_hasta, premium_origen, modalidad_mentoria")
      .eq("id", user.id)
      .single(),
    supabase
      .from("suscripciones")
      .select("estado, proximo_cobro, cancelada_al, frecuencia")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (!profile?.nombre) {
    redirect("/perfil/datos");
  }

  const suscripcion = obtenerSuscripcion(profile, sub ?? null);

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-4 text-center">
          <img src="/kraken-mark.png" alt="KRAKEN" className="h-16 w-16" />
          <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
            HOLA, {profile.nombre.toUpperCase()}
          </h1>
        </div>

        <Link
          href="/perfil/datos"
          className="mt-6 flex items-center justify-between gap-3 rounded-lg border border-border bg-bg-card px-4 py-3 transition-colors hover:border-border-strong active:bg-bg"
        >
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Tu plan</p>
            <span
              className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${TONO_SUSCRIPCION_CLASES[suscripcion.tono]}`}
            >
              {suscripcion.texto}
            </span>
          </div>
          <span className="shrink-0 text-2xl font-light leading-none text-gray-500">›</span>
        </Link>

        {/* Enlaces a los planes del sitio web: solo en la versión web/PWA. La app no cobra. */}
        {!MODO_TIENDA && (
        <div className="mt-10">
          <p className="mb-3 text-sm text-gray-500">¿Buscás más?</p>
          <div className="flex flex-col gap-3">
            <a
              href={URL_MENTORIAS}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-bg-card px-4 py-3 transition-colors hover:border-border-strong active:bg-bg"
            >
              <div>
                <p className="text-sm font-medium text-white">Mentoría personalizada</p>
                <p className="mt-0.5 text-xs text-gray-500">Rutina a medida y seguimiento conmigo</p>
              </div>
              <span className="shrink-0 text-2xl font-light leading-none text-gray-500">›</span>
            </a>
            <a
              href={URL_PLANES}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-bg-card px-4 py-3 transition-colors hover:border-border-strong active:bg-bg"
            >
              <div>
                <p className="text-sm font-medium text-white">Planes autoguiados</p>
                <p className="mt-0.5 text-xs text-gray-500">Rutina + PDF orientado a tu objetivo</p>
              </div>
              <span className="shrink-0 text-2xl font-light leading-none text-gray-500">›</span>
            </a>
          </div>
        </div>
        )}

        <div className={`mt-6 grid gap-3 ${MODO_TIENDA ? "grid-cols-2" : "grid-cols-3"}`}>
          {!MODO_TIENDA && (
          <a
            href={URL_SITIO_WEB}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 rounded-lg border border-border bg-bg-card px-3 py-4 text-xs text-white transition-colors hover:border-border-strong"
          >
            <img src="/section-icons/sitio-web.png" alt="" className="h-14 w-14 rounded-xl" />
            Sitio web
          </a>
          )}
          <a
            href={WHATSAPP_SOPORTE}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 rounded-lg border border-border bg-bg-card px-3 py-4 text-xs text-white transition-colors hover:border-border-strong"
          >
            <img src="/section-icons/soporte.png" alt="" className="h-14 w-14 rounded-xl" />
            Soporte
          </a>
          <CompartirAppBoton />
        </div>

        {esUsuarioDePrototipos(user.email) && (
          <Link
            href="/progreso/prueba"
            className="mt-4 flex items-center justify-between rounded-lg border border-dashed border-border-strong bg-bg-card px-4 py-3 text-sm text-white transition-colors hover:border-white/40"
          >
            <span>
              Progreso prueba <span className="ml-1 text-xs text-gray-500">prototipo</span>
            </span>
            <span className="text-2xl font-light leading-none text-gray-500">›</span>
          </Link>
        )}
      </div>
    </main>
  );
}

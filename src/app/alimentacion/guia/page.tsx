import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/back-link";
import { DisclaimerGate } from "@/components/disclaimer-gate";
import { DescargarGuiaBoton } from "@/components/descargar-guia-boton";
import { permisos, esMentoria } from "@/lib/premium";
import { linkWhatsapp } from "@/lib/contacto";

const WHATSAPP_MENTORIA = linkWhatsapp("Hola KRAKEN, quiero info de la Mentoría");

const BENEFICIOS_GUIA = [
  "Calorías y macros calculados para tu objetivo real, no una fórmula genérica",
  "Comidas armadas con alimentos que ya comés, nada de dietas raras",
  "Proteínas rotativas para no aburrirte comiendo siempre lo mismo",
  "Se ajusta cuando cambian tus resultados -- no es un PDF fijo y listo",
];

const TEXTO_DISCLAIMER_GUIA = `Las recomendaciones que siguen son orientativas y educativas, pensadas para acompañar tu entrenamiento; NO son una dieta ni una prescripción de un licenciado en nutrición.

Si tenés una condición médica, tomás medicación, o tenés dudas de salud, consultá con tu médico o nutricionista antes de hacer cambios.`;

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
    .select("golden_perpetuo, premium_hasta, premium_origen, disclaimer_guia_aceptado_at")
    .eq("id", user.id)
    .single();

  // La guía es exclusiva de Mentoría -- más estricto que el resto de
  // Alimentación (calculadora), que ya tienen Golden y Compra suelta
  // también. Alguien sin mentoría pero con calculadora (Golden, Compra) no
  // se redirige al hub (ahí volvería a ver este mismo link y entraría en
  // loop) -- se le muestra acá mismo por qué no puede entrar.
  if (!permisos(profile).calculadora) {
    redirect("/alimentacion");
  }

  if (!esMentoria(profile)) {
    return (
      <main className="flex flex-1 flex-col items-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="relative mb-2">
            <BackLink href="/alimentacion" />
            <h1 className="text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
              GUÍA ALIMENTICIA
            </h1>
          </div>

          <div className="mt-4 flex justify-center">
            <img src="/section-icons/guia-alimenticia.png" alt="" className="h-16 w-16 rounded-xl" />
          </div>

          <p className="mt-4 text-center text-sm text-gray-400">
            Es un beneficio exclusivo de la Mentoría 1 a 1: tu propia guía alimenticia,
            armada a tu medida y con seguimiento directo conmigo.
          </p>

          <div className="mt-6 flex flex-col gap-3 rounded-lg border border-border bg-bg-card p-4">
            {BENEFICIOS_GUIA.map((beneficio) => (
              <div key={beneficio} className="flex gap-2 text-sm text-gray-300">
                <span className="shrink-0 text-emerald-400">✓</span>
                {beneficio}
              </div>
            ))}
          </div>

          <a
            href={WHATSAPP_MENTORIA}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 block rounded-full bg-amber-400 px-6 py-3 text-center text-sm font-medium text-black"
          >
            Quiero la Mentoría
          </a>
        </div>
      </main>
    );
  }

  const disclaimerPendiente = !profile?.disclaimer_guia_aceptado_at;

  // El coach carga esto a mano por cuenta (tabla guias_alimenticias, ver
  // migración 050) -- no hay flujo de compra acá, es 1 fila si ya se la
  // asignó a este usuario puntual.
  const { data: guia } = await supabase
    .from("guias_alimenticias")
    .select("actualizada_at")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <>
      {disclaimerPendiente && (
        <DisclaimerGate
          campo="guia"
          volverA="/alimentacion"
          titulo="GUÍA ALIMENTICIA"
          texto={TEXTO_DISCLAIMER_GUIA}
        />
      )}
      <main className="flex flex-1 flex-col items-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="relative mb-2">
            <BackLink href="/alimentacion" />
            <h1 className="text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
              GUÍA ALIMENTICIA
            </h1>
          </div>

          <div className="mt-6 rounded-lg border border-border-strong bg-bg-card p-4">
            <p className="text-xs leading-relaxed text-gray-400">
              Las recomendaciones que siguen son orientativas y educativas, pensadas para
              acompañar tu entrenamiento; NO son una dieta ni una prescripción de un
              licenciado en nutrición. Si tenés una condición médica, tomás medicación, o
              tenés dudas de salud, consultá con tu médico o nutricionista antes de hacer
              cambios.
            </p>
          </div>

          {guia ? (
            <div className="mt-6 flex flex-col items-center gap-3">
              <p className="text-center text-sm text-gray-400">
                Tu coach te preparó una guía alimenticia personalizada.
              </p>
              <DescargarGuiaBoton />
            </div>
          ) : (
            <p className="mt-6 text-center text-sm text-gray-500">
              Todavía no tenés una guía alimenticia asignada. Tu coach te la va a cargar acá.
            </p>
          )}
        </div>
      </main>
    </>
  );
}

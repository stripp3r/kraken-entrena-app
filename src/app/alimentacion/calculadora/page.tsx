import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/back-link";
import { DisclaimerGate } from "@/components/disclaimer-gate";
import { calcularEdad } from "@/lib/fecha";
import { esGoldenTier } from "@/lib/premium";
import {
  calcularEstimacionNutricional,
  type ActividadNutricional,
  type ObjetivoNutricional,
} from "@/lib/nutricion";

const TEXTO_DISCLAIMER_CALCULADORA = `Esta calculadora estima tus calorías y macros usando una fórmula estándar (Mifflin-St Jeor) sobre los datos de tu perfil y tu última medición. Es una referencia general, no un cálculo clínico ni un diagnóstico.

KRAKEN Fitness no se responsabiliza por decisiones que tomes en base a este resultado. Si tenés una condición médica, tomás medicación, estás embarazada, o tenés dudas de salud, consultá con tu médico o nutricionista antes de hacer cambios en tu alimentación.`;

export default async function CalculadoraCaloriasPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: medidas }] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "golden_perpetuo, premium_origen, sexo, fecha_nacimiento, actividad_fisica, objetivo, disclaimer_calculadora_aceptado_at"
      )
      .eq("id", user.id)
      .single(),
    supabase
      .from("body_measurements")
      .select("fecha, peso, altura")
      .eq("user_id", user.id)
      .order("fecha", { ascending: true }),
  ]);

  const esGolden = esGoldenTier(profile);
  if (!esGolden) {
    redirect("/alimentacion");
  }

  const disclaimerPendiente = !profile?.disclaimer_calculadora_aceptado_at;

  const filas = medidas ?? [];
  const peso = [...filas].reverse().find((m) => m.peso != null)?.peso ?? null;
  const altura = [...filas].reverse().find((m) => m.altura != null)?.altura ?? null;
  const edad = profile?.fecha_nacimiento ? calcularEdad(profile.fecha_nacimiento) : null;
  const sexo = profile?.sexo === "femenino" || profile?.sexo === "masculino" ? profile.sexo : null;
  const actividad = (profile?.actividad_fisica as ActividadNutricional | null) ?? null;
  const objetivo = (profile?.objetivo as ObjetivoNutricional | null) ?? null;

  const faltantes: { label: string; href: string }[] = [];
  if (!sexo) faltantes.push({ label: "Sexo", href: "/perfil/datos" });
  if (!edad) faltantes.push({ label: "Fecha de nacimiento", href: "/perfil/datos" });
  if (!actividad) faltantes.push({ label: "Actividad física", href: "/perfil/datos" });
  if (!objetivo) faltantes.push({ label: "Objetivo", href: "/perfil/datos" });
  if (!peso) faltantes.push({ label: "Peso", href: "/medidas" });
  if (!altura) faltantes.push({ label: "Altura", href: "/medidas" });

  const resultado =
    sexo && edad && actividad && objetivo && peso && altura
      ? calcularEstimacionNutricional({ sexo, pesoKg: peso, alturaCm: altura, edad, actividad, objetivo })
      : null;

  return (
    <>
      {disclaimerPendiente && (
        <DisclaimerGate
          campo="calculadora"
          volverA="/alimentacion"
          titulo="CALORÍAS"
          texto={TEXTO_DISCLAIMER_CALCULADORA}
        />
      )}
      <main className="flex flex-1 flex-col items-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="relative mb-2">
            <BackLink href="/alimentacion" />
            <h1 className="text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
              CALORÍAS
            </h1>
          </div>
          <p className="mb-6 text-center text-sm text-gray-500">
            Calculado con tus datos personales y tu última medición.
          </p>

        {!resultado ? (
          <div className="flex flex-col gap-3">
            <p className="text-center text-sm text-gray-400">
              Te falta completar esto para calcularlo:
            </p>
            {faltantes.map((f) => (
              <Link
                key={f.label}
                href={f.href}
                className="flex items-center justify-between rounded-lg border border-border bg-bg-card px-4 py-3 transition-colors hover:border-border-strong active:bg-bg"
              >
                <span className="text-sm text-white">{f.label}</span>
                <span className="text-2xl font-light leading-none text-gray-500">›</span>
              </Link>
            ))}
          </div>
        ) : (
          <>
            <div className="mb-6 rounded-lg border border-border-strong bg-bg-card p-4">
              <p className="text-xs leading-relaxed text-gray-400">
                Estimación orientativa (fórmula Mifflin-St Jeor), no un cálculo clínico.{" "}
                <strong className="text-gray-300">
                  KRAKEN Fitness no se responsabiliza por decisiones tomadas en base a este
                  número.
                </strong>{" "}
                Si tenés una condición de salud, consultá primero con un profesional.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-bg-card p-4 text-center">
              <p className="text-3xl font-medium text-white">
                {resultado.kcal.toLocaleString("es-AR")}{" "}
                <span className="text-base font-normal text-gray-500">kcal / día</span>
              </p>
              <p className="mt-1 text-sm text-gray-400">{resultado.etiqueta}</p>

              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4">
                <div>
                  <p className="text-lg font-medium text-white">{resultado.proteina} g</p>
                  <p className="text-xs text-gray-500">Proteína</p>
                </div>
                <div>
                  <p className="text-lg font-medium text-white">{resultado.carbos} g</p>
                  <p className="text-xs text-gray-500">Carbohidratos</p>
                </div>
                <div>
                  <p className="text-lg font-medium text-white">{resultado.grasa} g</p>
                  <p className="text-xs text-gray-500">Grasas</p>
                </div>
              </div>
            </div>

            <p className="mt-4 text-center text-xs text-gray-600">
              Si cambian tu peso, tu objetivo o tu actividad física, este número se actualiza
              solo la próxima vez que entres acá.
            </p>
          </>
          )}
        </div>
      </main>
    </>
  );
}

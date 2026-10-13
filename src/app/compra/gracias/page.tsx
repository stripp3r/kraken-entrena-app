import Link from "next/link";
import { URL_ARREPENTIMIENTO } from "@/lib/legal";
import { WHATSAPP_COACH_NUMERO, linkWhatsapp } from "@/lib/contacto";
import { DIAS_ARREPENTIMIENTO_COMERCIAL, DIAS_ARREPENTIMIENTO_LEGAL } from "@/lib/proveedor";

const boton =
  "inline-block rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-opacity hover:opacity-90";

function numeroLegible() {
  return `+${WHATSAPP_COACH_NUMERO.replace(/^549(\d{3})(\d{3})(\d{4})$/, "54 9 $1 $2-$3")}`;
}

// El texto depende de qué se compró: los checkouts mandan ?tipo= (mentoria,
// plan, golden) -- sin parámetro (links viejos) se muestra el mensaje genérico.
export default async function CompraGraciasPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; tier?: string }>;
}) {
  const { tipo, tier } = await searchParams;

  const arrepentimiento = (
    <p className="mt-8 text-xs text-gray-600">
      Podés arrepentirte de tu compra: tenés {DIAS_ARREPENTIMIENTO_LEGAL} días corridos por ley y KRAKEN lo amplía a{" "}
      {DIAS_ARREPENTIMIENTO_COMERCIAL}, con reembolso del 100%.{" "}
      <a href={URL_ARREPENTIMIENTO} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
        Botón de arrepentimiento
      </a>
      .
    </p>
  );

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="w-full max-w-sm">
        <h1 className="mb-3 font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">¡GRACIAS!</h1>

        {tipo === "mentoria" ? (
          <>
            <p className="mb-4 text-sm text-gray-400">
              Tu pago se acreditó y tu mentoría{tier === "vip" ? " VIP" : tier === "basic" ? " Basic" : ""} ya está
              activa.
            </p>
            <ol className="mb-6 flex flex-col gap-2 text-left text-sm text-gray-300">
              <li>1. Completá el formulario de ingreso: nos cuenta tu objetivo, tu disponibilidad y tu equipamiento.</li>
              <li>2. Armamos tu plan personalizado.</li>
              <li>3. Lo recibís directamente en la app.</li>
            </ol>
            <p className="mb-6 text-sm text-gray-400">
              Nuestro equipo también te contacta por WhatsApp al {numeroLegible()}. Si querés adelantarte, escribinos
              vos.
            </p>
            <div className="flex flex-col items-center gap-3">
              <Link href={`/login?next=${encodeURIComponent("/perfil/ingreso")}`} className={boton}>
                Completar formulario de ingreso
              </Link>
              <a
                href={linkWhatsapp("Hola! Ya pagué mi mentoría en KRAKEN.")}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-400 underline underline-offset-2"
              >
                Escribir por WhatsApp
              </a>
            </div>
          </>
        ) : tipo === "plan" ? (
          <>
            <p className="mb-4 text-sm text-gray-400">
              Tu pago se acreditó. Entrá a la app y registrate con el mismo email que usaste para pagar: tu plan queda
              desbloqueado solo.
            </p>
            <p className="mb-8 text-sm text-gray-400">
              El PDF de tu plan se lee dentro de la app, en Perfil → Mis PDFs. No se descarga: se ve solo desde tu
              cuenta.
            </p>
            <Link href="/login" className={boton}>
              Entrar a la app
            </Link>
            <p className="mt-4 text-xs text-gray-600">
              ¿Pagaste con un email distinto al de tu cuenta? Después de entrar vas a poder recuperar tu compra desde
              Perfil → ¿Ya compraste y no ves tu plan?
            </p>
          </>
        ) : tipo === "golden" ? (
          <>
            <p className="mb-8 text-sm text-gray-400">
              Tu suscripción Golden se está activando. En unos instantes tu cuenta tiene el acceso completo; si no lo
              ves, cerrá y volvé a abrir la app.
            </p>
            <Link href="/" className={boton}>
              Ir a la app
            </Link>
          </>
        ) : (
          <>
            <p className="mb-8 text-sm text-gray-400">
              Tu pago se acreditó. Entrá a la app y registrate con el mismo email que usaste para pagar: tu rutina
              queda desbloqueada sola y el PDF lo leés dentro de la app, en Perfil → Mis PDFs.
            </p>
            <Link href="/login" className={boton}>
              Entrar a la app
            </Link>
          </>
        )}

        {arrepentimiento}
      </div>
    </main>
  );
}

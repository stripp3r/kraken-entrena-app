import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";
import { RegisterServiceWorker } from "./register-sw";
import { BottomNav } from "@/components/bottom-nav";
import { TrialBanner } from "@/components/trial-banner";
import { OrientationGuard } from "@/components/orientation-guard";
import { FranjaLegal } from "@/components/franja-legal";
import { AvisoPrecioModal } from "@/components/aviso-precio-modal";
import { AvisoPagoRechazado } from "@/components/aviso-pago-rechazado";
import { avisoPrecioPendiente, type AvisoPrecio } from "@/lib/aviso-precio";
import { createClient } from "@/lib/supabase/server";
import { diasRestantesTrial } from "@/lib/premium";
import { obtenerUsuario } from "@/lib/supabase/usuario";

const bebasNeue = Bebas_Neue({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KRAKEN Entrena",
  description: "Tu rutina, tu progreso y tus técnicas KRAKEN en el celular.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "KRAKEN",
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await obtenerUsuario(supabase);

  let genero: "femenino" | "masculino" = "masculino";
  let diasTrial: number | null = null;
  let avisoPrecio: AvisoPrecio | null = null;
  let fechaCortePago: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("sexo, premium_hasta, golden_perpetuo, premium_origen")
      .eq("id", user.id)
      .single();
    if (profile?.sexo === "femenino") genero = "femenino";
    diasTrial = diasRestantesTrial(profile);
    avisoPrecio = await avisoPrecioPendiente(supabase, user.id, profile?.premium_origen);

    // Cobro de renovación rechazado en gracia (migración 094): se avisa en la app
    // con la fecha exacta de suspensión. Un fallo de la consulta no rompe la app.
    try {
      const { data: enGracia } = await supabase
        .from("suscripciones")
        .select("gracia_premium_original")
        .eq("user_id", user.id)
        .eq("estado", "pausada")
        .not("gracia_premium_original", "is", null)
        .limit(1);
      if (enGracia?.length && profile?.premium_hasta) fechaCortePago = profile.premium_hasta;
    } catch {
      fechaCortePago = null;
    }
  }

  return (
    <html lang="es" className={`${bebasNeue.variable} ${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col pb-16 antialiased">
        <OrientationGuard />
        <FranjaLegal />
        {fechaCortePago && <AvisoPagoRechazado fechaCorte={fechaCortePago} />}
        {diasTrial != null && <TrialBanner dias={diasTrial} />}
        {children}
        <BottomNav genero={genero} />
        {avisoPrecio && <AvisoPrecioModal aviso={avisoPrecio} />}
        <RegisterServiceWorker />
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";
import { RegisterServiceWorker } from "./register-sw";
import { BottomNav } from "@/components/bottom-nav";

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
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${bebasNeue.variable} ${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col pb-16 antialiased">
        {children}
        <BottomNav />
        <RegisterServiceWorker />
      </body>
    </html>
  );
}

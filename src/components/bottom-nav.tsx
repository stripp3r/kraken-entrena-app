"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { guardarUltimaPantalla, leerUltimaPantalla } from "@/lib/ultima-pantalla";

const OCULTAR_EN = ["/login", "/registro"];

export function BottomNav({ genero }: { genero: "femenino" | "masculino" }) {
  const pathname = usePathname();

  const TABS = [
    {
      href: "/",
      label: "Inicio",
      match: (path: string) => path === "/",
      icon: "/section-icons/inicio.png",
    },
    {
      href: "/entrenamiento",
      label: "Entrenar",
      match: (path: string) => path.startsWith("/entrenamiento"),
      icon: `/section-icons/entrenar-${genero}.png`,
    },
    {
      href: "/progreso",
      label: "Análisis",
      match: (path: string) => path.startsWith("/progreso"),
      icon: "/section-icons/progreso.png",
    },
    {
      href: "/perfil",
      label: "Perfil",
      match: (path: string) =>
        path.startsWith("/perfil") || path.startsWith("/medidas") || path.startsWith("/evolucion"),
      icon: `/section-icons/datos-${genero}.png`,
    },
    {
      href: "/alimentacion",
      label: "Alimentación",
      match: (path: string) => path.startsWith("/alimentacion"),
      icon: "/section-icons/alimentacion.png",
    },
  ];

  const [hrefsPorHub, setHrefsPorHub] = useState<Record<string, string>>({});

  // Cada hub recuerda la última pantalla vista dentro de él (ej. Progreso ->
  // "/progreso/medidas") -- volver a tocar su ícono retoma ahí en vez de
  // resetear siempre a la portada de esa sección. "Inicio" queda afuera
  // porque es una sola pantalla, no tiene sub-páginas propias. Se resuelve
  // en un efecto (no en el estado inicial) para no romper la hidratación.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const hubActual = TABS.find((t) => t.href !== "/" && t.match(pathname));
    if (hubActual) {
      guardarUltimaPantalla(hubActual.href, pathname);
    }
    setHrefsPorHub(
      Object.fromEntries(
        TABS.filter((t) => t.href !== "/").map((t) => [t.href, leerUltimaPantalla(t.href) ?? t.href])
      )
    );
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (OCULTAR_EN.some((p) => pathname.startsWith(p))) {
    return null;
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-bg-elev"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-sm">
        {TABS.map((tab) => {
          const activo = tab.match(pathname);
          const href = hrefsPorHub[tab.href] ?? tab.href;
          return (
            <Link
              key={tab.href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] ${
                activo ? "text-white" : "text-gray-500"
              }`}
            >
              <img
                src={tab.icon}
                alt=""
                className="h-7 w-7 rounded-md"
                style={{ opacity: activo ? 1 : 0.55 }}
              />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

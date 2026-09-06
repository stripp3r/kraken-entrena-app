"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const OCULTAR_EN = ["/login", "/registro"];

export function BottomNav({ genero }: { genero: "femenino" | "masculino" }) {
  const pathname = usePathname();

  if (OCULTAR_EN.some((p) => pathname.startsWith(p))) {
    return null;
  }

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
      label: "Progreso",
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
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-bg-elev"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-sm">
        {TABS.map((tab) => {
          const activo = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
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

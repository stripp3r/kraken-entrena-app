"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  {
    href: "/",
    label: "Inicio",
    match: (path: string) => path === "/",
    icon: (
      <path d="M4 11.5 12 4l8 7.5M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9" />
    ),
  },
  {
    href: "/entrenamiento",
    label: "Entrenar",
    match: (path: string) => path.startsWith("/entrenamiento"),
    icon: (
      <path d="M4 8v8M20 8v8M2 10v4M22 10v4M7 8v8M17 8v8M7 12h10" />
    ),
  },
  {
    href: "/progreso",
    label: "Progreso",
    match: (path: string) => path.startsWith("/progreso") || path.startsWith("/medidas") || path.startsWith("/evolucion"),
    icon: <path d="M4 19V9m6 10V4m6 15v-7m6 7v-3" />,
  },
  {
    href: "/perfil",
    label: "Perfil",
    match: (path: string) => path.startsWith("/perfil"),
    icon: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c1.2-3.5 4-5 7-5s5.8 1.5 7 5" />
      </>
    ),
  },
];

const OCULTAR_EN = ["/login", "/registro"];

export function BottomNav() {
  const pathname = usePathname();

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
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] ${
                activo ? "text-white" : "text-gray-500"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                {tab.icon}
              </svg>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

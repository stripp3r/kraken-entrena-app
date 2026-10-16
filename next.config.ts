import type { NextConfig } from "next";

// Encabezados de seguridad (diagnóstico 2026-10-15). A propósito NO hay una CSP
// completa: la app usa scripts/estilos en línea de Next, gráficos y los
// checkouts de Mercado Pago/PayPal, y una CSP estricta se rompería en
// producción sin poder probarla en todos los dispositivos. Lo que sí se fija:
// - frame-ancestors / X-Frame-Options: la app no puede mostrarse dentro de otra
//   web (clickjacking). La app no se embebe en ningún lado.
// - nosniff, Referrer-Policy y Permissions-Policy (sin micrófono ni ubicación;
//   la cámara no se bloquea porque las fotos de evolución se cargan con el
//   selector de archivos del teléfono).
const encabezadosDeSeguridad = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: encabezadosDeSeguridad }];
  },
};

export default nextConfig;

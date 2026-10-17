// MODO_TIENDA: interruptor para la versión de la app que se publique en la App
// Store / Google Play. Con NEXT_PUBLIC_MODO_TIENDA=1 se esconde TODO enlace que lleve
// a comprar (sitio web, planes, mentorías), porque Apple no permite botones, links ni
// textos que inviten a comprar por otro medio fuera de Estados Unidos, y Google solo
// permite mencionar sin links. La versión web/PWA (apagado, por defecto) mantiene un
// enlace al sitio para quien necesite conseguir o renovar su acceso. La app NUNCA cobra
// ni muestra precios: todo el cobro pasa por el sitio web. Detalle y fuentes en CLAUDE.md
// ("Pagos fuera de la app").
export const MODO_TIENDA = process.env.NEXT_PUBLIC_MODO_TIENDA === "1";

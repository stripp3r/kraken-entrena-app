// Número de WhatsApp del negocio (no el personal del coach) -- usado para
// Mentoría y Soporte. Único lugar donde vive: si cambia, se actualiza acá
// y no hay que buscarlo en cada pantalla que lo usa.
export const WHATSAPP_COACH_NUMERO = "5493412672887";

export function linkWhatsapp(mensaje: string): string {
  return `https://wa.me/${WHATSAPP_COACH_NUMERO}?text=${encodeURIComponent(mensaje)}`;
}

// Cliente mínimo de la WhatsApp Cloud API (Meta). Server-only: usa
// WHATSAPP_TOKEN, que nunca debe llegar al browser.

const VERSION = process.env.WHATSAPP_API_VERSION ?? "v23.0";

export async function enviarTextoWhatsapp(
  para: string,
  texto: string
): Promise<{ ok: boolean; detalle: string }> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) {
    return { ok: false, detalle: "Faltan WHATSAPP_TOKEN o WHATSAPP_PHONE_NUMBER_ID" };
  }
  const res = await fetch(`https://graph.facebook.com/${VERSION}/${phoneId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: para,
      type: "text",
      text: { body: texto, preview_url: false },
    }),
  });
  const cuerpo = await res.text();
  return { ok: res.ok, detalle: `${res.status} ${cuerpo.slice(0, 300)}` };
}

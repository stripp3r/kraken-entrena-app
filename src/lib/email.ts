import { Resend } from "resend";

function client() {
  return new Resend(process.env.RESEND_API_KEY!);
}

const URL_APP = "https://kraken-entrena-app.vercel.app";

export async function enviarEntregaProducto({
  email,
  nombreProducto,
  pdfUrl,
  cuentaExistente,
}: {
  email: string;
  nombreProducto: string;
  pdfUrl: string | null;
  cuentaExistente: boolean;
}) {
  const resend = client();

  const linkAccion = cuentaExistente
    ? URL_APP
    : `${URL_APP}/registro?email=${encodeURIComponent(email)}`;

  const textoAcceso = cuentaExistente
    ? `Entrá a la app y ya vas a ver tu rutina nueva desbloqueada: ${linkAccion}`
    : `Creá tu cuenta en la app con este mismo email para que se te desbloquee la rutina sola: ${linkAccion}`;

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: email,
    subject: `Tu compra: ${nombreProducto}`,
    html: `
      <p>¡Gracias por tu compra!</p>
      <p>Ya tenés acceso a <strong>${nombreProducto}</strong>.</p>
      ${pdfUrl ? `<p><a href="${pdfUrl}">Descargá tu PDF acá</a></p>` : ""}
      <p>${textoAcceso}</p>
    `,
    attachments: pdfUrl ? [{ path: pdfUrl, filename: `${nombreProducto}.pdf` }] : undefined,
  });
}

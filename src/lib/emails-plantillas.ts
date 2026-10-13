import { escaparHtml } from "@/lib/email";
import {
  DATOS_PROVEEDOR,
  DIAS_ARREPENTIMIENTO_COMERCIAL,
  DIAS_ARREPENTIMIENTO_LEGAL,
  PIE_PROVEEDOR,
} from "@/lib/proveedor";
import { URL_ARREPENTIMIENTO, URL_BAJA, URL_TERMINOS } from "@/lib/legal";
import { WHATSAPP_COACH_NUMERO } from "@/lib/contacto";

type Plantilla = { asunto: string; html: string; texto: string };

const fechaAR = (iso: string) =>
  new Intl.DateTimeFormat("es-AR", { timeZone: "America/Argentina/Buenos_Aires", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

const soloFechaAR = (ymd: string) => ymd.split("-").reverse().join("/");

export function importeLegible(monto: number | null, moneda: string | null) {
  if (monto == null) return "a confirmar";
  const n = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 }).format(monto);
  return `${moneda ?? ""} ${n}`.trim();
}

function envolver(titulo: string, cuerpo: string) {
  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#111;max-width:560px;margin:0 auto;padding:16px">
<h2 style="font-size:18px;margin:0 0 12px">${escaparHtml(titulo)}</h2>
${cuerpo}
<hr style="border:none;border-top:1px solid #ddd;margin:20px 0 8px">
<p style="font-size:11px;color:#666;margin:0">${escaparHtml(PIE_PROVEEDOR)}</p>
</div>`;
}

const p = (s: string) => `<p style="margin:8px 0">${s}</p>`;
const fila = (k: string, v: string) =>
  `<tr><td style="padding:3px 12px 3px 0;color:#555">${escaparHtml(k)}</td><td style="padding:3px 0"><b>${escaparHtml(v)}</b></td></tr>`;
const contactoLinea = `Contacto: WhatsApp +${WHATSAPP_COACH_NUMERO.replace(/^549(\d{3})(\d{3})(\d{4})$/, "54 9 $1 $2-$3")}.`;

// Comprobante de compra / pago (adenda legal D).
export function comprobanteCompra(d: {
  producto: string;
  monto: number | null;
  moneda: string | null;
  fechaISO: string;
  medioPago: string;
  operacionId: string;
  suscripcion: null | { frecuencia: "mensual" | "anual" | null };
  terminosVersion: string;
  plazoLegalVence: string | null;
  plazoComercialVence: string | null;
}): Plantilla {
  const importe = importeLegible(d.monto, d.moneda);
  const renov = d.suscripcion
    ? d.suscripcion.frecuencia === "mensual"
      ? "Es una suscripción con renovación automática cada mes. Podés darte de baja cuando quieras, sin penalidad ni preaviso: la baja frena las renovaciones y conservás el acceso hasta el fin del período ya pagado."
      : d.suscripcion.frecuencia === "anual"
        ? "Es una suscripción con renovación automática cada año. Podés darte de baja cuando quieras, sin penalidad ni preaviso: la baja frena las renovaciones y conservás el acceso hasta el fin del período ya pagado."
        : "Es una suscripción con renovación automática. Podés darte de baja cuando quieras, sin penalidad ni preaviso: la baja frena las renovaciones y conservás el acceso hasta el fin del período ya pagado."
    : "Es un pago único (sin renovación automática).";

  const arrepentimiento = `Podés arrepentirte de la compra: tenés ${DIAS_ARREPENTIMIENTO_LEGAL} días corridos por ley (art. 34, Ley 24.240) y KRAKEN lo amplía a ${DIAS_ARREPENTIMIENTO_COMERCIAL} días como garantía comercial, con reembolso del 100% dentro de ese plazo. ${
    d.plazoComercialVence ? `Tu plazo vence el ${soloFechaAR(d.plazoComercialVence)}.` : ""
  }`;

  const html = envolver(
    "Comprobante de compra",
    `<table style="border-collapse:collapse">
${fila("Producto", d.producto)}
${fila("Importe", importe)}
${fila("Fecha", fechaAR(d.fechaISO))}
${fila("Medio de pago", d.medioPago)}
${fila("N° de operación", d.operacionId)}
</table>
${p(escaparHtml(renov))}
${p(escaparHtml(arrepentimiento))}
${p(`Botón de arrepentimiento: <a href="${URL_ARREPENTIMIENTO}">${URL_ARREPENTIMIENTO}</a><br>Botón de baja de servicio: <a href="${URL_BAJA}">${URL_BAJA}</a>`)}
${p(`Aceptaste la versión <b>${escaparHtml(d.terminosVersion)}</b> de los <a href="${URL_TERMINOS}">Términos y Condiciones</a>.`)}
${p(escaparHtml(contactoLinea))}`
  );

  const texto = [
    "Comprobante de compra",
    `Producto: ${d.producto}`,
    `Importe: ${importe}`,
    `Fecha: ${fechaAR(d.fechaISO)}`,
    `Medio de pago: ${d.medioPago}`,
    `N° de operación: ${d.operacionId}`,
    renov,
    arrepentimiento,
    `Arrepentimiento: ${URL_ARREPENTIMIENTO}`,
    `Baja: ${URL_BAJA}`,
    `Términos (versión ${d.terminosVersion}): ${URL_TERMINOS}`,
    contactoLinea,
    PIE_PROVEEDOR,
  ].join("\n");

  return { asunto: `Comprobante de tu compra: ${d.producto}`, html, texto };
}

// Constancia fehaciente de una solicitud de arrepentimiento o baja (Disp.
// 954/2025 art. 5 + adenda B): código de identificación, fecha y hora de
// recepción y qué va a pasar.
export function constanciaSolicitud(d: {
  tipo: "arrepentimiento" | "baja";
  codigo: string;
  recibidaAt: string;
  producto?: string | null;
  verificada: boolean;
}): Plantilla {
  const esArr = d.tipo === "arrepentimiento";
  const titulo = esArr ? "Constancia de arrepentimiento" : "Constancia de baja del servicio";
  const siguiente = esArr
    ? `Recibimos tu solicitud de arrepentimiento. Se te reembolsa el 100% de lo pagado dentro de los ${DIAS_ARREPENTIMIENTO_COMERCIAL} días corridos de la compra y se revoca el acceso a lo comprado. Vamos a hacer el reembolso por el mismo medio de pago y te avisamos cuando esté hecho.`
    : "Recibimos tu solicitud de baja. La baja es sin penalidad ni preaviso: frena las renovaciones y conservás el acceso hasta el fin del período ya pagado. Si por error se te cobrara una renovación después de esta solicitud, te la devolvemos nosotros, sin que tengas que iniciar otro trámite.";
  const verif = d.verificada
    ? ""
    : "No pudimos relacionar automáticamente este email con una compra o suscripción; lo revisamos a mano y te escribimos a este mismo email si necesitamos algún dato.";

  const html = envolver(
    titulo,
    `${p(`Tu código de identificación es <b style="font-size:18px">${escaparHtml(d.codigo)}</b>. Guardalo: sirve para consultar el estado de tu solicitud.`)}
<table style="border-collapse:collapse">
${fila("Fecha y hora de recepción", fechaAR(d.recibidaAt))}
${d.producto ? fila("Producto", d.producto) : ""}
</table>
${p(escaparHtml(siguiente))}
${verif ? p(escaparHtml(verif)) : ""}
${p(escaparHtml(contactoLinea))}`
  );

  const texto = [titulo, `Código de identificación: ${d.codigo}`, `Recibida: ${fechaAR(d.recibidaAt)}`, d.producto ? `Producto: ${d.producto}` : "", siguiente, verif, contactoLinea, PIE_PROVEEDOR]
    .filter(Boolean)
    .join("\n");

  return { asunto: `${titulo} ${d.codigo}`, html, texto };
}

// Reembolso hecho (cierra el ciclo de una solicitud).
export function reembolsoRealizado(d: { codigo: string; importe: string; referencia: string | null }): Plantilla {
  const html = envolver(
    "Reembolso realizado",
    `${p(`Realizamos el reembolso de tu solicitud <b>${escaparHtml(d.codigo)}</b> por <b>${escaparHtml(d.importe)}</b>, por el mismo medio de pago.${d.referencia ? ` Referencia: ${escaparHtml(d.referencia)}.` : ""}`)}
${p("Según el medio de pago, puede demorar unos días en verse reflejado.")}
${p(escaparHtml(contactoLinea))}`
  );
  return {
    asunto: `Reembolso realizado ${d.codigo}`,
    html,
    texto: `Realizamos el reembolso de tu solicitud ${d.codigo} por ${d.importe}, por el mismo medio de pago.${d.referencia ? ` Referencia: ${d.referencia}.` : ""}\n${contactoLinea}\n${PIE_PROVEEDOR}`,
  };
}

export function codigoReclamoCompra(codigo: string): Plantilla {
  const html = envolver(
    "Tu código para recuperar tu compra",
    `${p(`Tu código es <b style="font-size:22px;letter-spacing:3px">${escaparHtml(codigo)}</b>.`)}
${p("Ingresalo en la app dentro de los próximos 30 minutos. Si no lo pediste vos, ignorá este email: nadie puede acceder a tu compra sin este código.")}`
  );
  return {
    asunto: "Tu código para recuperar tu compra",
    html,
    texto: `Tu código es ${codigo}. Ingresalo en la app dentro de los próximos 30 minutos. Si no lo pediste vos, ignorá este email.\n${PIE_PROVEEDOR}`,
  };
}

export function avisoPagoRechazado(d: { producto: string; fechaCorte: string }): Plantilla {
  const f = soloFechaAR(d.fechaCorte);
  const html = envolver(
    "No pudimos cobrar tu renovación",
    `${p(`El cobro de renovación de <b>${escaparHtml(d.producto)}</b> fue rechazado.`)}
${p(`Mantenés el acceso hasta el <b>${escaparHtml(f)}</b> (incluye 48 horas de gracia). Si regularizás el pago antes de esa fecha, tu acceso sigue sin cortes y sin doble cobro. Si no, el acceso se suspende después de esa fecha.`)}
${p(escaparHtml(contactoLinea))}`
  );
  return {
    asunto: "No pudimos cobrar tu renovación",
    html,
    texto: `El cobro de renovación de ${d.producto} fue rechazado. Mantenés el acceso hasta el ${f} (incluye 48 horas de gracia). Si regularizás el pago antes, el acceso sigue sin cortes y sin doble cobro.\n${contactoLinea}\n${PIE_PROVEEDOR}`,
  };
}

export function precioNoAceptadoBaja(d: { producto: string; accesoHasta: string | null }): Plantilla {
  const hasta = d.accesoHasta ? ` Conservás el acceso hasta el ${soloFechaAR(d.accesoHasta)}.` : "";
  const html = envolver(
    "Tu suscripción no se renovará",
    `${p(`Como no aceptaste el nuevo precio de <b>${escaparHtml(d.producto)}</b>, cancelamos la renovación de tu suscripción: no se te va a cobrar el precio nuevo.${escaparHtml(hasta)}`)}
${p("Si querés seguir, podés volver a suscribirte desde nuestro sitio web.")}
${p(escaparHtml(contactoLinea))}`
  );
  return {
    asunto: "Tu suscripción no se renovará",
    html,
    texto: `Como no aceptaste el nuevo precio de ${d.producto}, cancelamos la renovación de tu suscripción: no se te va a cobrar el precio nuevo.${hasta}\n${contactoLinea}\n${PIE_PROVEEDOR}`,
  };
}

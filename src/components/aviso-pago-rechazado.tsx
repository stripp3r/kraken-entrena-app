import { URL_PLANES } from "@/lib/legal";
import { MODO_TIENDA } from "@/lib/modo-tienda";

// Franja visible mientras una suscripción está en la gracia de 48 h por un cobro
// rechazado: avisa la fecha exacta en que se suspende el acceso. Si la persona
// regulariza el pago antes, el webhook limpia la gracia y esta franja desaparece.
// En la versión de tienda es solo texto (sin enlace a pagar).
export function AvisoPagoRechazado({ fechaCorte }: { fechaCorte: string }) {
  const f = fechaCorte.split("-").reverse().join("/");
  const clase = "block bg-red-500/10 px-4 py-1.5 text-center text-xs text-red-300";
  const texto = `No pudimos cobrar tu renovación · tu acceso se suspende después del ${f} · regularizá el pago en tu medio de pago`;
  return MODO_TIENDA ? (
    <div className={clase}>{texto}</div>
  ) : (
    <a href={URL_PLANES} target="_blank" rel="noopener noreferrer" className={clase}>
      {texto}
    </a>
  );
}

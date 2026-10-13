import { URL_PLANES } from "@/lib/legal";

// Franja visible mientras una suscripción está en la gracia de 48 h por un cobro
// rechazado: avisa la fecha exacta en que se suspende el acceso. Si la persona
// regulariza el pago antes, el webhook limpia la gracia y esta franja desaparece.
export function AvisoPagoRechazado({ fechaCorte }: { fechaCorte: string }) {
  const f = fechaCorte.split("-").reverse().join("/");
  return (
    <a
      href={URL_PLANES}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-red-500/10 px-4 py-1.5 text-center text-xs text-red-300"
    >
      No pudimos cobrar tu renovación · tu acceso se suspende después del {f} · regularizá el pago
    </a>
  );
}

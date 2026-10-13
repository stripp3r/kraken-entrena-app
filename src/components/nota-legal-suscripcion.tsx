import { URL_ARREPENTIMIENTO, URL_BAJA, URL_TERMINOS } from "@/lib/legal";
import { DIAS_ARREPENTIMIENTO_COMERCIAL, DIAS_ARREPENTIMIENTO_LEGAL } from "@/lib/proveedor";

// Condiciones que tienen que estar a la vista junto al botón de suscribirse
// (adenda legal G: coincidir con las páginas del sitio): renovación automática,
// baja sin penalidad ni preaviso y plazo de arrepentimiento.
export function NotaLegalSuscripcion() {
  const link = "underline underline-offset-2";
  return (
    <p className="mt-4 text-center text-[11px] leading-relaxed text-gray-600">
      La suscripción se renueva automáticamente cada período hasta que te des de baja. Podés darte de baja cuando
      quieras, sin penalidad ni preaviso: frena las renovaciones y conservás el acceso hasta el fin del período
      pagado. Podés arrepentirte: {DIAS_ARREPENTIMIENTO_LEGAL} días corridos por ley, ampliados a{" "}
      {DIAS_ARREPENTIMIENTO_COMERCIAL} por garantía de KRAKEN, con reembolso del 100%.{" "}
      <a href={URL_BAJA} target="_blank" rel="noopener noreferrer" className={link}>
        Baja
      </a>
      {" · "}
      <a href={URL_ARREPENTIMIENTO} target="_blank" rel="noopener noreferrer" className={link}>
        Arrepentimiento
      </a>
      {" · "}
      <a href={URL_TERMINOS} target="_blank" rel="noopener noreferrer" className={link}>
        Términos
      </a>
    </p>
  );
}

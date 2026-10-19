// Entrada de números decimales que funciona con teclado en español (coma) y punto.
// En iPhone, <input type="number"> descarta "5,5" cuando el teclado usa coma; por eso los
// campos de peso/medidas son de texto con inputMode="decimal" y se convierten acá.

/** Deja solo dígitos y un separador decimal (coma o punto). */
export function limpiarDecimal(texto: string): string {
  const soloValidos = texto.replace(/[^0-9.,]/g, "");
  const i = soloValidos.search(/[.,]/);
  if (i === -1) return soloValidos;
  return soloValidos.slice(0, i + 1) + soloValidos.slice(i + 1).replace(/[.,]/g, "");
}

/** "5,5" o "5.5" -> 5.5. Texto vacío o inválido -> NaN. */
export function aNumero(texto: string): number {
  return Number(texto.trim().replace(",", "."));
}

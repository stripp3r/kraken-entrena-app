// Datos del proveedor que se muestran en comprobantes y pie de los emails.
// Son los mismos que ya están cargados en el sitio (fit.krakenbrand.com).
// Único lugar donde viven: si cambian, se cambian acá.
export const DATOS_PROVEEDOR = {
  marca: "KRAKEN",
  titular: "Ezequiel Arce",
  cuit: "20-37449501-2",
  domicilio: "Aliau 3458, Rosario, Santa Fe, Argentina",
} as const;

export const PIE_PROVEEDOR = `${DATOS_PROVEEDOR.marca} · ${DATOS_PROVEEDOR.titular} · CUIT ${DATOS_PROVEEDOR.cuit} · ${DATOS_PROVEEDOR.domicilio}`;

// Plazos de arrepentimiento (adenda legal 2026-10-12): 10 días corridos por ley
// (art. 34, Ley 24.240) y 14 como garantía comercial de KRAKEN, con reembolso
// del 100% sin excepciones dentro de los 14 para todos los planes.
export const DIAS_ARREPENTIMIENTO_LEGAL = 10;
export const DIAS_ARREPENTIMIENTO_COMERCIAL = 14;

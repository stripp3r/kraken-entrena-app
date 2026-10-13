// Versión vigente de Términos + Política de Privacidad. Al cambiarla, todos
// los usuarios (nuevos y existentes) vuelven a ver /aceptar-terminos en su
// próximo ingreso -- el proxy compara contra esta constante.
//
// Vive en un archivo aparte (sin imports) para que el proxy pueda leerla sin
// arrastrar next/headers ni el cliente admin de aceptacion-legal.ts.
export const VERSION_LEGAL = "2026-10";
export const TIPO_ACEPTACION = "terminos_privacidad";

// Declaración de ser mayor de 18 años (adenda legal 2026-10-12, regla 6).
export const TIPO_MAYOR_18 = "mayor_18";
export const VERSION_MAYOR_18 = "2026-10";

// Consentimiento EXPRESO para transferir datos a proveedores en el exterior
// (EE.UU. no es país de nivel adecuado para la AAIP; ley 25.326 art. 12).
// Casilla SEPARADA de los términos, sin tildar por defecto.
export const TIPO_TRANSFERENCIA = "transferencia_internacional";
export const VERSION_TRANSFERENCIA = "2026-10";

// Consentimiento específico para datos de salud (peso, medidas, fotos,
// lesiones). Se pide recién antes de cargar ese tipo de datos, no al ingresar.
export const TIPO_SALUD = "consentimiento_salud";
export const VERSION_SALUD = "2026-10";

// Lo que TODO usuario logueado tiene que haber aceptado (con su versión
// vigente) para usar la app. Si falta alguna, el proxy lo manda a
// /aceptar-terminos, que muestra solo las casillas que faltan.
export const ACEPTACIONES_REQUERIDAS = [
  { tipo: TIPO_ACEPTACION, version: VERSION_LEGAL },
  { tipo: TIPO_MAYOR_18, version: VERSION_MAYOR_18 },
  { tipo: TIPO_TRANSFERENCIA, version: VERSION_TRANSFERENCIA },
] as const;

export const TEXTO_MAYOR_18 = "Declaro tener 18 años o más.";
export const TEXTO_TRANSFERENCIA =
  "Autorizo expresamente que mis datos se traten en servidores de proveedores ubicados fuera de Argentina (por ejemplo Estados Unidos) para prestarme el servicio, según la Política de Privacidad.";

export type ClaveAceptacion = (typeof ACEPTACIONES_REQUERIDAS)[number]["tipo"];

// Devuelve las aceptaciones requeridas que NO están en `registradas`.
export function aceptacionesFaltantes(registradas: { tipo: string; version: string }[]) {
  return ACEPTACIONES_REQUERIDAS.filter(
    (req) => !registradas.some((r) => r.tipo === req.tipo && r.version === req.version)
  );
}

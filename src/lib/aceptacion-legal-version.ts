// Versión vigente de Términos + Política de Privacidad. Al cambiarla, todos
// los usuarios (nuevos y existentes) vuelven a ver /aceptar-terminos en su
// próximo ingreso -- el proxy compara contra esta constante.
//
// Vive en un archivo aparte (sin imports) para que el proxy pueda leerla sin
// arrastrar next/headers ni el cliente admin de aceptacion-legal.ts.
export const VERSION_LEGAL = "2026-10";
export const TIPO_ACEPTACION = "terminos_privacidad";

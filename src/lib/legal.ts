// Referencia legal única de la app: las páginas viven en el sitio web (otro
// repo), la app solo linkea. Si el dominio o una ruta cambia, se cambia acá.
export const SITIO_URL = "https://fit.krakenbrand.com";

export const URL_PRIVACIDAD = `${SITIO_URL}/privacidad`;
export const URL_TERMINOS = `${SITIO_URL}/terminos`;
export const URL_ELIMINAR_DATOS = `${SITIO_URL}/eliminar-datos`;

// Disposición 954/2025 (Argentina): "BOTÓN DE ARREPENTIMIENTO" y "BOTÓN DE
// BAJA DE SERVICIO" a simple vista y desde el primer acceso, sin pedir
// registro ni ningún otro trámite previo -- ver <FranjaLegal /> y la sección
// "Cumplimiento legal" de CLAUDE.md.
export const URL_ARREPENTIMIENTO = `${SITIO_URL}/arrepentimiento`;
export const URL_BAJA = `${SITIO_URL}/baja`;

export const URL_PLANES = `${SITIO_URL}/#planes`;
export const URL_SITIO_WEB = `${SITIO_URL}/#inicio`;
export const URL_MENTORIAS = `${SITIO_URL}/#mentorias`;

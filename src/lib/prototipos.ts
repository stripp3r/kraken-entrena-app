// Cuentas que pueden ver los PROTOTIPOS en desarrollo (hoy: la cámara de prueba).
// Quien no esté en la lista no ve el acceso en Inicio y, si abre la dirección a
// mano, vuelve al inicio. Cuando un prototipo se publique para todos, se saca de acá.
const EMAILS_PROTOTIPOS = ["ezequiel.arce@outlook.com"];

export function esUsuarioDePrototipos(email: string | null | undefined): boolean {
  return Boolean(email) && EMAILS_PROTOTIPOS.includes((email as string).trim().toLowerCase());
}

// Cada hub del nav de abajo (Entrenar, Progreso, Perfil, Alimentación)
// recuerda su última pantalla visitada, solo en este dispositivo/pestaña
// (sessionStorage) -- volver a tocar el ícono de un hub retoma ahí en vez de
// resetear siempre a la portada de esa sección. `hubKey` es el href base del
// hub (ej. "/progreso"); el valor guardado es el pathname completo de la
// última pantalla vista dentro de ese hub (ej. "/progreso/medidas").
const CLAVE = "kraken:ultima-pantalla";

type Mapa = Record<string, string>;

function leerMapa(): Mapa {
  if (typeof window === "undefined") return {};
  try {
    const guardado = window.sessionStorage.getItem(CLAVE);
    return guardado ? (JSON.parse(guardado) as Mapa) : {};
  } catch {
    return {};
  }
}

export function guardarUltimaPantalla(hubKey: string, pathname: string) {
  if (typeof window === "undefined") return;
  try {
    const mapa = leerMapa();
    mapa[hubKey] = pathname;
    window.sessionStorage.setItem(CLAVE, JSON.stringify(mapa));
  } catch {
    // modo privado, storage lleno, etc. -- no es crítico, se pierde el resume
  }
}

export function leerUltimaPantalla(hubKey: string): string | null {
  return leerMapa()[hubKey] ?? null;
}

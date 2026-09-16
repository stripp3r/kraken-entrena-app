import { hoyISO } from "@/lib/fecha";

// Recuerda, solo en este dispositivo/pestaña (sessionStorage, no la base),
// en qué día de entrenamiento estaba el usuario "a mitad de sesión" -- así
// si navega a Progreso/Inicio y vuelve a Entrenar, la app lo devuelve
// directo a ese día en vez de al hub, y ese día restaura qué ejercicio tenía
// activo. Las series ya cargadas siempre quedan guardadas en la base sin
// depender de esto -- esto es solo la conveniencia de "dónde me quedé".
const CLAVE = "kraken:sesion-entrenamiento";

export type SesionGuardada = {
  dia: string;
  fecha: string;
  activoId: number | null;
  lado: "derecho" | "izquierdo" | null;
};

// Devuelve la sesión guardada solo si es de HOY -- una de ayer quedó vieja
// (el usuario ya debe haber elegido otro día) y se ignora.
export function leerSesionActiva(): SesionGuardada | null {
  if (typeof window === "undefined") return null;
  try {
    const guardada = window.sessionStorage.getItem(CLAVE);
    if (!guardada) return null;
    const sesion = JSON.parse(guardada) as SesionGuardada;
    return sesion.fecha === hoyISO() ? sesion : null;
  } catch {
    return null;
  }
}

export function guardarSesionActiva(sesion: Omit<SesionGuardada, "fecha">) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(CLAVE, JSON.stringify({ ...sesion, fecha: hoyISO() }));
  } catch {
    // modo privado, storage lleno, etc. -- no es crítico, se pierde el resume
  }
}

export function borrarSesionActiva() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(CLAVE);
  } catch {
    // ignorar
  }
}

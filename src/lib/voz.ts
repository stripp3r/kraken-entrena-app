// Voz del teléfono (Web Speech API) para cantar las repeticiones y dar avisos sin mirar la
// pantalla. Todo corre en el teléfono; si el navegador no tiene voz, simplemente no habla.

const CLAVE_VOZ = "kraken_camara_voz";
const CLAVE_LADO = "kraken_camara_lado";

export function vozDisponible(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function leerPreferencia<T extends string>(clave: string, valido: readonly T[], porDefecto: T): T {
  try {
    const v = window.localStorage.getItem(clave);
    return (valido as readonly string[]).includes(v ?? "") ? (v as T) : porDefecto;
  } catch {
    return porDefecto;
  }
}

export function guardarPreferencia(clave: string, valor: string) {
  try {
    window.localStorage.setItem(clave, valor);
  } catch {
    /* sin almacenamiento: no pasa nada */
  }
}

export const PREF = { voz: CLAVE_VOZ, lado: CLAVE_LADO };

let ultimoTexto = "";
let ultimoMs = 0;

/** Habla `texto`. Corta lo que esté diciendo (para que el número no llegue tarde). `espera` evita repetir el mismo aviso. */
export function hablar(texto: string, opciones: { espera?: number } = {}) {
  if (!vozDisponible()) return;
  const ahora = Date.now();
  if (texto === ultimoTexto && ahora - ultimoMs < (opciones.espera ?? 0)) return;
  ultimoTexto = texto;
  ultimoMs = ahora;
  try {
    const s = window.speechSynthesis;
    s.cancel();
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = "es-AR";
    u.rate = 1.15;
    u.volume = 1;
    s.speak(u);
  } catch {
    /* sin voz */
  }
}

export function callar() {
  if (!vozDisponible()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* sin voz */
  }
}

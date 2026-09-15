// Los navegadores móviles solo permiten crear/activar audio y vibración
// dentro de un toque directo del usuario. Como el aviso de fin de descanso
// se dispara solo, desde un cronómetro, hay que "preparar" el audio en el
// momento del toque (ej. al apretar "Registrar serie") para poder
// reproducirlo minutos después cuando el descanso termina.

let ctx: AudioContext | null = null;

function obtenerContexto(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!ctx) {
    ctx = new AudioCtx();
  }
  return ctx;
}

/** Llamar de forma síncrona dentro de un onClick real (nunca desde un timer). */
export function prepararAlertas() {
  const c = obtenerContexto();
  if (c && c.state === "suspended") {
    c.resume().catch(() => {});
  }
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(1);
  }
  // Pedimos permiso de notificaciones acá (dentro de un toque real) para
  // poder avisar cuando termina el descanso aunque el usuario haya
  // minimizado la app -- el sonido/vibración solos no se ven si el celular
  // está bloqueado o la app no está al frente.
  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
    Notification.requestPermission().catch(() => {});
  }
}

/** Llamar cuando termina el descanso (puede venir de un timer). */
export function reproducirAlerta() {
  const c = obtenerContexto();
  if (c) {
    if (c.state === "suspended") {
      c.resume().catch(() => {});
    }
    try {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain);
      gain.connect(c.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.001, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.3, c.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.5);
      osc.start();
      osc.stop(c.currentTime + 0.5);
    } catch {
      // sin audio disponible en este navegador
    }
  }
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate([250, 100, 250, 100, 250]);
  }
  mostrarNotificacionDescanso();
}

/** Notificación del sistema como refuerzo del sonido/vibración -- sigue
 * visible en la barra de notificaciones aunque el celular esté bloqueado o
 * la app minimizada, a diferencia del sonido que se puede pasar por alto. */
function mostrarNotificacionDescanso() {
  if (typeof window === "undefined" || !("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  const opciones: NotificationOptions = {
    body: "Terminó tu descanso -- volvé a la app para la siguiente serie.",
    icon: "/kraken-mark.png",
    tag: "kraken-descanso",
  };

  if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
    navigator.serviceWorker.ready
      .then((reg) => reg.showNotification("Descanso terminado", opciones))
      .catch(() => {
        try {
          new Notification("Descanso terminado", opciones);
        } catch {
          // sin soporte de notificaciones en este navegador
        }
      });
  } else {
    try {
      new Notification("Descanso terminado", opciones);
    } catch {
      // sin soporte de notificaciones en este navegador
    }
  }
}

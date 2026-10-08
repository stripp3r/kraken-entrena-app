// Service worker mínimo: solo lo necesario para que la PWA sea instalable
// y el shell quede disponible offline. Sin estrategia de cache compleja todavía.
const CACHE = "kraken-entrena-shell-v1";
const SHELL = ["/", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  // Los bytes de los PDF de planes (visor de solo lectura) nunca se guardan
  // en cache ni se sirven offline: la ruta responde no-store y el acceso se
  // puede revocar (arrepentimiento), asi que siempre va a la red.
  if (/^\/perfil\/recursos\/[^/]+\/pdf$/.test(new URL(event.request.url).pathname)) return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// iOS no soporta bloquear la orientación de una PWA (WebKit nunca
// implementó screen.orientation.lock), así que en vez de forzarla -- cosa
// imposible ahí -- tapamos la pantalla cuando el celular está horizontal.
// Es puro CSS (variante `landscape:` de Tailwind), no depende de ninguna
// API de orientación ni de JS.
export function OrientationGuard() {
  return (
    <div className="fixed inset-0 z-[100] hidden flex-col items-center justify-center gap-4 bg-bg px-8 text-center landscape:flex">
      <img src="/kraken-mark.png" alt="" className="h-12 w-12 opacity-70" />
      <p className="text-lg font-medium text-white">Girá tu celular</p>
      <p className="text-sm text-gray-400">
        KRAKEN Entrena está pensada para usarse en vertical.
      </p>
    </div>
  );
}

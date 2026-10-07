import { loginConProveedor } from "@/app/login/actions";

// Facebook OCULTO de nuevo (2026-10-07) hasta que Meta deje publicar la app:
// mientras está en modo Desarrollo el botón solo funciona para quienes tienen
// rol en la app (el coach); a cualquier cliente le muestra un error de Meta.
// El flujo ya está cableado y probado hasta la pantalla de login de Facebook.
// Pasar a `true` recién cuando "Publicar" en Meta Developers esté en "Activo".
const FACEBOOK_ACTIVO = false;

const CLASE_BOTON =
  "flex w-full items-center justify-center gap-3 rounded-full border border-border-strong bg-bg-card px-5 py-3 text-sm font-medium text-white transition-colors hover:border-white/40";

// "Continuar con Google / Facebook". Va en un <form> propio, separado del de
// email/contraseña, para que los `required` de ese formulario no bloqueen el
// botón. Sirve igual para entrar que para crear cuenta.
export function BotonesSociales({ next }: { next?: string }) {
  return (
    <div className="mt-6">
      <div className="mb-4 flex items-center gap-3 text-xs text-gray-600">
        <span className="h-px flex-1 bg-border" />
        o
        <span className="h-px flex-1 bg-border" />
      </div>

      <form className="flex flex-col gap-3">
        {next && <input type="hidden" name="next" value={next} />}

        <button formAction={loginConProveedor.bind(null, "google")} className={CLASE_BOTON}>
          <svg viewBox="0 0 48 48" aria-hidden="true" className="h-5 w-5">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
          Continuar con Google
        </button>

        {FACEBOOK_ACTIVO && (
          <button formAction={loginConProveedor.bind(null, "facebook")} className={CLASE_BOTON}>
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
              <path
                fill="#1877F2"
                d="M24 12c0-6.627-5.373-12-12-12S0 5.373 0 12c0 5.99 4.388 10.954 10.125 11.854V15.47H7.078V12h3.047V9.356c0-3.007 1.792-4.668 4.533-4.668 1.312 0 2.686.234 2.686.234v2.953H15.83c-1.491 0-1.956.925-1.956 1.874V12h3.328l-.532 3.47h-2.796v8.385C19.612 22.954 24 17.99 24 12z"
              />
            </svg>
            Continuar con Facebook
          </button>
        )}
      </form>
    </div>
  );
}

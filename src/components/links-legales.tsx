import { URL_PRIVACIDAD, URL_TERMINOS, URL_ELIMINAR_DATOS } from "@/lib/legal";

// Pie con las páginas legales del sitio web. `eliminarDatos` solo se muestra
// donde ya hay sesión (Perfil); en login/registro alcanzan Privacidad y
// Términos.
export function LinksLegales({
  eliminarDatos = false,
  className = "mt-6",
}: {
  eliminarDatos?: boolean;
  className?: string;
}) {
  const clase = "underline underline-offset-2 hover:text-gray-300";
  return (
    <p className={`${className} flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-xs text-gray-500`}>
      <a href={URL_PRIVACIDAD} target="_blank" rel="noopener noreferrer" className={clase}>
        Política de privacidad
      </a>
      <a href={URL_TERMINOS} target="_blank" rel="noopener noreferrer" className={clase}>
        Términos y condiciones
      </a>
      {eliminarDatos && (
        <a href={URL_ELIMINAR_DATOS} target="_blank" rel="noopener noreferrer" className={clase}>
          Eliminar mis datos
        </a>
      )}
    </p>
  );
}

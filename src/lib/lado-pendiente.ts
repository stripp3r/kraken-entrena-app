import type { Lado } from "@/lib/descanso";

// Qué lado toca registrar ahora en un ejercicio unilateral. Sale SIEMPRE de
// lo que ya está registrado hoy para ese ejercicio -- nunca de un estado en
// memoria ni de un cronómetro. Antes era un toggle derecho<->izquierdo que
// se volteaba al terminar/saltar el descanso y se reseteaba a "derecho" cada
// vez que se (re)elegía el ejercicio; cualquier cosa que lo desincronizara
// (app en segundo plano, pestaña descartada, sessionStorage perdido) dejaba
// el lado mal asignado en silencio. Contando los registros reales eso no
// puede pasar: borrar o editar un set se autocorrige solo.
//
// Se usa tanto en el cliente (para mostrar el lado) como en el servidor
// (registrarSets, para asignarlo) -- el mismo criterio en los dos lados.
export function ladoPendiente(logs: { lado: Lado | null }[]): Lado {
  let derecho = 0;
  let izquierdo = 0;
  for (const l of logs) {
    if (l.lado === "derecho") derecho++;
    else if (l.lado === "izquierdo") izquierdo++;
  }
  return derecho > izquierdo ? "izquierdo" : "derecho";
}

export function ladoOpuesto(lado: Lado): Lado {
  return lado === "derecho" ? "izquierdo" : "derecho";
}

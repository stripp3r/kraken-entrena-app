import { redirect } from "next/navigation";

// El potencial muscular vive ahora en Análisis > Medidas (pestaña "Potencial muscular"). Esta ruta queda por si
// quedó guardado un enlace viejo.
export default function PotencialMuscularPage() {
  redirect("/progreso/medidas?tab=potencial");
}

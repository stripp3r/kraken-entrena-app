// Bloque chico reusado por Frecuencia/Recuperación (por grupo muscular) e
// Intensidad/Sostenibilidad (por día) en las 3 pantallas que muestran
// desgloses de un pentágono (wizard, análisis individual, comparador) --
// mismo estilo visual que la tabla de Volumen, sin repetir el markup 4
// veces por pantalla.
export function TablaMetrica({
  titulo,
  filas,
}: {
  titulo: React.ReactNode;
  filas: { label: string; valor: string; detalle?: string }[];
}) {
  return (
    <div className="mt-5">
      <p className="mb-2 text-sm text-gray-400">{titulo}</p>
      <div className="flex flex-col gap-1 rounded-md border border-border bg-bg-card p-3">
        {filas.map(({ label, valor, detalle }) => (
          <div key={label} className="flex justify-between text-sm">
            <span className="text-gray-300">{label}</span>
            <span className="text-white">
              {valor} {detalle && <span className="text-gray-500">{detalle}</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

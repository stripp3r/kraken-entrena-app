// Bloque chico reusado por Frecuencia/Recuperación (por grupo muscular) e
// Intensidad/Sostenibilidad (por día) en las 3 pantallas que muestran
// desgloses de un pentágono (wizard, análisis individual, comparador) --
// mismo estilo visual que la tabla de Volumen, sin repetir el markup 4
// veces por pantalla.
export function TablaMetrica({
  titulo,
  filas,
  total,
}: {
  titulo: React.ReactNode;
  filas: { label: string; valor: string; detalle?: string }[];
  total?: { label: string; valor: string };
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
        {total && (
          <div className="mt-1 flex justify-between border-t border-border pt-2 text-sm font-medium">
            <span className="text-gray-300">{total.label}</span>
            <span className="text-white">{total.valor}</span>
          </div>
        )}
      </div>
    </div>
  );
}

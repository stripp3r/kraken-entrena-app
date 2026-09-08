"use client";

import { cambiarRutinaActiva } from "@/app/perfil/datos/actions";

type Routine = { id: number; nombre: string; dias: number };

export function CambiarRutina({
  routineIdActual,
  routines,
}: {
  routineIdActual: number | null;
  routines: Routine[];
}) {
  const rutinaActual = routines.find((r) => r.id === routineIdActual);

  return (
    <div className="rounded-lg border border-border bg-bg-card p-4">
      <h2 className="mb-1 text-sm font-medium text-white">Tu rutina activa</h2>
      <p className="mb-4 text-sm text-gray-400">
        {rutinaActual
          ? `${rutinaActual.nombre} (${rutinaActual.dias} días)`
          : "Todavía no elegiste una rutina."}
      </p>

      <form className="flex flex-col gap-3">
        <select
          name="routine_id"
          defaultValue={routineIdActual ?? ""}
          required
          className="w-full rounded-lg border border-border bg-bg px-4 py-2.5 text-white outline-none focus:border-border-strong"
        >
          <option value="" disabled>
            Elegí
          </option>
          {routines.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nombre} ({r.dias} días)
            </option>
          ))}
        </select>

        <button
          formAction={cambiarRutinaActiva}
          className="rounded-full border border-border-strong bg-bg px-5 py-2.5 text-sm text-gray-300"
        >
          {rutinaActual ? "Cambiar rutina" : "Elegir rutina"}
        </button>
      </form>

      {routineIdActual && (
        <p className="mt-3 text-xs text-gray-500">
          Si tenés más de un plan, podés cambiar cuál está activo cuando quieras.
          Tu progreso de cada ejercicio se conserva, no se pierde al cambiar.
        </p>
      )}
    </div>
  );
}

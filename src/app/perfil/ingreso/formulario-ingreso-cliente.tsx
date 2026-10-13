"use client";

import { useState, useTransition } from "react";
import { guardarFormularioIngreso } from "./actions";

export type IngresoInicial = {
  objetivo: string | null;
  experiencia: string | null;
  dias_por_semana: number | null;
  minutos_por_sesion: number | null;
  lugar: string | null;
  equipamiento: string | null;
  disponibilidad: string | null;
  restricciones: string | null;
  habitos: string | null;
  comentarios: string | null;
} | null;

const campo =
  "w-full rounded-lg border border-border bg-bg-card px-4 py-2.5 text-sm text-white outline-none focus:border-border-strong";
const etiqueta = "text-sm text-gray-300";
const ayuda = "text-xs text-gray-600";

const LUGARES: [string, string][] = [
  ["gimnasio", "Gimnasio"],
  ["casa", "En casa"],
  ["ambos", "Ambos"],
];

export function FormularioIngresoCliente({ inicial }: { inicial: IngresoInicial }) {
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);

  function enviar(formData: FormData) {
    setError(null);
    setGuardado(false);
    iniciar(async () => {
      const r = await guardarFormularioIngreso(formData);
      if ("error" in r && r.error) setError(r.error);
      else setGuardado(true);
    });
  }

  return (
    <form action={enviar} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="objetivo" className={etiqueta}>Tu objetivo principal *</label>
        <textarea id="objetivo" name="objetivo" required rows={2} defaultValue={inicial?.objetivo ?? ""} placeholder="Ej: ganar masa muscular, bajar grasa, mejorar mi fuerza" className={campo} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="dias_por_semana" className={etiqueta}>Días por semana *</label>
          <input id="dias_por_semana" name="dias_por_semana" type="number" inputMode="numeric" min={1} max={7} required defaultValue={inicial?.dias_por_semana ?? ""} className={campo} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="minutos_por_sesion" className={etiqueta}>Minutos por sesión</label>
          <input id="minutos_por_sesion" name="minutos_por_sesion" type="number" inputMode="numeric" min={15} max={240} defaultValue={inicial?.minutos_por_sesion ?? ""} className={campo} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className={etiqueta}>Dónde entrenás *</span>
        <div className="flex gap-4 text-sm text-gray-300">
          {LUGARES.map(([valor, rotulo]) => (
            <label key={valor} className="flex items-center gap-2">
              <input type="radio" name="lugar" value={valor} required defaultChecked={inicial?.lugar === valor} className="accent-orange-500" />
              {rotulo}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="experiencia" className={etiqueta}>Tu experiencia entrenando</label>
        <textarea id="experiencia" name="experiencia" rows={2} defaultValue={inicial?.experiencia ?? ""} placeholder="Ej: entreno hace 2 años, antes jugaba al fútbol" className={campo} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="equipamiento" className={etiqueta}>Equipamiento que tenés a mano</label>
        <textarea id="equipamiento" name="equipamiento" rows={2} defaultValue={inicial?.equipamiento ?? ""} placeholder="Ej: gimnasio completo / mancuernas y banda elástica" className={campo} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="disponibilidad" className={etiqueta}>Días y horarios en que podés entrenar</label>
        <textarea id="disponibilidad" name="disponibilidad" rows={2} defaultValue={inicial?.disponibilidad ?? ""} className={campo} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="restricciones" className={etiqueta}>Lesiones o limitaciones que importen para entrenar (opcional)</label>
        <textarea id="restricciones" name="restricciones" rows={2} defaultValue={inicial?.restricciones ?? ""} className={campo} />
        <p className={ayuda}>Contanos solo lo que afecta tu entrenamiento. No hace falta un diagnóstico completo.</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="habitos" className={etiqueta}>Hábitos: sueño, estrés, alimentación (opcional)</label>
        <textarea id="habitos" name="habitos" rows={2} defaultValue={inicial?.habitos ?? ""} className={campo} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="comentarios" className={etiqueta}>Algo más que quieras contarnos (opcional)</label>
        <textarea id="comentarios" name="comentarios" rows={3} defaultValue={inicial?.comentarios ?? ""} className={campo} />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {guardado && <p className="text-sm text-emerald-400">Listo, recibimos tu formulario. Te escribimos por WhatsApp con los próximos pasos.</p>}

      <button type="submit" disabled={pendiente} className="rounded-full bg-white px-5 py-3 font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50">
        {pendiente ? "Guardando…" : inicial ? "Actualizar formulario" : "Enviar formulario"}
      </button>
    </form>
  );
}

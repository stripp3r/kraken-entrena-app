"use client";

import { useState } from "react";
import { guardarPerfil } from "@/app/perfil/datos/actions";

type Profile = {
  nombre: string | null;
  apellido: string | null;
  sexo: string | null;
  edad: number | null;
  objetivo: string | null;
  actividad_fisica: string | null;
  routine_id: number | null;
};

type Routine = { id: number; nombre: string; dias: number };

const fieldClass =
  "w-full rounded-lg border border-border bg-bg-card px-4 py-2.5 text-white outline-none focus:border-border-strong";
const labelClass = "text-sm text-gray-300";

const SEXO_LABEL: Record<string, string> = { femenino: "Femenino", masculino: "Masculino" };
const OBJETIVO_LABEL: Record<string, string> = {
  superavit: "Superávit (ganar masa)",
  mantenimiento: "Mantenimiento",
  definicion: "Definición",
};
const ACTIVIDAD_LABEL: Record<string, string> = {
  poca_o_nula: "Poca o nula",
  ligera: "Ligera",
  moderada: "Moderada",
  muy_activo: "Muy activo",
  extremo: "Extremo",
};

export function DatosPersonales({
  profile,
  routines,
  error,
}: {
  profile: Profile | null;
  routines: Routine[];
  error?: string;
}) {
  const [editando, setEditando] = useState(!profile?.nombre);
  const rutina = routines.find((r) => r.id === profile?.routine_id);

  if (!editando && profile?.nombre) {
    return (
      <div className="rounded-lg border border-border bg-bg-card p-4">
        <dl className="flex flex-col gap-3 text-sm">
          <Fila label="Nombre" valor={`${profile.nombre} ${profile.apellido ?? ""}`.trim()} />
          <Fila label="Sexo" valor={profile.sexo ? SEXO_LABEL[profile.sexo] : "-"} />
          <Fila label="Edad" valor={profile.edad ? `${profile.edad} años` : "-"} />
          <Fila label="Objetivo" valor={profile.objetivo ? OBJETIVO_LABEL[profile.objetivo] : "-"} />
          <Fila
            label="Actividad física"
            valor={profile.actividad_fisica ? ACTIVIDAD_LABEL[profile.actividad_fisica] : "-"}
          />
          <Fila label="Rutina" valor={rutina ? `${rutina.nombre} (${rutina.dias} días)` : "-"} />
        </dl>

        <button
          onClick={() => setEditando(true)}
          className="mt-4 w-full rounded-full border border-border-strong bg-bg px-5 py-2.5 text-sm text-gray-300"
        >
          Editar
        </button>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-4">
      <div className="flex gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <label htmlFor="nombre" className={labelClass}>
            Nombre
          </label>
          <input
            id="nombre"
            name="nombre"
            defaultValue={profile?.nombre ?? ""}
            required
            className={fieldClass}
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <label htmlFor="apellido" className={labelClass}>
            Apellido
          </label>
          <input
            id="apellido"
            name="apellido"
            defaultValue={profile?.apellido ?? ""}
            className={fieldClass}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <label htmlFor="sexo" className={labelClass}>
            Sexo
          </label>
          <select
            id="sexo"
            name="sexo"
            defaultValue={profile?.sexo ?? ""}
            required
            className={fieldClass}
          >
            <option value="" disabled>
              Elegí
            </option>
            <option value="femenino">Femenino</option>
            <option value="masculino">Masculino</option>
          </select>
        </div>
        <div className="flex w-28 flex-col gap-1.5">
          <label htmlFor="edad" className={labelClass}>
            Edad
          </label>
          <input
            id="edad"
            name="edad"
            type="number"
            min={12}
            max={100}
            defaultValue={profile?.edad ?? ""}
            required
            className={fieldClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="objetivo" className={labelClass}>
          Objetivo
        </label>
        <select
          id="objetivo"
          name="objetivo"
          defaultValue={profile?.objetivo ?? ""}
          required
          className={fieldClass}
        >
          <option value="" disabled>
            Elegí
          </option>
          <option value="superavit">Superávit (ganar masa)</option>
          <option value="mantenimiento">Mantenimiento</option>
          <option value="definicion">Definición</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="actividad_fisica" className={labelClass}>
          Actividad física fuera del gym
        </label>
        <select
          id="actividad_fisica"
          name="actividad_fisica"
          defaultValue={profile?.actividad_fisica ?? ""}
          required
          className={fieldClass}
        >
          <option value="" disabled>
            Elegí
          </option>
          <option value="poca_o_nula">Poca o nula</option>
          <option value="ligera">Ligera</option>
          <option value="moderada">Moderada</option>
          <option value="muy_activo">Muy activo</option>
          <option value="extremo">Extremo</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="routine_id" className={labelClass}>
          Tu rutina
        </label>
        <select
          id="routine_id"
          name="routine_id"
          defaultValue={profile?.routine_id ?? ""}
          required
          className={fieldClass}
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
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        formAction={guardarPerfil}
        className="mt-2 rounded-full bg-white px-5 py-3 font-medium text-black transition-opacity hover:opacity-90"
      >
        Guardar
      </button>

      {profile?.nombre && (
        <button
          type="button"
          onClick={() => setEditando(false)}
          className="text-sm text-gray-500 underline"
        >
          Cancelar
        </button>
      )}
    </form>
  );
}

function Fila({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex justify-between border-b border-border pb-2 last:border-0 last:pb-0">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-white">{valor}</dd>
    </div>
  );
}

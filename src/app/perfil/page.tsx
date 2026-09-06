import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { guardarPerfil } from "./actions";
import { logout } from "../login/actions";

const fieldClass =
  "w-full rounded-lg border border-border bg-bg-card px-4 py-2.5 text-white outline-none focus:border-border-strong";
const labelClass = "text-sm text-gray-300";

export default async function PerfilPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: routines } = await supabase
    .from("routines")
    .select("id, nombre, dias")
    .order("dias", { ascending: true });

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
          TU PERFIL
        </h1>
        <p className="mb-8 text-center text-sm text-gray-500">
          Completá tus datos para armar tu programa.
        </p>

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
              {routines?.map((r) => (
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
        </form>

        <form>
          <button
            formAction={logout}
            className="mt-6 block w-full text-center text-sm text-gray-500 underline"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </main>
  );
}

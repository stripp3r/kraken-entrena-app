"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Estado = "procesando" | "listo" | "invalido" | "guardando";

function leerTokensDeHash() {
  if (typeof window === "undefined") return null;
  const hash = new URLSearchParams(window.location.hash.slice(1));
  const accessToken = hash.get("access_token");
  const refreshToken = hash.get("refresh_token");
  if (hash.get("type") !== "recovery" || !accessToken || !refreshToken) return null;
  return { accessToken, refreshToken };
}

// El link del mail de recuperación redirige acá con los tokens en el
// FRAGMENTO de la URL (#access_token=...&type=recovery), no como query
// param -- confirmado probando contra el proyecto real de Supabase (usa el
// flujo implícito de GoTrue para el link de "olvidé mi contraseña", no el
// flujo PKCE con ?code=). El fragmento nunca llega al servidor, así que
// todo este intercambio tiene que pasar por acá, client-side.
//
// El estado inicial se calcula en el inicializador de useState (no en el
// effect) para que el caso sincrónico "no hay tokens válidos" no dispare un
// setState dentro de un effect -- el effect solo hace el intercambio async
// con Supabase.
export function RestablecerPasswordCliente() {
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>(() => (leerTokensDeHash() ? "procesando" : "invalido"));
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");

  useEffect(() => {
    if (estado !== "procesando") return;
    const tokens = leerTokensDeHash();
    if (!tokens) return;

    const supabase = createClient();
    supabase.auth
      .setSession({ access_token: tokens.accessToken, refresh_token: tokens.refreshToken })
      .then(({ error }) => {
        // Se limpia el fragmento de la URL apenas se usa -- son credenciales
        // de sesión, no deberían quedar visibles en la barra de direcciones
        // ni en el historial del navegador.
        window.history.replaceState(null, "", window.location.pathname);
        setEstado(error ? "invalido" : "listo");
      });
  }, [estado]);

  async function guardar() {
    setError(null);
    if (password.length < 6) {
      setError("La contraseña tiene que tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setEstado("guardando");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setEstado("listo");
      return;
    }

    // Se cierra la sesión de recuperación a propósito -- el primer ingreso
    // con la contraseña nueva es un login real, confirma que quedó bien
    // guardada.
    await supabase.auth.signOut();
    router.push("/login?mensaje=Contrase%C3%B1a+actualizada.+Inici%C3%A1+sesi%C3%B3n+de+nuevo");
  }

  if (estado === "procesando") {
    return <p className="text-center text-sm text-gray-500">Verificando el link...</p>;
  }

  if (estado === "invalido") {
    return (
      <p className="text-center text-sm text-gray-400">
        Este link no es válido o ya venció. Pedí uno nuevo desde{" "}
        <a href="/olvide-password" className="text-gray-300 underline">
          ¿Olvidaste tu contraseña?
        </a>
        .
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm text-gray-300">
          Contraseña nueva
        </label>
        <PasswordInputControlado id="password" value={password} onChange={setPassword} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirmar" className="text-sm text-gray-300">
          Repetila
        </label>
        <PasswordInputControlado id="confirmar" value={confirmar} onChange={setConfirmar} />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="button"
        disabled={estado === "guardando"}
        onClick={guardar}
        className="mt-2 rounded-full bg-white px-5 py-3 font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {estado === "guardando" ? "Guardando..." : "Guardar contraseña"}
      </button>
    </div>
  );
}

// PasswordInput del repo es un input de formulario no controlado (pensado
// para Server Actions vía FormData) -- acá hace falta la versión
// controlada, ya que todo este flujo se maneja con fetch directo al
// cliente de Supabase, sin FormData ni Server Action de por medio.
function PasswordInputControlado({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        minLength={6}
        required
        className="w-full rounded-lg border border-border bg-bg-card px-4 py-2.5 pr-12 text-white outline-none focus:border-border-strong"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-gray-500 hover:text-gray-300"
      >
        {visible ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
        )}
      </button>
    </div>
  );
}

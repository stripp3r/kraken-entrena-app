"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Se abandonó el link clickeable del mail (ver CLAUDE.md, "Recuperar
// contraseña"): algunas apps de mail (Outlook incluida) hacen un preview
// automático del link en segundo plano, y como es de un solo uso, ese
// preview silencioso ya lo consume antes de que el usuario lo toque de
// verdad -- confirmado en vivo, pasaba incluso con el dominio de Supabase
// sin reescribir (descartando que fuera Safe Links de Microsoft). Un
// código de 8 dígitos tipeado a mano es inmune a esto: nada automático lo
// "visita" por vos. El mail (plantilla editada en Supabase) ahora solo
// muestra el código en texto plano, sin ningún link.
//
// Dos pasos, no uno solo (corregido 2026-10-03 a pedido del coach): primero
// se valida el código con `verifyOtp` -- recién si es correcto se muestran
// los campos de contraseña nueva. Antes se pedía todo junto y, si el código
// estaba mal, la persona ya había tipeado la contraseña nueva dos veces
// para nada.
type Paso = "codigo" | "password";

export function RestablecerPasswordCliente({ emailInicial }: { emailInicial?: string }) {
  const router = useRouter();
  const [paso, setPaso] = useState<Paso>("codigo");
  const [email, setEmail] = useState(emailInicial ?? "");
  const [codigo, setCodigo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function verificarCodigo() {
    setError(null);
    if (!email.trim()) {
      setError("Ingresá tu email.");
      return;
    }
    if (!codigo.trim()) {
      setError("Ingresá el código de 8 dígitos que te mandamos por mail.");
      return;
    }

    setCargando(true);
    const supabase = createClient();
    const { error: errorCodigo } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: codigo.trim(),
      type: "recovery",
    });
    setCargando(false);

    if (errorCodigo) {
      setError("El código no es válido o ya venció. Pedí uno nuevo.");
      return;
    }

    setPaso("password");
  }

  async function guardarPassword() {
    setError(null);
    if (password.length < 6) {
      setError("La contraseña tiene que tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setCargando(true);
    const supabase = createClient();
    const { error: errorPassword } = await supabase.auth.updateUser({ password });

    if (errorPassword) {
      setError(errorPassword.message);
      setCargando(false);
      return;
    }

    // Se cierra la sesión de recuperación a propósito -- el primer ingreso
    // con la contraseña nueva es un login real, confirma que quedó bien
    // guardada.
    await supabase.auth.signOut();
    router.push("/login?mensaje=Contrase%C3%B1a+actualizada.+Inici%C3%A1+sesi%C3%B3n+de+nuevo");
  }

  if (paso === "codigo") {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm text-gray-300">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-lg border border-border bg-bg-card px-4 py-2.5 text-white outline-none focus:border-border-strong"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="codigo" className="text-sm text-gray-300">
            Código de 8 dígitos
          </label>
          <input
            id="codigo"
            type="text"
            inputMode="numeric"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="12345678"
            maxLength={8}
            required
            className="rounded-lg border border-border bg-bg-card px-4 py-2.5 text-center text-lg tracking-[0.3em] text-white outline-none focus:border-border-strong"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="button"
          disabled={cargando}
          onClick={verificarCodigo}
          className="mt-2 rounded-full bg-white px-5 py-3 font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {cargando ? "Verificando..." : "Verificar código"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-300">
        Código verificado -- ahora elegí tu contraseña nueva.
      </p>

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
        disabled={cargando}
        onClick={guardarPassword}
        className="mt-2 rounded-full bg-white px-5 py-3 font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {cargando ? "Guardando..." : "Guardar contraseña"}
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
          </svg>
        )}
      </button>
    </div>
  );
}

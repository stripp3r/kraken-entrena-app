import { createAdminClient } from "@/lib/supabase/admin";
import { hoyISO } from "@/lib/fecha";
import { MESES_ACCESO_POR_COMPRA } from "@/lib/compras";
import { cancelarPreApproval } from "@/lib/mercadopago";
import { cancelarSuscripcionPaypal } from "@/lib/paypal";
import { cancelarGolden } from "@/lib/suscripciones";
import { rutinaIncluidaEnPlan } from "@/lib/premium";

// Funciones SERVER-ONLY para atender el BOTÓN DE ARREPENTIMIENTO y el BOTÓN DE
// BAJA DE SERVICIO (Disposición 954/2025). No hay pantalla ni ruta pública
// para esto: las invoca la automatización del coach (WhatsApp / otro Claude
// Code) importándolas directo o llamando a POST /api/admin/solicitudes con el
// secreto ADMIN_API_SECRET. Ver "Cumplimiento legal" en CLAUDE.md.
//
// Reglas de negocio (definidas por el coach, publicadas en /terminos):
// - Arrepentimiento: 14 días corridos desde la compra; dentro del plazo se
//   devuelve el 100%, fuera no hay reembolsos. NO se valida el plazo acá: lo
//   decide quien atiende; estas funciones solo ejecutan el efecto.
// - Baja de suscripción: se frena la renovación y el acceso sigue hasta el
//   final del período ya pagado (premium_hasta).
// - Los reembolsos se hacen A MANO desde el panel de cada proveedor (hoy no
//   hay reembolso por API en lib/mercadopago ni lib/paypal; ver CLAUDE.md).

export type TipoSolicitud = "arrepentimiento" | "baja";
export type MedioSolicitud = "whatsapp" | "email" | "app" | "web";
export type EstadoSolicitud = "recibida" | "codigo_enviado" | "procesada" | "rechazada";

const normalizarEmail = (email: string) => email.trim().toLowerCase();

// El `rpc` compara `email = p_email` a secas, así que siempre se le pasa el
// email en minúsculas (Supabase Auth los guarda así).
export async function buscarUsuarioPorEmail(email: string): Promise<string | null> {
  const { data } = await createAdminClient().rpc("buscar_usuario_por_email", {
    p_email: normalizarEmail(email),
  });
  return (data as string | null) ?? null;
}

// ---------- Registro de solicitudes ----------

// Crea el registro (fecha/hora, medio, contacto) y devuelve el código de
// identificación que hay que informarle a la persona dentro de las 24 h
// (ARR-2026-000123 / BAJ-2026-000123, lo arma un trigger de la base).
export async function registrarSolicitud({
  tipo,
  medio,
  contacto,
  emailCuenta,
  productoSlug,
  notas,
  extra,
}: {
  tipo: TipoSolicitud;
  medio: MedioSolicitud;
  contacto: string;
  emailCuenta?: string | null;
  productoSlug?: string | null;
  notas?: string | null;
  // Columnas del registro completo (migración 100): compra_id, suscripcion_id,
  // verificacion, ip_hash, numero_operacion.
  extra?: Record<string, unknown>;
}) {
  const { data, error } = await createAdminClient()
    .from("solicitudes_baja_arrepentimiento")
    // codigo vacío: el trigger asignar_codigo_solicitud lo completa.
    .insert({
      codigo: "",
      tipo,
      medio,
      contacto,
      email_cuenta: emailCuenta ? normalizarEmail(emailCuenta) : null,
      producto_slug: productoSlug ?? null,
      notas: notas ?? null,
      ...(extra ?? {}),
    })
    .select("codigo, recibida_at")
    .single();

  if (error || !data) return { error: error?.message ?? "No se pudo registrar la solicitud" };
  return { ok: true, codigo: data.codigo as string, recibidaAt: data.recibida_at as string };
}

// Cambia el estado de una solicitud. 'codigo_enviado' deja registrado cuándo
// se informó el código; 'procesada'/'rechazada' dejan la fecha de resolución.
export async function actualizarSolicitud(
  codigo: string,
  { estado, notas }: { estado: EstadoSolicitud; notas?: string | null }
) {
  const ahora = new Date().toISOString();
  const { data, error } = await createAdminClient()
    .from("solicitudes_baja_arrepentimiento")
    .update({
      estado,
      ...(estado === "codigo_enviado" ? { codigo_informado_at: ahora } : {}),
      ...(estado === "procesada" || estado === "rechazada" ? { resuelta_at: ahora } : {}),
      ...(notas != null ? { notas } : {}),
    })
    .eq("codigo", codigo)
    .select("codigo")
    .maybeSingle();

  if (error) return { error: error.message };
  if (!data) return { error: `No existe la solicitud ${codigo}` };
  return { ok: true };
}

// ---------- Baja de suscripción ----------

type ResultadoSub = {
  proveedor: string;
  suscripcionId: string;
  ok: boolean;
  yaEstabaCancelada?: boolean;
  error?: string;
};

// Cancela la/s suscripción/es activa/s o pausada/s de una cuenta EN EL
// PROVEEDOR (Mercado Pago preapproval / PayPal subscription) y la deja con
// estado 'cancelada' y `cancelada_al` = fin del período ya pagado
// (profiles.premium_hasta). NO corta el acceso: sigue hasta premium_hasta.
// No reembolsa: si la persona pidió la baja ANTES de la renovación y igual
// se le cobró, ese cobro se devuelve a mano desde el panel del proveedor.
export async function cancelarSuscripcion({
  email,
  suscripcionId,
}: {
  email?: string;
  suscripcionId?: number;
}) {
  const admin = createAdminClient();

  let consulta = admin
    .from("suscripciones")
    .select("id, user_id, proveedor, proveedor_sub_id, estado, proximo_cobro")
    .in("estado", ["activa", "pausada"]);

  let userId: string | null = null;
  if (suscripcionId != null) {
    consulta = consulta.eq("id", suscripcionId);
  } else if (email) {
    userId = await buscarUsuarioPorEmail(email);
    if (!userId) return { error: `No existe una cuenta con el email ${email}` };
    consulta = consulta.eq("user_id", userId);
  } else {
    return { error: "Falta email o suscripcionId" };
  }

  const { data: subs, error } = await consulta;
  if (error) return { error: error.message };
  if (!subs?.length) {
    return { error: "No hay ninguna suscripción activa o pausada para cancelar" };
  }

  const resultados: ResultadoSub[] = [];
  let accesoHasta: string | null = null;

  for (const sub of subs) {
    const base = { proveedor: sub.proveedor as string, suscripcionId: sub.proveedor_sub_id as string };
    try {
      let yaEstabaCancelada = false;
      try {
        if (sub.proveedor === "mercadopago") {
          await cancelarPreApproval(sub.proveedor_sub_id);
        } else {
          await cancelarSuscripcionPaypal(sub.proveedor_sub_id, "Baja pedida por el cliente");
        }
      } catch (e) {
        // Si el proveedor ya la tenía cancelada no es un error real: lo único
        // que falta es dejar la base consistente.
        const msg = e instanceof Error ? e.message : String(e);
        if (!/SUBSCRIPTION_STATUS_INVALID|already.*cancel|cancelled/i.test(msg)) throw e;
        yaEstabaCancelada = true;
      }

      await cancelarGolden(sub.proveedor, sub.proveedor_sub_id);

      // `cancelada_al` = fin del período pagado (premium_hasta), que es lo
      // que realmente manda el acceso en la app.
      const { data: perfil } = await admin
        .from("profiles")
        .select("premium_hasta")
        .eq("id", sub.user_id)
        .maybeSingle();
      accesoHasta = perfil?.premium_hasta ?? accesoHasta;
      if (perfil?.premium_hasta) {
        await admin
          .from("suscripciones")
          .update({ cancelada_al: perfil.premium_hasta })
          .eq("id", sub.id);
      }

      resultados.push({ ...base, ok: true, ...(yaEstabaCancelada ? { yaEstabaCancelada } : {}) });
    } catch (e) {
      resultados.push({ ...base, ok: false, error: e instanceof Error ? e.message : String(e) });
    }
  }

  const todasOk = resultados.every((r) => r.ok);
  return {
    ok: todasOk,
    resultados,
    accesoHasta,
    aviso:
      "El acceso NO se cortó: sigue hasta accesoHasta. Si la persona pidió la baja antes de la fecha de renovación y igual se le cobró, devolver ese cobro a mano desde el panel de Mercado Pago/PayPal.",
  };
}

// ---------- Arrepentimiento: revocar una compra ----------

function sumarMeses(fechaISO: string, meses: number): string {
  const d = new Date(`${fechaISO}T00:00:00-03:00`);
  d.setMonth(d.getMonth() + meses);
  return d.toISOString().slice(0, 10);
}

// Revoca la compra de un plan suelto: compras.estado = 'revocado' (con lo que
// el PDF deja de verse en la app), quita el acceso a las rutinas que daba ESA
// compra, y deshace el acceso a la app (premium_hasta/premium_origen) que
// dio, sin tocar nada que venga de Golden, mentoría, Founder u otra compra.
//
// Si la persona compró el mismo producto más de una vez, revoca la MÁS
// RECIENTE (o la que se indique con `compraId`). NO reembolsa: devuelve en
// `reembolsoManual` los datos del pago para hacerlo desde el panel del
// proveedor. No valida el plazo de 14 días: lo decide quien atiende.
//
// Limitación conocida: profile_routine_access no distingue "dada por una
// compra" de "dada a mano por el coach" -- si el cliente tenía la misma
// rutina asignada a mano además de comprarla, también se le quita.
export async function revocarCompra({
  email,
  productoSlug,
  compraId,
}: {
  email: string;
  productoSlug: string;
  compraId?: number;
}) {
  const admin = createAdminClient();
  const emailNorm = normalizarEmail(email);
  const userId = await buscarUsuarioPorEmail(emailNorm);

  const { data: producto } = await admin.from("productos").select("id").eq("slug", productoSlug).maybeSingle();
  if (!producto) return { error: `No existe el producto ${productoSlug}` };

  const { data: candidatas, error: errCompras } = await admin
    .from("compras")
    .select(
      "id, user_id, email_comprador, proveedor, proveedor_payment_id, monto, moneda, created_at, premium_aplicado, premium_previo_hasta, premium_previo_origen"
    )
    .eq("producto_id", producto.id)
    .eq("estado", "aprobado")
    .order("created_at", { ascending: false });
  if (errCompras) return { error: errCompras.message };

  const propias = (candidatas ?? []).filter(
    (c) => (userId && c.user_id === userId) || normalizarEmail(c.email_comprador) === emailNorm
  );
  const compra = compraId != null ? propias.find((c) => c.id === compraId) : propias[0];
  if (!compra) {
    return { error: `No hay una compra aprobada de ${productoSlug} para ${emailNorm}` };
  }

  const { error: errRevoca } = await admin
    .from("compras")
    .update({ estado: "revocado", revocada_at: new Date().toISOString() })
    .eq("id", compra.id);
  if (errRevoca) return { error: errRevoca.message };

  const resultado: {
    ok: true;
    compraId: number;
    reembolsoManual: { proveedor: string; pagoId: string; monto: number | null; moneda: string | null };
    cuentaEncontrada: boolean;
    rutinasQuitadas: number[];
    rutinaActivaLimpiada: boolean;
    premium: { antes: string | null; despues: string | null; origenAntes: string | null; origenDespues: string | null } | null;
    comprasAprobadasQueQuedan: number;
  } = {
    ok: true,
    compraId: compra.id,
    reembolsoManual: {
      proveedor: compra.proveedor,
      pagoId: compra.proveedor_payment_id,
      monto: compra.monto,
      moneda: compra.moneda,
    },
    cuentaEncontrada: false,
    rutinasQuitadas: [],
    rutinaActivaLimpiada: false,
    premium: null,
    comprasAprobadasQueQuedan: 0,
  };

  const destinatario = compra.user_id ?? userId;
  // Compra previa al registro y todavía sin reclamar: con estado 'revocado'
  // handle_new_user ya no la va a reclamar. No hay nada más que deshacer.
  if (!destinatario) return resultado;
  resultado.cuentaEncontrada = true;

  // Otras compras aprobadas de la misma persona: lo que ellas dan se conserva.
  const { data: otras } = await admin
    .from("compras")
    .select("id, producto_id")
    .eq("user_id", destinatario)
    .eq("estado", "aprobado");
  resultado.comprasAprobadasQueQuedan = otras?.length ?? 0;

  // --- Rutinas ---
  const { data: deEstaCompra } = await admin
    .from("producto_rutinas")
    .select("routine_id")
    .eq("producto_id", producto.id);
  const ids = (deEstaCompra ?? []).map((r) => r.routine_id as number);

  const productosQueQuedan = [...new Set((otras ?? []).map((o) => o.producto_id).filter((x): x is number => x != null))];
  const { data: deOtras } = productosQueQuedan.length
    ? await admin.from("producto_rutinas").select("routine_id").in("producto_id", productosQueQuedan)
    : { data: [] as { routine_id: number }[] };
  const seConservan = new Set((deOtras ?? []).map((r) => r.routine_id));
  const aQuitar = ids.filter((id) => !seConservan.has(id));

  if (aQuitar.length) {
    await admin.from("profile_routine_access").delete().eq("user_id", destinatario).in("routine_id", aQuitar);
    resultado.rutinasQuitadas = aQuitar;
  }

  // --- Acceso a la app (premium) ---
  const { data: perfil } = await admin
    .from("profiles")
    .select("premium_hasta, premium_origen, golden_perpetuo, modalidad_mentoria, routine_id")
    .eq("id", destinatario)
    .maybeSingle();

  let perfilFinal = perfil;
  // Solo se toca si el acceso actual sigue siendo "por compra": si ahora es
  // Golden/mentoría/Founder/perpetuo, ese acceso no depende de esta compra.
  if (perfil && !perfil.golden_perpetuo && perfil.premium_origen === "compra" && perfil.premium_hasta) {
    let nuevoHasta: string | null;
    let nuevoOrigen: string | null;

    if (resultado.comprasAprobadasQueQuedan > 0) {
      // Compras apiladas: cada una sumó MESES_ACCESO_POR_COMPRA al vencimiento.
      nuevoHasta = sumarMeses(perfil.premium_hasta, -MESES_ACCESO_POR_COMPRA);
      nuevoOrigen = "compra";
    } else if (compra.premium_aplicado) {
      nuevoHasta = compra.premium_previo_hasta;
      nuevoOrigen = compra.premium_previo_origen;
    } else {
      // Compra anterior al registro de "cómo estaba antes" (o reclamada por el
      // trigger handle_new_user): se resta lo que sumó. Si todavía queda
      // vigencia es de la prueba gratis, el único acceso no pago que existe.
      nuevoHasta = sumarMeses(perfil.premium_hasta, -MESES_ACCESO_POR_COMPRA);
      nuevoOrigen = nuevoHasta >= hoyISO() ? "trial" : "compra";
    }

    await admin
      .from("profiles")
      .update({ premium_hasta: nuevoHasta, premium_origen: nuevoOrigen })
      .eq("id", destinatario);

    resultado.premium = {
      antes: perfil.premium_hasta,
      despues: nuevoHasta,
      origenAntes: perfil.premium_origen,
      origenDespues: nuevoOrigen,
    };
    perfilFinal = { ...perfil, premium_hasta: nuevoHasta, premium_origen: nuevoOrigen };
  }

  // --- Rutina activa ---
  // Si la rutina activa era una de las quitadas y el plan que le queda no la
  // incluye por sí solo (Golden/Founder sí), se desactiva y se cierra su
  // período en el historial.
  if (perfilFinal?.routine_id && aQuitar.includes(perfilFinal.routine_id)) {
    const { data: rutina } = await admin
      .from("routines")
      .select("nombre, es_privada")
      .eq("id", perfilFinal.routine_id)
      .maybeSingle();

    if (rutina && !rutinaIncluidaEnPlan(perfilFinal, rutina)) {
      await admin.from("profiles").update({ routine_id: null }).eq("id", destinatario);
      await admin
        .from("profile_routine_history")
        .update({ fecha_fin: hoyISO() })
        .eq("user_id", destinatario)
        .eq("routine_id", perfilFinal.routine_id)
        .is("fecha_fin", null);
      resultado.rutinaActivaLimpiada = true;
    }
  }

  return resultado;
}

// ---------- Procesar una solicitud ya registrada ----------

// Ejecuta el efecto de una solicitud registrada, a partir de su código:
// - baja: cancela la/s suscripción/es activa/s de la cuenta (el acceso sigue
//   hasta el fin del período pagado);
// - arrepentimiento: revoca la compra asociada (quita acceso) y deja una tarea
//   de reembolso manual con los datos del pago.
// Marca la solicitud como 'procesada'. NO valida el plazo (el coach nunca invoca
// la excepción del art. 3 inc. b: reembolso total dentro del plazo siempre).
export async function procesarSolicitud(codigo: string) {
  const admin = createAdminClient();
  const { data: sol } = await admin
    .from("solicitudes_baja_arrepentimiento")
    .select("codigo, tipo, email_cuenta, producto_slug, compra_id, estado")
    .eq("codigo", codigo)
    .maybeSingle();
  if (!sol) return { error: `No existe la solicitud ${codigo}` };
  if (sol.estado === "procesada") return { ok: true, yaProcesada: true };
  if (!sol.email_cuenta) return { error: "La solicitud no tiene email de cuenta: resolverla a mano." };

  let efecto: Record<string, unknown>;
  if (sol.tipo === "baja") {
    efecto = await cancelarSuscripcion({ email: sol.email_cuenta });
  } else {
    let slug = sol.producto_slug as string | null;
    if (!slug && sol.compra_id) {
      const { data: c } = await admin.from("compras").select("producto_id").eq("id", sol.compra_id).maybeSingle();
      if (c?.producto_id) {
        const { data: pr } = await admin.from("productos").select("slug").eq("id", c.producto_id).maybeSingle();
        slug = (pr?.slug as string | undefined) ?? null;
      }
    }
    if (!slug) return { error: "No se sabe qué producto revocar: indicar producto o resolver a mano." };
    efecto = await revocarCompra({
      email: sol.email_cuenta,
      productoSlug: slug,
      compraId: sol.compra_id ?? undefined,
    });
    if (!efecto.error) {
      const r = efecto as { compraId?: number; reembolsoManual?: { proveedor: string; pagoId: string; monto: number | null; moneda: string | null } };
      await admin.from("tareas_reembolso").insert({
        origen_ref: `solicitud:${sol.codigo}`,
        motivo: `Arrepentimiento ${sol.codigo}: reembolso del 100%.`,
        proveedor: r.reembolsoManual?.proveedor ?? null,
        proveedor_payment_id: r.reembolsoManual?.pagoId ?? null,
        email: sol.email_cuenta,
        monto: r.reembolsoManual?.monto ?? null,
        moneda: r.reembolsoManual?.moneda ?? null,
        solicitud_codigo: sol.codigo,
      });
    }
  }

  if (efecto.error) return { error: String(efecto.error), efecto };
  await actualizarSolicitud(codigo, { estado: "procesada" });
  return { ok: true, efecto };
}

// Registra que el reembolso de una solicitud (o de una tarea) ya se hizo a mano
// en el panel del proveedor, cierra la tarea y avisa a la persona por email.
export async function registrarReembolsoHecho({
  codigo,
  tareaId,
  fecha,
  importe,
  moneda,
  referencia,
}: {
  codigo?: string;
  tareaId?: number;
  fecha?: string;
  importe: number;
  moneda: string;
  referencia?: string;
}) {
  const admin = createAdminClient();
  const dia = fecha ?? hoyISO();

  let cod = codigo ?? null;
  let email: string | null = null;
  if (tareaId != null) {
    const { data: t } = await admin.from("tareas_reembolso").select("solicitud_codigo, email").eq("id", tareaId).maybeSingle();
    if (!t) return { error: `No existe la tarea ${tareaId}` };
    cod = cod ?? (t.solicitud_codigo as string | null);
    email = t.email as string | null;
    await admin
      .from("tareas_reembolso")
      .update({ estado: "hecha", resuelta_at: new Date().toISOString(), notas: referencia ?? null })
      .eq("id", tareaId);
  }
  if (cod) {
    const { data: s } = await admin
      .from("solicitudes_baja_arrepentimiento")
      .update({ reembolso_fecha: dia, reembolso_importe: importe, reembolso_moneda: moneda, reembolso_referencia: referencia ?? null })
      .eq("codigo", cod)
      .select("email_cuenta, producto_slug")
      .maybeSingle();
    email = email ?? ((s?.email_cuenta as string | null) ?? null);
    await admin
      .from("tareas_reembolso")
      .update({ estado: "hecha", resuelta_at: new Date().toISOString() })
      .eq("solicitud_codigo", cod)
      .eq("estado", "pendiente");
    if (s?.producto_slug) {
      await admin
        .from("compras")
        .update({ reembolsada_at: new Date().toISOString(), reembolso_referencia: referencia ?? null })
        .eq("estado", "revocado")
        .is("reembolsada_at", null)
        .eq("email_comprador", (email ?? "").trim().toLowerCase());
    }
  }
  if (!cod && tareaId == null) return { error: "Falta codigo o tareaId" };

  if (email && cod) {
    const { reembolsoRealizado, importeLegible } = await import("@/lib/emails-plantillas");
    const { enviarEmail } = await import("@/lib/email");
    await enviarEmail({
      tipo: "reembolso",
      ref: `${cod}:${referencia ?? dia}`,
      para: email,
      ...reembolsoRealizado({ codigo: cod, importe: importeLegible(importe, moneda), referencia: referencia ?? null }),
    });
  }
  return { ok: true };
}

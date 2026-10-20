import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/back-link";
import { GateSalud } from "@/components/gate-salud";
import { ProgresoGlobal } from "@/components/progreso-global";
import { esUsuarioDePrototipos } from "@/lib/prototipos";
import { demoGlobal, medidasDemo } from "@/lib/progreso-demo";
import { modalidadValida } from "@/lib/carga";
import { fechaISO } from "@/lib/fecha";
import type { EjercicioGlobal, LogCrudo } from "@/lib/progreso-global";
import type { FilaMedida } from "@/lib/progreso-simple";
import type { Sexo } from "@/lib/estandares-fuerza";

// PROTOTIPO: panel global de progreso ("¿progresé?", constancia, equilibrio). Solo cuentas de
// lib/prototipos.ts. ?demo=1 muestra 16 semanas de datos de demostración.
export default async function ProgresoPruebaPage({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  const { demo } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!esUsuarioDePrototipos(user.email)) redirect("/");

  let ejercicios: EjercicioGlobal[];
  let medidas: FilaMedida[];
  let perfil: { sexo: Sexo | null; pesoCorporal: number | null };
  if (demo === "1") {
    const d = demoGlobal();
    ejercicios = d.ejercicios;
    perfil = d.perfil;
    medidas = medidasDemo();
  } else {
    // Supabase devuelve como mucho 1000 filas por pedido: se pagina.
    const filas: {
      id: number;
      exercise_definition_id: number;
      peso: number | null;
      reps: number | null;
      rir: number | null;
      lastre: number | null;
      peso_corporal_ref: number | null;
      tipo_serie: "normal" | "dropset" | "drop";
      drop_de: number | null;
      created_at: string;
      exercise_definitions: { nombre: string; grupos_musculares: string[] | null; modalidad_carga: string | null } | { nombre: string; grupos_musculares: string[] | null; modalidad_carga: string | null }[] | null;
    }[] = [];
    for (let desde = 0; ; desde += 1000) {
      const { data } = await supabase
        .from("workout_logs")
        .select("id, exercise_definition_id, peso, reps, rir, lastre, peso_corporal_ref, tipo_serie, drop_de, created_at, exercise_definitions(nombre, grupos_musculares, modalidad_carga)")
        .eq("user_id", user.id)
        .not("exercise_definition_id", "is", null)
        .order("created_at", { ascending: true })
        .range(desde, desde + 999);
      filas.push(...(data ?? []));
      if (!data || data.length < 1000) break;
    }
    const [{ data: med }, { data: prof }] = await Promise.all([
      supabase.from("body_measurements").select("fecha, peso, cintura, caderas, pecho, brazo, muslos").eq("user_id", user.id),
      supabase.from("profiles").select("sexo").eq("id", user.id).single(),
    ]);
    const por = new Map<number, EjercicioGlobal>();
    for (const l of filas) {
      const def = Array.isArray(l.exercise_definitions) ? l.exercise_definitions[0] : l.exercise_definitions;
      const id = l.exercise_definition_id;
      if (!por.has(id)) por.set(id, { id, nombre: def?.nombre ?? "Ejercicio", grupos: def?.grupos_musculares ?? [], modalidad: modalidadValida(def?.modalidad_carga), logs: [] });
      por.get(id)!.logs.push({ id: l.id, peso: l.peso, reps: l.reps, rir: l.rir, tipo_serie: l.tipo_serie, drop_de: l.drop_de, created_at: l.created_at, lastre: l.lastre, peso_corporal_ref: l.peso_corporal_ref } as LogCrudo);
    }
    ejercicios = [...por.values()];
    medidas = (med ?? []) as FilaMedida[];
    const conPeso = [...medidas].filter((m) => typeof m.peso === "number" && (m.peso as number) > 0).sort((a, b) => b.fecha.localeCompare(a.fecha));
    perfil = { sexo: prof?.sexo === "masculino" || prof?.sexo === "femenino" ? prof.sexo : null, pesoCorporal: conPeso.length ? (conPeso[0].peso as number) : null };
  }

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-10">
      <GateSalud volverA="/" />
      <div className="w-full max-w-sm">
        <div className="relative mb-2">
          <BackLink href="/" />
          <h1 className="text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">TU PROGRESO</h1>
        </div>
        <p className="mb-4 text-center text-xs text-gray-500">Prototipo de prueba{demo === "1" ? " · datos de demostración" : ""} · deslizá para ver la segunda pantalla</p>
        <ProgresoGlobal ejercicios={ejercicios} medidas={medidas} perfil={perfil} hoy={fechaISO(new Date())} />
      </div>
    </main>
  );
}

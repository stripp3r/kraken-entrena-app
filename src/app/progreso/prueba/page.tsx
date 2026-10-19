import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/back-link";
import { GateSalud } from "@/components/gate-salud";
import { ProgresoSimple, type EjercicioProgreso } from "@/components/progreso-simple";
import { esUsuarioDePrototipos } from "@/lib/prototipos";
import { ejerciciosDemo, medidasDemo } from "@/lib/progreso-demo";
import { adaptarPesoCorporal, type FilaMedida, type LogSerie } from "@/lib/progreso-simple";
import { factorPesoCorporal, modalidadValida, type ModalidadCarga } from "@/lib/carga";

// PROTOTIPO: "Tu progreso en simple". Solo cuentas de lib/prototipos.ts.
// ?demo=1 muestra datos de demostración con un caso de cada tipo.
export default async function ProgresoPruebaPage({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  const { demo } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!esUsuarioDePrototipos(user.email)) redirect("/");

  let ejercicios: EjercicioProgreso[];
  let medidas: FilaMedida[];
  if (demo === "1") {
    ejercicios = ejerciciosDemo();
    medidas = medidasDemo();
  } else {
    const [{ data: logs }, { data: filas }] = await Promise.all([
      supabase
        .from("workout_logs")
        .select("id, exercise_definition_id, peso, reps, rir, lastre, peso_corporal_ref, tipo_serie, drop_de, created_at, exercise_definitions(nombre, grupos_musculares, modalidad_carga)")
        .eq("user_id", user.id)
        .not("exercise_definition_id", "is", null)
        .order("created_at", { ascending: true })
        .limit(5000),
      supabase.from("body_measurements").select("fecha, peso, cintura, caderas, pecho, brazo, muslos").eq("user_id", user.id),
    ]);
    const por = new Map<number, EjercicioProgreso & { id: number; modalidad: ModalidadCarga; crudos: Parameters<typeof adaptarPesoCorporal>[0] }>();
    for (const l of logs ?? []) {
      const def = Array.isArray(l.exercise_definitions) ? l.exercise_definitions[0] : l.exercise_definitions;
      const id = l.exercise_definition_id as number;
      if (!por.has(id)) por.set(id, { id, modalidad: modalidadValida(def?.modalidad_carga), nombre: def?.nombre ?? "Ejercicio", grupos: def?.grupos_musculares ?? [], logs: [], crudos: [] });
      por.get(id)!.crudos.push({ id: l.id, peso: l.peso, reps: l.reps, rir: l.rir, lastre: l.lastre, peso_corporal_ref: l.peso_corporal_ref, tipo_serie: l.tipo_serie, drop_de: l.drop_de, created_at: l.created_at });
    }
    ejercicios = [...por.values()].map((e) => {
      // Peso corporal: lastre sobre una base fija; banda y tiempo: solo repeticiones.
      if (e.modalidad === "peso_corporal") {
        const { logs: ls, base } = adaptarPesoCorporal(e.crudos, factorPesoCorporal(e.id));
        return { nombre: e.nombre, grupos: e.grupos, logs: ls, base };
      }
      const ls = e.crudos.map((c) => ({ ...c, peso: e.modalidad === "con_peso" ? c.peso : null }));
      return { nombre: e.nombre, grupos: e.grupos, logs: ls as LogSerie[] };
    });
    medidas = (filas ?? []) as FilaMedida[];
  }

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <GateSalud volverA="/" />
      <div className="w-full max-w-sm">
        <div className="relative mb-2">
          <BackLink href="/" />
          <h1 className="text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">TU PROGRESO</h1>
        </div>
        <p className="mb-5 text-center text-xs text-gray-500">Prototipo de prueba{demo === "1" ? " · datos de demostración" : ""}</p>
        <ProgresoSimple ejercicios={ejercicios} medidas={medidas} hoy={new Date().toISOString().slice(0, 10)} />
      </div>
    </main>
  );
}

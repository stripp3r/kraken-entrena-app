import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EvolucionUploader } from "@/components/evolucion-uploader";
import { BorrarFotoBoton } from "@/components/borrar-foto-boton";

export default async function EvolucionPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: fotos } = await supabase
    .from("progress_photos")
    .select("id, fecha, tipo, storage_path")
    .eq("user_id", user.id)
    .order("fecha", { ascending: false });

  const porFecha = new Map<string, { id: number; tipo: string; url: string | null; storage_path: string }[]>();

  for (const foto of fotos ?? []) {
    const { data: signed } = await supabase.storage
      .from("progress-photos")
      .createSignedUrl(foto.storage_path, 3600);

    const lista = porFecha.get(foto.fecha) ?? [];
    lista.push({
      id: foto.id,
      tipo: foto.tipo,
      url: signed?.signedUrl ?? null,
      storage_path: foto.storage_path,
    });
    porFecha.set(foto.fecha, lista);
  }

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-center font-[family-name:var(--font-display)] text-4xl tracking-wide text-white">
          EVOLUCIÓN
        </h1>
        <p className="mb-6 text-center text-sm text-gray-500">
          Fotos de antes/después, frontal y lateral. Es opcional y privado —
          solo vos las ves.
        </p>

        <div className="flex flex-col gap-4">
          <EvolucionUploader />

          {[...porFecha.entries()].map(([fecha, fotosDia]) => (
            <div key={fecha} className="rounded-lg border border-border bg-bg-card p-4">
              <p className="mb-3 text-sm text-white">{fecha}</p>
              <div className="grid grid-cols-2 gap-3">
                {["frontal", "lateral"].map((tipo) => {
                  const foto = fotosDia.find((f) => f.tipo === tipo);
                  return (
                    <div key={tipo} className="flex flex-col gap-1.5">
                      <div className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded-md bg-bg">
                        {foto?.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={foto.url}
                            alt={tipo}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-xs text-gray-600">—</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase text-gray-500">{tipo}</span>
                        {foto && (
                          <BorrarFotoBoton id={foto.id} storagePath={foto.storage_path} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <Link
          href="/perfil"
          className="mt-8 block text-center text-sm text-gray-500 underline"
        >
          Volver a Perfil
        </Link>
      </div>
    </main>
  );
}

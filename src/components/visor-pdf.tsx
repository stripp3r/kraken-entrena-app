"use client";

import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";

const ZOOMS = [1, 1.5, 2];

type Pagina = { ancho: number; alto: number };

// Visor de solo lectura de un PDF (pdf.js sobre <canvas>): sin barra del
// visor nativo, sin botón de descargar ni imprimir, sin menú contextual y con
// una marca de agua con el email del usuario dibujada DENTRO de cada página.
// Los bytes vienen de una ruta que exige sesión + compra aprobada (ver
// perfil/recursos/[producto]/pdf/route.ts). No impide una captura de
// pantalla: es un disuasivo, no un blindaje (ver CLAUDE.md).
export function VisorPdf({ src, marcaDeAgua }: { src: string; marcaDeAgua: string }) {
  const contenedor = useRef<HTMLDivElement>(null);
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [paginas, setPaginas] = useState<Pagina[]>([]);
  const [anchoBase, setAnchoBase] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [estado, setEstado] = useState<"cargando" | "listo" | "error">("cargando");

  // 1) Descarga el archivo a memoria y lo abre con pdf.js.
  useEffect(() => {
    let cancelado = false;
    let tareaCarga: { destroy: () => Promise<void> } | null = null;

    async function abrir() {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url
        ).toString();

        const res = await fetch(src, { cache: "no-store", credentials: "same-origin" });
        if (!res.ok) throw new Error(String(res.status));
        const datos = new Uint8Array(await res.arrayBuffer());

        const carga = pdfjs.getDocument({ data: datos });
        tareaCarga = carga;
        const abierto = await carga.promise;
        if (cancelado) {
          carga.destroy();
          return;
        }

        const medidas: Pagina[] = [];
        for (let i = 1; i <= abierto.numPages; i++) {
          const v = (await abierto.getPage(i)).getViewport({ scale: 1 });
          medidas.push({ ancho: v.width, alto: v.height });
        }
        if (cancelado) return;

        setPaginas(medidas);
        setDoc(abierto);
        setEstado("listo");
      } catch {
        if (!cancelado) setEstado("error");
      }
    }

    abrir();
    return () => {
      cancelado = true;
      tareaCarga?.destroy();
    };
  }, [src]);

  // 2) Ancho disponible (para que cada página ocupe todo el ancho en zoom 1).
  useEffect(() => {
    const el = contenedor.current;
    if (!el) return;
    const medir = () => setAnchoBase(el.clientWidth);
    medir();
    const obs = new ResizeObserver(medir);
    obs.observe(el);
    return () => obs.disconnect();
  }, [estado]);

  // 3) Sin atajos de guardar/imprimir mientras el visor está abierto.
  useEffect(() => {
    function bloquear(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && ["s", "p"].includes(e.key.toLowerCase())) e.preventDefault();
    }
    window.addEventListener("keydown", bloquear);
    return () => window.removeEventListener("keydown", bloquear);
  }, []);

  if (estado === "error") {
    return (
      <p className="rounded-lg border border-border bg-bg-card px-5 py-6 text-center text-sm text-red-400">
        No pudimos abrir el PDF. Volvé a intentar en un momento.
      </p>
    );
  }

  return (
    <div className="visor-pdf" onContextMenu={(e) => e.preventDefault()} onDragStart={(e) => e.preventDefault()}>
      <div className="mb-3 flex items-center justify-between text-xs text-gray-500">
        <span>Solo lectura dentro de la app</span>
        <span className="flex items-center gap-1">
          {ZOOMS.map((z) => (
            <button
              key={z}
              type="button"
              onClick={() => setZoom(z)}
              className={`rounded-full px-2.5 py-1 ${zoom === z ? "bg-white text-black" : "bg-bg-card text-gray-400"}`}
            >
              {z * 100}%
            </button>
          ))}
        </span>
      </div>

      <div ref={contenedor} className="overflow-x-auto">
        {estado === "cargando" && <p className="py-10 text-center text-sm text-gray-500">Cargando PDF…</p>}
        {doc && anchoBase > 0 && (
          <div className="flex flex-col gap-3" style={{ width: anchoBase * zoom }}>
            {paginas.map((p, i) => (
              <PaginaPdf
                key={`${i}-${zoom}-${anchoBase}`}
                doc={doc}
                numero={i + 1}
                ancho={anchoBase * zoom}
                alto={(p.alto / p.ancho) * anchoBase * zoom}
                marcaDeAgua={marcaDeAgua}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

type Enlace = { url: string; left: number; top: number; width: number; height: number };

// Una página: reserva su alto de entrada y recién la dibuja cuando se acerca
// a la pantalla (los PDFs de plan pueden tener decenas de páginas).
function PaginaPdf({
  doc,
  numero,
  ancho,
  alto,
  marcaDeAgua,
}: {
  doc: PDFDocumentProxy;
  numero: number;
  ancho: number;
  alto: number;
  marcaDeAgua: string;
}) {
  const caja = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [enlaces, setEnlaces] = useState<Enlace[]>([]);

  useEffect(() => {
    const el = caja.current;
    if (!el) return;
    let cancelado = false;
    let tarea: { cancel: () => void } | null = null;

    async function dibujar() {
      const pagina = await doc.getPage(numero);
      if (cancelado || !canvas.current) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const base = pagina.getViewport({ scale: 1 });
      const escala = ancho / base.width;
      const viewport = pagina.getViewport({ scale: escala * dpr });
      const c = canvas.current;
      c.width = Math.floor(viewport.width);
      c.height = Math.floor(viewport.height);

      const render = pagina.render({ canvas: c, viewport });
      tarea = render;
      await render.promise;
      if (cancelado) return;

      marcarAgua(c, marcaDeAgua);

      // Los links del PDF (ej. videos de Drive) siguen siendo clickeables:
      // se superponen como <a> sobre el canvas. Apuntan a URLs externas, no
      // al archivo.
      const vista = pagina.getViewport({ scale: escala });
      const anotaciones = await pagina.getAnnotations();
      if (cancelado) return;
      setEnlaces(
        anotaciones
          .filter((a: { subtype?: string; url?: string }) => a.subtype === "Link" && a.url)
          .map((a: { url: string; rect: number[] }) => {
            const [x1, y1] = vista.convertToViewportPoint(a.rect[0], a.rect[1]);
            const [x2, y2] = vista.convertToViewportPoint(a.rect[2], a.rect[3]);
            return {
              url: a.url,
              left: Math.min(x1, x2),
              top: Math.min(y1, y2),
              width: Math.abs(x2 - x1),
              height: Math.abs(y2 - y1),
            };
          })
      );
    }

    const obs = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          obs.disconnect();
          dibujar().catch(() => {});
        }
      },
      { rootMargin: "800px 0px" }
    );
    obs.observe(el);

    return () => {
      cancelado = true;
      obs.disconnect();
      tarea?.cancel();
    };
  }, [doc, numero, ancho, marcaDeAgua]);

  return (
    <div ref={caja} className="relative overflow-hidden bg-white" style={{ width: ancho, height: alto }}>
      <canvas ref={canvas} className="block h-full w-full select-none" style={{ pointerEvents: "none" }} />
      {enlaces.map((e, i) => (
        <a
          key={i}
          href={e.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Abrir enlace"
          className="absolute"
          style={{ left: e.left, top: e.top, width: e.width, height: e.height }}
        />
      ))}
    </div>
  );
}

// Marca de agua con el email del usuario, en mosaico y en diagonal, dibujada
// sobre los píxeles de la página (no es un elemento que se pueda borrar desde
// el inspector). Gris medio y baja opacidad: se ve sobre fondo claro y oscuro
// sin tapar la lectura.
function marcarAgua(canvas: HTMLCanvasElement, texto: string) {
  if (!texto) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const lado = Math.min(canvas.width, canvas.height);
  const tamano = Math.max(14, Math.round(lado * 0.035));

  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.fillStyle = "#808080";
  ctx.font = `${tamano}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(-Math.PI / 6);

  const pasoX = Math.max(ctx.measureText(texto).width * 1.6, tamano * 8);
  const pasoY = tamano * 7;
  const radio = Math.hypot(canvas.width, canvas.height) / 2;
  for (let y = -radio; y <= radio; y += pasoY) {
    for (let x = -radio; x <= radio; x += pasoX) {
      ctx.fillText(texto, x, y);
    }
  }
  ctx.restore();
}

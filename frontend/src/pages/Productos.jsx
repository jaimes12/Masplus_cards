import { useEffect, useState } from 'react'
import { ArrowDown, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react'
import { api } from '../lib/api.js'

/**
 * Catálogo público minimalista (/productos). A propósito no comparte la navegación de la
 * landing: es otra línea de negocio y vive sola — fondo claro, mucho aire, solo producto.
 */

function fmtPrecio(n) {
  return `$${Number(n).toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

/** Carrusel de fotos/videos del producto: flechas + puntos, un medio a la vez. */
function MediaCarrusel({ medias, nombre }) {
  const [idx, setIdx] = useState(0)
  const total = medias.length

  if (total === 0) {
    return <div className="aspect-square w-full rounded-2xl bg-zinc-100" aria-hidden />
  }

  const media = medias[Math.min(idx, total - 1)]

  return (
    <div className="group relative aspect-square w-full overflow-hidden rounded-2xl bg-zinc-100">
      {media.tipo === 'video' ? (
        <video
          key={media.url}
          src={media.url}
          className="h-full w-full object-cover"
          controls
          playsInline
          preload="metadata"
        />
      ) : (
        <img src={media.url} alt={nombre} loading="lazy" className="h-full w-full object-cover" />
      )}

      {total > 1 && (
        <>
          <button
            type="button"
            aria-label="Anterior"
            onClick={() => setIdx((i) => (i - 1 + total) % total)}
            className="absolute left-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-zinc-700 shadow-sm transition-opacity hover:bg-white sm:opacity-0 sm:group-hover:opacity-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Siguiente"
            onClick={() => setIdx((i) => (i + 1) % total)}
            className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-zinc-700 shadow-sm transition-opacity hover:bg-white sm:opacity-0 sm:group-hover:opacity-100"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {medias.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Ir al medio ${i + 1}`}
                onClick={() => setIdx(i)}
                className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-5 bg-white' : 'w-1.5 bg-white/60'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/** Cinta en movimiento estilo tienda editorial: refuerza la propuesta sin ocupar atención. */
function Ticker() {
  const frases = ['Hecho a mano', 'Piezas limitadas', 'Envíos a todo México', 'Diseño propio']
  const fila = frases.map((f, i) => (
    <span key={i} className="mx-6 inline-flex items-center gap-6 text-xs font-medium uppercase tracking-[0.25em] text-zinc-400">
      {f} <span className="text-zinc-300">·</span>
    </span>
  ))
  return (
    <div className="overflow-hidden border-y border-zinc-100 py-3">
      <div className="marquee-pausable flex w-max animate-marquee-slow">
        {fila}
        {fila}
        {fila}
        {fila}
      </div>
    </div>
  )
}

/** Banner editorial con la pieza destacada (la primera del catálogo con foto). */
function Banner({ producto }) {
  const foto = producto?.medias.find((m) => m.tipo === 'imagen')
  if (!producto || !foto) return null
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="grid overflow-hidden rounded-3xl bg-zinc-900 text-white sm:grid-cols-2">
        <div className="flex flex-col justify-center gap-4 p-8 sm:p-12">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-zinc-400">Pieza destacada</p>
          <h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{producto.nombre}</h2>
          {producto.descripcion && (
            <p className="max-w-sm text-sm leading-relaxed text-zinc-400">{producto.descripcion}</p>
          )}
          <div className="mt-2 flex items-center gap-4">
            <a
              href="#catalogo"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-200"
            >
              Ver piezas <ArrowDown className="h-4 w-4" />
            </a>
            <p className="text-lg font-semibold tabular-nums">{fmtPrecio(producto.precio)}</p>
          </div>
        </div>
        <div className="relative min-h-[260px] sm:min-h-[380px]">
          <img src={foto.url} alt={producto.nombre} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-900/30 to-transparent sm:from-zinc-900/50" />
        </div>
      </div>
    </section>
  )
}

export default function Productos() {
  const [catalogo, setCatalogo] = useState(null)
  const [categoriaId, setCategoriaId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'Catálogo'
    api
      .get('/api/productos')
      .then(setCatalogo)
      .catch((err) => setError(err.message))
    return () => {
      document.title = 'Masplus Cards'
    }
  }, [])

  if (error) return <p className="p-10 text-center text-sm text-zinc-500">{error}</p>
  if (!catalogo) return <p className="p-10 text-center text-sm text-zinc-400">Cargando...</p>

  const productos = categoriaId
    ? catalogo.productos.filter((p) => p.categoriaId === categoriaId)
    : catalogo.productos
  const destacado = catalogo.productos.find((p) => p.medias.some((m) => m.tipo === 'imagen'))

  return (
    <div className="min-h-svh bg-white text-zinc-900">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 pb-4 pt-8 sm:px-6 sm:pt-10">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-400">Catálogo</p>
        <a href="#catalogo" className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-400 hover:text-zinc-900">
          Piezas
        </a>
      </header>

      {/* Hero tipográfico, escala fluida para que luzca igual en celular y desktop */}
      <section className="mx-auto max-w-6xl px-4 pb-12 pt-6 sm:px-6 sm:pb-16 sm:pt-10">
        <h1
          className="font-semibold leading-[1.02] tracking-tight"
          style={{ fontSize: 'clamp(2.5rem, 7vw, 4.75rem)' }}
        >
          Piezas únicas,
          <br />
          <span className="text-zinc-300">hechas con detalle.</span>
        </h1>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-zinc-500 sm:text-base">
          Objetos de diseño para espacios con personalidad. Cada pieza se produce bajo pedido, con
          acabados cuidados y materiales ligeros.
        </p>
      </section>

      <Ticker />

      <main className="space-y-14 pb-24 pt-12 sm:space-y-20 sm:pt-16">
        <Banner producto={destacado} />

        <section id="catalogo" className="mx-auto max-w-6xl scroll-mt-10 px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight">Todas las piezas</h2>
            {catalogo.categorias.length > 1 && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setCategoriaId(null)}
                  className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                    categoriaId === null
                      ? 'border-zinc-900 bg-zinc-900 text-white'
                      : 'border-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  Todo
                </button>
                {catalogo.categorias.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategoriaId(c.id)}
                    className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                      categoriaId === c.id
                        ? 'border-zinc-900 bg-zinc-900 text-white'
                        : 'border-zinc-200 hover:border-zinc-400'
                    }`}
                  >
                    {c.nombre}
                  </button>
                ))}
              </div>
            )}
          </div>

          {productos.length === 0 ? (
            <p className="mt-16 text-center text-sm text-zinc-400">Pronto habrá piezas nuevas por aquí.</p>
          ) : (
            <div className="mt-8 grid gap-x-5 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3">
            {productos.map((p) => (
              <article key={p.id}>
                <MediaCarrusel medias={p.medias} nombre={p.nombre} />
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-medium">{p.nombre}</h2>
                    {p.categoriaNombre && (
                      <p className="mt-0.5 text-xs uppercase tracking-wide text-zinc-400">{p.categoriaNombre}</p>
                    )}
                  </div>
                  <p className="shrink-0 font-semibold tabular-nums">{fmtPrecio(p.precio)}</p>
                </div>
                {p.descripcion && <p className="mt-2 text-sm leading-relaxed text-zinc-500">{p.descripcion}</p>}
                {p.linkCompra && (
                  <a
                    href={p.linkCompra}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700"
                  >
                    <ShoppingBag className="h-4 w-4" /> Comprar
                  </a>
                )}
              </article>
            ))}
          </div>
          )}
        </section>

        {/* Banda de cierre, mismo lenguaje editorial */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="rounded-3xl border border-zinc-100 bg-zinc-50 p-8 text-center sm:p-14">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-zinc-400">Hecho bajo pedido</p>
            <h2 className="mx-auto mt-3 max-w-lg text-2xl font-semibold tracking-tight sm:text-3xl">
              Cada pieza se fabrica cuando la pides — nada de producción en masa.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-zinc-500">
              ¿Buscas un color o tamaño especial? Escríbenos y lo hacemos a tu medida.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-100 py-8">
        <p className="text-center text-xs uppercase tracking-[0.25em] text-zinc-300">
          © {new Date().getFullYear()} · Hecho en México
        </p>
      </footer>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react'
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

  return (
    <div className="min-h-svh bg-white text-zinc-900">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 pb-4 pt-10">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-400">Catálogo</p>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-24">
        <h1 className="text-4xl font-semibold tracking-tight">Piezas únicas,
          <br />
          <span className="text-zinc-400">hechas con detalle.</span>
        </h1>

        {catalogo.categorias.length > 1 && (
          <div className="mt-8 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategoriaId(null)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                categoriaId === null ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 hover:border-zinc-400'
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
                  categoriaId === c.id ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 hover:border-zinc-400'
                }`}
              >
                {c.nombre}
              </button>
            ))}
          </div>
        )}

        {productos.length === 0 ? (
          <p className="mt-16 text-center text-sm text-zinc-400">Pronto habrá piezas nuevas por aquí.</p>
        ) : (
          <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
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
      </main>
    </div>
  )
}

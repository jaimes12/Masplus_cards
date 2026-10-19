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
            className="absolute left-1.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-zinc-700 shadow-sm transition-opacity hover:bg-white sm:left-2 sm:h-9 sm:w-9 sm:opacity-0 sm:group-hover:opacity-100"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <button
            type="button"
            aria-label="Siguiente"
            onClick={() => setIdx((i) => (i + 1) % total)}
            className="absolute right-1.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-zinc-700 shadow-sm transition-opacity hover:bg-white sm:right-2 sm:h-9 sm:w-9 sm:opacity-0 sm:group-hover:opacity-100"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
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

/** Carrusel de banners administrados desde el panel: rotan solos cada 5 s. */
function BannersCarrusel({ banners }) {
  const [idx, setIdx] = useState(0)
  const total = banners.length

  useEffect(() => {
    if (total < 2) return
    const t = setInterval(() => setIdx((i) => (i + 1) % total), 5000)
    return () => clearInterval(t)
  }, [total])

  if (total === 0) return null
  const b = banners[Math.min(idx, total - 1)]

  const contenido = (
    <>
      <img src={b.imagenUrl} alt={b.titulo || 'Banner'} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      {(b.titulo || b.subtitulo) && (
        <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-10">
          {b.titulo && (
            <h2 className="text-2xl font-semibold leading-tight tracking-tight sm:text-4xl">{b.titulo}</h2>
          )}
          {b.subtitulo && <p className="mt-1 max-w-lg text-sm text-white/80 sm:text-base">{b.subtitulo}</p>}
        </div>
      )}
    </>
  )

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="relative h-[300px] overflow-hidden rounded-3xl bg-zinc-100 sm:h-[420px]">
        {b.link ? (
          <a href={b.link} target={b.link.startsWith('/') ? '_self' : '_blank'} rel="noreferrer" className="absolute inset-0">
            {contenido}
          </a>
        ) : (
          contenido
        )}
        {total > 1 && (
          <div className="absolute bottom-4 right-5 flex gap-1.5 sm:bottom-6 sm:right-8">
            {banners.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Banner ${i + 1}`}
                onClick={() => setIdx(i)}
                className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
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
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 pb-4 pt-8 sm:px-6 sm:pt-10">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-400">Catálogo</p>
        <a href="#catalogo" className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-400 hover:text-zinc-900">
          Piezas
        </a>
      </header>

      <div className="space-y-8 pb-10 pt-2 sm:space-y-10 sm:pb-12">
        <BannersCarrusel banners={catalogo.banners} />
      </div>

      <Ticker />

      <main className="space-y-14 pb-24 pt-12 sm:space-y-20 sm:pt-16">
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
            // 2 columnas también en celular (estilo marketplace): compacto en móvil, con aire desde tablet.
            <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3">
            {productos.map((p) => (
              <article key={p.id}>
                <MediaCarrusel medias={p.medias} nombre={p.nombre} />
                <div className="mt-2.5 flex items-start justify-between gap-2 sm:mt-4 sm:gap-3">
                  <div className="min-w-0">
                    <h2 className="text-sm font-medium leading-snug sm:text-base">{p.nombre}</h2>
                    {p.categoriaNombre && (
                      <p className="mt-0.5 text-[10px] uppercase tracking-wide text-zinc-400 sm:text-xs">
                        {p.categoriaNombre}
                      </p>
                    )}
                  </div>
                  <p className="shrink-0 text-sm font-semibold tabular-nums sm:text-base">{fmtPrecio(p.precio)}</p>
                </div>
                {p.descripcion && (
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-zinc-500 sm:mt-2 sm:line-clamp-none sm:text-sm">
                    {p.descripcion}
                  </p>
                )}
                {p.linkCompra && (
                  <a
                    href={p.linkCompra}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-700 sm:mt-4 sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm"
                  >
                    <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Comprar
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

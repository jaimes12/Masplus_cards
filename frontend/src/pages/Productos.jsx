import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, ShoppingBag, X } from 'lucide-react'
import { api } from '../lib/api.js'

/** WhatsApp de la tienda de productos (no es el de Masplus Cards). */
const WHATSAPP_PRODUCTOS = '5214498095350'

function waLink(texto) {
  return `https://wa.me/${WHATSAPP_PRODUCTOS}?text=${encodeURIComponent(texto)}`
}

/** Ícono de WhatsApp (lucide no trae marcas). */
function WhatsAppIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2.05 22l5.3-1.39a9.87 9.87 0 0 0 4.69 1.19h.01c5.46 0 9.9-4.44 9.9-9.9 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.17.25-.64.8-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.29Z" />
    </svg>
  )
}

/**
 * Catálogo público minimalista (/productos). A propósito no comparte la navegación de la
 * landing: es otra línea de negocio y vive sola — fondo claro, mucho aire, solo producto.
 */

function fmtPrecio(n) {
  return `$${Number(n).toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

/** Carrusel de fotos/videos del producto: flechas + puntos, un medio a la vez. */
function MediaCarrusel({ medias, nombre, detalle = false }) {
  const [idx, setIdx] = useState(0)
  const total = medias.length
  const marco = detalle
    ? 'rounded-t-3xl sm:rounded-l-3xl sm:rounded-tr-none'
    : 'rounded-2xl'

  if (total === 0) {
    return <div className={`aspect-square w-full bg-zinc-100 ${marco}`} aria-hidden />
  }

  const media = medias[Math.min(idx, total - 1)]

  return (
    <div className={`group relative aspect-square w-full overflow-hidden bg-zinc-100 ${marco}`}>
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
            className={`absolute left-1.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-zinc-700 shadow-sm transition-opacity hover:bg-white sm:left-2 sm:h-9 sm:w-9 ${detalle ? '' : 'sm:opacity-0 sm:group-hover:opacity-100'}`}
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <button
            type="button"
            aria-label="Siguiente"
            onClick={() => setIdx((i) => (i + 1) % total)}
            className={`absolute right-1.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-zinc-700 shadow-sm transition-opacity hover:bg-white sm:right-2 sm:h-9 sm:w-9 ${detalle ? '' : 'sm:opacity-0 sm:group-hover:opacity-100'}`}
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
  const conTexto = Boolean(b.titulo || b.subtitulo)

  // La imagen manda: se muestra a su proporción real (ancho completo, alto automático) para
  // que un banner ancho no se recorte en el celular. Solo se limita el alto máximo para que
  // una imagen casi cuadrada no se coma la pantalla.
  const contenido = (
    <>
      <img
        src={b.imagenUrl}
        alt={b.titulo || 'Banner'}
        className="block h-auto max-h-[300px] w-full object-cover sm:max-h-[480px]"
      />
      {conTexto && (
        <>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-10">
            {b.titulo && (
              <h2 className="text-lg font-semibold leading-tight tracking-tight sm:text-4xl">{b.titulo}</h2>
            )}
            {b.subtitulo && <p className="mt-0.5 max-w-lg text-xs text-white/80 sm:mt-1 sm:text-base">{b.subtitulo}</p>}
          </div>
        </>
      )}
    </>
  )

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="relative overflow-hidden rounded-2xl bg-zinc-100 sm:rounded-3xl">
        {b.link ? (
          <a href={b.link} target={b.link.startsWith('/') ? '_self' : '_blank'} rel="noreferrer" className="relative block">
            {contenido}
          </a>
        ) : (
          <div className="relative">{contenido}</div>
        )}
        {total > 1 && (
          <div className="absolute bottom-3 right-4 flex gap-1.5 sm:bottom-6 sm:right-8">
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

/** Detalle de producto a pantalla: carrusel grande, SKU, descripción completa y acciones. */
function DetalleProducto({ producto, onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const mensaje = `¡Hola! Me interesa este producto: ${producto.nombre}${producto.sku ? ` (SKU ${producto.sku})` : ''}. ¿Me das más información?`

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center sm:p-8"
      onClick={onClose}
    >
      <div
        className="max-h-[92svh] w-full overflow-y-auto rounded-t-3xl bg-white sm:max-w-3xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid sm:grid-cols-2">
          <div className="relative">
            <MediaCarrusel medias={producto.medias} nombre={producto.nombre} detalle />
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-zinc-700 shadow sm:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="relative flex flex-col p-5 sm:p-8">
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute right-4 top-4 hidden rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 sm:block"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-zinc-400">
              {producto.categoriaNombre && <span>{producto.categoriaNombre}</span>}
              {producto.sku && (
                <>
                  {producto.categoriaNombre && <span>·</span>}
                  <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-zinc-500">SKU {producto.sku}</span>
                </>
              )}
            </div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">{producto.nombre}</h2>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{fmtPrecio(producto.precio)} <span className="text-sm font-normal text-zinc-400">MXN</span></p>
            {producto.descripcion && (
              <p className="mt-4 text-sm leading-relaxed text-zinc-600">{producto.descripcion}</p>
            )}
            <div className="mt-6 flex flex-col gap-2 sm:mt-auto sm:pt-6">
              <a
                href={waLink(mensaje)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                <WhatsAppIcon className="h-4 w-4" /> Me interesa — WhatsApp
              </a>
              {producto.linkCompra && (
                <a
                  href={producto.linkCompra}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700"
                >
                  <ShoppingBag className="h-4 w-4" /> Comprar en línea
                </a>
              )}
              <p className="text-center text-[11px] text-zinc-400">Hecho bajo pedido · Envíos a todo México</p>
            </div>
          </div>
        </div>
      </div>
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

export default function Productos() {
  const [catalogo, setCatalogo] = useState(null)
  const [categoriaId, setCategoriaId] = useState(null)
  const [detalle, setDetalle] = useState(null)
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
              <article
                key={p.id}
                role="button"
                tabIndex={0}
                onClick={() => setDetalle(p)}
                onKeyDown={(e) => e.key === 'Enter' && setDetalle(p)}
                className="cursor-pointer"
              >
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
                <button
                  type="button"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-zinc-200 px-4 py-2 text-xs font-semibold transition-colors hover:border-zinc-400 sm:mt-4 sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm"
                >
                  Ver detalles
                </button>
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

      {/* WhatsApp flotante de la tienda */}
      <a
        href={waLink('¡Hola! Vi su catálogo y me interesa un producto 🙌')}
        target="_blank"
        rel="noreferrer"
        aria-label="Escríbenos por WhatsApp"
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition-transform hover:scale-105"
      >
        <WhatsAppIcon className="h-7 w-7" />
      </a>

      {detalle && <DetalleProducto producto={detalle} onClose={() => setDetalle(null)} />}

      <footer className="border-t border-zinc-100 py-8">
        <p className="text-center text-xs uppercase tracking-[0.25em] text-zinc-300">
          © {new Date().getFullYear()} · Hecho en México
        </p>
      </footer>
    </div>
  )
}

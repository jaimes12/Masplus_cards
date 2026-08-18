import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { PlayCircle, X } from 'lucide-react'
import { TUTORIALES } from '../../lib/tutoriales.js'

const STORAGE_KEY = 'masplus_tutoriales_ocultos'

function leerOcultos() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

/** Reproductor: autoplay silencioso en loop mientras está en pantalla; controles si el navegador lo bloquea. */
function Player({ id, autoplay = true }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const [blocked, setBlocked] = useState(false)

  useEffect(() => {
    const video = ref.current
    if (!video || reduce || !autoplay) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => setBlocked(true))
        else video.pause()
      },
      { threshold: 0.4 },
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [reduce, autoplay])

  return (
    <video
      ref={ref}
      className="aspect-video w-full rounded-xl bg-black"
      src={`/demo/tutoriales/${id}.mp4`}
      poster={`/demo/tutoriales/${id}-poster.jpg`}
      muted
      loop
      playsInline
      preload="metadata"
      controls={reduce || blocked || !autoplay}
      aria-label={TUTORIALES[id]?.titulo}
    />
  )
}

/**
 * Tira de tutoriales para el encabezado de una sección: tarjetas con póster + play; al tocar
 * una, se expande el reproductor debajo. Se puede ocultar por sección (se recuerda en el
 * navegador) para que no estorbe cuando ya se aprendió.
 */
export function TutorialStrip({ ids, seccion }) {
  const [abierto, setAbierto] = useState(null)
  const [oculto, setOculto] = useState(() => leerOcultos().includes(seccion))

  function ocultar() {
    const lista = leerOcultos()
    if (!lista.includes(seccion)) localStorage.setItem(STORAGE_KEY, JSON.stringify([...lista, seccion]))
    setOculto(true)
  }

  function mostrar() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leerOcultos().filter((s) => s !== seccion)))
    setOculto(false)
  }

  if (oculto) {
    return (
      <button
        type="button"
        onClick={mostrar}
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-ink-3 hover:text-foreground"
      >
        <PlayCircle className="h-3.5 w-3.5" /> Ver tutoriales de esta sección
      </button>
    )
  }

  return (
    <div className="mb-6 rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <PlayCircle className="h-4 w-4 text-accent" />
        <p className="text-xs font-semibold tracking-wide text-ink-3 uppercase">
          Tutorial{ids.length > 1 ? 'es' : ''}
        </p>
        <button
          type="button"
          onClick={ocultar}
          className="ml-auto grid h-7 w-7 place-items-center rounded-lg text-ink-3 hover:bg-secondary hover:text-foreground"
          aria-label="Ocultar tutoriales"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className={`grid gap-3 ${ids.length > 1 ? 'sm:grid-cols-2' : ''}`}>
        {ids.map((id) => {
          const t = TUTORIALES[id]
          const activo = abierto === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => setAbierto(activo ? null : id)}
              className={`flex items-center gap-3 rounded-xl border p-2.5 text-left transition-colors ${
                activo ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/40'
              }`}
            >
              <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-lg bg-secondary">
                <img src={`/demo/tutoriales/${id}-poster.jpg`} alt="" className="h-full w-full object-cover" />
                <span className="absolute inset-0 grid place-items-center bg-black/25">
                  <PlayCircle className="h-7 w-7 text-white drop-shadow" />
                </span>
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{t.titulo}</p>
                <p className="line-clamp-2 text-xs text-ink-2">{t.descripcion}</p>
                <p className="mt-0.5 text-[11px] text-ink-3">{t.meta} · sin audio</p>
              </div>
            </button>
          )
        })}
      </div>

      {abierto && (
        <div className="mt-3">
          <Player id={abierto} />
        </div>
      )}
    </div>
  )
}

/** Reproductor suelto (para Cómo usar / Ayuda), con título. */
export function TutorialCard({ id }) {
  const t = TUTORIALES[id]
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <Player id={id} autoplay={false} />
      <div className="p-4">
        <p className="text-sm font-semibold text-foreground">{t.titulo}</p>
        <p className="mt-0.5 text-xs text-ink-2">{t.descripcion}</p>
      </div>
    </div>
  )
}

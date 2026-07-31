import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronRight, Sparkles, X } from 'lucide-react'
import { Button } from './ui.jsx'

const STEPS = [
  {
    target: '[data-tour="add-diseno-btn"]',
    route: '/empresa/disenos',
    title: 'Tocá acá para crear tu primer diseño',
    description: 'Ahí armás la tarjeta de tu marca: puede ser de sellos (juntar visitas) o una promoción con vencimiento.',
    advanceWhen: '[data-tour="diseno-step-info"]',
  },
  {
    target: '[data-tour="diseno-step-info"]',
    route: '/empresa/disenos',
    title: 'Completá los datos básicos',
    description: 'Elegí el tipo de tarjeta, ponele un nombre y los detalles del premio o la promoción. Cuando termines, tocá "Siguiente".',
    advanceWhen: '[data-tour="diseno-step-diseno"]',
  },
  {
    target: '[data-tour="diseno-step-diseno"]',
    route: '/empresa/disenos',
    title: 'Subí tu logo y tus colores',
    description: 'Personalizá cómo se va a ver la tarjeta con el logo y los colores de tu negocio. Después tocá "Siguiente" otra vez.',
    advanceWhen: '[data-tour="diseno-step-revisar"]',
  },
  {
    target: '[data-tour="diseno-step-revisar"]',
    route: '/empresa/disenos',
    title: 'Revisá y guardá',
    description: 'Confirmá que todo esté bien y tocá "Crear diseño" para guardarlo.',
    advanceWhen: '[data-tour="diseno-qr-btn"]',
  },
  {
    target: '[data-tour="diseno-qr-btn"]',
    route: '/empresa/disenos',
    title: 'Generá tu código QR',
    description:
      'Tocá "Código QR" para conseguir el código que vas a compartir con tus clientes: lo escanean, se registran solos y reciben su tarjeta al instante.',
  },
  {
    target: '[data-tour="sidebar-escanear"]',
    route: '/empresa/escanear',
    title: 'Escaneá las tarjetas de tus clientes',
    description:
      'Cuando un cliente vuelva, abrí "Escanear" acá y apuntá la cámara al QR de su tarjeta para sumarle un sello al instante.',
  },
]

export function tourStorageKey(empresaId) {
  return `masplus_tour_seen_${empresaId}`
}

function sameRect(a, b) {
  if (a === b) return true
  if (!a || !b) return false
  return a.top === b.top && a.left === b.left && a.width === b.width && a.height === b.height
}

function useTargetRect(selector) {
  const [rect, setRect] = useState(null)

  useEffect(() => {
    if (!selector) {
      setRect(null)
      return
    }

    function measure() {
      const el = document.querySelector(selector)
      const next = el ? el.getBoundingClientRect() : null
      const nextRect = next ? { top: next.top, left: next.left, width: next.width, height: next.height } : null
      setRect((prev) => (sameRect(prev, nextRect) ? prev : nextRect))
    }

    measure()
    const interval = setInterval(measure, 250)
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [selector])

  return rect
}

function tooltipStyle(rect) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const isMobile = vw < 640
  const width = isMobile ? vw - 32 : Math.min(384, vw - 48)
  const margin = 16

  if (!rect) {
    return isMobile
      ? { position: 'fixed', left: 16, right: 16, bottom: 16, width: 'auto' }
      : { position: 'fixed', right: 24, bottom: 24, width }
  }

  const spaceBelow = vh - rect.top - rect.height
  const placeBelow = spaceBelow > 240 || spaceBelow > rect.top

  const style = { position: 'fixed', width: isMobile ? vw - 32 : width }
  if (placeBelow) {
    style.top = Math.min(rect.top + rect.height + margin, vh - 24)
  } else {
    style.bottom = Math.max(vh - rect.top + margin, 24)
  }

  if (isMobile) {
    style.left = 16
  } else {
    let left = rect.left
    if (left + width + margin > vw) left = vw - width - margin
    if (left < margin) left = margin
    style.left = left
  }
  return style
}

export default function OnboardingTour({ empresaId }) {
  const [step, setStep] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!empresaId) return
    const seen = localStorage.getItem(tourStorageKey(empresaId))
    if (!seen) {
      setStep(0)
      if (location.pathname !== STEPS[0].route) navigate(STEPS[0].route)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empresaId])

  const current = step !== null ? STEPS[step] : null
  const rect = useTargetRect(current?.target)

  function finish() {
    localStorage.setItem(tourStorageKey(empresaId), '1')
    setStep(null)
  }

  function goToStep(next) {
    if (next >= STEPS.length) {
      finish()
      return
    }
    setStep(next)
    if (STEPS[next].route !== location.pathname) navigate(STEPS[next].route)
  }

  useEffect(() => {
    const advanceSelector = current?.advanceWhen
    if (!advanceSelector) return
    const interval = setInterval(() => {
      if (document.querySelector(advanceSelector)) {
        clearInterval(interval)
        goToStep(step + 1)
      }
    }, 300)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  useEffect(() => {
    const el = current?.target ? document.querySelector(current.target) : null
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  if (step === null) return null

  const isLast = step === STEPS.length - 1
  const pad = 6

  return (
    <>
      {rect && (
        <div
          className="pointer-events-none fixed z-[59] rounded-xl transition-all duration-300"
          style={{
            top: rect.top - pad,
            left: rect.left - pad,
            width: rect.width + pad * 2,
            height: rect.height + pad * 2,
            boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.55), 0 0 0 3px var(--color-primary, #f97316)',
          }}
        />
      )}
      <div className="pointer-events-none z-[60]" style={tooltipStyle(rect)}>
        <div className="shadow-soft pointer-events-auto w-full rounded-3xl border border-border bg-card p-5">
          <div className="flex items-start justify-between gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3 w-3" /> Tutorial
            </span>
            <button
              type="button"
              onClick={finish}
              className="rounded-md p-1 text-muted-foreground hover:bg-secondary"
              aria-label="Cerrar tutorial"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <h3 className="mt-3 text-base font-semibold">{current.title}</h3>
          <p className="mt-1.5 text-sm text-muted-foreground">{current.description}</p>
          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${i === step ? 'w-5 bg-primary' : 'w-1.5 bg-border'}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={finish} className="text-sm text-muted-foreground hover:text-foreground">
                Saltar
              </button>
              <Button className="gap-1" onClick={() => goToStep(step + 1)}>
                {isLast ? 'Entendido' : 'Siguiente'}
                {!isLast && <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

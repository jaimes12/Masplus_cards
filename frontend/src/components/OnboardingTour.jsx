import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronRight, Sparkles, X } from 'lucide-react'
import { Button } from './ui.jsx'

const STEPS = [
  {
    route: '/empresa/disenos',
    title: 'Creá tu primer diseño',
    description:
      'Elegí si tu tarjeta es de sellos o de promoción, ponele tu logo y tus colores. Tocá "Agregar nuevo diseño" para armarla.',
  },
  {
    route: '/empresa/disenos',
    title: 'Descargá tu código QR',
    description:
      'En cada diseño tocá "Código QR": podés copiar el link, editar el póster o descargarlo en PDF para imprimir y pegar en tu negocio. Tus clientes lo escanean y reciben su tarjeta al instante.',
  },
  {
    route: '/empresa/escanear',
    title: 'Escaneá las tarjetas de tus clientes',
    description:
      'Cuando un cliente vuelva, abrí "Escanear" en el menú y apuntá la cámara al QR de su tarjeta (la que tienen en Apple Wallet) para sumarle un sello al instante.',
  },
]

export function tourStorageKey(empresaId) {
  return `masplus_tour_seen_${empresaId}`
}

export default function OnboardingTour({ empresaId }) {
  const [step, setStep] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!empresaId) return
    const seen = localStorage.getItem(tourStorageKey(empresaId))
    if (!seen) setStep(0)
  }, [empresaId])

  if (step === null) return null

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

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex justify-end sm:inset-x-auto sm:right-6 sm:bottom-6">
      <div className="shadow-soft pointer-events-auto w-full max-w-sm rounded-3xl border border-border bg-card p-5">
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
  )
}

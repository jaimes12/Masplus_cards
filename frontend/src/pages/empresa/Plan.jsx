import { useEffect, useState } from 'react'
import { Check, Crown } from 'lucide-react'
import { api } from '../../lib/api.js'
import { Button, Card } from '../../components/ui.jsx'

function UsageBar({ label, used, limit, dark }) {
  const pct = limit ? Math.min(100, Math.round((used / limit) * 100)) : 100
  return (
    <div>
      <div className={`mb-1.5 flex items-baseline justify-between text-sm ${dark ? 'text-white' : ''}`}>
        <span className="font-medium">{label}</span>
        <span className={dark ? 'text-white/60' : 'text-muted-foreground'}>
          {used}
          {limit ? ` / ${limit}` : ' · ilimitado'}
        </span>
      </div>
      <div className={`h-2 overflow-hidden rounded-full ${dark ? 'bg-white/15' : 'bg-secondary'}`}>
        <div
          className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function Plan() {
  const [data, setData] = useState(null)
  const [cambiando, setCambiando] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    load()
  }, [])

  function load() {
    api.get('/api/empresa/plan').then(setData).catch((e) => setError(e.message))
  }

  async function cambiar(planId) {
    setCambiando(planId)
    setError('')
    try {
      const updated = await api.post(`/api/empresa/plan/${planId}`)
      setData(updated)
    } catch (e) {
      setError(e.message)
    } finally {
      setCambiando(null)
    }
  }

  if (!data) return <p className="text-muted-foreground">Cargando...</p>

  const { planActual, renuevaEl, disenosUsados, tarjetasUsadas, planes } = data

  return (
    <div className="space-y-8">
      {error && (
        <Card className="border-2 border-destructive/40">
          <p className="text-sm text-destructive">{error}</p>
        </Card>
      )}

      <Card className="animate-fade-up shadow-soft-lg overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-800 text-white">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-orange-400">
              <Crown className="h-3.5 w-3.5" /> Plan actual
            </p>
            <h2 className="mt-1 text-2xl font-semibold">{planActual?.nombre || 'Sin plan activo'}</h2>
            {renuevaEl ? (
              <p className="mt-1 text-sm text-white/60">
                Se renueva el{' '}
                {new Date(renuevaEl).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            ) : (
              <p className="mt-1 text-sm text-white/60">Elige un plan para desbloquear todos los límites de tu cuenta.</p>
            )}
          </div>
          {planActual && (
            <p className="text-3xl font-semibold">
              ${Math.round(Number(planActual.precioMensual))}
              <span className="text-sm font-normal text-white/60"> MXN/mes</span>
            </p>
          )}
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <UsageBar label="Diseños activos" used={disenosUsados} limit={planActual?.limiteDisenos} dark />
          <UsageBar label="Tarjetas emitidas" used={tarjetasUsadas} limit={planActual?.limiteTarjetas} dark />
        </div>
      </Card>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Todos los planes</h3>
        <div className="grid gap-5 sm:grid-cols-3">
          {planes.map((plan, i) => {
            const esActual = planActual?.id === plan.id
            return (
              <Card
                key={plan.id}
                className={`animate-fade-up relative flex flex-col ${plan.destacado ? 'ring-2 ring-orange-500' : ''}`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {plan.destacado && (
                  <span className="absolute -top-3 left-6 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 px-3 py-1 text-xs font-semibold text-white">
                    Más popular
                  </span>
                )}
                <h4 className="text-lg font-semibold">{plan.nombre}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{plan.descripcion}</p>
                <p className="mt-4">
                  <span className="text-3xl font-semibold">${Math.round(Number(plan.precioMensual))}</span>
                  <span className="text-sm text-muted-foreground"> MXN/mes</span>
                </p>
                <ul className="mt-5 flex-1 space-y-2 text-sm">
                  {plan.caracteristicas.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-6 w-full"
                  variant={esActual ? 'outline' : 'primary'}
                  disabled={esActual || cambiando === plan.id}
                  onClick={() => cambiar(plan.id)}
                >
                  {esActual ? 'Plan actual' : cambiando === plan.id ? 'Cambiando...' : 'Elegir este plan'}
                </Button>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

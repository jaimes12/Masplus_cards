import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Check, Crown, Sparkles, Tag } from 'lucide-react'
import { api } from '../../lib/api.js'
import { Button, Card, Input, Label } from '../../components/ui.jsx'
import { PageHead } from '../../components/empresa/EmpresaUI.jsx'
import PagoPlanModal from '../../components/PagoPlanModal.jsx'

const cardHover = { y: -6, transition: { type: 'spring', stiffness: 300, damping: 22 } }

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
  const reduce = useReducedMotion()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [pagoPlan, setPagoPlan] = useState(null)
  const [canjeando, setCanjeando] = useState(null)

  const [codigoInput, setCodigoInput] = useState('')
  const [validandoCodigo, setValidandoCodigo] = useState(false)
  const [resultadosCodigo, setResultadosCodigo] = useState(null)
  const [errorCodigo, setErrorCodigo] = useState('')

  useEffect(() => {
    load()
  }, [])

  function load() {
    api.get('/api/empresa/plan').then(setData).catch((e) => setError(e.message))
  }

  async function aplicarCodigo(e) {
    e.preventDefault()
    if (!codigoInput.trim() || !data) return
    setValidandoCodigo(true)
    setErrorCodigo('')
    setResultadosCodigo(null)
    try {
      const resultados = await Promise.all(
        data.planes.map((plan) =>
          api
            .post('/api/empresa/codigo-descuento/validar', { codigo: codigoInput.trim(), planId: plan.id })
            .then((r) => [plan.id, r])
        )
      )
      const map = Object.fromEntries(resultados)
      const algunoValido = Object.values(map).some((r) => r.valido)
      if (!algunoValido) {
        setErrorCodigo(Object.values(map)[0]?.error || 'Ese código no es válido.')
      }
      setResultadosCodigo(map)
    } catch (e) {
      setErrorCodigo(e.message)
    } finally {
      setValidandoCodigo(false)
    }
  }

  async function elegirPlan(plan) {
    const resultado = resultadosCodigo?.[plan.id]
    if (resultado?.valido && Number(resultado.precioConDescuento) === 0) {
      setCanjeando(plan.id)
      setError('')
      try {
        await api.post('/api/empresa/stripe/canjear-gratis', { planId: plan.id, codigo: codigoInput.trim() })
        setResultadosCodigo(null)
        setCodigoInput('')
        load()
      } catch (e) {
        setError(e.message)
      } finally {
        setCanjeando(null)
      }
      return
    }
    setPagoPlan(plan)
  }

  if (!data) return <p className="text-muted-foreground">Cargando...</p>

  const { planActual, renuevaEl, enPrueba, pruebaTerminaEl, diasPrueba, disenosUsados, tarjetasUsadas, planes } = data
  const esGratis = planActual && Number(planActual.precioMensual) === 0
  const diasRestantes = pruebaTerminaEl
    ? Math.max(0, Math.ceil((new Date(pruebaTerminaEl) - Date.now()) / 86400000))
    : 0
  const planesPago = planes.filter((p) => Number(p.precioMensual) > 0)
  const planGratis = planes.find((p) => Number(p.precioMensual) === 0)

  return (
    <div className="space-y-8">
      <PageHead title="Mi plan" subtitle="Tu suscripción y los límites de tu cuenta." />
      {error && (
        <Card className="border-2 border-destructive/40">
          <p className="text-sm text-destructive">{error}</p>
        </Card>
      )}

      <Card className="animate-fade-up shadow-soft-lg overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-800 text-white">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-orange-400">
              {enPrueba ? <Sparkles className="h-3.5 w-3.5" /> : <Crown className="h-3.5 w-3.5" />}
              {enPrueba ? 'Prueba gratis' : 'Plan actual'}
            </p>
            <h2 className="mt-1 text-2xl font-semibold">{planActual?.nombre || 'Sin plan activo'}</h2>
            {enPrueba ? (
              <p className="mt-1 text-sm text-white/60">
                Estás usando el {planActual.nombre} completo, gratis y sin tarjeta.{' '}
                {diasRestantes > 0
                  ? `Te quedan ${diasRestantes} día${diasRestantes === 1 ? '' : 's'}.`
                  : 'Termina hoy.'}{' '}
                Al terminar pasas al plan Gratis{planGratis?.limiteTarjetas ? ` (1 diseño, ${planGratis.limiteTarjetas} tarjetas)` : ''}, salvo que elijas uno abajo.
              </p>
            ) : esGratis ? (
              <p className="mt-1 text-sm text-white/60">
                Gratis para siempre. Cuando necesites más tarjetas o diseños, elige un plan abajo — tus clientes conservan sus tarjetas.
              </p>
            ) : renuevaEl ? (
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
              {enPrueba || esGratis ? (
                <>
                  $0<span className="text-sm font-normal text-white/60"> {enPrueba ? `por ${diasPrueba} días` : 'MXN/mes'}</span>
                </>
              ) : (
                <>
                  ${Math.round(Number(planActual.precioMensual))}
                  <span className="text-sm font-normal text-white/60"> MXN/mes</span>
                </>
              )}
            </p>
          )}
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <UsageBar label="Diseños activos" used={disenosUsados} limit={planActual?.limiteDisenos} dark />
          <UsageBar label="Tarjetas emitidas" used={tarjetasUsadas} limit={planActual?.limiteTarjetas} dark />
        </div>
      </Card>

      <Card>
        <form onSubmit={aplicarCodigo} className="flex flex-wrap items-end gap-3">
          <div className="min-w-0 flex-1">
            <Label className="flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" /> ¿Tienes un código de descuento?
            </Label>
            <Input
              value={codigoInput}
              onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
              placeholder="Ej. VERANO20"
            />
          </div>
          <Button type="submit" variant="outline" disabled={validandoCodigo || !codigoInput.trim()}>
            {validandoCodigo ? 'Validando...' : 'Aplicar'}
          </Button>
        </form>
        {errorCodigo && <p className="mt-2 text-sm text-destructive">{errorCodigo}</p>}
        {resultadosCodigo && !errorCodigo && (
          <p className="mt-2 text-sm text-muted-foreground">
            Código aplicado — el precio con descuento aparece marcado abajo. Se confirma al pagar.
          </p>
        )}
      </Card>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Todos los planes</h3>
        {planGratis && (
          <Card className="mb-5 flex flex-wrap items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="font-semibold">
                {planGratis.nombre} <span className="text-sm font-normal text-muted-foreground">· $0 para siempre</span>
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {planGratis.descripcion} {planGratis.limiteDisenos} diseño · hasta {planGratis.limiteTarjetas} tarjetas.
              </p>
            </div>
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-ink-2">
              {esGratis ? 'Plan actual' : enPrueba ? 'Se activa al terminar tu prueba' : 'Se activa si cancelas tu suscripción'}
            </span>
          </Card>
        )}
        <div className="grid gap-5 sm:grid-cols-3">
          {planesPago.map((plan, i) => {
            const esActual = planActual?.id === plan.id && !enPrueba
            const resultado = resultadosCodigo?.[plan.id]
            const conDescuento = resultado?.valido ? resultado : null
            return (
              <motion.div
                key={plan.id}
                className={`animate-fade-up ${plan.destacado ? 'sm:-my-2 sm:scale-[1.03]' : ''}`}
                style={{ animationDelay: `${i * 60}ms` }}
                whileHover={reduce ? undefined : cardHover}
              >
                <Card
                  className={`relative flex h-full flex-col ${
                    plan.destacado ? 'border-orange-500 bg-gradient-to-b from-orange-50/80 to-card shadow-soft-lg ring-2 ring-orange-500' : ''
                  }`}
                >
                  {plan.destacado && (
                    <span className="absolute -top-3 left-6 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                      Más popular
                    </span>
                  )}
                  <h4 className="text-lg font-semibold">{plan.nombre}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.descripcion}</p>
                  <p className="mt-4">
                    {conDescuento ? (
                      <>
                        <span className="text-sm text-muted-foreground line-through">
                          ${Math.round(Number(plan.precioMensual))}
                        </span>{' '}
                        <span className="text-3xl font-semibold text-orange-600">
                          ${Math.round(Number(conDescuento.precioConDescuento))}
                        </span>
                      </>
                    ) : (
                      <span className="text-3xl font-semibold">${Math.round(Number(plan.precioMensual))}</span>
                    )}
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
                    className={`mt-6 w-full ${esActual ? '' : '!bg-gradient-to-br !from-orange-500 !to-orange-600 !text-white'}`}
                    variant={esActual ? 'outline' : 'primary'}
                    disabled={esActual || canjeando === plan.id}
                    onClick={() => elegirPlan(plan)}
                  >
                    {esActual
                      ? 'Plan actual'
                      : canjeando === plan.id
                        ? 'Activando...'
                        : enPrueba && planActual?.id === plan.id
                          ? 'Continuar con este plan'
                          : 'Elegir este plan'}
                  </Button>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      {pagoPlan && (
        <PagoPlanModal
          plan={pagoPlan}
          precioMostrar={
            resultadosCodigo?.[pagoPlan.id]?.valido
              ? resultadosCodigo[pagoPlan.id].precioConDescuento
              : pagoPlan.precioMensual
          }
          codigoDescuento={resultadosCodigo?.[pagoPlan.id]?.valido ? codigoInput.trim() : null}
          onClose={() => setPagoPlan(null)}
          onSuccess={() => {
            setPagoPlan(null)
            setResultadosCodigo(null)
            setCodigoInput('')
            load()
          }}
        />
      )}
    </div>
  )
}

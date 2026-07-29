import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CreditCard, Gift, Palette, Stamp, Users } from 'lucide-react'
import { api } from '../../lib/api.js'
import { Card } from '../../components/ui.jsx'
import AreaTrend from '../../components/charts/AreaTrend.jsx'
import DonutChart from '../../components/charts/DonutChart.jsx'

// Paleta categórica validada (contraste + separación por daltonismo) para el donut de diseños.
const DONUT_PALETTE = ['#2a78d6', '#eb6834', '#1baf7a']
const DONUT_OTROS = '#c3c2b7'

function buildTrend(tarjetas, days = 14) {
  const buckets = []
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(start)
    d.setDate(d.getDate() - i)
    buckets.push({ date: d, value: 0 })
  }
  tarjetas.forEach((t) => {
    const d = new Date(t.createdAt)
    d.setHours(0, 0, 0, 0)
    const bucket = buckets.find((b) => b.date.getTime() === d.getTime())
    if (bucket) bucket.value += 1
  })
  return buckets.map((b) => ({
    label: b.date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }),
    value: b.value,
  }))
}

function buildDisenoBreakdown(tarjetas) {
  const counts = new Map()
  tarjetas.forEach((t) => {
    const key = t.disenoNombre || 'Sin nombre'
    counts.set(key, (counts.get(key) || 0) + 1)
  })
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1])
  const top = sorted.slice(0, 3)
  const otros = sorted.slice(3).reduce((sum, [, v]) => sum + v, 0)
  const data = top.map(([label, value], i) => ({ label, value, color: DONUT_PALETTE[i] }))
  if (otros > 0) data.push({ label: 'Otros', value: otros, color: DONUT_OTROS })
  return data
}

export default function Dashboard() {
  const [disenos, setDisenos] = useState([])
  const [tarjetas, setTarjetas] = useState([])
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/api/disenos'), api.get('/api/tarjetas'), api.get('/api/clientes')])
      .then(([d, t, c]) => {
        setDisenos(d)
        setTarjetas(t)
        setClientes(c)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-muted-foreground">Cargando...</p>

  const activo = disenos.find((d) => d.esActivoDeEmpresa)
  const sellosOtorgados = tarjetas.reduce((sum, t) => sum + t.sellosActuales + t.premiosCanjeados * t.sellosRequeridos, 0)
  const premiosCanjeados = tarjetas.reduce((sum, t) => sum + t.premiosCanjeados, 0)
  const recientes = [...tarjetas].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
  const trend = buildTrend(tarjetas)
  const disenoBreakdown = buildDisenoBreakdown(tarjetas)

  const cards = [
    { label: 'Tarjetas emitidas', value: tarjetas.length, icon: CreditCard },
    { label: 'Clientes', value: clientes.length, icon: Users },
    { label: 'Sellos otorgados', value: sellosOtorgados, icon: Stamp },
    { label: 'Premios canjeados', value: premiosCanjeados, icon: Gift },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Resumen</h1>
        <p className="text-sm text-muted-foreground">Cómo va tu programa de fidelidad.</p>
      </div>

      {!activo && (
        <Card className="border-2 border-destructive/40">
          <p className="text-sm">
            Todavía no tenés un diseño activo.{' '}
            <Link to="/empresa/disenos" className="underline">
              Elegí o creá uno
            </Link>{' '}
            antes de emitir tarjetas.
          </p>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="flex items-center gap-4">
            <div className="rounded-full bg-secondary p-3">
              <c.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{c.label}</p>
              <p className="text-2xl font-semibold">{c.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {tarjetas.length > 0 && (
        <div className={`grid gap-4 ${disenoBreakdown.length > 1 ? 'lg:grid-cols-3' : ''}`}>
          <Card className={disenoBreakdown.length > 1 ? 'lg:col-span-2' : ''}>
            <AreaTrend
              data={trend}
              title="Tarjetas emitidas"
              subtitle={`${trend.reduce((s, d) => s + d.value, 0)} en los últimos 14 días`}
            />
          </Card>
          {disenoBreakdown.length > 1 && (
            <Card className="flex flex-col justify-center">
              <DonutChart data={disenoBreakdown} title="Tarjetas por diseño" />
            </Card>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <Palette className="h-4 w-4 text-muted-foreground" />
            <p className="font-medium">Diseño activo</p>
          </div>
          {activo ? (
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 shrink-0 rounded-full border border-border"
                style={{ background: activo.colorPrimario || '#18181B' }}
              />
              <div>
                <p className="font-medium">{activo.nombre}</p>
                <p className="text-sm text-muted-foreground">{activo.sellosRequeridos} sellos para el premio</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sin diseño activo.</p>
          )}
        </Card>

        <Card>
          <p className="mb-3 font-medium">Tarjetas recientes</p>
          {recientes.length === 0 && <p className="text-sm text-muted-foreground">Todavía no emitiste tarjetas.</p>}
          <div className="space-y-3">
            {recientes.map((t) => {
              const esCupon = t.tipo === 'cupon'
              const pct = esCupon ? 0 : Math.min(100, Math.round((t.sellosActuales / Math.max(t.sellosRequeridos, 1)) * 100))
              return (
                <div key={t.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate font-medium">{t.clienteNombre}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {esCupon ? (t.cuponRedimido ? 'Canjeado' : 'Vigente') : `${t.sellosActuales}/${t.sellosRequeridos} sellos`}
                    </span>
                  </div>
                  {!esCupon && (
                    <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}

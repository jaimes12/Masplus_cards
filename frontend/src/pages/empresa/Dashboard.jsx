import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, CreditCard, Gift, QrCode, Stamp, Users } from 'lucide-react'
import { api } from '../../lib/api.js'
import { Panel, StatCard } from '../../components/empresa/EmpresaUI.jsx'
import AreaTrend from '../../components/charts/AreaTrend.jsx'
import DonutChart from '../../components/charts/DonutChart.jsx'

const ACCENT = '#F97316'
const DONUT_PALETTE = ['#F97316', '#2A78D6', '#1BAF7A']
const DONUT_OTROS = '#D6D2CC'

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

const QUICK_LINKS = [
  { to: '/empresa/escanear', label: 'Escanear', icon: QrCode },
  { to: '/empresa/clientes', label: 'Clientes', icon: Users },
  { to: '/empresa/disenos', label: 'Tarjetas', icon: CreditCard },
]

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
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Inicio</h1>
          <p className="mt-1 text-sm text-muted-foreground">Cómo va tu programa de fidelidad.</p>
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          {QUICK_LINKS.map((q) => (
            <Link
              key={q.to}
              to={q.to}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-border bg-card px-3.5 text-sm font-semibold text-foreground transition-colors hover:border-ink-3"
            >
              <q.icon className="h-4 w-4 text-ink-3" />
              {q.label}
            </Link>
          ))}
        </div>
      </div>

      {!activo && (
        <div className="flex items-center gap-3 rounded-2xl border border-warn/30 bg-warn-soft px-5 py-4 text-sm text-warn">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <p>
            Todavía no tenés un diseño activo.{' '}
            <Link to="/empresa/disenos" className="font-semibold underline underline-offset-2">
              Elegí o creá uno
            </Link>{' '}
            antes de emitir tarjetas.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((c) => (
          <StatCard key={c.label} icon={c.icon} label={c.label} value={c.value} />
        ))}
      </div>

      {tarjetas.length > 0 && (
        <div className={`grid gap-4 ${disenoBreakdown.length > 1 ? 'lg:grid-cols-3' : ''}`}>
          <Panel className={disenoBreakdown.length > 1 ? 'lg:col-span-2' : ''} bodyClassName="p-5">
            <AreaTrend
              data={trend}
              color={ACCENT}
              title="Tarjetas emitidas"
              subtitle={`${trend.reduce((s, d) => s + d.value, 0)} en los últimos 14 días`}
            />
          </Panel>
          {disenoBreakdown.length > 1 && (
            <Panel bodyClassName="flex flex-col justify-center p-5">
              <DonutChart data={disenoBreakdown} title="Tarjetas por diseño" />
            </Panel>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Panel title="Diseño activo">
          {activo ? (
            <div className="flex items-center gap-3.5">
              <div
                className="h-11 w-11 shrink-0 rounded-xl border border-border shadow-soft"
                style={{ background: activo.colorPrimario || '#12100F' }}
              />
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">{activo.nombre}</p>
                <p className="text-sm text-ink-3">{activo.sellosRequeridos} sellos para el premio</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-ink-3">Sin diseño activo.</p>
          )}
        </Panel>

        <Panel title="Tarjetas recientes">
          {recientes.length === 0 && <p className="text-sm text-ink-3">Todavía no emitiste tarjetas.</p>}
          <div className="space-y-3.5">
            {recientes.map((t) => {
              const esCupon = t.tipo === 'cupon'
              const pct = esCupon ? 0 : Math.min(100, Math.round((t.sellosActuales / Math.max(t.sellosRequeridos, 1)) * 100))
              return (
                <div key={t.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate font-medium text-foreground">{t.clienteNombre}</span>
                    <span className="shrink-0 text-xs text-ink-3 tabular-nums">
                      {esCupon ? (t.cuponRedimido ? 'Canjeado' : 'Vigente') : `${t.sellosActuales}/${t.sellosRequeridos} sellos`}
                    </span>
                  </div>
                  {!esCupon && (
                    <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Panel>
      </div>
    </div>
  )
}

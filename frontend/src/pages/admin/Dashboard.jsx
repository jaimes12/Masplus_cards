import { useEffect, useState } from 'react'
import { Building2, CreditCard, Gift, LayoutTemplate, Palette, Users } from 'lucide-react'
import { api } from '../../lib/api.js'
import { Card } from '../../components/ui.jsx'
import AreaTrend from '../../components/charts/AreaTrend.jsx'
import DonutChart from '../../components/charts/DonutChart.jsx'

const DONUT_PALETTE = ['#2a78d6', '#eb6834', '#1baf7a']
const DONUT_OTROS = '#c3c2b7'

function buildTrend(empresas, days = 14) {
  const buckets = []
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(start)
    d.setDate(d.getDate() - i)
    buckets.push({ date: d, value: 0 })
  }
  empresas.forEach((e) => {
    const d = new Date(e.createdAt)
    d.setHours(0, 0, 0, 0)
    const bucket = buckets.find((b) => b.date.getTime() === d.getTime())
    if (bucket) bucket.value += 1
  })
  return buckets.map((b) => ({
    label: b.date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }),
    value: b.value,
  }))
}

function buildPlanBreakdown(empresas) {
  const counts = new Map()
  empresas.forEach((e) => {
    const key = e.planNombre || 'Sin plan'
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
  const [stats, setStats] = useState(null)
  const [empresas, setEmpresas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/api/admin/stats'), api.get('/api/admin/empresas')])
      .then(([s, e]) => {
        setStats(s)
        setEmpresas(e)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading || !stats) return <p className="text-muted-foreground">Cargando...</p>

  const cards = [
    { label: 'Empresas', value: stats.totalEmpresas, icon: Building2 },
    { label: 'Templates', value: stats.totalTemplates, icon: LayoutTemplate },
    { label: 'Diseños', value: stats.totalDisenos, icon: Palette },
    { label: 'Tarjetas emitidas', value: stats.totalTarjetas, icon: CreditCard },
    { label: 'Clientes finales', value: stats.totalClientes, icon: Users },
    { label: 'Premios canjeados', value: stats.premiosCanjeados, icon: Gift },
  ]

  const trend = buildTrend(empresas)
  const planBreakdown = buildPlanBreakdown(empresas)
  const recientes = [...empresas].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Resumen</h1>
        <p className="text-sm text-muted-foreground">Estado general de la plataforma.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
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

      {empresas.length > 0 && (
        <div className={`grid gap-4 ${planBreakdown.length > 1 ? 'lg:grid-cols-3' : ''}`}>
          <Card className={planBreakdown.length > 1 ? 'lg:col-span-2' : ''}>
            <AreaTrend
              data={trend}
              title="Empresas nuevas"
              subtitle={`${trend.reduce((s, d) => s + d.value, 0)} en los últimos 14 días`}
            />
          </Card>
          {planBreakdown.length > 1 && (
            <Card className="flex flex-col justify-center">
              <DonutChart data={planBreakdown} title="Empresas por plan" totalLabel="empresas" />
            </Card>
          )}
        </div>
      )}

      <Card>
        <p className="mb-3 font-medium">Empresas recientes</p>
        {recientes.length === 0 && <p className="text-sm text-muted-foreground">Todavía no hay empresas registradas.</p>}
        <div className="space-y-2">
          {recientes.map((e) => (
            <div key={e.id} className="flex items-center justify-between text-sm">
              <span className="truncate font-medium">{e.nombre}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {e.planNombre || 'Sin plan'} · {e.totalTarjetas} tarjeta{e.totalTarjetas === 1 ? '' : 's'}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

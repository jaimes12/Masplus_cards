import { useEffect, useState } from 'react'
import { Gift, Repeat2, Stamp, Star, TrendingUp, UserPlus, Users, UserX } from 'lucide-react'
import { api } from '../../lib/api.js'
import { Panel } from '../../components/ui.jsx'
import { PageHead, StatCard } from '../../components/empresa/EmpresaUI.jsx'
import AreaTrend from '../../components/charts/AreaTrend.jsx'
import DonutChart from '../../components/charts/DonutChart.jsx'

const ACCENT = '#F97316'

export default function Estadisticas() {
  const [data, setData] = useState(null)

  useEffect(() => {
    api.get('/api/estadisticas').then(setData)
  }, [])

  if (!data) return <p className="text-muted-foreground">Cargando...</p>

  const { kpis, clientesAcumulados, actividadSemanal, composicion, retencion } = data

  const kpiCards = [
    { icon: Users, label: 'Clientes registrados', value: kpis.clientesTotal },
    { icon: UserPlus, label: 'Clientes nuevos', value: kpis.clientesNuevos30d },
    { icon: Repeat2, label: 'Clientes activos', value: kpis.clientesActivos30d },
    { icon: Stamp, label: 'Sellos otorgados', value: kpis.sellos30d },
    { icon: Gift, label: 'Recompensas canjeadas', value: kpis.canjes30d },
    { icon: TrendingUp, label: 'Tasa de retorno', value: `${kpis.tasaRetorno}%` },
    { icon: Star, label: 'Clientes frecuentes', value: composicion.frecuente },
    { icon: UserX, label: 'Clientes inactivos', value: composicion.inactivo },
  ]

  const trendData = clientesAcumulados.map((p) => ({ label: p.etiqueta, value: p.valor }))
  const maxBar = Math.max(1, ...actividadSemanal.map((w) => w.sellos + w.canjes))
  const donutData = [
    { label: 'Frecuentes', value: composicion.frecuente, color: '#F97316' },
    { label: 'Activos', value: composicion.activo + composicion.canjeListo, color: '#2A78D6' },
    { label: 'Inactivos y nuevos', value: composicion.inactivo + composicion.nuevo, color: '#D6D2CC' },
  ].filter((d) => d.value > 0)

  return (
    <div className="space-y-4">
      <PageHead title="Estadísticas" subtitle="Comparado con los 30 días anteriores." />

      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
        {kpiCards.map((k) => (
          <StatCard key={k.label} icon={k.icon} label={k.label} value={k.value} />
        ))}
      </div>

      <Panel title="Clientes registrados acumulados">
        <AreaTrend data={trendData} color={ACCENT} />
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Sellos y canjes por semana">
          <div className="flex h-[160px] items-end gap-2.5">
            {actividadSemanal.map((w, i) => (
              <div
                key={i}
                className={`flex-1 rounded-t ${i === actividadSemanal.length - 1 ? 'bg-accent' : 'bg-secondary'}`}
                style={{ height: `${Math.max(4, ((w.sellos + w.canjes) / maxBar) * 100)}%` }}
                title={`${w.etiqueta}: ${w.sellos} sellos, ${w.canjes} canjes`}
              />
            ))}
          </div>
          <div className="mt-2 flex gap-2.5 text-[11px] text-ink-3">
            {actividadSemanal.map((w, i) => (
              <span key={i} className="flex-1 text-center">
                {w.etiqueta.split(' ')[0]}
              </span>
            ))}
          </div>
          <div className="mt-3.5 flex flex-wrap gap-4 text-sm text-ink-2">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm bg-accent" /> Semana en curso
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm bg-secondary" /> Semanas previas
            </span>
          </div>
        </Panel>

        <Panel title="Composición de la base">
          {donutData.length === 0 ? (
            <p className="text-sm text-ink-3">Todavía no hay clientes suficientes para mostrar la composición.</p>
          ) : (
            <DonutChart data={donutData} totalLabel="clientes" />
          )}
          <p className="mt-3.5 text-xs text-ink-3">
            Frecuente: 4 o más sellos en 30 días. Inactivo: sin visitas en 60 días.
          </p>
        </Panel>
      </div>

      <Panel title="Retención por cohorte de registro">
        <div className="space-y-0">
          {retencion.map((r) => (
            <div key={r.mes} className="flex items-center gap-3.5 border-t border-border py-2.5 text-sm first:border-t-0 first:pt-0">
              <span className="w-24 shrink-0 text-ink-2">{r.mes}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-accent" style={{ width: `${r.porcentajeRetenido}%` }} />
              </div>
              <b className="w-12 shrink-0 text-right tabular-nums">{r.porcentajeRetenido}%</b>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}

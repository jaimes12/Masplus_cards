import { useEffect, useState } from 'react'
import { Clock, Eye, Monitor, Palette, Smartphone, CreditCard, UserPlus, Users } from 'lucide-react'
import { api } from '../../lib/api.js'
import { Button, Card } from '../../components/ui.jsx'
import AreaTrend from '../../components/charts/AreaTrend.jsx'

const RANGOS = [
  { dias: 7, label: '7 días' },
  { dias: 30, label: '30 días' },
  { dias: 90, label: '90 días' },
]

function fmtDuracion(seg) {
  if (!seg) return '0s'
  if (seg < 60) return `${seg}s`
  const m = Math.floor(seg / 60)
  const s = seg % 60
  if (m < 60) return s ? `${m}m ${s}s` : `${m}m`
  return `${Math.floor(m / 60)}h ${m % 60}m`
}

function fmtFecha(str) {
  return new Date(str).toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function Analitica() {
  const [dias, setDias] = useState(30)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api
      .get(`/api/admin/analitica?dias=${dias}`)
      .then(setData)
      .finally(() => setLoading(false))
  }, [dias])

  if (loading && !data) return <p className="text-muted-foreground">Cargando...</p>
  if (!data) return <p className="text-muted-foreground">No se pudo cargar la analítica.</p>

  const { kpis, funnel, porDia, visitantesRecientes, registrosRecientes } = data
  const maxFunnel = Math.max(1, ...funnel.map((f) => f.visitantes))
  const sinDatos = kpis.visitantesUnicos === 0

  const kpiCards = [
    { label: 'Visitantes únicos', value: kpis.visitantesUnicos, sub: `${kpis.sesiones} sesiones`, icon: Users },
    { label: 'Páginas vistas', value: kpis.pageviews, sub: 'en el sitio público', icon: Eye },
    {
      label: 'Duración promedio',
      value: fmtDuracion(kpis.duracionPromedioSegundos),
      sub: 'por sesión',
      icon: Clock,
    },
    {
      label: 'Registros de empresa',
      value: kpis.registrosEmpresas,
      sub: `${kpis.conversionPorciento}% de conversión`,
      icon: UserPlus,
    },
    { label: 'Diseños creados', value: kpis.disenosCreados, sub: 'tarjetas diseñadas', icon: Palette },
    {
      label: 'Invitaciones emitidas',
      value: kpis.tarjetasEmitidas,
      sub: `${kpis.clientesRegistrados} clientes finales`,
      icon: CreditCard,
    },
  ]

  const trend = porDia.map((d) => ({
    label: new Date(`${d.fecha}T12:00:00`).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }),
    value: d.visitantes,
  }))
  const trendRegistros = porDia.map((d) => ({
    label: new Date(`${d.fecha}T12:00:00`).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }),
    value: d.registros,
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Analítica</h1>
          <p className="text-sm text-muted-foreground">
            Quién entra a maspluss.com, hasta dónde llega y quién se registra.
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border border-border p-1">
          {RANGOS.map((r) => (
            <Button
              key={r.dias}
              type="button"
              variant={dias === r.dias ? 'default' : 'ghost'}
              className="h-8 px-3 text-sm"
              onClick={() => setDias(r.dias)}
            >
              {r.label}
            </Button>
          ))}
        </div>
      </div>

      {sinDatos && (
        <Card>
          <p className="text-sm text-muted-foreground">
            Todavía no hay visitas registradas en este rango. El medidor propio empezó a juntar datos cuando se
            publicó esta función — desde ahora, cada visita al sitio público (landing, registro, wallet) queda
            registrada aquí de forma anónima.
          </p>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {kpiCards.map((c) => (
          <Card key={c.label} className="flex items-center gap-4">
            <div className="rounded-full bg-secondary p-3">
              <c.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm text-muted-foreground">{c.label}</p>
              <p className="text-2xl font-semibold">{c.value}</p>
              <p className="truncate text-xs text-muted-foreground">{c.sub}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <AreaTrend
            data={trend}
            title="Visitantes por día"
            subtitle={`${kpis.visitantesUnicos} visitantes únicos en ${dias} días`}
          />
        </Card>
        <Card>
          <AreaTrend
            data={trendRegistros}
            title="Registros por día"
            subtitle={`${kpis.registrosEmpresas} empresas nuevas en ${dias} días`}
          />
        </Card>
      </div>

      <Card>
        <p className="mb-1 font-medium">Funnel: de visita a registro</p>
        <p className="mb-4 text-sm text-muted-foreground">
          Cuántos visitantes distintos llegaron a cada etapa del sitio.
        </p>
        <div className="space-y-3">
          {funnel.map((f, i) => {
            const pct = Math.round((f.visitantes / maxFunnel) * 100)
            const pctDelPrimero = funnel[0].visitantes > 0 ? Math.round((f.visitantes / funnel[0].visitantes) * 100) : 0
            return (
              <div key={f.etapa}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {i + 1}. {f.nombre}
                  </span>
                  <span className="text-muted-foreground">
                    {f.visitantes} · {pctDelPrimero}%
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-secondary">
                  <div
                    className={`h-full rounded-full ${f.etapa === 'registro_completado' ? 'bg-emerald-500' : 'bg-orange-500'}`}
                    style={{ width: `${Math.max(2, pct)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="overflow-x-auto">
          <p className="mb-3 font-medium">Visitantes recientes</p>
          {visitantesRecientes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin visitas todavía.</p>
          ) : (
            <table className="w-full min-w-[540px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3">Visitante</th>
                  <th className="py-2 pr-3">Última visita</th>
                  <th className="py-2 pr-3">Llegó hasta</th>
                  <th className="py-2 pr-3 text-right">Tiempo</th>
                  <th className="py-2 text-right">Págs.</th>
                </tr>
              </thead>
              <tbody>
                {visitantesRecientes.map((v) => (
                  <tr key={v.visitanteId} className="border-t border-border">
                    <td className="py-2 pr-3">
                      <div className="flex items-center gap-2">
                        {v.dispositivo === 'mobile' ? (
                          <Smartphone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        ) : (
                          <Monitor className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        )}
                        <span className="font-mono text-xs">{v.visitanteId.slice(0, 8)}</span>
                        {v.empresaNombre && (
                          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600">
                            {v.empresaNombre}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap py-2 pr-3 text-xs text-muted-foreground">
                      {fmtFecha(v.ultimaVisita)}
                    </td>
                    <td className="py-2 pr-3 text-xs">{v.etapaMax}</td>
                    <td className="whitespace-nowrap py-2 pr-3 text-right text-xs tabular-nums">
                      {fmtDuracion(v.duracionTotalSegundos)}
                    </td>
                    <td className="py-2 text-right text-xs tabular-nums">{v.pageviews}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card className="overflow-x-auto">
          <p className="mb-3 font-medium">Registros recientes</p>
          {registrosRecientes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin registros en este rango.</p>
          ) : (
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3">Empresa</th>
                  <th className="py-2 pr-3">Plan</th>
                  <th className="py-2 pr-3 text-right">Diseños</th>
                  <th className="py-2 pr-3 text-right">Tarjetas</th>
                  <th className="py-2 text-right">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {registrosRecientes.map((r) => (
                  <tr key={r.empresaId} className="border-t border-border">
                    <td className="py-2 pr-3">
                      <p className="font-medium">{r.nombre}</p>
                      <p className="text-xs text-muted-foreground">{r.email}</p>
                    </td>
                    <td className="py-2 pr-3 text-xs">{r.plan || 'Sin plan'}</td>
                    <td className="py-2 pr-3 text-right text-xs tabular-nums">{r.disenos}</td>
                    <td className="py-2 pr-3 text-right text-xs tabular-nums">{r.tarjetas}</td>
                    <td className="whitespace-nowrap py-2 text-right text-xs text-muted-foreground">
                      {fmtFecha(r.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  )
}

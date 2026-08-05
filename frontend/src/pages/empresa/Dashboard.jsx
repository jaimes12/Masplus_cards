import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CreditCard, Gift, Plus, Stamp, Users } from 'lucide-react'
import { api } from '../../lib/api.js'
import { Button, Panel } from '../../components/ui.jsx'
import { PageHead, StatCard } from '../../components/empresa/EmpresaUI.jsx'

const MOVIMIENTOS = {
  tarjeta_creada: { label: 'Registro', tone: 'bg-secondary text-ink-2' },
  sello_agregado: { label: '+1 sello', tone: 'bg-accent/10 text-accent' },
  sello_quitado: { label: '-1 sello', tone: 'bg-bad-soft text-bad' },
  sellos_editados: { label: 'Ajuste', tone: 'bg-warn-soft text-warn' },
  premio_canjeado: { label: 'Canje', tone: 'bg-ok-soft text-ok' },
  cupon_canjeado: { label: 'Canje', tone: 'bg-ok-soft text-ok' },
}

function formatRelativo(fechaStr) {
  const fecha = new Date(fechaStr)
  const diffMs = Date.now() - fecha.getTime()
  const min = Math.floor(diffMs / 60000)
  if (min < 1) return 'ahora'
  if (min < 60) return `hace ${min} min`
  const horas = Math.floor(min / 60)
  if (horas < 24) return `hace ${horas} h`
  const dias = Math.floor(horas / 24)
  if (dias === 1) return 'ayer'
  if (dias < 7) return `hace ${dias} días`
  return fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}

export default function Dashboard() {
  const [disenos, setDisenos] = useState([])
  const [clientes, setClientes] = useState([])
  const [tarjetas, setTarjetas] = useState([])
  const [estadisticas, setEstadisticas] = useState(null)
  const [actividad, setActividad] = useState([])
  const [loading, setLoading] = useState(true)
  const nombre = (JSON.parse(localStorage.getItem('masplus_auth') || 'null')?.nombre || '').split(' ')[0]

  useEffect(() => {
    Promise.all([
      api.get('/api/disenos'),
      api.get('/api/clientes'),
      api.get('/api/tarjetas'),
      api.get('/api/estadisticas'),
      api.get('/api/empresa/historial?pageSize=5'),
    ])
      .then(([d, c, t, e, h]) => {
        setDisenos(d)
        setClientes(c)
        setTarjetas(t)
        setEstadisticas(e)
        setActividad(h.items)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading || !estadisticas) return <p className="text-muted-foreground">Cargando...</p>

  const sellosOtorgados = tarjetas.reduce((sum, t) => sum + t.sellosActuales + t.premiosCanjeados * t.sellosRequeridos, 0)
  const canjesRealizados = tarjetas.reduce((sum, t) => sum + t.premiosCanjeados, 0)
  const disenosActivos = disenos.filter((d) => d.activo).length
  const sellosSemanales = estadisticas.actividadSemanal.reduce((s, w) => s + w.sellos, 0)
  const maxTarjetasCount = Math.max(1, ...disenos.map((d) => d.tarjetasCount || 0))
  const maxBarSemana = Math.max(1, ...estadisticas.actividadSemanal.map((w) => w.sellos))

  const cards = [
    { label: 'Tarjetas creadas', value: disenos.length, delta: `${disenosActivos} activas`, icon: CreditCard },
    {
      label: 'Clientes registrados',
      value: clientes.length,
      delta: `+${estadisticas.kpis.clientesNuevos30d} este mes`,
      icon: Users,
    },
    {
      label: 'Sellos otorgados',
      value: sellosOtorgados,
      delta: `+${estadisticas.kpis.sellos30d} este mes`,
      icon: Stamp,
    },
    {
      label: 'Canjes realizados',
      value: canjesRealizados,
      delta: `+${estadisticas.kpis.canjes30d} este mes`,
      icon: Gift,
    },
  ]

  return (
    <div className="space-y-4">
      <PageHead
        title={`Hola, ${nombre || 'de nuevo'}`}
        subtitle="Esto pasó en tu programa los últimos 30 días."
        actions={
          <Link to="/empresa/disenos">
            <Button className="gap-2 !bg-gradient-to-br !from-orange-500 !to-orange-600 !text-white">
              <Plus className="h-4 w-4" /> Crear nueva tarjeta
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <StatCard key={c.label} icon={c.icon} label={c.label} value={c.value} delta={c.delta} deltaTone="up" />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.45fr_1fr]">
        <Panel title="Actividad reciente" action={<Link to="/empresa/historial" className="text-sm font-semibold text-accent">Ver historial</Link>} bodyClassName="overflow-x-auto">
          {actividad.length === 0 ? (
            <p className="p-5 text-sm text-ink-3">Todavía no hay movimientos.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold tracking-wide text-ink-3 uppercase">
                  <th className="px-5 py-3">Cliente</th>
                  <th className="px-5 py-3">Movimiento</th>
                  <th className="px-5 py-3">Tarjeta</th>
                  <th className="px-5 py-3 text-right">Cuándo</th>
                </tr>
              </thead>
              <tbody>
                {actividad.map((item) => {
                  const mv = MOVIMIENTOS[item.accion] ?? { label: item.accion, tone: 'bg-secondary text-ink-2' }
                  return (
                    <tr key={item.id} className="border-t border-border">
                      <td className="px-5 py-3 font-semibold text-foreground">{item.clienteNombre ?? '—'}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${mv.tone}`}>
                          {mv.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-ink-2">{item.disenoNombre ?? '—'}</td>
                      <td className="px-5 py-3 text-right text-xs text-ink-3 tabular-nums">{formatRelativo(item.createdAt)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </Panel>

        <div className="flex flex-col gap-4">
          <Panel title="Sellos por semana">
            <div className="flex h-[120px] items-end gap-2">
              {estadisticas.actividadSemanal.map((w, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-t ${i === estadisticas.actividadSemanal.length - 1 ? 'bg-accent' : 'bg-secondary'}`}
                  style={{ height: `${Math.max(4, (w.sellos / maxBarSemana) * 100)}%` }}
                  title={`${w.etiqueta}: ${w.sellos} sellos`}
                />
              ))}
            </div>
            <div className="mt-2 flex gap-2 text-[11px] text-ink-3">
              {estadisticas.actividadSemanal.map((w, i) => (
                <span key={i} className="flex-1 text-center">
                  {w.etiqueta.split(' ')[0]}
                </span>
              ))}
            </div>
            <p className="mt-3.5 text-sm text-ink-2">{sellosSemanales} sellos en las últimas 7 semanas.</p>
          </Panel>

          <Panel title="Tus tarjetas" action={<Link to="/empresa/disenos" className="text-sm font-semibold text-accent">Administrar</Link>} bodyClassName="p-2">
            {disenos.length === 0 && <p className="p-3.5 text-sm text-ink-3">Todavía no creaste ninguna tarjeta.</p>}
            {disenos.slice(0, 4).map((d) => (
              <div key={d.id} className="flex items-center gap-3.5 p-2.5">
                <span
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white"
                  style={{ background: d.colorPrimario || '#12100F' }}
                >
                  {d.tipo === 'cupon' ? <Gift className="h-5 w-5" /> : <Stamp className="h-5 w-5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{d.nombre}</p>
                  <p className="truncate text-xs text-ink-3">
                    {d.tipo === 'cupon' ? 'Cupón' : `${d.sellosRequeridos} sellos`} · {d.tarjetasCount} clientes
                  </p>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${Math.max(4, ((d.tarjetasCount || 0) / maxTarjetasCount) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </Panel>
        </div>
      </div>
    </div>
  )
}

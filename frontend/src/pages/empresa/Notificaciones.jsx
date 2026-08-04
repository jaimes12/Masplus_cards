import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CreditCard, Gift, PauseCircle, PlayCircle } from 'lucide-react'
import { api } from '../../lib/api.js'
import { EmptyState, PageHead, Panel } from '../../components/empresa/EmpresaUI.jsx'

const TIPOS = {
  tarjeta_completada: { icon: Gift, tone: 'bg-ok-soft text-ok' },
  pago_procesado: { icon: CreditCard, tone: 'bg-accent/10 text-accent' },
  diseno_pausado: { icon: PauseCircle, tone: 'bg-warn-soft text-warn' },
  diseno_reactivado: { icon: PlayCircle, tone: 'bg-ok-soft text-ok' },
}

function formatFecha(fechaStr) {
  const fecha = new Date(fechaStr)
  const diffMin = Math.floor((Date.now() - fecha.getTime()) / 60000)
  if (diffMin < 60) return `hace ${Math.max(diffMin, 0)} min`
  if (diffMin < 1440) return `hace ${Math.floor(diffMin / 60)} h`
  return fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}

export default function Notificaciones() {
  const [items, setItems] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/api/empresa/notificaciones').then(setItems)
    api.post('/api/empresa/notificaciones/marcar-leidas').catch(() => {})
  }, [])

  if (!items) return <p className="text-muted-foreground">Cargando...</p>

  return (
    <div className="space-y-6">
      <PageHead title="Notificaciones" subtitle="Avisos de tu programa de fidelidad." />

      {items.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-5 w-5" />}
          title="No tenés notificaciones"
          description="Acá vas a ver avisos cuando un cliente complete su tarjeta, se procese un pago o cambie el estado de un diseño."
        />
      ) : (
        <Panel bodyClassName="p-0">
          {items.map((n) => {
            const cfg = TIPOS[n.tipo] ?? { icon: Bell, tone: 'bg-secondary text-ink-2' }
            return (
              <div
                key={n.id}
                onClick={() => n.linkView && navigate(`/empresa/${n.linkView}`)}
                className={`flex items-center gap-3.5 border-t border-border px-5 py-4 first:border-t-0 ${
                  n.linkView ? 'cursor-pointer hover:bg-secondary/40' : ''
                } ${!n.leida ? 'bg-accent/5' : ''}`}
              >
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${cfg.tone}`}>
                  <cfg.icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{n.titulo}</p>
                  <p className="mt-0.5 text-sm text-ink-2">{n.mensaje}</p>
                </div>
                <span className="shrink-0 text-xs text-ink-3 whitespace-nowrap tabular-nums">{formatFecha(n.createdAt)}</span>
              </div>
            )
          })}
        </Panel>
      )}
    </div>
  )
}

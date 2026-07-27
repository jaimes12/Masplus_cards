import { useEffect, useState } from 'react'
import { Building2, CreditCard, Gift, LayoutTemplate, Palette, Users } from 'lucide-react'
import { api } from '../../lib/api.js'
import { Card } from '../../components/ui.jsx'

export default function Dashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get('/api/admin/stats').then(setStats)
  }, [])

  if (!stats) return <p className="text-muted-foreground">Cargando...</p>

  const cards = [
    { label: 'Empresas', value: stats.totalEmpresas, icon: Building2 },
    { label: 'Templates', value: stats.totalTemplates, icon: LayoutTemplate },
    { label: 'Diseños', value: stats.totalDisenos, icon: Palette },
    { label: 'Tarjetas emitidas', value: stats.totalTarjetas, icon: CreditCard },
    { label: 'Clientes finales', value: stats.totalClientes, icon: Users },
    { label: 'Premios canjeados', value: stats.premiosCanjeados, icon: Gift },
  ]

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
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CreditCard, Gift, Palette, Stamp, Users } from 'lucide-react'
import { api } from '../../lib/api.js'
import { Card } from '../../components/ui.jsx'

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
          <div className="space-y-2">
            {recientes.map((t) => (
              <div key={t.id} className="flex items-center justify-between text-sm">
                <span>{t.clienteNombre}</span>
                <span className="text-muted-foreground">
                  {t.sellosActuales}/{t.sellosRequeridos} sellos
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

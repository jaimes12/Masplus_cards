import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api.js'
import { Card } from '../../components/ui.jsx'

export default function Dashboard() {
  const [disenos, setDisenos] = useState([])
  const [tarjetas, setTarjetas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/api/disenos'), api.get('/api/tarjetas')])
      .then(([d, t]) => {
        setDisenos(d)
        setTarjetas(t)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-muted-foreground">Cargando...</p>

  const activo = disenos.find((d) => d.esActivoDeEmpresa)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Inicio</h1>

      {!activo && (
        <Card className="border-destructive/40">
          <p className="text-sm">
            Todavía no tenés un diseño activo.{' '}
            <Link to="/empresa/disenos" className="underline">
              Elegí o creá uno
            </Link>{' '}
            antes de emitir tarjetas.
          </p>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <p className="text-sm text-muted-foreground">Tarjetas emitidas</p>
          <p className="text-3xl font-semibold">{tarjetas.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">Diseño activo</p>
          <p className="text-lg font-medium">{activo?.nombre ?? '—'}</p>
        </Card>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { api } from '../../lib/api.js'
import { Card } from '../../components/ui.jsx'

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/api/clientes')
      .then(setClientes)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-muted-foreground">Cargando...</p>

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Clientes</h1>
      {clientes.length === 0 && <p className="text-sm text-muted-foreground">Todavía no tenés clientes.</p>}
      <div className="space-y-2">
        {clientes.map((c) => (
          <Card key={c.id}>
            <p className="font-medium">{c.nombre}</p>
            <p className="text-sm text-muted-foreground">
              {c.telefono}
              {c.email ? ` · ${c.email}` : ''}
            </p>
          </Card>
        ))}
      </div>
    </div>
  )
}

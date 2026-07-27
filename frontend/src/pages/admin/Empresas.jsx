import { useEffect, useState } from 'react'
import { api } from '../../lib/api.js'
import { Card } from '../../components/ui.jsx'

export default function Empresas() {
  const [empresas, setEmpresas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/api/admin/empresas')
      .then(setEmpresas)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-muted-foreground">Cargando...</p>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Empresas</h1>
        <p className="text-sm text-muted-foreground">Negocios registrados en la plataforma.</p>
      </div>
      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/50 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Diseños</th>
              <th className="px-4 py-3 font-medium">Tarjetas</th>
              <th className="px-4 py-3 font-medium">Alta</th>
            </tr>
          </thead>
          <tbody>
            {empresas.map((e) => (
              <tr key={e.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">{e.nombre}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.email}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">{e.estado}</span>
                </td>
                <td className="px-4 py-3">{e.totalDisenos}</td>
                <td className="px-4 py-3">{e.totalTarjetas}</td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(e.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {empresas.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Todavía no hay empresas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

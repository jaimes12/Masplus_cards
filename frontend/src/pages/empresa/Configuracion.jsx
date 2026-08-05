import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api.js'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { Button, Input, Label, Panel, Tabs } from '../../components/ui.jsx'
import { PageHead } from '../../components/empresa/EmpresaUI.jsx'
import ImageUploadInput from '../../components/ImageUploadInput.jsx'

const TABS = [
  { value: 'negocio', label: 'Negocio' },
  { value: 'facturacion', label: 'Facturación' },
]

function NegocioTab() {
  const { auth, login } = useAuth()
  const [form, setForm] = useState({ nombre: '', logo: '', telefono: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    api.get('/api/empresa/perfil').then((data) => {
      setForm({ nombre: data.nombre || '', logo: data.logo || '', telefono: data.telefono || '' })
      setLoading(false)
    })
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const updated = await api.put('/api/empresa/perfil', {
        nombre: form.nombre,
        logo: form.logo || null,
        telefono: form.telefono || null,
      })
      login({ ...auth, nombre: updated.nombre })
      setSuccess('Cambios guardados.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-sm text-ink-3">Cargando...</p>

  return (
    <Panel title="Información general" className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Logo del negocio</Label>
          <ImageUploadInput value={form.logo} onChange={(url) => setForm({ ...form, logo: url })} />
        </div>
        <div>
          <Label>Nombre del negocio</Label>
          <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
        </div>
        <div>
          <Label>Teléfono</Label>
          <Input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {success && <p className="text-sm text-ok">{success}</p>}
        <Button type="submit" disabled={saving} className="!bg-gradient-to-br !from-orange-500 !to-orange-600 !text-white">
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </form>
    </Panel>
  )
}

function FacturacionTab() {
  const [data, setData] = useState(null)

  useEffect(() => {
    api.get('/api/empresa/plan').then(setData).catch(() => {})
  }, [])

  if (!data) return <p className="text-sm text-ink-3">Cargando...</p>

  const { planActual, renuevaEl } = data

  return (
    <Panel title="Suscripción" className="max-w-2xl">
      <p className="text-[26px] font-semibold tracking-tight text-foreground">
        {planActual?.nombre || 'Sin plan activo'}
        {planActual?.precioMensual != null && (
          <span className="ml-2 text-sm font-medium text-ink-3">${planActual.precioMensual} / mes</span>
        )}
      </p>
      {renuevaEl && (
        <p className="mt-2 text-sm text-ink-2">
          Se renueva el {new Date(renuevaEl).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}.
        </p>
      )}
      <Link to="/empresa/plan">
        <Button className="mt-4 !bg-gradient-to-br !from-orange-500 !to-orange-600 !text-white">Cambiar plan o ver facturación</Button>
      </Link>
    </Panel>
  )
}

export default function Configuracion() {
  const [tab, setTab] = useState('negocio')

  return (
    <div>
      <PageHead title="Configuración" subtitle="Los datos de tu negocio y tu suscripción." />
      <Tabs tabs={TABS} value={tab} onChange={setTab} />
      {tab === 'negocio' && <NegocioTab />}
      {tab === 'facturacion' && <FacturacionTab />}
    </div>
  )
}

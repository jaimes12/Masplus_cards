import { useEffect, useState } from 'react'
import { api } from '../../lib/api.js'
import { Button, Card, Input, Label, Select } from '../../components/ui.jsx'

const emptyForm = { nombre: '', descripcion: '', tipoRecompensa: 'sellos' }

export default function Templates() {
  const [templates, setTemplates] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    setTemplates(await api.get('/api/templates?soloActivos=false'))
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.post('/api/templates', { ...form, previewImg: null, estructura: null, activo: true })
      setForm(emptyForm)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function toggleActivo(t) {
    await api.put(`/api/templates/${t.id}`, {
      nombre: t.nombre,
      descripcion: t.descripcion,
      previewImg: t.previewImg,
      tipoRecompensa: t.tipoRecompensa,
      estructura: t.estructura,
      activo: !t.activo,
    })
    await load()
  }

  if (loading) return <p className="text-muted-foreground">Cargando...</p>

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Templates</h1>

      <Card>
        <h2 className="mb-3 text-lg font-medium">Nuevo template</h2>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Nombre</Label>
            <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
          </div>
          <div>
            <Label>Tipo de tarjeta</Label>
            <Select value={form.tipoRecompensa} onChange={(e) => setForm({ ...form, tipoRecompensa: e.target.value })}>
              <option value="sellos">Sellos (tarjeta de estampas)</option>
              <option value="cupon">Cupón</option>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label>Descripción</Label>
            <Input value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
          </div>
          {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
          <Button type="submit" disabled={saving} className="sm:col-span-2">
            {saving ? 'Guardando...' : 'Crear template'}
          </Button>
        </form>
      </Card>

      <div className="space-y-2">
        {templates.map((t) => (
          <Card key={t.id} className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                {t.nombre}{' '}
                <span className="text-sm text-muted-foreground">
                  ({t.tipoRecompensa === 'cupon' ? 'Cupón' : 'Sellos'})
                </span>
              </p>
              <p className="text-sm text-muted-foreground">{t.descripcion}</p>
            </div>
            <Button variant="outline" onClick={() => toggleActivo(t)}>
              {t.activo ? 'Desactivar' : 'Activar'}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}

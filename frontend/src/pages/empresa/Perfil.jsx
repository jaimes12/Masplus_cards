import { useEffect, useState } from 'react'
import { api } from '../../lib/api.js'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { Button, Card, Input, Label } from '../../components/ui.jsx'
import ImageUploadInput from '../../components/ImageUploadInput.jsx'

export default function Perfil() {
  const { auth, login } = useAuth()
  const [form, setForm] = useState({ nombre: '', email: '', logo: '', telefono: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [passwordForm, setPasswordForm] = useState({ actual: '', nueva: '', confirmar: '' })
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  useEffect(() => {
    api.get('/api/empresa/perfil').then((data) => {
      setForm({
        nombre: data.nombre || '',
        email: data.email || '',
        logo: data.logo || '',
        telefono: data.telefono || '',
      })
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
      setSuccess('Perfil actualizado.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (passwordForm.nueva !== passwordForm.confirmar) {
      setPasswordError('La contraseña nueva y la confirmación no coinciden.')
      return
    }

    setChangingPassword(true)
    try {
      await api.post('/api/empresa/perfil/password', {
        passwordActual: passwordForm.actual,
        passwordNueva: passwordForm.nueva,
      })
      setPasswordForm({ actual: '', nueva: '', confirmar: '' })
      setPasswordSuccess('Contraseña actualizada.')
    } catch (err) {
      setPasswordError(err.message)
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) return <p className="text-muted-foreground">Cargando...</p>

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Perfil</h1>
        <p className="text-sm text-muted-foreground">Datos de tu cuenta de empresa.</p>
      </div>

      <Card>
        <h2 className="mb-4 text-lg font-medium">Datos generales</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Foto / logo</Label>
            <ImageUploadInput value={form.logo} onChange={(url) => setForm({ ...form, logo: url })} />
          </div>
          <div>
            <Label>Nombre</Label>
            <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={form.email} disabled className="cursor-not-allowed opacity-60" />
            <p className="mt-1 text-xs text-muted-foreground">El email de acceso no se puede cambiar.</p>
          </div>
          <div>
            <Label>Teléfono</Label>
            <Input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-primary">{success}</p>}
          <Button type="submit" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </form>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-medium">Cambiar contraseña</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <Label>Contraseña actual</Label>
            <Input
              type="password"
              value={passwordForm.actual}
              onChange={(e) => setPasswordForm({ ...passwordForm, actual: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Contraseña nueva</Label>
            <Input
              type="password"
              value={passwordForm.nueva}
              onChange={(e) => setPasswordForm({ ...passwordForm, nueva: e.target.value })}
              minLength={6}
              required
            />
          </div>
          <div>
            <Label>Confirmar contraseña nueva</Label>
            <Input
              type="password"
              value={passwordForm.confirmar}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmar: e.target.value })}
              minLength={6}
              required
            />
          </div>
          {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
          {passwordSuccess && <p className="text-sm text-primary">{passwordSuccess}</p>}
          <Button type="submit" variant="outline" disabled={changingPassword}>
            {changingPassword ? 'Actualizando...' : 'Cambiar contraseña'}
          </Button>
        </form>
      </Card>
    </div>
  )
}

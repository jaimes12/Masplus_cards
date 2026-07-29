import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/api.js'
import { Button, Input, Label } from '../components/ui.jsx'
import CardPreview from '../components/CardPreview.jsx'
import masplusLogo from '../assets/masplus_logo.png'

const pageBackgroundStyle = { background: '#FFFFFF' }

/// Mismo patrón de marca de agua que la wallet web, para que el registro se sienta parte del mismo flujo.
function PageWatermarkPattern() {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" focusable="false">
      <defs>
        <pattern id="mp-page-pattern" width="280" height="200" patternUnits="userSpaceOnUse" patternTransform="rotate(-28)">
          <image href={masplusLogo} x="10" y="30" width="180" height="180" opacity="0.16" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#mp-page-pattern)" />
    </svg>
  )
}

export default function Registro() {
  const { codigo } = useParams()
  const navigate = useNavigate()
  const [diseno, setDiseno] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [form, setForm] = useState({ nombre: '', telefono: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get(`/api/registro/${codigo}`)
      .then(setDiseno)
      .catch((err) => setLoadError(err.message || 'Este enlace de registro no está disponible.'))
      .finally(() => setLoading(false))
  }, [codigo])

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const result = await api.post(`/api/registro/${codigo}`, form)
      navigate(`/wallet/${result.codigoQr}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="relative flex min-h-svh items-center justify-center overflow-hidden p-4" style={pageBackgroundStyle}>
        <PageWatermarkPattern />
        <p className="relative z-10 text-sm text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  if (loadError || !diseno) {
    return (
      <div className="relative flex min-h-svh items-center justify-center overflow-hidden p-4 text-center" style={pageBackgroundStyle}>
        <PageWatermarkPattern />
        <p className="relative z-10 max-w-xs text-sm text-muted-foreground">
          {loadError || 'Este enlace de registro no está disponible.'}
        </p>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden p-4" style={pageBackgroundStyle}>
      <PageWatermarkPattern />
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-6">
        <CardPreview
          empresaNombre={diseno.empresaNombre}
          clienteNombre={form.nombre || 'Tu nombre'}
          tipo={diseno.tipo}
          logo={diseno.logo}
          iconoSello={diseno.iconoSello}
          fondoUrl={diseno.fondoUrl}
          colorPrimario={diseno.colorPrimario}
          colorTexto={diseno.colorTexto}
          sellosRequeridos={diseno.sellosRequeridos}
          sellosActuales={0}
          vencimiento={diseno.vencimiento}
          descripcion={diseno.descripcion}
        />

        <form onSubmit={handleSubmit} className="w-full space-y-4 rounded-2xl bg-card p-6 shadow-lg">
          <div>
            <p className="font-semibold">{diseno.empresaNombre}</p>
            <p className="text-sm text-muted-foreground">
              {diseno.tipo === 'cupon'
                ? 'Registrate con tu nombre y teléfono para obtener tu cupón.'
                : 'Registrate con tu nombre y teléfono para empezar a juntar sellos.'}
            </p>
          </div>
          <div>
            <Label>Nombre</Label>
            <Input value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} required />
          </div>
          <div>
            <Label>Teléfono</Label>
            <Input
              type="tel"
              value={form.telefono}
              onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Creando tu tarjeta...' : 'Obtener mi tarjeta'}
          </Button>
        </form>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ScanLine, X } from 'lucide-react'
import { api } from '../../lib/api.js'
import { Button, Card, Input, Label, Select } from '../../components/ui.jsx'
import QrScanner from '../../components/QrScanner.jsx'
import ErrorBoundary from '../../components/ErrorBoundary.jsx'

const emptyForm = { nombre: '', telefono: '', email: '', disenoId: '' }

export default function Tarjetas() {
  const [tarjetas, setTarjetas] = useState([])
  const [disenos, setDisenos] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState(null)

  async function load() {
    const [t, d] = await Promise.all([api.get('/api/tarjetas'), api.get('/api/disenos')])
    setTarjetas(t)
    setDisenos(d)
    setForm((f) => (f.disenoId ? f : { ...f, disenoId: String(d.find((x) => x.esActivoDeEmpresa)?.id ?? d[0]?.id ?? '') }))
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function handleEmitir(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.post('/api/tarjetas/emitir', {
        nombre: form.nombre,
        telefono: form.telefono,
        email: form.email || null,
        walletTipo: 'web',
        disenoId: Number(form.disenoId),
      })
      setForm((f) => ({ ...emptyForm, disenoId: f.disenoId }))
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function sumarSello(id) {
    await api.post(`/api/tarjetas/${id}/sello`)
    await load()
  }

  async function canjear(id) {
    try {
      await api.post(`/api/tarjetas/${id}/canjear`)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  async function canjearCupon(id) {
    try {
      await api.post(`/api/tarjetas/${id}/canjear-cupon`)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleScan(codigoQr) {
    setScanning(false)
    try {
      const tarjeta = await api.post(`/api/tarjetas/escanear/${codigoQr}/sello`)
      setScanResult({ ok: true, tarjeta })
      await load()
    } catch (err) {
      setScanResult({ ok: false, message: err.message })
    }
  }

  if (loading) return <p className="text-muted-foreground">Cargando...</p>

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tarjetas</h1>
        <Button onClick={() => { setScanResult(null); setScanning(true) }} className="gap-2">
          <ScanLine className="h-4 w-4" /> Escanear QR
        </Button>
      </div>

      {scanning && (
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <p className="font-medium">Apuntá la cámara al QR de la tarjeta del cliente</p>
            <button
              type="button"
              onClick={() => setScanning(false)}
              className="rounded-md p-1 text-muted-foreground hover:bg-secondary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <ErrorBoundary
            fallback={<p className="text-sm text-destructive">No se pudo abrir la cámara en este dispositivo.</p>}
          >
            <QrScanner onScan={handleScan} />
          </ErrorBoundary>
        </Card>
      )}

      {scanResult && (
        <Card className={scanResult.ok ? 'border-primary/40' : 'border-destructive/40'}>
          {scanResult.ok ? (
            <p className="text-sm">
              Sello agregado a <span className="font-medium">{scanResult.tarjeta.clienteNombre}</span> —{' '}
              {scanResult.tarjeta.sellosActuales} / {scanResult.tarjeta.sellosRequeridos} sellos
            </p>
          ) : (
            <p className="text-sm text-destructive">{scanResult.message}</p>
          )}
          <Button variant="outline" className="mt-3" onClick={() => { setScanResult(null); setScanning(true) }}>
            Escanear otra
          </Button>
        </Card>
      )}

      {disenos.length === 0 ? (
        <Card>
          <p className="text-sm text-muted-foreground">
            Todavía no tenés ningún diseño. Creá uno en <Link to="/empresa/disenos" className="underline">Diseños</Link> antes de emitir tarjetas.
          </p>
        </Card>
      ) : (
        <Card>
          <h2 className="mb-3 text-lg font-medium">Emitir tarjeta nueva</h2>
          <form onSubmit={handleEmitir} className="grid gap-4 sm:grid-cols-4">
            <div>
              <Label>Diseño</Label>
              <Select value={form.disenoId} onChange={(e) => setForm({ ...form, disenoId: e.target.value })} required>
                {disenos.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nombre} ({d.tipo === 'cupon' ? 'Promoción' : 'Sellos'})
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Nombre</Label>
              <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} required />
            </div>
            <div>
              <Label>Email (opcional)</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            {error && <p className="text-sm text-destructive sm:col-span-4">{error}</p>}
            <Button type="submit" disabled={saving} className="sm:col-span-4">
              {saving ? 'Emitiendo...' : 'Emitir tarjeta'}
            </Button>
          </form>
        </Card>
      )}

      <div className="space-y-8">
        {tarjetas.length === 0 && disenos.length > 0 && (
          <p className="text-sm text-muted-foreground">Todavía no emitiste tarjetas.</p>
        )}
        {disenos
          .filter((d) => tarjetas.some((t) => t.disenoId === d.id))
          .map((d) => {
            const tarjetasDelDiseno = tarjetas.filter((t) => t.disenoId === d.id)
            return (
              <div key={d.id}>
                <div className="mb-3 flex items-center gap-2">
                  <h2 className="text-lg font-medium">{d.nombre}</h2>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                    {d.tipo === 'cupon' ? 'Promoción' : 'Sellos'}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    · {tarjetasDelDiseno.length} tarjeta{tarjetasDelDiseno.length === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="space-y-3">
                  {tarjetasDelDiseno.map((t) => (
                    <Card key={t.id} className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">
                          {t.clienteNombre} · {t.clienteTelefono}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t.tipo === 'cupon'
                            ? `${t.descripcion || 'Cupón'} · ${t.cuponRedimido ? 'canjeado' : t.vencimiento ? `vence ${new Date(t.vencimiento).toLocaleDateString('es-MX')}` : 'sin vencimiento'}`
                            : `${t.sellosActuales} / ${t.sellosRequeridos} sellos · ${t.premiosCanjeados} premios canjeados`}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {t.tipo === 'cupon' ? (
                          <Button variant="outline" onClick={() => canjearCupon(t.id)} disabled={t.cuponRedimido}>
                            {t.cuponRedimido ? 'Cupón canjeado' : 'Canjear cupón'}
                          </Button>
                        ) : (
                          <>
                            <Button variant="outline" onClick={() => sumarSello(t.id)}>
                              + Sello
                            </Button>
                            <Button variant="outline" onClick={() => canjear(t.id)}>
                              Canjear premio
                            </Button>
                          </>
                        )}
                        <Link to={`/wallet/${t.codigoQr}`} target="_blank">
                          <Button variant="ghost">Ver wallet</Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ScanLine, X } from 'lucide-react'
import { api } from '../../lib/api.js'
import { Button, Card, Input, Label } from '../../components/ui.jsx'
import QrScanner from '../../components/QrScanner.jsx'
import ErrorBoundary from '../../components/ErrorBoundary.jsx'

export default function Tarjetas() {
  const [tarjetas, setTarjetas] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ nombre: '', telefono: '', email: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState(null)

  async function load() {
    setTarjetas(await api.get('/api/tarjetas'))
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
      await api.post('/api/tarjetas/emitir', { ...form, email: form.email || null, walletTipo: 'web' })
      setForm({ nombre: '', telefono: '', email: '' })
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

      <Card>
        <h2 className="mb-3 text-lg font-medium">Emitir tarjeta nueva</h2>
        <form onSubmit={handleEmitir} className="grid gap-4 sm:grid-cols-3">
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
          {error && <p className="text-sm text-destructive sm:col-span-3">{error}</p>}
          <Button type="submit" disabled={saving} className="sm:col-span-3">
            {saving ? 'Emitiendo...' : 'Emitir tarjeta'}
          </Button>
        </form>
      </Card>

      <div className="space-y-3">
        {tarjetas.length === 0 && <p className="text-sm text-muted-foreground">Todavía no emitiste tarjetas.</p>}
        {tarjetas.map((t) => (
          <Card key={t.id} className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium">
                {t.clienteNombre} · {t.clienteTelefono}
              </p>
              <p className="text-sm text-muted-foreground">
                {t.sellosActuales} / {t.sellosRequeridos} sellos · {t.premiosCanjeados} premios canjeados
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => sumarSello(t.id)}>
                + Sello
              </Button>
              <Button variant="outline" onClick={() => canjear(t.id)}>
                Canjear premio
              </Button>
              <Link to={`/wallet/${t.codigoQr}`} target="_blank">
                <Button variant="ghost">Ver wallet</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

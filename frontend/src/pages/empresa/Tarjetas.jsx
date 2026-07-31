import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Minus, Pencil, Plus, ScanLine, Search, X } from 'lucide-react'
import { api } from '../../lib/api.js'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { Button, Card, Input, Label, Select } from '../../components/ui.jsx'
import MiniCardPreview from '../../components/MiniCardPreview.jsx'
import QrScanner from '../../components/QrScanner.jsx'
import ErrorBoundary from '../../components/ErrorBoundary.jsx'

const emptyForm = { nombre: '', telefono: '', email: '', disenoId: '' }

function EditarSellosModal({ tarjeta, onClose, onSaved }) {
  const [valor, setValor] = useState(String(tarjeta.sellosActuales))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function guardar(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const actualizada = await api.put(`/api/tarjetas/${tarjeta.id}/sellos`, { sellosActuales: Number(valor) })
      onSaved(actualizada)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-soft-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Editar sellos</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          {tarjeta.clienteNombre} · {tarjeta.disenoNombre}
        </p>
        <form onSubmit={guardar} className="space-y-4">
          <div>
            <Label>Sellos actuales (de {tarjeta.sellosRequeridos})</Label>
            <Input
              type="number"
              min="0"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              autoFocus
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Tarjetas() {
  const { auth } = useAuth()
  const [searchParams] = useSearchParams()
  const [tarjetas, setTarjetas] = useState([])
  const [disenos, setDisenos] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState(null)

  const [filtroDiseno, setFiltroDiseno] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [editando, setEditando] = useState(null)

  const selectedDiseno = disenos.find((d) => String(d.id) === form.disenoId)

  async function load() {
    const [t, d] = await Promise.all([api.get('/api/tarjetas'), api.get('/api/disenos')])
    setTarjetas(t)
    setDisenos(d)
    setForm((f) => {
      if (f.disenoId) return f
      const disenoIdUrl = searchParams.get('disenoId')
      const preferido = disenoIdUrl && d.some((x) => String(x.id) === disenoIdUrl)
        ? disenoIdUrl
        : String(d.find((x) => x.esActivoDeEmpresa)?.id ?? d[0]?.id ?? '')
      return { ...f, disenoId: preferido }
    })
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

  async function restarSello(id) {
    try {
      await api.post(`/api/tarjetas/${id}/sello/quitar`)
      await load()
    } catch (err) {
      setError(err.message)
    }
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

  const tarjetasFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return tarjetas.filter((t) => {
      if (filtroDiseno && String(t.disenoId) !== filtroDiseno) return false
      if (!q) return true
      return t.clienteNombre?.toLowerCase().includes(q) || t.clienteTelefono?.toLowerCase().includes(q)
    })
  }, [tarjetas, filtroDiseno, busqueda])

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
        <Card className={`border-2 ${scanResult.ok ? 'border-primary/40' : 'border-destructive/40'}`}>
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
          <form onSubmit={handleEmitir} className="grid gap-4 sm:grid-cols-[auto_1fr]">
            <div className="flex justify-center sm:justify-start">
              {selectedDiseno && (
                <MiniCardPreview
                  empresaNombre={auth?.nombre}
                  clienteNombre={form.nombre || 'Cliente de ejemplo'}
                  tipo={selectedDiseno.tipo}
                  logo={selectedDiseno.logo}
                  iconoSello={selectedDiseno.iconoSello}
                  fondoUrl={selectedDiseno.fondoUrl}
                  colorPrimario={selectedDiseno.colorPrimario}
                  colorTexto={selectedDiseno.colorTexto}
                  sellosRequeridos={selectedDiseno.sellosRequeridos}
                  sellosActuales={0}
                  vencimiento={selectedDiseno.vencimiento}
                  descripcion={selectedDiseno.descripcion}
                />
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
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
              {error && <p className="text-sm text-destructive sm:col-span-3">{error}</p>}
              <Button type="submit" disabled={saving} className="sm:col-span-3">
                {saving ? 'Emitiendo...' : 'Emitir tarjeta'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {tarjetas.length === 0 && disenos.length > 0 ? (
        <p className="text-sm text-muted-foreground">Todavía no emitiste tarjetas.</p>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-0 flex-1 sm:max-w-xs">
              <Label>Diseño</Label>
              <Select value={filtroDiseno} onChange={(e) => setFiltroDiseno(e.target.value)}>
                <option value="">Todos los diseños</option>
                {disenos.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nombre}
                  </option>
                ))}
              </Select>
            </div>
            <div className="min-w-0 flex-1 sm:max-w-xs">
              <Label>Buscar cliente</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Nombre o teléfono"
                  className="pl-9"
                />
              </div>
            </div>
            <p className="pb-2 text-sm text-muted-foreground">
              {tarjetasFiltradas.length} tarjeta{tarjetasFiltradas.length === 1 ? '' : 's'}
            </p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {tarjetasFiltradas.length === 0 ? (
            <p className="text-sm text-muted-foreground">Ninguna tarjeta coincide con ese filtro.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {tarjetasFiltradas.map((t) => (
                <Card key={t.id} className="flex flex-col gap-3 p-4">
                  <div className="flex items-start gap-3">
                    <MiniCardPreview
                      empresaNombre={auth?.nombre}
                      clienteNombre={t.clienteNombre}
                      tipo={t.tipo}
                      logo={t.logo}
                      iconoSello={t.iconoSello}
                      fondoUrl={t.fondoUrl}
                      colorPrimario={t.colorPrimario}
                      colorTexto={t.colorTexto}
                      sellosRequeridos={t.sellosRequeridos}
                      sellosActuales={t.sellosActuales}
                      vencimiento={t.vencimiento}
                      descripcion={t.descripcion}
                      cuponRedimido={t.cuponRedimido}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{t.clienteNombre}</p>
                      <p className="truncate text-xs text-muted-foreground">{t.clienteTelefono}</p>
                      <span className="mt-1 inline-block rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                        {t.disenoNombre}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {t.tipo === 'cupon'
                      ? `${t.descripcion || 'Cupón'} · ${t.cuponRedimido ? 'canjeado' : t.vencimiento ? `vence ${new Date(t.vencimiento).toLocaleDateString('es-MX')}` : 'sin vencimiento'}`
                      : `${t.sellosActuales} / ${t.sellosRequeridos} sellos · ${t.premiosCanjeados} premios`}
                  </p>

                  <div className="mt-auto flex flex-wrap items-center gap-1.5">
                    {t.tipo === 'cupon' ? (
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => canjearCupon(t.id)}
                        disabled={t.cuponRedimido}
                      >
                        {t.cuponRedimido ? 'Canjeado' : 'Canjear cupón'}
                      </Button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => restarSello(t.id)}
                          disabled={t.sellosActuales <= 0}
                          title="Quitar sello"
                          className="rounded-lg border border-border p-2 hover:bg-secondary disabled:opacity-40"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => sumarSello(t.id)}
                          title="Agregar sello"
                          className="rounded-lg border border-border p-2 hover:bg-secondary"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditando(t)}
                          title="Editar sellos"
                          className="rounded-lg border border-border p-2 hover:bg-secondary"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <Button variant="outline" className="flex-1" onClick={() => canjear(t.id)}>
                          Canjear
                        </Button>
                      </>
                    )}
                  </div>
                  <Link to={`/wallet/${t.codigoQr}`} target="_blank" className="text-center">
                    <Button variant="ghost" className="w-full">
                      Ver wallet
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {editando && (
        <EditarSellosModal
          tarjeta={editando}
          onClose={() => setEditando(null)}
          onSaved={() => {
            setEditando(null)
            load()
          }}
        />
      )}
    </div>
  )
}

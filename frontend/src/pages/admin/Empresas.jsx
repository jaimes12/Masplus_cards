import { useEffect, useState } from 'react'
import { CreditCard, Gift, QrCode, Stamp, Users, X } from 'lucide-react'
import { api } from '../../lib/api.js'
import { Card } from '../../components/ui.jsx'
import MiniCardPreview from '../../components/MiniCardPreview.jsx'

const ACCION_LABEL = {
  tarjeta_creada: 'Se registró un cliente',
  sello_agregado: 'Sello agregado',
  sello_quitado: 'Sello quitado',
  sellos_editados: 'Sellos ajustados',
  premio_canjeado: 'Premio canjeado',
  cupon_canjeado: 'Cupón canjeado',
}

function fmtFecha(str) {
  return new Date(str).toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function KpiChip({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-border bg-secondary/40 px-3 py-2.5">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-lg font-semibold leading-tight">{value}</p>
        <p className="truncate text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

function EmpresaDetalle({ empresaId, onClose }) {
  const [detalle, setDetalle] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setDetalle(null)
    setError('')
    api
      .get(`/api/admin/empresas/${empresaId}`)
      .then(setDetalle)
      .catch((err) => setError(err.message))
  }, [empresaId])

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:p-8" onClick={onClose}>
      <div
        className="w-full max-w-3xl rounded-2xl border border-border bg-card p-5 shadow-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {!detalle && !error && <p className="py-10 text-center text-muted-foreground">Cargando detalle...</p>}
        {error && <p className="py-10 text-center text-sm text-red-500">{error}</p>}
        {detalle && (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {detalle.logo ? (
                  <img src={detalle.logo} alt="" className="h-12 w-12 rounded-full border border-border object-cover" />
                ) : (
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-secondary text-lg font-semibold">
                    {(detalle.nombre || '?').slice(0, 1).toUpperCase()}
                  </span>
                )}
                <div>
                  <h2 className="text-lg font-semibold leading-tight">{detalle.nombre}</h2>
                  <p className="text-sm text-muted-foreground">
                    {detalle.email}
                    {detalle.telefono ? ` · ${detalle.telefono}` : ''}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="rounded-full bg-secondary px-2 py-0.5">{detalle.estado}</span>
                    <span className="rounded-full bg-secondary px-2 py-0.5">{detalle.planNombre || 'Sin plan'}</span>
                    {detalle.pruebaTerminaEl && new Date(detalle.pruebaTerminaEl) > new Date() && (
                      <span className="rounded-full bg-orange-500/10 px-2 py-0.5 font-medium text-orange-600">
                        Prueba hasta {new Date(detalle.pruebaTerminaEl).toLocaleDateString('es-MX')}
                      </span>
                    )}
                    {detalle.tienePagoStripe && (
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-600">
                        Cliente Stripe
                      </span>
                    )}
                    <span className="text-muted-foreground">
                      Alta: {new Date(detalle.createdAt).toLocaleDateString('es-MX')}
                    </span>
                  </div>
                </div>
              </div>
              <button type="button" onClick={onClose} className="rounded-full p-1.5 hover:bg-secondary" aria-label="Cerrar">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <KpiChip icon={Users} label="Clientes registrados" value={detalle.totalClientes} />
              <KpiChip icon={CreditCard} label="Tarjetas emitidas" value={detalle.totalTarjetas} />
              <KpiChip icon={QrCode} label="Clientes que escanearon" value={detalle.clientesEscanearon} />
              <KpiChip icon={QrCode} label="Escaneos totales" value={detalle.escaneosTotal} />
              <KpiChip icon={Stamp} label="Sellos otorgados" value={detalle.sellosOtorgados} />
              <KpiChip icon={Gift} label="Premios canjeados" value={detalle.premiosCanjeados} />
            </div>

            <div>
              <p className="mb-2 font-medium">Diseños ({detalle.disenos.length})</p>
              {detalle.disenos.length === 0 ? (
                <p className="text-sm text-muted-foreground">Esta empresa todavía no crea diseños.</p>
              ) : (
                <div className="space-y-2">
                  {detalle.disenos.map((d) => (
                    <div key={d.id} className="flex gap-3 rounded-xl border border-border p-3">
                      <MiniCardPreview
                        empresaNombre={detalle.nombre}
                        tipo={d.tipo}
                        logo={d.logo}
                        iconoSello={d.iconoSello}
                        fondoUrl={d.fondoUrl}
                        colorPrimario={d.colorPrimario}
                        colorTexto={d.colorTexto}
                        sellosRequeridos={d.sellosRequeridos}
                        sellosActuales={0}
                        vencimiento={d.vencimiento}
                        descripcion={d.descripcion}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="font-medium">{d.nombre || 'Sin nombre'}</p>
                          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">
                            {d.tipo === 'cupon' ? 'Cupón' : `${d.sellosRequeridos} sellos`}
                          </span>
                          {!d.activo && (
                            <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs text-red-500">inactivo</span>
                          )}
                          {d.estiloPoster && (
                            <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-xs font-medium text-orange-600">
                              Póster iOS 27
                            </span>
                          )}
                        </div>
                        {d.descripcion && <p className="mt-0.5 text-xs text-muted-foreground">{d.descripcion}</p>}
                        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground sm:grid-cols-4">
                          <span>
                            <b className="text-foreground">{d.tarjetas}</b> tarjetas
                          </span>
                          <span>
                            <b className="text-foreground">{d.clientesEscanearon}</b> escanearon
                          </span>
                          <span>
                            <b className="text-foreground">{d.escaneos}</b> escaneos
                          </span>
                          <span>
                            <b className="text-foreground">{d.premiosCanjeados}</b> premios
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Creado el {new Date(d.createdAt).toLocaleDateString('es-MX')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="mb-2 font-medium">Actividad reciente</p>
              {detalle.actividadReciente.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin movimientos todavía.</p>
              ) : (
                <div className="space-y-1.5">
                  {detalle.actividadReciente.map((a, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 text-sm">
                      <span className="min-w-0 truncate">
                        <span className="font-medium">{ACCION_LABEL[a.accion] ?? a.accion}</span>
                        {a.clienteNombre && <span className="text-muted-foreground"> · {a.clienteNombre}</span>}
                        {a.disenoNombre && <span className="text-muted-foreground"> · {a.disenoNombre}</span>}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">{fmtFecha(a.createdAt)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Empresas() {
  const [empresas, setEmpresas] = useState([])
  const [loading, setLoading] = useState(true)
  const [detalleId, setDetalleId] = useState(null)

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
        <p className="text-sm text-muted-foreground">
          Negocios registrados en la plataforma. Haz clic en una empresa para ver su detalle.
        </p>
      </div>
      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/50 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Diseños</th>
              <th className="px-4 py-3 font-medium">Tarjetas</th>
              <th className="px-4 py-3 font-medium">Alta</th>
            </tr>
          </thead>
          <tbody>
            {empresas.map((e) => (
              <tr
                key={e.id}
                className="cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-secondary/40"
                onClick={() => setDetalleId(e.id)}
              >
                <td className="px-4 py-3 font-medium">{e.nombre}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.email}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.planNombre || '—'}</td>
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
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  Todavía no hay empresas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {detalleId && <EmpresaDetalle empresaId={detalleId} onClose={() => setDetalleId(null)} />}
    </div>
  )
}

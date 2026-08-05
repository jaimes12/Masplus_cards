import { useEffect, useState } from 'react'
import { Gift, Minus, Search, Stamp, UserPlus } from 'lucide-react'
import { api } from '../../lib/api.js'
import { Button, EmptyState, FilterChip, Input } from '../../components/ui.jsx'
import { FeedDay, FeedItem, PageHead } from '../../components/empresa/EmpresaUI.jsx'

const TIPOS = [
  { value: null, label: 'Todos' },
  { value: 'sello_agregado', label: 'Sellos' },
  { value: 'premio_canjeado', label: 'Canjes' },
  { value: 'tarjeta_creada', label: 'Registros' },
  { value: 'sellos_editados', label: 'Ajustes' },
]

const ICONS = {
  sello_agregado: { icon: Stamp, tone: 'brand' },
  sello_quitado: { icon: Minus, tone: 'bad' },
  sellos_editados: { icon: Minus, tone: 'bad' },
  premio_canjeado: { icon: Gift, tone: 'ok' },
  cupon_canjeado: { icon: Gift, tone: 'ok' },
  tarjeta_creada: { icon: UserPlus, tone: 'neutral' },
}

function describir(item) {
  const nombre = item.clienteNombre ?? 'Un cliente'
  switch (item.accion) {
    case 'sello_agregado':
      return `${nombre} recibió un sello`
    case 'sello_quitado':
      return `${nombre} perdió un sello`
    case 'sellos_editados':
      return `Se ajustaron los sellos de ${nombre}`
    case 'premio_canjeado':
      return `${nombre} canjeó su recompensa`
    case 'cupon_canjeado':
      return `${nombre} canjeó su cupón`
    case 'tarjeta_creada':
      return `${nombre} se registró`
    default:
      return `${nombre} · ${item.accion}`
  }
}

function agruparPorDia(items) {
  const grupos = new Map()
  items.forEach((item) => {
    const fecha = new Date(item.createdAt)
    const key = fecha.toDateString()
    if (!grupos.has(key)) grupos.set(key, { fecha, items: [] })
    grupos.get(key).items.push(item)
  })
  return [...grupos.values()]
}

function etiquetaDia(fecha) {
  const hoy = new Date()
  const ayer = new Date(hoy)
  ayer.setDate(hoy.getDate() - 1)
  if (fecha.toDateString() === hoy.toDateString()) return `Hoy · ${fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })}`
  if (fecha.toDateString() === ayer.toDateString()) return `Ayer · ${fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })}`
  return fecha.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function Historial() {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [tipo, setTipo] = useState(null)
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const pageSize = 20

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ page: '1', pageSize: String(pageSize) })
    if (tipo) params.set('accion', tipo)
    if (q.trim()) params.set('q', q.trim())
    api
      .get(`/api/empresa/historial?${params}`)
      .then((data) => {
        setItems(data.items)
        setTotal(data.total)
        setPage(1)
      })
      .finally(() => setLoading(false))
  }, [tipo, q])

  function cargarMas() {
    const nextPage = page + 1
    const params = new URLSearchParams({ page: String(nextPage), pageSize: String(pageSize) })
    if (tipo) params.set('accion', tipo)
    if (q.trim()) params.set('q', q.trim())
    api.get(`/api/empresa/historial?${params}`).then((data) => {
      setItems((prev) => [...prev, ...data.items])
      setPage(nextPage)
    })
  }

  const grupos = agruparPorDia(items)

  return (
    <div className="space-y-6">
      <PageHead title="Historial" subtitle={`${total} movimiento${total === 1 ? '' : 's'} · agrupados por día.`} />

      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[220px] flex-1 sm:max-w-[320px]">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-3" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar cliente o tarjeta" className="!pl-10" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {TIPOS.map((t) => (
          <FilterChip key={t.label} active={tipo === t.value} onClick={() => setTipo(t.value)}>
            {t.label}
          </FilterChip>
        ))}
      </div>

      {!loading && items.length === 0 && (
        <EmptyState icon={<Search className="h-5 w-5" />} title="Sin movimientos" description="No encontramos actividad con esos filtros." />
      )}

      <div className="space-y-6">
        {grupos.map((grupo) => (
          <FeedDay key={grupo.fecha.toDateString()} label={etiquetaDia(grupo.fecha)} meta={`${grupo.items.length} movimiento${grupo.items.length === 1 ? '' : 's'}`}>
            {grupo.items.map((item) => {
              const cfg = ICONS[item.accion] ?? ICONS.tarjeta_creada
              return (
                <FeedItem
                  key={item.id}
                  icon={cfg.icon}
                  tone={cfg.tone}
                  title={describir(item)}
                  subtitle={item.disenoNombre}
                  time={new Date(item.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                />
              )
            })}
          </FeedDay>
        ))}
      </div>

      {items.length < total && (
        <div className="flex justify-center pt-2">
          <Button variant="outline" onClick={cargarMas}>
            Cargar más movimientos
          </Button>
        </div>
      )}
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowUp, Film, Plus, Trash2, Upload, X } from 'lucide-react'
import { api, API_URL, getAuth } from '../../lib/api.js'
import { Button, Card, Input, Label, Select } from '../../components/ui.jsx'

function fmtPrecio(n) {
  return `$${Number(n).toLocaleString('es-MX')}`
}

const emptyForm = {
  nombre: '',
  descripcion: '',
  precio: '',
  linkCompra: '',
  categoriaId: '',
  activo: true,
  orden: 0,
  medias: [],
}

/** Sube imágenes/videos al endpoint admin (fetch directo: el helper api no maneja FormData). */
async function subirMedia(file) {
  const fd = new FormData()
  fd.append('file', file)
  const res = await fetch(`${API_URL}/api/admin/productos/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getAuth('Admin')?.token}` },
    body: fd,
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.message || 'No se pudo subir el archivo.')
  return data // { url, tipo }
}

const emptyBanner = { imagenUrl: '', titulo: '', subtitulo: '', link: '', orden: 0, activo: true }

/** Sección de banners del catálogo: imagen ancha + texto opcional, rotan en la página pública. */
function BannersAdmin() {
  const [banners, setBanners] = useState([])
  const [form, setForm] = useState(emptyBanner)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [subiendo, setSubiendo] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef(null)

  async function load() {
    setBanners(await api.get('/api/admin/productos/banners'))
  }

  useEffect(() => {
    load()
  }, [])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function onFile(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setSubiendo(true)
    setError('')
    try {
      const media = await subirMedia(file)
      update('imagenUrl', media.url)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubiendo(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.imagenUrl) {
      setError('Sube la imagen del banner primero.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const payload = {
        imagenUrl: form.imagenUrl,
        titulo: form.titulo || null,
        subtitulo: form.subtitulo || null,
        link: form.link || null,
        orden: Number(form.orden) || 0,
        activo: !!form.activo,
      }
      if (editingId) await api.put(`/api/admin/productos/banners/${editingId}`, payload)
      else await api.post('/api/admin/productos/banners', payload)
      setShowForm(false)
      setForm(emptyBanner)
      setEditingId(null)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function eliminar(b) {
    if (!window.confirm('¿Eliminar este banner?')) return
    await api.delete(`/api/admin/productos/banners/${b.id}`)
    await load()
  }

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="font-medium">Banners</p>
          <p className="text-xs text-muted-foreground">
            Aparecen arriba del catálogo; si hay varios activos, rotan solos. Ideal 1600×600 aprox.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="gap-1.5"
          onClick={() => {
            setEditingId(null)
            setForm(emptyBanner)
            setError('')
            setShowForm(true)
          }}
        >
          <Plus className="h-4 w-4" /> Nuevo banner
        </Button>
      </div>

      {banners.length === 0 && !showForm && (
        <p className="text-sm text-muted-foreground">Sin banners todavía.</p>
      )}

      <div className="space-y-2">
        {banners.map((b) => (
          <div key={b.id} className="flex items-center gap-3 rounded-xl border border-border p-2">
            <img src={b.imagenUrl} alt="" className="h-14 w-28 shrink-0 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{b.titulo || 'Sin título'}</p>
              <p className="truncate text-xs text-muted-foreground">
                {b.subtitulo || b.link || '—'}
                {!b.activo && <span className="ml-1 text-red-500">· oculto</span>}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-8 px-3 text-xs"
              onClick={() => {
                setEditingId(b.id)
                setForm({
                  imagenUrl: b.imagenUrl,
                  titulo: b.titulo || '',
                  subtitulo: b.subtitulo || '',
                  link: b.link || '',
                  orden: b.orden,
                  activo: b.activo,
                })
                setError('')
                setShowForm(true)
              }}
            >
              Editar
            </Button>
            <button
              type="button"
              onClick={() => eliminar(b)}
              className="rounded-full p-1.5 text-muted-foreground hover:text-red-500"
              aria-label="Eliminar banner"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-4 grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Imagen del banner</Label>
            <div className="mt-1 flex items-center gap-3">
              {form.imagenUrl ? (
                <img src={form.imagenUrl} alt="" className="h-20 w-40 rounded-lg border border-border object-cover" />
              ) : (
                <div className="grid h-20 w-40 place-items-center rounded-lg border-2 border-dashed border-border text-xs text-muted-foreground">
                  Sin imagen
                </div>
              )}
              <Button type="button" variant="outline" className="gap-1.5" disabled={subiendo} onClick={() => fileRef.current?.click()}>
                <Upload className="h-4 w-4" /> {subiendo ? 'Subiendo...' : form.imagenUrl ? 'Cambiar' : 'Subir imagen'}
              </Button>
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={onFile} />
            </div>
          </div>
          <div>
            <Label>Título (opcional)</Label>
            <Input value={form.titulo} onChange={(e) => update('titulo', e.target.value)} placeholder="Ej. Nueva colección" />
          </div>
          <div>
            <Label>Subtítulo (opcional)</Label>
            <Input value={form.subtitulo} onChange={(e) => update('subtitulo', e.target.value)} placeholder="Texto corto debajo del título" />
          </div>
          <div>
            <Label>Link (opcional)</Label>
            <Input value={form.link} onChange={(e) => update('link', e.target.value)} placeholder="https://... o #catalogo" />
          </div>
          <div className="flex items-end gap-4">
            <div className="w-24">
              <Label>Orden</Label>
              <Input type="number" value={form.orden} onChange={(e) => update('orden', e.target.value)} />
            </div>
            <label className="flex items-center gap-2 pb-2 text-sm">
              <input type="checkbox" checked={form.activo} onChange={(e) => update('activo', e.target.checked)} />
              Visible
            </label>
          </div>
          {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 sm:col-span-2">{error}</p>}
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" disabled={saving || subiendo}>
              {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear banner'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      )}
    </Card>
  )
}

export default function Productos() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [subiendo, setSubiendo] = useState(false)
  const [nuevaCategoria, setNuevaCategoria] = useState('')
  const fileRef = useRef(null)

  async function load() {
    const [p, c] = await Promise.all([api.get('/api/admin/productos'), api.get('/api/admin/productos/categorias')])
    setProductos(p)
    setCategorias(c)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function startNew() {
    setEditingId(null)
    setForm(emptyForm)
    setError('')
    setShowForm(true)
  }

  function startEdit(p) {
    setEditingId(p.id)
    setForm({
      nombre: p.nombre,
      descripcion: p.descripcion || '',
      precio: String(p.precio),
      linkCompra: p.linkCompra || '',
      categoriaId: p.categoriaId ? String(p.categoriaId) : '',
      activo: p.activo,
      orden: p.orden,
      medias: p.medias.map((m) => ({ url: m.url, tipo: m.tipo })),
    })
    setError('')
    setShowForm(true)
  }

  async function onFiles(e) {
    const files = [...(e.target.files || [])]
    e.target.value = ''
    if (files.length === 0) return
    setSubiendo(true)
    setError('')
    try {
      for (const file of files) {
        const media = await subirMedia(file)
        setForm((f) => ({ ...f, medias: [...f.medias, media] }))
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSubiendo(false)
    }
  }

  function moverMedia(i, dir) {
    setForm((f) => {
      const medias = [...f.medias]
      const j = i + dir
      if (j < 0 || j >= medias.length) return f
      ;[medias[i], medias[j]] = [medias[j], medias[i]]
      return { ...f, medias }
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        nombre: form.nombre,
        descripcion: form.descripcion || null,
        precio: Number(form.precio) || 0,
        linkCompra: form.linkCompra || null,
        categoriaId: form.categoriaId ? Number(form.categoriaId) : null,
        activo: !!form.activo,
        orden: Number(form.orden) || 0,
        medias: form.medias,
      }
      if (editingId) await api.put(`/api/admin/productos/${editingId}`, payload)
      else await api.post('/api/admin/productos', payload)
      setShowForm(false)
      setForm(emptyForm)
      setEditingId(null)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function eliminar(p) {
    if (!window.confirm(`¿Eliminar "${p.nombre}"? Esta acción no se puede deshacer.`)) return
    await api.delete(`/api/admin/productos/${p.id}`)
    await load()
  }

  async function crearCategoria(e) {
    e.preventDefault()
    if (!nuevaCategoria.trim()) return
    await api.post('/api/admin/productos/categorias', { nombre: nuevaCategoria.trim(), orden: categorias.length })
    setNuevaCategoria('')
    await load()
  }

  async function eliminarCategoria(c) {
    if (!window.confirm(`¿Eliminar la categoría "${c.nombre}"? Sus productos quedan sin categoría.`)) return
    await api.delete(`/api/admin/productos/categorias/${c.id}`)
    await load()
  }

  if (loading) return <p className="text-muted-foreground">Cargando...</p>

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Productos</h1>
          <p className="text-sm text-muted-foreground">
            El catálogo público vive en{' '}
            <a href="/productos" target="_blank" rel="noreferrer" className="font-medium text-accent underline">
              /productos
            </a>
            .
          </p>
        </div>
        <Button type="button" className="gap-2" onClick={startNew}>
          <Plus className="h-4 w-4" /> Nuevo producto
        </Button>
      </div>

      <BannersAdmin />

      <Card>
        <p className="mb-3 font-medium">Categorías</p>
        <div className="flex flex-wrap items-center gap-2">
          {categorias.map((c) => (
            <span key={c.id} className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-sm">
              {c.nombre} <span className="text-xs text-muted-foreground">({c.productosCount})</span>
              <button
                type="button"
                onClick={() => eliminarCategoria(c)}
                className="text-muted-foreground hover:text-red-500"
                aria-label={`Eliminar categoría ${c.nombre}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
          <form onSubmit={crearCategoria} className="flex items-center gap-2">
            <Input
              value={nuevaCategoria}
              onChange={(e) => setNuevaCategoria(e.target.value)}
              placeholder="Nueva categoría"
              className="h-9 w-44"
            />
            <Button type="submit" variant="outline" className="h-9">
              Agregar
            </Button>
          </form>
        </div>
      </Card>

      {showForm && (
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <p className="font-medium">{editingId ? 'Editar producto' : 'Nuevo producto'}</p>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-full p-1 hover:bg-secondary">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Nombre</Label>
              <Input value={form.nombre} onChange={(e) => update('nombre', e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Precio (MXN)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.precio}
                  onChange={(e) => update('precio', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Categoría</Label>
                <Select value={form.categoriaId} onChange={(e) => update('categoriaId', e.target.value)}>
                  <option value="">Sin categoría</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="sm:col-span-2">
              <Label>Descripción</Label>
              <Input
                value={form.descripcion}
                onChange={(e) => update('descripcion', e.target.value)}
                placeholder="Corta y al punto: material, tamaños, qué lo hace especial."
              />
            </div>
            <div>
              <Label>Link de compra (opcional)</Label>
              <Input
                value={form.linkCompra}
                onChange={(e) => update('linkCompra', e.target.value)}
                placeholder="https://... (muestra el botón Comprar)"
              />
            </div>
            <div className="flex items-end gap-4">
              <div className="w-24">
                <Label>Orden</Label>
                <Input type="number" value={form.orden} onChange={(e) => update('orden', e.target.value)} />
              </div>
              <label className="flex items-center gap-2 pb-2 text-sm">
                <input type="checkbox" checked={form.activo} onChange={(e) => update('activo', e.target.checked)} />
                Visible en el catálogo
              </label>
            </div>

            <div className="sm:col-span-2">
              <Label>Fotos y videos (el orden es el del carrusel)</Label>
              <div className="mt-1 flex flex-wrap gap-3">
                {form.medias.map((m, i) => (
                  <div key={`${m.url}-${i}`} className="relative">
                    {m.tipo === 'video' ? (
                      <div className="grid h-24 w-24 place-items-center rounded-lg border border-border bg-secondary">
                        <Film className="h-7 w-7 text-muted-foreground" />
                      </div>
                    ) : (
                      <img src={m.url} alt="" className="h-24 w-24 rounded-lg border border-border object-cover" />
                    )}
                    <div className="absolute -right-2 -top-2 flex gap-1">
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, medias: f.medias.filter((_, j) => j !== i) }))}
                        className="grid h-6 w-6 place-items-center rounded-full bg-red-500 text-white shadow"
                        aria-label="Quitar"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="absolute bottom-1 left-1 flex gap-1">
                      <button
                        type="button"
                        onClick={() => moverMedia(i, -1)}
                        className="grid h-6 w-6 place-items-center rounded-full bg-white/90 shadow"
                        aria-label="Mover antes"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moverMedia(i, 1)}
                        className="grid h-6 w-6 place-items-center rounded-full bg-white/90 shadow"
                        aria-label="Mover después"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={subiendo}
                  className="grid h-24 w-24 place-items-center rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-orange-400 hover:text-orange-500 disabled:opacity-50"
                >
                  {subiendo ? (
                    <span className="text-xs">Subiendo...</span>
                  ) : (
                    <span className="flex flex-col items-center gap-1 text-xs">
                      <Upload className="h-5 w-5" /> Subir
                    </span>
                  )}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,video/mp4,video/webm,video/quicktime"
                  multiple
                  className="hidden"
                  onChange={onFiles}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Imágenes PNG/JPG/WEBP (máx. 5 MB) o videos MP4/WEBM/MOV (máx. 50 MB).
              </p>
            </div>

            {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 sm:col-span-2">{error}</p>}
            <div className="flex gap-2 sm:col-span-2">
              <Button type="submit" disabled={saving || subiendo}>
                {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear producto'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {productos.map((p) => (
          <Card key={p.id} className="flex flex-col gap-3">
            {p.medias[0] ? (
              p.medias[0].tipo === 'video' ? (
                <video src={p.medias[0].url} className="aspect-square w-full rounded-xl object-cover" muted playsInline />
              ) : (
                <img src={p.medias[0].url} alt={p.nombre} className="aspect-square w-full rounded-xl object-cover" />
              )
            ) : (
              <div className="grid aspect-square w-full place-items-center rounded-xl bg-secondary text-sm text-muted-foreground">
                Sin fotos
              </div>
            )}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium">{p.nombre}</p>
                <p className="text-xs text-muted-foreground">
                  {p.categoriaNombre || 'Sin categoría'} · {p.medias.length} medio{p.medias.length === 1 ? '' : 's'}
                  {!p.activo && <span className="ml-1 text-red-500">· oculto</span>}
                </p>
              </div>
              <p className="shrink-0 font-semibold tabular-nums">{fmtPrecio(p.precio)}</p>
            </div>
            <div className="mt-auto flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => startEdit(p)}>
                Editar
              </Button>
              <Button type="button" variant="outline" className="gap-1.5 text-red-500" onClick={() => eliminar(p)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
        {productos.length === 0 && (
          <p className="text-sm text-muted-foreground sm:col-span-2 lg:col-span-3">
            Todavía no hay productos. Crea el primero con "Nuevo producto".
          </p>
        )}
      </div>
    </div>
  )
}

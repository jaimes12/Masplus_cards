import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowLeft, Download, Save } from 'lucide-react'
import { api } from '../../lib/api.js'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { Button, ColorInput, Input, Label } from '../../components/ui.jsx'
import ImageUploadInput from '../../components/ImageUploadInput.jsx'
import masplusLogo from '../../assets/masplus_logo.png'

const CANVAS_W = 720
const CANVAS_H = 1000

function defaultPoster(diseno, empresaNombre) {
  const elements = []

  if (diseno.logo) {
    elements.push({ id: 'logo', type: 'image', src: diseno.logo, x: 300, y: 60, w: 120, h: 120 })
  }

  const topAfterLogo = diseno.logo ? 210 : 90
  const textColor = diseno.colorTexto || '#18181B'

  elements.push({
    id: 'title',
    type: 'text',
    text: empresaNombre || diseno.nombre || 'Mi Negocio',
    x: 40,
    y: topAfterLogo,
    w: 640,
    fontSize: 40,
    color: textColor,
  })
  elements.push({
    id: 'subtitle',
    type: 'text',
    text: diseno.tipo === 'cupon' ? 'Escaneá para obtener tu cupón' : 'Escaneá para juntar tus sellos',
    x: 40,
    y: topAfterLogo + 70,
    w: 640,
    fontSize: 20,
    color: textColor,
  })
  elements.push({
    id: 'qr',
    type: 'qr',
    x: 160,
    y: topAfterLogo + 150,
    w: 400,
    h: 400,
    color: '#000000',
    bgColor: '#FFFFFF',
  })

  return {
    background: { type: 'color', value: diseno.colorPrimario || '#F4F4F5' },
    elements,
  }
}

function PosterElementView({ el, selected, registroUrl, onPointerDownMove, onPointerDownResize, readOnly }) {
  const style = {
    position: 'absolute',
    left: el.x,
    top: el.y,
    width: el.w,
    height: el.type === 'text' ? undefined : el.h,
  }

  let content = null
  if (el.type === 'text') {
    content = (
      <p
        style={{
          fontSize: el.fontSize,
          color: el.color,
          textAlign: 'center',
          fontWeight: el.id === 'title' ? 700 : 500,
          lineHeight: 1.25,
          wordBreak: 'break-word',
          margin: 0,
        }}
      >
        {el.text}
      </p>
    )
  } else if (el.type === 'image') {
    content = <img src={el.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} draggable={false} />
  } else if (el.type === 'qr') {
    const size = Math.max(el.w, el.h) * 2
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?${new URLSearchParams({
      size: `${size}x${size}`,
      data: registroUrl,
      color: (el.color || '#000000').replace('#', ''),
      bgcolor: (el.bgColor || '#FFFFFF').replace('#', ''),
    })}`
    content = <img src={qrUrl} alt="Código QR" style={{ width: '100%', height: '100%' }} draggable={false} />
  }

  if (readOnly) {
    return <div style={style}>{content}</div>
  }

  return (
    <div
      style={{
        ...style,
        cursor: 'move',
        outline: selected ? '2px solid #f97316' : '2px dashed transparent',
        userSelect: 'none',
        touchAction: 'none',
      }}
      onPointerDown={onPointerDownMove}
    >
      {content}
      {(el.type !== 'text' || selected) && (
        <div
          onPointerDown={onPointerDownResize}
          className="absolute -bottom-1.5 -right-1.5 h-4 w-4 rounded-full border-2 border-white bg-primary shadow"
          style={{ cursor: el.type === 'text' ? 'ew-resize' : 'se-resize' }}
        />
      )}
    </div>
  )
}

export default function PosterEditor() {
  const { id } = useParams()
  const { auth } = useAuth()
  const [diseno, setDiseno] = useState(null)
  const [poster, setPoster] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState(null)
  const canvasRef = useRef(null)
  const stageRef = useRef(null)
  const dragState = useRef(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const update = () => {
      const available = stage.clientWidth
      setScale(available > 0 ? Math.min(1, available / CANVAS_W) : 1)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(stage)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    api.get(`/api/disenos/${id}`).then((d) => {
      setDiseno(d)
      let parsed = null
      if (d.configuracion) {
        try {
          parsed = JSON.parse(d.configuracion)?.poster ?? null
        } catch {
          parsed = null
        }
      }
      setPoster(parsed || defaultPoster(d, auth?.nombre))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  function updateElement(elId, patch) {
    setPoster((p) => ({ ...p, elements: p.elements.map((el) => (el.id === elId ? { ...el, ...patch } : el)) }))
  }

  function updateBackground(patch) {
    setPoster((p) => ({ ...p, background: { ...p.background, ...patch } }))
  }

  function onDrag(e) {
    const d = dragState.current
    if (!d) return
    const dx = (e.clientX - d.startX) / d.scale
    const dy = (e.clientY - d.startY) / d.scale
    if (d.mode === 'move') {
      updateElement(d.id, {
        x: Math.max(0, Math.min(CANVAS_W - d.origW, Math.round(d.origX + dx))),
        y: Math.max(0, Math.min(CANVAS_H - d.origH, Math.round(d.origY + dy))),
      })
    } else {
      updateElement(d.id, {
        w: Math.max(40, Math.round(d.origW + dx)),
        ...(d.hasHeight ? { h: Math.max(40, Math.round(d.origH + dy)) } : {}),
      })
    }
  }

  function endDrag() {
    dragState.current = null
    window.removeEventListener('pointermove', onDrag)
    window.removeEventListener('pointerup', endDrag)
  }

  function beginDrag(e, el, mode) {
    e.stopPropagation()
    e.preventDefault()
    setSelectedId(el.id)
    const rect = canvasRef.current.getBoundingClientRect()
    dragState.current = {
      mode,
      id: el.id,
      startX: e.clientX,
      startY: e.clientY,
      origX: el.x,
      origY: el.y,
      origW: el.w,
      origH: el.h || 0,
      hasHeight: el.type !== 'text',
      scale: rect.width / CANVAS_W,
    }
    window.addEventListener('pointermove', onDrag)
    window.addEventListener('pointerup', endDrag)
  }

  async function guardar() {
    setSaving(true)
    try {
      await api.put(`/api/disenos/${id}`, {
        templateId: null,
        tipo: diseno.tipo,
        nombre: diseno.nombre,
        logo: diseno.logo || null,
        colorPrimario: diseno.colorPrimario,
        colorSecundario: diseno.colorSecundario,
        colorTexto: diseno.colorTexto,
        iconoSello: diseno.iconoSello || null,
        fondoUrl: diseno.fondoUrl || null,
        sellosRequeridos: diseno.sellosRequeridos,
        vencimiento: diseno.vencimiento || null,
        descripcion: diseno.descripcion || null,
        configuracion: JSON.stringify({ poster }),
        recordatoriosActivos: diseno.recordatoriosActivos,
        estiloCuponPoster: diseno.estiloCuponPoster,
      })
      setSavedAt(Date.now())
    } finally {
      setSaving(false)
    }
  }

  if (!diseno || !poster) {
    return <p className="p-8 text-muted-foreground">Cargando...</p>
  }

  const registroUrl = `${window.location.origin}/registro/${diseno.codigoRegistro}`
  const selected = poster.elements.find((e) => e.id === selectedId)
  const canvasStyle = {
    width: CANVAS_W,
    height: CANVAS_H,
    background: poster.background.type === 'image' ? undefined : poster.background.value,
    backgroundImage: poster.background.type === 'image' ? `url(${poster.background.value})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }

  return (
    <div className="flex min-h-svh flex-col bg-secondary/40">
      <header className="print:hidden flex flex-col gap-2 border-b border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" onClick={() => window.close()} className="shrink-0 gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Cerrar
          </Button>
          <p className="min-w-0 truncate font-medium">Editar póster · {diseno.nombre}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {savedAt && <span className="text-xs text-muted-foreground">Guardado</span>}
          <Button variant="outline" onClick={guardar} disabled={saving} className="gap-1.5">
            <Save className="h-4 w-4" /> {saving ? 'Guardando...' : 'Guardar'}
          </Button>
          <Button onClick={() => window.print()} className="gap-1.5">
            <Download className="h-4 w-4" /> Descargar PDF
          </Button>
        </div>
      </header>

      <div className="print:hidden flex flex-1 flex-col gap-6 overflow-auto p-4 sm:p-6 lg:flex-row">
        <div ref={stageRef} className="flex min-w-0 flex-1 items-start justify-center">
          <div style={{ width: CANVAS_W * scale, height: CANVAS_H * scale }}>
            <div
              ref={canvasRef}
              className="relative shrink-0 origin-top-left overflow-hidden rounded-lg shadow-soft-lg"
              style={{ ...canvasStyle, userSelect: 'none', touchAction: 'none', transform: `scale(${scale})` }}
              onPointerDown={() => setSelectedId(null)}
            >
              {poster.elements.map((el) => (
                <PosterElementView
                  key={el.id}
                  el={el}
                  selected={selectedId === el.id}
                  registroUrl={registroUrl}
                  onPointerDownMove={(e) => beginDrag(e, el, 'move')}
                  onPointerDownResize={(e) => beginDrag(e, el, 'resize')}
                />
              ))}
              <div className="pointer-events-none absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5 opacity-60">
                <img src={masplusLogo} alt="" className="h-4 w-4" />
                <span className="text-xs">Powered by Masplus</span>
              </div>
            </div>
          </div>
        </div>

        <aside className="w-full shrink-0 space-y-4 lg:w-72">
          <div className="rounded-2xl border border-border bg-card p-4">
            <Label>Fondo</Label>
            <div className="mt-2 flex items-center gap-2">
              <ColorInput
                value={poster.background.type === 'color' ? poster.background.value : '#18181B'}
                onChange={(e) => updateBackground({ type: 'color', value: e.target.value })}
              />
              <span className="text-xs text-muted-foreground">Color sólido</span>
            </div>
            <div className="mt-3">
              <Label className="mb-1">O una imagen</Label>
              <ImageUploadInput
                value={poster.background.type === 'image' ? poster.background.value : ''}
                onChange={(url) =>
                  url
                    ? updateBackground({ type: 'image', value: url })
                    : updateBackground({ type: 'color', value: poster.background.value || '#18181B' })
                }
              />
            </div>
          </div>

          {selected ? (
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="mb-3 text-sm font-medium">
                {selected.type === 'text' ? 'Texto' : selected.type === 'qr' ? 'Código QR' : 'Logo'}
              </p>
              {selected.type === 'text' && (
                <div className="space-y-3">
                  <div>
                    <Label>Contenido</Label>
                    <Input value={selected.text} onChange={(e) => updateElement(selected.id, { text: e.target.value })} />
                  </div>
                  <div>
                    <Label>Tamaño de letra</Label>
                    <Input
                      type="number"
                      min="10"
                      max="120"
                      value={selected.fontSize}
                      onChange={(e) => updateElement(selected.id, { fontSize: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Color</Label>
                    <ColorInput value={selected.color} onChange={(e) => updateElement(selected.id, { color: e.target.value })} />
                  </div>
                </div>
              )}
              {selected.type === 'qr' && (
                <div className="space-y-3">
                  <div>
                    <Label>Color del código</Label>
                    <ColorInput value={selected.color} onChange={(e) => updateElement(selected.id, { color: e.target.value })} />
                  </div>
                  <div>
                    <Label>Color de fondo</Label>
                    <ColorInput value={selected.bgColor} onChange={(e) => updateElement(selected.id, { bgColor: e.target.value })} />
                  </div>
                </div>
              )}
              <p className="mt-4 text-xs text-muted-foreground">
                Arrastrá el elemento para moverlo, o el puntito para cambiar el tamaño.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
              Tocá un elemento del póster para editarlo.
            </div>
          )}
        </aside>
      </div>

      <div className="print-poster">
        <div className="relative overflow-hidden" style={canvasStyle}>
          {poster.elements.map((el) => (
            <PosterElementView key={el.id} el={el} registroUrl={registroUrl} readOnly />
          ))}
          <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5 opacity-60">
            <img src={masplusLogo} alt="" className="h-4 w-4" />
            <span className="text-xs">Powered by Masplus</span>
          </div>
        </div>
      </div>
    </div>
  )
}

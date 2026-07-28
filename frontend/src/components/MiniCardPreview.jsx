import CardPreview from './CardPreview.jsx'

/// Miniatura de CardPreview (mismo componente, escalado) para usar en listas.
export default function MiniCardPreview(props) {
  return (
    <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-xl border border-border bg-secondary">
      <div className="pointer-events-none absolute left-0 top-0 origin-top-left" style={{ transform: 'scale(0.3)', width: 320 }}>
        <CardPreview {...props} />
      </div>
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { MoreHorizontal } from 'lucide-react'

/** Encabezado de página (equivalente a .page-head): título + subtítulo + acciones a la derecha. */
export function PageHead({ title, subtitle, actions, className = '' }) {
  return (
    <div className={`mb-7 flex flex-wrap items-end gap-4 ${className}`}>
      <div>
        <h1 className="text-[28px] leading-tight font-semibold tracking-tight text-foreground">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-ink-2">{subtitle}</p>}
      </div>
      {actions && <div className="ml-auto flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

/** Card de métrica para Inicio/Estadísticas (equivalente a .stat / .kpi del prototipo). */
export function StatCard({ icon: Icon, label, value, delta, deltaTone = 'flat', className = '' }) {
  const toneClass = deltaTone === 'up' ? 'text-ok' : deltaTone === 'down' ? 'text-bad' : 'text-muted-foreground'
  return (
    <div className={`rounded-2xl border border-border bg-card p-5 ${className}`}>
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        {Icon && <Icon className="h-4 w-4 text-ink-3" />}
        {label}
      </div>
      <p className="mt-2.5 text-3xl font-semibold tracking-tight text-card-foreground">{value}</p>
      {delta != null && <p className={`mt-1.5 text-xs font-semibold ${toneClass}`}>{delta}</p>}
    </div>
  )
}

/** Toggle on/off (equivalente a .sw). */
export function Switch({ checked, onChange, label, description, className = '' }) {
  return (
    <label className={`flex cursor-pointer items-center gap-3 border-t border-border py-3.5 first:border-t-0 first:pt-0 ${className}`}>
      <span className="flex-1">
        {label && <p className="text-sm font-semibold text-foreground">{label}</p>}
        {description && <span className="text-xs text-ink-3">{description}</span>}
      </span>
      <span className="relative inline-flex h-[25px] w-[42px] shrink-0 items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span className="absolute inset-0 rounded-full bg-secondary transition-colors peer-checked:bg-accent" />
        <span className="absolute top-[3px] left-[3px] h-[19px] w-[19px] rounded-full bg-white shadow-soft transition-transform peer-checked:translate-x-[17px]" />
      </span>
    </label>
  )
}

/** Menú de "más acciones" tipo kebab (equivalente a .menu/.menu-pop). */
export function ActionMenu({ items, className = '' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  return (
    <div ref={ref} className={`relative ${className}`} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Más acciones"
        className="grid h-[34px] w-[34px] place-items-center rounded-lg border border-border bg-card hover:bg-secondary"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 bottom-[42px] z-30 w-[190px] rounded-lg border border-border bg-card p-1.5 shadow-2xl">
          {items.map((item, i) =>
            item.separator ? (
              <hr key={i} className="my-1.5 border-border" />
            ) : (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setOpen(false)
                  item.onClick?.()
                }}
                className={`flex h-[34px] w-full items-center gap-2.5 rounded-md px-2.5 text-sm ${
                  item.danger ? 'text-bad hover:bg-bad-soft' : 'text-ink-2 hover:bg-secondary hover:text-foreground'
                }`}
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  )
}

const SEGMENT_STYLES = {
  frecuente: { label: 'Frecuente', tone: 'bg-accent/10 text-accent' },
  activo: { label: 'Activo', tone: 'bg-ok-soft text-ok' },
  nuevo: { label: 'Nuevo', tone: 'bg-secondary text-ink-2' },
  'canje-listo': { label: 'Canje listo', tone: 'bg-warn-soft text-warn' },
  inactivo: { label: 'Inactivo', tone: 'bg-bad-soft text-bad' },
}

/** Badge de segmentación de cliente (frecuente/activo/nuevo/canje-listo/inactivo). */
export function SegmentBadge({ estado, className = '' }) {
  const cfg = SEGMENT_STYLES[estado] ?? SEGMENT_STYLES.activo
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.tone} ${className}`}>
      {cfg.label}
    </span>
  )
}

/** Badge Activo/Pausado para diseños (tarjetas). */
export function StatusPill({ activo, className = '' }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold before:h-1.5 before:w-1.5 before:rounded-full before:bg-current ${
        activo ? 'bg-ok-soft text-ok' : 'bg-warn-soft text-warn'
      } ${className}`}
    >
      {activo ? 'Activa' : 'Pausada'}
    </span>
  )
}

/** Card de campaña/diseño en grid (equivalente a .tile). */
export function Tile({ icon, name, subtitle, status, stats, actions, onClick, className = '' }) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-soft ${className}`}>
      <button type="button" onClick={onClick} className="flex w-full items-start gap-3.5 p-4 text-left">
        {icon}
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold tracking-tight text-foreground">{name}</p>
          {subtitle && <p className="mt-0.5 truncate text-xs text-ink-3">{subtitle}</p>}
        </div>
        {status}
      </button>
      {stats && (
        <div className="flex divide-x divide-border border-t border-border">
          {stats.map((s, i) => (
            <div key={i} className="flex-1 px-4 py-3">
              <b className="block text-lg font-semibold tracking-tight text-foreground">{s.value}</b>
              <span className="text-xs text-ink-3">{s.label}</span>
            </div>
          ))}
        </div>
      )}
      {actions && (
        <div className="flex items-center gap-1.5 border-t border-border bg-secondary/40 px-3.5 py-2.5">{actions}</div>
      )}
    </div>
  )
}

/** Puntos de progreso de sellos (equivalente a .dots). */
export function StampDots({ current, total, className = '' }) {
  const dots = Array.from({ length: Math.max(total, 0) })
  return (
    <div className={`mt-2 flex flex-wrap gap-1.5 ${className}`}>
      {dots.map((_, i) => (
        <span
          key={i}
          className={`h-3.5 w-3.5 rounded-full ring-1 ring-inset ring-black/5 ${i < current ? 'bg-accent ring-0' : 'bg-secondary'}`}
        />
      ))}
    </div>
  )
}

/** Card de cliente en vista grid (equivalente a .ccard). */
export function ClientCard({ nombre, telefono, estado, sellosActuales, sellosRequeridos, meta, actions, onClick, className = '' }) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-soft ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold tracking-tight text-foreground">{nombre}</p>
          <p className="text-xs text-ink-3 tabular-nums">{telefono}</p>
        </div>
        <SegmentBadge estado={estado} />
      </div>
      {sellosRequeridos > 0 && (
        <>
          <div className="mt-4 flex items-baseline gap-2 text-xs text-ink-3">
            Sellos <b className="text-sm text-foreground tabular-nums">{sellosActuales}/{sellosRequeridos}</b>
          </div>
          <StampDots current={sellosActuales} total={sellosRequeridos} />
        </>
      )}
      {meta && <div className="mt-4 flex flex-wrap gap-3.5 text-xs text-ink-3">{meta}</div>}
      {actions && (
        <div className="mt-4 flex items-center gap-1.5 border-t border-border pt-3.5" onClick={(e) => e.stopPropagation()}>
          {actions}
        </div>
      )}
    </div>
  )
}

/** Fila de cliente en vista lista (equivalente a .crow). */
export function ClientRow({ nombre, telefono, estado, progreso, ultimaVisita, actions, onClick, className = '' }) {
  return (
    <div
      onClick={onClick}
      className={`flex cursor-pointer items-center gap-3.5 border-t border-border px-5 py-3.5 first:border-t-0 hover:bg-secondary/40 ${className}`}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold tracking-tight text-foreground">{nombre}</p>
        <span className="text-xs text-ink-3 tabular-nums">{telefono}</span>
      </div>
      {progreso && <div className="hidden w-[150px] shrink-0 text-sm text-ink-2 sm:block">{progreso}</div>}
      <div className="hidden w-[130px] shrink-0 sm:block">
        <SegmentBadge estado={estado} />
      </div>
      {ultimaVisita && <div className="w-[104px] shrink-0 text-right text-xs text-ink-3 tabular-nums">{ultimaVisita}</div>}
      {actions && (
        <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {actions}
        </div>
      )}
    </div>
  )
}

/** Encabezado de un día en el feed de historial (equivalente a .fday). */
export function FeedDay({ label, meta, children }) {
  return (
    <div>
      <h4 className="mb-2.5 flex items-center gap-2.5 text-xs font-semibold tracking-wide text-ink-3 uppercase">
        {label}
        {meta && <span className="ml-auto text-xs font-medium tracking-normal text-ink-3 normal-case">{meta}</span>}
      </h4>
      <div className="overflow-hidden rounded-xl border border-border bg-card">{children}</div>
    </div>
  )
}

const FEED_TONES = {
  brand: 'bg-accent/10 text-accent',
  ok: 'bg-ok-soft text-ok',
  neutral: 'bg-secondary text-ink-2',
  bad: 'bg-bad-soft text-bad',
}

/** Item individual del feed de historial (equivalente a .fitem). */
export function FeedItem({ icon: Icon, tone = 'neutral', title, subtitle, time }) {
  return (
    <div className="flex items-center gap-3.5 border-t border-border px-5 py-3.5 first:border-t-0 hover:bg-secondary/40">
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${FEED_TONES[tone]}`}>
        {Icon && <Icon className="h-4 w-4" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-foreground">{title}</p>
        {subtitle && <span className="text-xs text-ink-3">{subtitle}</span>}
      </div>
      {time && <span className="shrink-0 text-xs whitespace-nowrap text-ink-3 tabular-nums">{time}</span>}
    </div>
  )
}


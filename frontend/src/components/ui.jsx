import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { X } from 'lucide-react'

export function Button({ className = '', variant = 'primary', ...props }) {
  const base =
    'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer'
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:opacity-90 shadow-sm',
    outline: 'border border-border bg-transparent hover:bg-secondary',
    ghost: 'hover:bg-secondary',
  }
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />
}

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full rounded-xl border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring ${className}`}
      {...props}
    />
  )
}

export function ColorInput({ value, onChange, className = '' }) {
  return (
    <div
      className={`relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-input shadow-sm ${className}`}
      style={{ background: value }}
    >
      <input
        type="color"
        value={value}
        onChange={onChange}
        className="absolute -inset-2 h-[calc(100%+16px)] w-[calc(100%+16px)] cursor-pointer opacity-0"
        aria-label="Elegir color"
      />
    </div>
  )
}

export function Select({ className = '', children, ...props }) {
  return (
    <select
      className={`w-full rounded-xl border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}

export function Card({ className = '', ...props }) {
  return <div className={`shadow-soft rounded-2xl bg-card p-6 ${className}`} {...props} />
}

export function Label({ className = '', ...props }) {
  return <label className={`mb-1 block text-sm font-medium text-muted-foreground ${className}`} {...props} />
}

/** Panel con encabezado opcional (equivalente a .panel/.panel-head/.panel-body del sistema Más+). */
export function Panel({ title, action, children, bodyClassName = 'p-5', className = '' }) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-border bg-card ${className}`}>
      {title && (
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          {action && <div className="ml-auto">{action}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </div>
  )
}

/** Barra de tabs. `tabs` es [{ value, label }]. */
export function Tabs({ tabs, value, onChange, className = '' }) {
  return (
    <div className={`mb-6 flex gap-1 overflow-x-auto border-b border-border ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={`-mb-px h-[42px] shrink-0 border-b-2 px-3.5 text-sm font-semibold whitespace-nowrap transition-colors ${
            value === tab.value ? 'border-accent text-foreground' : 'border-transparent text-ink-3 hover:text-foreground'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

/** Pill de filtro tipo chip. */
export function FilterChip({ active, onClick, children, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-8 shrink-0 rounded-full border px-3.5 text-sm font-semibold whitespace-nowrap transition-colors ${
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-ink-2 hover:border-ink-3 hover:text-foreground'
      } ${className}`}
    >
      {children}
    </button>
  )
}

/** Toggle tipo segmented control (p.ej. vista grid/lista). */
export function SegmentedControl({ options, value, onChange, className = '' }) {
  return (
    <div className={`inline-flex gap-0.5 rounded-lg bg-secondary p-0.5 ${className}`}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm font-semibold transition-colors ${
            value === opt.value ? 'bg-card text-foreground shadow-soft' : 'text-ink-3 hover:text-foreground'
          }`}
        >
          {opt.icon && <opt.icon className="h-3.5 w-3.5" />}
          {opt.label}
        </button>
      ))}
    </div>
  )
}

/** Estado vacío genérico. */
export function EmptyState({ icon, title, description, action, className = '' }) {
  return (
    <div className={`rounded-2xl border border-border bg-card px-8 py-14 text-center ${className}`}>
      {icon && <div className="mx-auto mb-4 grid h-11 w-11 place-items-center rounded-xl bg-accent/10 text-accent">{icon}</div>}
      {title && <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3>}
      {description && <p className="mx-auto mt-2 max-w-[44ch] text-sm text-ink-2">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

/** Panel lateral deslizante, montado en un portal sobre <body>. */
export function Drawer({ open, onClose, title, subtitle, icon, footer, children }) {
  const reduce = useReducedMotion()

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[120] bg-black/35"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-y-0 right-0 z-[130] flex w-full max-w-[460px] flex-col bg-card shadow-2xl"
            initial={{ x: reduce ? 0 : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: reduce ? 0 : '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          >
            <div className="flex items-center gap-3 border-b border-border p-5">
              {icon}
              <div className="min-w-0 flex-1">
                {title && <h3 className="truncate text-base font-semibold text-foreground">{title}</h3>}
                {subtitle && <p className="truncate text-sm text-ink-3">{subtitle}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border hover:bg-secondary"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">{children}</div>
            {footer && <div className="flex gap-2 border-t border-border p-4">{footer}</div>}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}

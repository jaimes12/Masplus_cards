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
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-input shadow-sm"
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
      <input
        type="text"
        value={value}
        onChange={onChange}
        maxLength={7}
        className="w-full rounded-xl border border-input bg-card px-3 py-2 text-sm uppercase outline-none focus:ring-2 focus:ring-ring"
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

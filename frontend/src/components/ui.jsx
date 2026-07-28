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

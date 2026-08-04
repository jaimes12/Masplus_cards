import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'

export default function Sidebar({ brand, items, footer, open = false, onClose }) {
  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={onClose} aria-hidden="true" />}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-svh w-64 shrink-0 flex-col border-r border-border bg-card transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          {brand}
          <button
            type="button"
            onClick={onClose}
            className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary lg:hidden"
            aria-label="Cerrar menú"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
          {items.map((item, i) =>
            item.divider ? (
              <hr key={`div-${i}`} className="my-2.5 border-border" />
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                data-tour={item.tour}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive ? 'bg-accent text-accent-foreground' : 'text-ink-2 hover:bg-secondary hover:text-foreground'
                  }`
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge > 0 && (
                  <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-accent px-1 text-[11px] font-semibold text-accent-foreground">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            )
          )}
        </nav>
        <div className="border-t border-border p-3">{footer}</div>
      </aside>
    </>
  )
}

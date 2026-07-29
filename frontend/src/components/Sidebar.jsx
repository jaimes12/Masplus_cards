import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'

export default function Sidebar({ brand, items, footer, open = false, onClose }) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-svh w-72 shrink-0 flex-col p-4 transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="shadow-soft flex h-full flex-col overflow-hidden rounded-3xl bg-card">
          <div className="flex items-center justify-between border-b border-border/60 px-6 py-6">
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
          <nav className="flex-1 space-y-1.5 overflow-y-auto p-4">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md shadow-orange-600/25'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="border-t border-border/60 p-4">{footer}</div>
        </div>
      </aside>
    </>
  )
}

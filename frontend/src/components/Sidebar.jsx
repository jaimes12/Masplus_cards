import { NavLink } from 'react-router-dom'

export default function Sidebar({ brand, items, footer }) {
  return (
    <aside className="flex h-svh w-64 shrink-0 flex-col border-r border-border bg-card">
      <div className="border-b border-border px-6 py-5">{brand}</div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-border p-3">{footer}</div>
    </aside>
  )
}

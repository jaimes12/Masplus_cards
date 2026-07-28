import { NavLink } from 'react-router-dom'

export default function Sidebar({ brand, items, footer }) {
  return (
    <aside className="flex h-svh w-72 shrink-0 flex-col p-4">
      <div className="shadow-soft flex h-full flex-col overflow-hidden rounded-3xl bg-card">
        <div className="border-b border-border/60 px-6 py-6">{brand}</div>
        <nav className="flex-1 space-y-1.5 overflow-y-auto p-4">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
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
  )
}

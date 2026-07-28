import { Link } from 'react-router-dom'
import { Crown } from 'lucide-react'

export default function Navbar({ title, subtitle, logo, name, planNombre, planLinkTo = '/empresa/plan' }) {
  return (
    <header className="shadow-soft mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-card px-6 py-4">
      <div className="min-w-0">
        <h1 className="truncate text-xl font-semibold">{title}</h1>
        {subtitle && <p className="truncate text-sm text-muted-foreground">{subtitle}</p>}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {planNombre !== undefined && (
          <Link
            to={planLinkTo}
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-transform hover:scale-105"
          >
            <Crown className="h-3.5 w-3.5" />
            {planNombre || 'Elegir plan'}
          </Link>
        )}
        <div className="flex items-center gap-2 rounded-full bg-secondary py-1 pl-1 pr-3.5">
          {logo ? (
            <img src={logo} alt="" className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {(name || '?').slice(0, 2).toUpperCase()}
            </div>
          )}
          <span className="max-w-[140px] truncate text-sm font-medium">{name}</span>
        </div>
      </div>
    </header>
  )
}

import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { Button } from '../components/ui.jsx'

const links = [
  { to: '/empresa', label: 'Inicio', end: true },
  { to: '/empresa/disenos', label: 'Diseños' },
  { to: '/empresa/tarjetas', label: 'Tarjetas' },
  { to: '/empresa/clientes', label: 'Clientes' },
]

export default function EmpresaLayout() {
  const { auth, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/empresa/login')
  }

  return (
    <div className="min-h-svh">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="font-semibold">{auth?.nombre}</span>
            <nav className="flex gap-4 text-sm">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) =>
                    isActive ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Salir
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl p-4">
        <Outlet />
      </main>
    </div>
  )
}

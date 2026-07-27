import { Outlet, useNavigate } from 'react-router-dom'
import { CreditCard, LayoutDashboard, LogOut, Palette, Store, Users } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'
import Sidebar from '../components/Sidebar.jsx'
import { Button } from '../components/ui.jsx'

const items = [
  { to: '/empresa', label: 'Resumen', icon: LayoutDashboard, end: true },
  { to: '/empresa/disenos', label: 'Diseños', icon: Palette },
  { to: '/empresa/tarjetas', label: 'Tarjetas', icon: CreditCard },
  { to: '/empresa/clientes', label: 'Clientes', icon: Users },
]

export default function EmpresaLayout() {
  const { auth, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/empresa/login')
  }

  return (
    <div className="flex min-h-svh">
      <Sidebar
        brand={
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Store className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold leading-tight">{auth?.nombre}</p>
              <p className="text-xs text-muted-foreground">Panel de empresa</p>
            </div>
          </div>
        }
        items={items}
        footer={
          <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> Salir
          </Button>
        }
      />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-5xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

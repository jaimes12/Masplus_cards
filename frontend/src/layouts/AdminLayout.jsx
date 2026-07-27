import { Outlet, useNavigate } from 'react-router-dom'
import { Building2, LayoutDashboard, LogOut, ShieldCheck, LayoutTemplate } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'
import Sidebar from '../components/Sidebar.jsx'
import { Button } from '../components/ui.jsx'

const items = [
  { to: '/admin', label: 'Resumen', icon: LayoutDashboard, end: true },
  { to: '/admin/templates', label: 'Templates', icon: LayoutTemplate },
  { to: '/admin/empresas', label: 'Empresas', icon: Building2 },
]

export default function AdminLayout() {
  const { auth, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="flex min-h-svh">
      <Sidebar
        brand={
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold leading-tight">{auth?.nombre}</p>
              <p className="text-xs text-muted-foreground">Panel de administración</p>
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

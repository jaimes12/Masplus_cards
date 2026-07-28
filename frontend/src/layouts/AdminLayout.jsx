import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Building2, LayoutDashboard, LogOut, ShieldCheck, LayoutTemplate } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'
import Sidebar from '../components/Sidebar.jsx'
import Navbar from '../components/Navbar.jsx'
import { Button } from '../components/ui.jsx'

const items = [
  { to: '/admin', label: 'Resumen', icon: LayoutDashboard, end: true },
  { to: '/admin/templates', label: 'Templates', icon: LayoutTemplate },
  { to: '/admin/empresas', label: 'Empresas', icon: Building2 },
]

const TITLES = {
  '/admin': ['Resumen', 'Cómo va Masplus Cards en general.'],
  '/admin/templates': ['Templates', 'Plantillas base que las empresas personalizan.'],
  '/admin/empresas': ['Empresas', 'Cuentas registradas en la plataforma.'],
}

export default function AdminLayout() {
  const { auth, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  function handleLogout() {
    logout()
    navigate('/admin/login')
  }

  const [title, subtitle] = TITLES[location.pathname] ?? ['Panel de administración', '']

  return (
    <div className="bg-app-surface flex h-svh overflow-hidden">
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
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="mx-auto w-full max-w-6xl shrink-0 px-4 pr-6 pt-6">
          <Navbar title={title} subtitle={subtitle} name={auth?.nombre} />
        </div>
        <main className="flex-1 overflow-y-auto px-4 pb-6 pr-6">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

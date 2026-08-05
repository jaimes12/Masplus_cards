import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Building2, LogOut, LayoutTemplate, LayoutDashboard, MessageCircle, Percent, Tag } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'
import Sidebar from '../components/Sidebar.jsx'
import Navbar from '../components/Navbar.jsx'
import { Button } from '../components/ui.jsx'
import masplusIcon from '../assets/masplus_icon.png'

const items = [
  { to: '/admin', label: 'Resumen', icon: LayoutDashboard, end: true },
  { to: '/admin/mensajes', label: 'Mensajes', icon: MessageCircle },
  { to: '/admin/templates', label: 'Templates', icon: LayoutTemplate },
  { to: '/admin/empresas', label: 'Empresas', icon: Building2 },
  { to: '/admin/planes', label: 'Planes', icon: Tag },
  { to: '/admin/codigos-descuento', label: 'Códigos de descuento', icon: Percent },
]

const TITLES = {
  '/admin': ['Resumen', 'Cómo va Masplus Cards en general.'],
  '/admin/mensajes': ['Mensajes', 'Conversaciones de WhatsApp con leads, atendidas por IA.'],
  '/admin/templates': ['Templates', 'Plantillas base que las empresas personalizan.'],
  '/admin/empresas': ['Empresas', 'Cuentas registradas en la plataforma.'],
  '/admin/planes': ['Planes', 'Precios y características de los paquetes.'],
  '/admin/codigos-descuento': ['Códigos de descuento', 'Crea y administra promociones para los planes.'],
}

export default function AdminLayout() {
  const { auth, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
            <img src={masplusIcon} alt="MasPlus" className="h-8 w-8 shrink-0 object-contain" />
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
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="mx-auto w-full max-w-6xl shrink-0 px-4 pr-6 pt-6">
          <Navbar title={title} subtitle={subtitle} name={auth?.nombre} onMenuClick={() => setMobileMenuOpen(true)} />
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

import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { CreditCard, Crown, LayoutDashboard, LogOut, Palette, Store, User, Users } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { api } from '../lib/api.js'
import Sidebar from '../components/Sidebar.jsx'
import Navbar from '../components/Navbar.jsx'
import { Button } from '../components/ui.jsx'

const items = [
  { to: '/empresa', label: 'Resumen', icon: LayoutDashboard, end: true },
  { to: '/empresa/disenos', label: 'Diseños', icon: Palette },
  { to: '/empresa/tarjetas', label: 'Tarjetas', icon: CreditCard },
  { to: '/empresa/clientes', label: 'Clientes', icon: Users },
  { to: '/empresa/plan', label: 'Mi plan', icon: Crown },
  { to: '/empresa/perfil', label: 'Perfil', icon: User },
]

const TITLES = {
  '/empresa': ['Resumen', 'Cómo va tu programa de fidelidad.'],
  '/empresa/disenos': ['Diseños', 'Crea y personaliza las tarjetas de tu marca.'],
  '/empresa/tarjetas': ['Tarjetas', 'Administra las tarjetas emitidas a tus clientes.'],
  '/empresa/clientes': ['Clientes', 'Todas las personas inscritas en tu programa.'],
  '/empresa/plan': ['Mi plan', 'Tu suscripción y los límites de tu cuenta.'],
  '/empresa/perfil': ['Perfil', 'Datos de tu cuenta y tu negocio.'],
}

export default function EmpresaLayout() {
  const { auth, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [logo, setLogo] = useState(null)
  const [planNombre, setPlanNombre] = useState('')

  useEffect(() => {
    api.get('/api/empresa/perfil').then((data) => setLogo(data.logo || null)).catch(() => {})
    api.get('/api/empresa/plan').then((data) => setPlanNombre(data.planActual?.nombre || '')).catch(() => {})
  }, [])

  function handleLogout() {
    logout()
    navigate('/empresa/login')
  }

  const [title, subtitle] = TITLES[location.pathname] ?? ['Panel de empresa', '']

  return (
    <div className="bg-app-surface flex min-h-svh">
      <Sidebar
        brand={
          <div className="flex items-center gap-2">
            {logo ? (
              <img src={logo} alt="" className="h-8 w-8 shrink-0 rounded-md object-cover" />
            ) : (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Store className="h-4 w-4" />
              </div>
            )}
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
      <main className="flex-1 overflow-y-auto p-4 pr-6 pb-6 pt-6">
        <div className="mx-auto max-w-6xl">
          <Navbar title={title} subtitle={subtitle} logo={logo} name={auth?.nombre} planNombre={planNombre} />
          <Outlet />
        </div>
      </main>
    </div>
  )
}

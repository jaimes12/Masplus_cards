import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { CreditCard, Crown, LayoutDashboard, LogOut, Palette, ScanLine, Store, User, Users } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { api } from '../lib/api.js'
import Sidebar from '../components/Sidebar.jsx'
import Navbar from '../components/Navbar.jsx'
import { Button } from '../components/ui.jsx'
import OnboardingTour, { tourStorageKey } from '../components/OnboardingTour.jsx'

const items = [
  { to: '/empresa', label: 'Resumen', icon: LayoutDashboard, end: true },
  { to: '/empresa/disenos', label: 'Diseños', icon: Palette },
  { to: '/empresa/tarjetas', label: 'Tarjetas', icon: CreditCard },
  { to: '/empresa/escanear', label: 'Escanear', icon: ScanLine, tour: 'sidebar-escanear' },
  { to: '/empresa/clientes', label: 'Clientes', icon: Users },
  { to: '/empresa/plan', label: 'Mi plan', icon: Crown },
  { to: '/empresa/perfil', label: 'Perfil', icon: User },
]

const TITLES = {
  '/empresa': ['Resumen', 'Cómo va tu programa de fidelidad.'],
  '/empresa/disenos': ['Diseños', 'Crea y personaliza las tarjetas de tu marca.'],
  '/empresa/tarjetas': ['Tarjetas', 'Administra las tarjetas emitidas a tus clientes.'],
  '/empresa/escanear': ['Escanear', 'Sumá sellos escaneando el QR de tus clientes.'],
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [tourKey, setTourKey] = useState(0)

  useEffect(() => {
    api.get('/api/empresa/perfil').then((data) => setLogo(data.logo || null)).catch(() => {})
    api.get('/api/empresa/plan').then((data) => setPlanNombre(data.planActual?.nombre || '')).catch(() => {})
  }, [])

  function handleLogout() {
    logout()
    navigate('/empresa/login')
  }

  function replayTour() {
    if (auth?.id) localStorage.removeItem(tourStorageKey(auth.id))
    setTourKey((k) => k + 1)
    if (location.pathname !== '/empresa/disenos') navigate('/empresa/disenos')
  }

  const [title, subtitle] = TITLES[location.pathname] ?? ['Panel de empresa', '']

  return (
    <div className="bg-app-surface flex h-svh overflow-hidden">
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
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start gap-2" onClick={replayTour}>
              <ScanLine className="h-4 w-4" /> Ver tutorial
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout}>
              <LogOut className="h-4 w-4" /> Salir
            </Button>
          </div>
        }
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="mx-auto w-full max-w-6xl shrink-0 px-4 pr-6 pt-6">
          <Navbar
            title={title}
            subtitle={subtitle}
            logo={logo}
            name={auth?.nombre}
            planNombre={planNombre}
            onMenuClick={() => setMobileMenuOpen(true)}
          />
        </div>
        <main className="flex-1 overflow-y-auto px-4 pb-6 pr-6">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
      <OnboardingTour key={tourKey} empresaId={auth?.id} />
    </div>
  )
}

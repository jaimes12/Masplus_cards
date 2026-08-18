import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  Bell,
  Clock,
  CreditCard,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  Palette,
  PlayCircle,
  ScanLine,
  Settings,
  Users,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { api } from '../lib/api.js'
import Sidebar from '../components/Sidebar.jsx'
import OnboardingTour, { tourStorageKey } from '../components/OnboardingTour.jsx'
import masplusLogo from '../assets/masplus_logo_wide.png'

const items = [
  { to: '/empresa', label: 'Inicio', icon: LayoutDashboard, end: true },
  { to: '/empresa/disenos', label: 'Diseños', icon: Palette },
  { to: '/empresa/tarjetas', label: 'Tarjetas', icon: CreditCard },
  { to: '/empresa/clientes', label: 'Clientes', icon: Users },
  { to: '/empresa/escanear', label: 'Escáner', icon: ScanLine, tour: 'sidebar-escanear' },
  { to: '/empresa/historial', label: 'Historial', icon: Clock },
  { to: '/empresa/estadisticas', label: 'Estadísticas', icon: BarChart3 },
  { to: '/empresa/configuracion', label: 'Configuración', icon: Settings },
  { divider: true },
  { to: '/empresa/notificaciones', label: 'Notificaciones', icon: Bell, badgeKey: 'notificaciones' },
  { to: '/empresa/como-usar', label: 'Cómo usar', icon: PlayCircle },
  { to: '/empresa/ayuda', label: 'Ayuda', icon: HelpCircle },
]

export default function EmpresaLayout() {
  const { auth, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [logo, setLogo] = useState(null)
  const [noLeidas, setNoLeidas] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [tourKey, setTourKey] = useState(0)

  useEffect(() => {
    api.get('/api/empresa/perfil').then((data) => setLogo(data.logo || null)).catch(() => {})
    api.get('/api/empresa/notificaciones/no-leidas').then(setNoLeidas).catch(() => {})
  }, [location.pathname])

  function handleLogout() {
    logout()
    navigate('/empresa/login')
  }

  function replayTour() {
    if (auth?.id) localStorage.removeItem(tourStorageKey(auth.id))
    setTourKey((k) => k + 1)
    if (location.pathname !== '/empresa/disenos') navigate('/empresa/disenos')
  }

  const itemsWithBadge = items.map((item) =>
    item.badgeKey === 'notificaciones' ? { ...item, badge: noLeidas } : item
  )

  return (
    <div className="bg-app-surface theme-mas flex h-svh overflow-hidden">
      <Sidebar
        brand={<img src={masplusLogo} alt="Más+" className="h-8 w-auto object-contain" />}
        items={itemsWithBadge}
        footer={
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => navigate('/empresa/perfil')}
              className="flex w-full items-center gap-2.5 rounded-lg p-1.5 text-left transition-colors hover:bg-secondary"
            >
              {logo ? (
                <img src={logo} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
              ) : (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
                  {(auth?.nombre || '?').slice(0, 2).toUpperCase()}
                </div>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-foreground">{auth?.nombre}</span>
                <span className="block truncate text-xs text-ink-3">Ver perfil</span>
              </span>
            </button>
            <button
              type="button"
              onClick={replayTour}
              className="flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-sm font-medium text-ink-2 transition-colors hover:bg-secondary hover:text-foreground"
            >
              <ScanLine className="h-4 w-4" /> Ver tutorial
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-sm font-medium text-ink-2 transition-colors hover:bg-secondary hover:text-foreground"
            >
              <LogOut className="h-4 w-4" /> Salir
            </button>
          </div>
        }
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
      <main className="flex-1 overflow-y-auto px-5 py-6 sm:px-8">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="mb-4 flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-medium lg:hidden"
        >
          <Menu className="h-4 w-4" /> Menú
        </button>
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
      <OnboardingTour key={tourKey} empresaId={auth?.id} />
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
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
  Sparkles,
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
  const [plan, setPlan] = useState(null)

  useEffect(() => {
    api.get('/api/empresa/perfil').then((data) => setLogo(data.logo || null)).catch(() => {})
    api.get('/api/empresa/notificaciones/no-leidas').then(setNoLeidas).catch(() => {})
    api.get('/api/empresa/plan').then(setPlan).catch(() => {})
  }, [location.pathname])

  // Aviso arriba del contenido: días restantes de la prueba gratis, o cercanía al tope del plan
  // Gratis. No se muestra en Mi plan (ahí ya está todo el detalle).
  const avisoPlan = (() => {
    if (!plan?.planActual || location.pathname === '/empresa/plan') return null
    if (plan.enPrueba && plan.pruebaTerminaEl) {
      const dias = Math.max(0, Math.ceil((new Date(plan.pruebaTerminaEl) - Date.now()) / 86400000))
      return {
        texto:
          dias > 0
            ? `Prueba gratis del ${plan.planActual.nombre}: te quedan ${dias} día${dias === 1 ? '' : 's'}.`
            : `Tu prueba gratis del ${plan.planActual.nombre} termina hoy.`,
        cta: 'Elegir plan',
        urgente: dias <= 3,
      }
    }
    const limite = plan.planActual.limiteTarjetas
    if (Number(plan.planActual.precioMensual) === 0 && limite && plan.tarjetasUsadas >= Math.floor(limite * 0.8)) {
      return {
        texto: `Plan Gratis: llevas ${plan.tarjetasUsadas} de ${limite} tarjetas. Mejora tu plan para seguir sumando clientes.`,
        cta: 'Ver planes',
        urgente: plan.tarjetasUsadas >= limite,
      }
    }
    return null
  })()

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
          {avisoPlan && (
            <div
              className={`mb-5 flex flex-wrap items-center gap-3 rounded-xl border px-4 py-2.5 text-sm ${
                avisoPlan.urgente ? 'border-warn/40 bg-warn-soft text-warn' : 'border-accent/30 bg-accent/5 text-foreground'
              }`}
            >
              <Sparkles className="h-4 w-4 shrink-0" />
              <span className="flex-1">{avisoPlan.texto}</span>
              <Link to="/empresa/plan" className="font-semibold underline underline-offset-2">
                {avisoPlan.cta}
              </Link>
            </div>
          )}
          <Outlet />
        </div>
      </main>
      <OnboardingTour key={tourKey} empresaId={auth?.id} />
    </div>
  )
}

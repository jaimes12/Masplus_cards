import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { CreditCard, LayoutDashboard, LogOut, Palette, Store, User, Users } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { api } from '../lib/api.js'
import Sidebar from '../components/Sidebar.jsx'
import { Button } from '../components/ui.jsx'

const items = [
  { to: '/empresa', label: 'Resumen', icon: LayoutDashboard, end: true },
  { to: '/empresa/disenos', label: 'Diseños', icon: Palette },
  { to: '/empresa/tarjetas', label: 'Tarjetas', icon: CreditCard },
  { to: '/empresa/clientes', label: 'Clientes', icon: Users },
  { to: '/empresa/perfil', label: 'Perfil', icon: User },
]

export default function EmpresaLayout() {
  const { auth, logout } = useAuth()
  const navigate = useNavigate()
  const [logo, setLogo] = useState(null)

  useEffect(() => {
    api.get('/api/empresa/perfil').then((data) => setLogo(data.logo || null)).catch(() => {})
  }, [])

  function handleLogout() {
    logout()
    navigate('/empresa/login')
  }

  return (
    <div className="flex min-h-svh">
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
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-5xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

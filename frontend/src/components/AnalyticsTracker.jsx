import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { esRutaPublica, iniciarMedicionDuracion, trackEtapa, trackPageview } from '../lib/analytics.js'

/**
 * Tracker del sitio público. Va montado dentro del Router:
 * - pageview en cada cambio de ruta pública
 * - etapas del funnel de la landing (vio cómo funciona / precios) vía IntersectionObserver
 * - clic en cualquier link hacia /empresa/registro (etapa cta_registro)
 * - duración activa de la sesión (se manda al cerrar u ocultar la pestaña)
 * No renderiza nada y nunca lanza: la analítica no puede romper la página.
 */
export default function AnalyticsTracker() {
  const location = useLocation()
  const inicializado = useRef(false)

  useEffect(() => {
    if (inicializado.current) return
    inicializado.current = true
    try {
      iniciarMedicionDuracion()
      document.addEventListener('click', (e) => {
        const link = e.target.closest?.('a[href*="/empresa/registro"]')
        if (link) trackEtapa('cta_registro')
      })
    } catch {
      /* noop */
    }
  }, [])

  useEffect(() => {
    try {
      if (!esRutaPublica(location.pathname)) return
      trackPageview(location.pathname, document.referrer)
      if (location.pathname === '/empresa/registro') trackEtapa('registro_form')
      if (location.pathname !== '/') return

      // Etapas de scroll en la landing: se marcan cuando la sección entra a la vista.
      const secciones = [
        ['como-funciona', 'vio_como_funciona'],
        ['precios', 'vio_precios'],
      ]
      const observers = []
      // Las secciones se montan con la landing en el mismo tick; el timeout da margen por si tardan.
      const t = setTimeout(() => {
        for (const [idSeccion, etapa] of secciones) {
          const el = document.getElementById(idSeccion)
          if (!el) continue
          const obs = new IntersectionObserver(
            ([entry]) => {
              if (entry.isIntersecting) {
                trackEtapa(etapa)
                obs.disconnect()
              }
            },
            { threshold: 0.3 },
          )
          obs.observe(el)
          observers.push(obs)
        }
      }, 500)
      return () => {
        clearTimeout(t)
        observers.forEach((o) => o.disconnect())
      }
    } catch {
      /* noop */
    }
  }, [location.pathname])

  return null
}

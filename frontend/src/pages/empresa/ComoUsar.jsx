import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useReducedMotion } from 'motion/react'
import { ArrowRight, Bell, Palette, QrCode, ScanLine, Smartphone, Wallet } from 'lucide-react'
import { Panel } from '../../components/ui.jsx'
import { PageHead } from '../../components/empresa/EmpresaUI.jsx'

/**
 * Guía "Cómo usar": el mismo video demo de la landing (generado con Remotion en /video), más
 * el paso a paso del flujo desde el punto de vista del negocio, con atajos a cada sección.
 */

const PASOS_NEGOCIO = [
  {
    icon: Palette,
    title: 'Diseña tu tarjeta',
    text: 'Logo, colores, ícono del sello, cuántos sellos pide el premio. La ves en vivo mientras la armas.',
    to: '/empresa/disenos',
    cta: 'Ir a Diseños',
  },
  {
    icon: QrCode,
    title: 'Imprime tu QR y ponlo en el mostrador',
    text: 'Desde Diseños descargas el cartel listo para imprimir. Cada tarjeta tiene su propio QR de registro.',
    to: '/empresa/disenos',
    cta: 'Descargar cartel',
  },
  {
    icon: ScanLine,
    title: 'Suma sellos con el escáner',
    text: 'Cuando el cliente pague, escanea el QR de su tarjeta desde tu celular. El sello aparece al instante en su Wallet.',
    to: '/empresa/escanear',
    cta: 'Abrir escáner',
  },
  {
    icon: Bell,
    title: 'Tráelos de vuelta',
    text: 'Envía avisos y promociones a la tarjeta de tus clientes. Les llega como notificación en el iPhone.',
    to: '/empresa/notificaciones',
    cta: 'Ver notificaciones',
  },
]

const PASOS_CLIENTE = [
  { icon: QrCode, text: 'Escanea el QR del mostrador con la cámara normal de su iPhone (sin descargar apps).' },
  { icon: Smartphone, text: 'Escribe su nombre y teléfono en la página de registro de tu negocio.' },
  { icon: Wallet, text: 'Toca "Agregar a Apple Wallet". Su tarjeta queda guardada junto a sus otros pases.' },
  { icon: ScanLine, text: 'En cada compra te muestra la tarjeta desde Wallet y tú le escaneas el QR para sumar el sello.' },
]

function DemoVideo() {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const [autoplayBlocked, setAutoplayBlocked] = useState(false)

  useEffect(() => {
    const video = ref.current
    if (!video || reduce) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => setAutoplayBlocked(true))
        else video.pause()
      },
      { threshold: 0.4 },
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [reduce])

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <video
        ref={ref}
        className="aspect-video w-full"
        src="/demo/masplus-demo.mp4"
        poster="/demo/masplus-demo-poster.jpg"
        muted
        loop
        playsInline
        preload="metadata"
        controls={reduce || autoplayBlocked}
        aria-label="Demo: un cliente escanea el QR, agrega su tarjeta a Apple Wallet, compra y recibe su sello al instante."
      />
    </div>
  )
}

export default function ComoUsar() {
  return (
    <div className="space-y-6">
      <PageHead
        title="Cómo usar Más+"
        subtitle="En un minuto: así se ve el recorrido completo, del lado de tu cliente y del tuyo."
      />

      <DemoVideo />

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="Tu parte: 4 pasos" bodyClassName="p-0">
          <ol className="divide-y divide-border">
            {PASOS_NEGOCIO.map((p, i) => (
              <li key={p.title} className="flex gap-4 p-5">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
                  <p.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    <span className="mr-2 text-accent">{String(i + 1).padStart(2, '0')}</span>
                    {p.title}
                  </p>
                  <p className="mt-1 text-sm text-ink-2">{p.text}</p>
                  <Link
                    to={p.to}
                    className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
                  >
                    {p.cta} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </li>
            ))}
          </ol>
        </Panel>

        <Panel title="Lo que hace tu cliente">
          <ol className="space-y-4">
            {PASOS_CLIENTE.map((p, i) => (
              <li key={i} className="flex gap-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-ink-2">
                  <p.icon className="h-4 w-4" />
                </div>
                <p className="text-sm text-ink-2">{p.text}</p>
              </li>
            ))}
          </ol>
          <p className="mt-5 rounded-xl bg-secondary/60 p-3 text-xs text-ink-3">
            En Android, la tarjeta se abre desde el navegador con el mismo QR y funciona igual: se actualiza sola
            cuando sumas sellos.
          </p>
        </Panel>
      </div>
    </div>
  )
}

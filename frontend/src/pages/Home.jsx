import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Bell,
  Check,
  ChevronDown,
  Menu,
  Palette,
  QrCode,
  Sparkles,
  Users,
  X,
} from 'lucide-react'
import masplusLogo from '../assets/masplus_logo_wide.png'
import heroBg from '../assets/bg-naranja-blanco.webp'
import ejemplo1 from '../assets/ejemplo1.webp'
import ejemplo2 from '../assets/ejemplo2.webp'
import ejemplo3 from '../assets/ejemplo3.webp'
import ejemplo4 from '../assets/ejemplo4.webp'
import ejemplo5 from '../assets/ejemplo5.webp'

const DEMO_WALLET_URL = '/wallet/05102f7dbbc74eeea98ddfda98f39738'

function Reveal({ children, className = '', delay = 0, style }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'} ${className}`}
      style={{ ...style, transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

const NAV_LINKS = [
  { href: '#inicio', label: 'Inicio' },
  { href: '#como-funciona', label: '¿Cómo funciona?' },
  { href: '#funciones', label: 'Funciones' },
  { href: '#precios', label: 'Precios' },
]

const STEPS = [
  {
    n: '01',
    title: 'Diseña',
    text: 'Personaliza el logo, los colores, el ícono del sello y el fondo de tu tarjeta desde el panel. En minutos.',
  },
  {
    n: '02',
    title: 'Comparte',
    text: 'Tus clientes agregan su tarjeta a Apple Wallet con un link o un QR. En cualquier otro celular, la abren desde la web.',
  },
  {
    n: '03',
    title: 'Suma sellos',
    text: 'Escaneas el QR del cliente desde el panel y su tarjeta se actualiza sola, al instante, sin que tenga que hacer nada.',
  },
]

const FEATURES = [
  {
    icon: Bell,
    title: 'Actualización en tiempo real',
    text: 'Cuando sumas un sello o canjeas un premio, la tarjeta en el iPhone del cliente cambia sola. Sin recargar, sin volver a descargar nada.',
  },
  {
    icon: QrCode,
    title: 'Sellos por código QR',
    text: 'Cada cliente tiene su propio QR. Lo escaneas desde el panel (o con la cámara del celular) y el sello se agrega en segundos.',
  },
  {
    icon: Palette,
    title: 'Diseño 100% tuyo',
    text: 'Logo, colores, ícono del sello y una imagen de fondo: tu tarjeta se ve como tu marca, no como una plantilla genérica.',
  },
  {
    icon: Users,
    title: 'Tus clientes, organizados',
    text: 'Cada persona que se une queda registrada con su info de contacto y su historial completo de sellos y premios canjeados.',
  },
]

const BUSINESS_TYPES = [
  'Cafeterías', 'Barberías', 'Salones de belleza', 'Spas', 'Gimnasios',
  'Estudios de yoga', 'Salones de uñas', 'Panaderías', 'Restaurantes',
  'Tiendas de ropa', 'Veterinarias', 'Lavanderías', 'Heladerías',
  'Foodtrucks', 'Consultorios dentales', 'Estudios de tatuajes',
]

const PLANS = [
  {
    name: 'Starter',
    monthly: 349,
    blurb: 'Para arrancar tu primer programa de lealtad.',
    features: [
      'Clientes ilimitados',
      '1 diseño de tarjeta activo',
      'Sellos por escaneo de QR',
      'Actualización automática en Apple Wallet',
      'Soporte por correo',
    ],
  },
  {
    name: 'Crece',
    monthly: 549,
    popular: true,
    blurb: 'Cuando ya tienes clientes recurrentes.',
    features: [
      'Todo lo de Starter',
      'Diseños de tarjeta ilimitados',
      'Historial de sellos y premios por cliente',
      'Soporte prioritario',
    ],
  },
  {
    name: 'Ilimitado',
    monthly: 899,
    blurb: 'Para negocios con varios puntos de atención.',
    features: [
      'Todo lo de Crece',
      'Usuarios ilimitados del panel',
      'Onboarding personalizado',
      'Soporte prioritario 24/7',
    ],
  },
]

const TESTIMONIALS = [
  {
    name: 'Nombre de ejemplo',
    business: 'Cafetería de ejemplo',
    text: 'Desde que dejamos las tarjetitas de papel, casi no perdemos clientes por olvido. La traen siempre en el celular.',
    avatar: 'https://i.pravatar.cc/100?img=12',
  },
  {
    name: 'Nombre de ejemplo',
    business: 'Barbería de ejemplo',
    text: 'Sumar el sello toma dos segundos: escaneo el QR y listo. Antes perdíamos minutos buscando la tarjeta física.',
    avatar: 'https://i.pravatar.cc/100?img=33',
  },
  {
    name: 'Nombre de ejemplo',
    business: 'Estudio de uñas de ejemplo',
    text: 'Que la tarjeta se actualice sola en su Wallet, sin que el cliente haga nada, se siente muy profesional.',
    avatar: 'https://i.pravatar.cc/100?img=47',
  },
]

const FAQS = [
  {
    q: '¿Qué es MasPlus?',
    a: 'Una plataforma para crear tarjetas de lealtad digitales: tus clientes suman sellos y canjean premios desde una tarjeta que viven en su celular, sin papel de por medio.',
  },
  {
    q: '¿Mis clientes necesitan descargar una app?',
    a: 'No. En iPhone la tarjeta se agrega directo a Apple Wallet. En cualquier otro celular, tienen una tarjeta web que funciona igual y también se actualiza en tiempo real.',
  },
  {
    q: '¿Cómo sumo un sello?',
    a: 'Desde el panel, escaneas el código QR del cliente (con la cámara del celular o una lectora) y el sello se agrega al instante. La tarjeta del cliente se actualiza sola.',
  },
  {
    q: '¿Puedo personalizar el diseño de la tarjeta?',
    a: 'Sí: logo, ícono del sello, colores y una imagen de fondo. Puedes tener más de un diseño y activar el que quieras usar.',
  },
  {
    q: '¿Necesito tarjeta de crédito para probar?',
    a: 'No. Creas tu cuenta de empresa gratis y puedes empezar a emitir tarjetas de inmediato.',
  },
  {
    q: '¿Qué pasa cuando un cliente completa sus sellos?',
    a: 'Puedes marcar el premio como canjeado desde el panel. El contador de sellos se reinicia y queda registrado en su historial.',
  },
]

function Logo({ className = '' }) {
  return (
    <div className={`flex items-center ${className}`}>
      <img src={masplusLogo} alt="MasPlus" className="h-9 w-auto object-contain" />
    </div>
  )
}

function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#inicio">
          <Logo />
        </a>
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="transition-colors hover:text-foreground">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/empresa/login" className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:inline">
            Ingresar
          </Link>
          <Link
            to="/empresa/registro"
            className="hidden rounded-full bg-gradient-to-br from-orange-500 to-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 sm:inline-block"
          >
            Empieza gratis
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-secondary md:hidden"
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border/60 bg-background px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-1 text-sm font-medium text-muted-foreground">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 transition-colors hover:bg-secondary hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-2 border-t border-border/60 pt-3">
            <Link
              to="/empresa/login"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              Ingresar
            </Link>
            <Link
              to="/empresa/registro"
              onClick={() => setMobileOpen(false)}
              className="rounded-full bg-gradient-to-br from-orange-500 to-orange-600 px-5 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
            >
              Empieza gratis
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

const SHOWCASE_CARDS = [ejemplo1, ejemplo2, ejemplo3, ejemplo4, ejemplo5]

function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-20 bg-cover bg-top opacity-45"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, transparent 45%, var(--background) 88%)',
        }}
      />
      <div className="mx-auto max-w-3xl px-6 pb-4 pt-16 text-center md:pt-24">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          Los sellos se actualizan solos en Apple Wallet
        </div>
        <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
          Convierte cada visita
          <br />
          <span className="text-orange-600">en una razón para volver.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
          Crea tarjetas de sellos y recompensas digitales que tus clientes guardan en su celular.
          Sin apps que descargar, sin tarjetitas de papel que se pierden.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/empresa/registro"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
          >
            Empieza gratis
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href={DEMO_WALLET_URL}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-orange-600 px-6 py-3 text-sm font-semibold text-orange-600 hover:bg-orange-50"
          >
            Ver demo en vivo
          </a>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-4 w-4 text-orange-600" /> Actívalo en minutos
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-4 w-4 text-orange-600" /> Sin compromisos, cancela cuando quieras
          </span>
        </div>
      </div>

      <div className="relative mt-10 h-[26rem] overflow-hidden sm:h-[30rem]">
        <div className="absolute inset-0 flex w-max animate-marquee-slow items-center gap-6 px-6">
          {[...SHOWCASE_CARDS, ...SHOWCASE_CARDS].map((src, i) => (
            <img
              key={i}
              src={src}
              alt="Ejemplo de tarjeta Masplus"
              className="h-full w-auto shrink-0 rounded-2xl object-contain drop-shadow-xl"
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function BusinessMarquee() {
  const items = [...BUSINESS_TYPES, ...BUSINESS_TYPES]
  return (
    <section className="border-y border-border/60 bg-secondary/40 py-10">
      <p className="mb-6 text-center text-sm font-medium uppercase tracking-wide text-muted-foreground">
        Una plataforma para todo tipo de negocio
      </p>
      <div className="overflow-hidden">
        <div className="flex w-max animate-marquee gap-3">
          {items.map((label, i) => (
            <span
              key={`${label}-${i}`}
              className="whitespace-nowrap rounded-full border border-border bg-background px-4 py-2 text-sm text-muted-foreground"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section id="como-funciona" className="mx-auto max-w-6xl px-6 py-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">¿Cómo funciona?</h2>
        <p className="mt-3 text-muted-foreground">Tres pasos, sin fricciones, para dejar atrás el papel.</p>
      </Reveal>
      <div className="mt-14 grid gap-8 md:grid-cols-3">
        {STEPS.map((step, i) => (
          <Reveal key={step.n} delay={i * 100} className="relative rounded-2xl border border-border bg-card p-7">
            <span className="text-sm font-semibold text-orange-600">{step.n}</span>
            <h3 className="mt-2 text-xl font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function Features() {
  return (
    <section id="funciones" className="bg-secondary/40 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Dale a tu negocio el poder de la lealtad
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 80} className="rounded-2xl border border-border bg-card p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function Pricing() {
  const [annual, setAnnual] = useState(false)

  return (
    <section id="precios" className="mx-auto max-w-6xl px-6 py-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Elige tu plan ideal</h2>
        <p className="mt-3 text-muted-foreground">Sin cargos ocultos. Cancela cuando quieras.</p>

        <div className="mt-6 inline-flex items-center gap-1 rounded-full border border-border bg-secondary p-1 text-sm font-medium">
          <button
            type="button"
            onClick={() => setAnnual(false)}
            className={`rounded-full px-4 py-1.5 transition-colors ${!annual ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
          >
            Mensual
          </button>
          <button
            type="button"
            onClick={() => setAnnual(true)}
            className={`rounded-full px-4 py-1.5 transition-colors ${annual ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
          >
            Anual · 2 meses gratis
          </button>
        </div>
      </Reveal>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {PLANS.map((plan, i) => {
          const price = annual ? Math.round(plan.monthly * 0.833) : plan.monthly
          return (
            <Reveal
              key={plan.name}
              delay={i * 100}
              className={`relative rounded-2xl border p-7 ${plan.popular ? 'border-orange-600 shadow-lg' : 'border-border'}`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-7 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 px-3 py-1 text-xs font-semibold text-white">
                  Más popular
                </span>
              )}
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{plan.blurb}</p>
              <p className="mt-5">
                <span className="text-4xl font-semibold">${price}</span>
                <span className="text-sm text-muted-foreground"> MXN / mes</span>
              </p>
              {annual && <p className="mt-1 text-xs text-muted-foreground">Facturado anualmente</p>}
              <ul className="mt-6 space-y-2.5 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/empresa/registro"
                className={`mt-7 block rounded-full px-5 py-2.5 text-center text-sm font-semibold transition-opacity hover:opacity-90 ${
                  plan.popular ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white' : 'border border-border'
                }`}
              >
                Empezar
              </Link>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}

function Testimonials() {
  return (
    <section className="bg-secondary/40 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Así se sentirán tus clientes
          </h2>
          <p className="mt-3 text-muted-foreground">
            Estamos en los primeros días de MasPlus — así imaginamos las reseñas de negocios como el tuyo.
          </p>
        </Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={i} delay={i * 100} className="rounded-2xl border border-border bg-card p-7">
              <p className="text-sm leading-relaxed">&ldquo;{t.text}&rdquo;</p>
              <div className="mt-4 flex items-center gap-3">
                <img src={t.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.business}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          * Testimonios de ejemplo, mientras sumamos nuestros primeros negocios reales.
        </p>
      </div>
    </section>
  )
}

function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <Reveal>
        <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">
          Preguntas frecuentes
        </h2>
      </Reveal>
      <Reveal delay={100} className="mt-12 divide-y divide-border rounded-2xl border border-border">
        {FAQS.map((item, i) => {
          const isOpen = open === i
          return (
            <div key={item.q}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <span className="font-medium">{item.q}</span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && <p className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">{item.a}</p>}
            </div>
          )
        })}
      </Reveal>
    </section>
  )
}

function CtaBanner() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24">
      <Reveal
        className="relative overflow-hidden rounded-3xl px-8 py-14 text-center text-white sm:px-16"
        style={{
          backgroundImage:
            'linear-gradient(rgba(194,65,12,0.88), rgba(154,52,18,0.92)), url(https://picsum.photos/seed/masplus-cta/1600/700)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Deja el papel. Empieza a fidelizar hoy.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-orange-50">
          Crea tu cuenta gratis y ten tu primera tarjeta de lealtad lista en minutos.
        </p>
        <Link
          to="/empresa/registro"
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-orange-700 hover:opacity-90"
        >
          Empieza gratis ahora
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Reveal>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-border/60 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 sm:flex-row">
        <Logo />
        <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-foreground">
              {link.label}
            </a>
          ))}
          <Link to="/admin/login" className="hover:text-foreground">
            Admin
          </Link>
        </nav>
        <p className="text-xs text-muted-foreground">© 2026 MasPlus. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}

export default function Home() {
  return (
    <div className="min-h-svh">
      <Nav />
      <Hero />
      <BusinessMarquee />
      <HowItWorks />
      <Features />
      <Pricing />
      <Testimonials />
      <Faq />
      <CtaBanner />
      <Footer />
    </div>
  )
}

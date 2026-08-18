import { useState } from 'react'
import { AlertTriangle, ChevronRight, Mail, MessageCircle } from 'lucide-react'
import { Button, Label, Panel, Select } from '../../components/ui.jsx'
import { PageHead } from '../../components/empresa/EmpresaUI.jsx'
import { TutorialCard } from '../../components/empresa/TutorialVideo.jsx'

const TUTORIALES = ['crear-tarjeta', 'imprimir-qr', 'sumar-sellos', 'notificaciones']

const FAQS = [
  {
    q: '¿Cómo cambio el número de sellos?',
    a: 'Entrá a Diseños, abrí la tarjeta y editá "Sellos requeridos". El avance de tus clientes se conserva y su tarjeta se actualiza sola en el Wallet.',
  },
  {
    q: 'Un cliente perdió su tarjeta del Wallet',
    a: 'Buscalo en Clientes por teléfono y compartile de nuevo el código QR de su tarjeta. Sus sellos quedan intactos.',
  },
  {
    q: '¿Puedo sellar sin internet?',
    a: 'El escáner necesita conexión para registrar el movimiento. Si se corta la red, esperá a reconectarte antes de sumar el sello.',
  },
  {
    q: '¿Qué pasa si pauso una tarjeta?',
    a: 'Deja de estar disponible para nuevas emisiones, pero las tarjetas ya entregadas a tus clientes siguen funcionando normal.',
  },
]

const CONTACTOS = [
  { icon: MessageCircle, tone: 'ok', title: 'WhatsApp', subtitle: 'Lun a sáb, 9:00 a 19:00 · respuesta en minutos' },
  { icon: Mail, tone: 'brand', title: 'Soporte por correo', subtitle: 'soporte@maspluss.com · respuesta en 24 h' },
]

export default function Ayuda() {
  const [reporte, setReporte] = useState({ area: 'Escáner', detalle: '' })
  const [enviado, setEnviado] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setEnviado(true)
  }

  return (
    <div className="space-y-6">
      <PageHead title="Centro de ayuda" subtitle="Tutoriales cortos, respuestas rápidas y una persona al otro lado." />

      <div>
        <p className="mb-3 text-xs font-semibold tracking-wide text-ink-3 uppercase">Tutoriales</p>
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {TUTORIALES.map((id) => (
            <TutorialCard key={id} id={id} />
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Preguntas frecuentes">
          <div className="divide-y divide-border">
            {FAQS.map((f) => (
              <details key={f.q} className="group py-3.5 first:pt-0 last:pb-0">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-foreground">
                  {f.q}
                  <ChevronRight className="h-4 w-4 shrink-0 text-ink-3 transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-2 text-sm text-ink-2">{f.a}</p>
              </details>
            ))}
          </div>
        </Panel>

        <div className="flex flex-col gap-4">
          <Panel title="Contacto" bodyClassName="p-0">
            {CONTACTOS.map((c) => (
              <div key={c.title} className="flex items-center gap-3.5 border-t border-border px-5 py-4 first:border-t-0">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${c.tone === 'ok' ? 'bg-ok-soft text-ok' : 'bg-accent/10 text-accent'}`}>
                  <c.icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{c.title}</p>
                  <span className="text-xs text-ink-3">{c.subtitle}</span>
                </div>
              </div>
            ))}
          </Panel>

          <Panel title="Reportar un problema">
            {enviado ? (
              <div className="flex items-center gap-3 rounded-xl bg-ok-soft px-4 py-3.5 text-sm text-ok">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Gracias, recibimos tu reporte. Te contactamos a tu correo si necesitamos más info.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <Label>¿Dónde ocurre?</Label>
                  <Select value={reporte.area} onChange={(e) => setReporte({ ...reporte, area: e.target.value })}>
                    <option>Escáner</option>
                    <option>Crear tarjeta</option>
                    <option>Clientes</option>
                    <option>Estadísticas</option>
                    <option>Facturación</option>
                    <option>Otro</option>
                  </Select>
                </div>
                <div>
                  <Label>Contanos qué pasó</Label>
                  <textarea
                    value={reporte.detalle}
                    onChange={(e) => setReporte({ ...reporte, detalle: e.target.value })}
                    placeholder="Al agregar un sello aparece un error y no se guarda."
                    rows={3}
                    className="w-full rounded-xl border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <Button type="submit" className="!bg-gradient-to-br !from-orange-500 !to-orange-600 !text-white">
                  Enviar reporte
                </Button>
              </form>
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}

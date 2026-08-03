import { useEffect, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js'
import { X } from 'lucide-react'
import { api } from '../lib/api.js'
import { Button } from './ui.jsx'

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#18181b',
      '::placeholder': { color: '#a1a1aa' },
    },
    invalid: { color: '#dc2626' },
  },
}

function CardForm({ plan, precioMostrar, codigoDescuento, clientSecret, onClose, onSuccess }) {
  const stripe = useStripe()
  const elements = useElements()
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!stripe || !elements) return
    setProcesando(true)
    setError('')
    try {
      const { setupIntent, error: setupError } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      })
      if (setupError) throw new Error(setupError.message)

      const resultado = await api.post('/api/empresa/stripe/suscripcion', {
        planId: plan.id,
        paymentMethodId: setupIntent.payment_method,
        codigoDescuento: codigoDescuento || null,
      })

      if (resultado.requiereAccion && resultado.clientSecret) {
        const { error: confirmError } = await stripe.confirmCardPayment(resultado.clientSecret)
        if (confirmError) throw new Error(confirmError.message)
      }

      onSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setProcesando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-xl border border-border p-3">
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-3">
        <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={procesando}>
          Cancelar
        </Button>
        <Button
          type="submit"
          className="!bg-gradient-to-br !from-orange-500 !to-orange-600 !text-white flex-1"
          disabled={!stripe || procesando}
        >
          {procesando ? 'Procesando...' : `Pagar $${Math.round(Number(precioMostrar))} MXN`}
        </Button>
      </div>
    </form>
  )
}

export default function PagoPlanModal({ plan, precioMostrar, codigoDescuento, onClose, onSuccess }) {
  const [stripePromise, setStripePromise] = useState(null)
  const [clientSecret, setClientSecret] = useState(null)
  const [error, setError] = useState('')

  const precioFinal = precioMostrar ?? plan.precioMensual
  const conDescuento = Number(precioFinal) !== Number(plan.precioMensual)

  useEffect(() => {
    api
      .post('/api/empresa/stripe/setup-intent')
      .then((r) => {
        setClientSecret(r.clientSecret)
        setStripePromise(loadStripe(r.publishableKey))
      })
      .catch((e) => setError(e.message))
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-soft-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Suscribirte a {plan.nombre}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          {conDescuento ? (
            <>
              Con tu código de descuento se te cobrará <strong>${Math.round(Number(precioFinal))} MXN</strong> hoy. A
              partir del próximo mes se cobrará el precio regular, ${Math.round(Number(plan.precioMensual))} MXN/mes,
              hasta que canceles.
            </>
          ) : (
            <>Se te cobrará ${Math.round(Number(precioFinal))} MXN hoy y cada mes hasta que canceles.</>
          )}
        </p>
        {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
        {clientSecret && stripePromise ? (
          <Elements stripe={stripePromise}>
            <CardForm
              plan={plan}
              precioMostrar={precioFinal}
              codigoDescuento={codigoDescuento}
              clientSecret={clientSecret}
              onClose={onClose}
              onSuccess={onSuccess}
            />
          </Elements>
        ) : (
          !error && <p className="text-sm text-muted-foreground">Cargando formulario de pago...</p>
        )}
      </div>
    </div>
  )
}

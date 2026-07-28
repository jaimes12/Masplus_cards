import { Check, Ticket } from 'lucide-react'

/// Mockup de cómo se va a ver la tarjeta (wallet web / Apple Wallet), en vivo mientras se arma el diseño.
export default function CardPreview({
  empresaNombre = 'Tu Negocio',
  clienteNombre = 'Cliente de ejemplo',
  tipo = 'sellos',
  logo,
  iconoSello,
  fondoUrl,
  colorPrimario,
  colorTexto,
  sellosRequeridos = 10,
  sellosActuales,
  vencimiento,
  descripcion,
  cuponRedimido = false,
}) {
  const primario = colorPrimario || '#18181B'
  const texto = colorTexto || '#FFFFFF'
  const esCupon = tipo === 'cupon'

  const total = Math.max(Number(sellosRequeridos) || 1, 1)
  const ganados =
    sellosActuales != null ? Math.min(Math.max(Number(sellosActuales) || 0, 0), total) : Math.min(Math.ceil(total * 0.3), total)
  const stamps = Array.from({ length: total }, (_, i) => i < ganados)
  const cuponVencido = esCupon && vencimiento && new Date(vencimiento) < new Date()

  const cardStyle = fondoUrl
    ? {
        backgroundImage: `linear-gradient(${primario}8c, ${primario}8c), url(${fondoUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: texto,
      }
    : { background: primario, color: texto }

  return (
    <div className="w-full max-w-xs overflow-hidden rounded-2xl p-6 shadow-lg" style={cardStyle}>
      <div className="flex items-center gap-3">
        {logo ? (
          <img src={logo} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold" style={{ background: `${texto}22` }}>
            {empresaNombre.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold">{empresaNombre || 'Tu Negocio'}</p>
          <p className="truncate text-sm opacity-80">{clienteNombre}</p>
        </div>
      </div>

      {esCupon ? (
        <div className="my-5">
          <div className="flex items-center justify-between">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{ background: `${texto}22` }}
            >
              <Ticket className="h-6 w-6" style={{ color: texto }} />
            </div>
            {cuponRedimido ? (
              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-black">CANJEADO</span>
            ) : cuponVencido ? (
              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-black">VENCIDO</span>
            ) : null}
          </div>
          <p className="mt-4 text-xl font-semibold leading-snug">{descripcion || 'Cupón especial'}</p>
          <p className="mt-2 text-xs uppercase tracking-wide opacity-70">
            {vencimiento ? `Vence ${new Date(vencimiento).toLocaleDateString('es-MX')}` : 'Sin vencimiento'}
          </p>
        </div>
      ) : (
        <>
          <p className="my-5 text-sm font-medium uppercase tracking-wide opacity-70">
            Faltan {total - ganados} sello{total - ganados === 1 ? '' : 's'}
          </p>

          <div className="grid grid-cols-4 gap-3">
            {stamps.map((ganado, i) => (
              <div
                key={i}
                className="flex aspect-square items-center justify-center rounded-full border-2"
                style={{
                  borderColor: texto,
                  opacity: ganado ? 1 : 0.3,
                  background: ganado ? `${texto}22` : 'transparent',
                }}
              >
                {iconoSello ? (
                  <img src={iconoSello} alt="" className="h-full w-full rounded-full object-cover" style={{ opacity: ganado ? 1 : 0.35 }} />
                ) : (
                  ganado && <Check className="h-4 w-4" style={{ color: texto }} />
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

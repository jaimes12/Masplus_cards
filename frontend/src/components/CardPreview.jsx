import { Check } from 'lucide-react'

/// Mockup de cómo se va a ver la tarjeta (wallet web / Apple Wallet), en vivo mientras se arma el diseño.
export default function CardPreview({
  empresaNombre = 'Tu Negocio',
  clienteNombre = 'Cliente de ejemplo',
  logo,
  iconoSello,
  fondoUrl,
  colorPrimario,
  colorTexto,
  sellosRequeridos = 10,
}) {
  const primario = colorPrimario || '#18181B'
  const texto = colorTexto || '#FFFFFF'
  const total = Math.max(Number(sellosRequeridos) || 1, 1)
  const ganados = Math.min(Math.ceil(total * 0.3), total)
  const stamps = Array.from({ length: total }, (_, i) => i < ganados)

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

      <p className="my-5 text-sm font-medium uppercase tracking-wide opacity-70">
        Faltan {total - ganados} sello{total - ganados === 1 ? '' : 's'}
      </p>

      <div className="grid grid-cols-5 gap-3">
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
              <img src={iconoSello} alt="" className="h-5 w-5 object-contain" style={{ opacity: ganado ? 1 : 0.35 }} />
            ) : (
              ganado && <Check className="h-4 w-4" style={{ color: texto }} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

import { useState } from 'react'

const WIDTH = 560
const HEIGHT = 200
const PAD_L = 8
const PAD_R = 8
const PAD_T = 16
const PAD_B = 28

/// Gráfica de área/línea de una sola serie (ej. tarjetas emitidas por día).
/// Incluye crosshair + tooltip al pasar el mouse, como pide cualquier gráfica de línea.
export default function AreaTrend({ data, color = '#EA580C', title, subtitle }) {
  const [hoverIndex, setHoverIndex] = useState(null)

  if (!data || data.length === 0) return null

  const values = data.map((d) => d.value)
  const max = Math.max(...values, 1)
  const innerW = WIDTH - PAD_L - PAD_R
  const innerH = HEIGHT - PAD_T - PAD_B
  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0

  const points = data.map((d, i) => ({
    x: PAD_L + i * stepX,
    y: PAD_T + innerH - (d.value / max) * innerH,
    ...d,
  }))

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ')
  const last = points[points.length - 1]
  const first = points[0]
  const areaPath = `${linePath} L ${last.x.toFixed(2)} ${(PAD_T + innerH).toFixed(2)} L ${first.x.toFixed(2)} ${(PAD_T + innerH).toFixed(2)} Z`

  const labelEvery = Math.max(1, Math.ceil(data.length / 5))
  const gradientId = 'area-trend-gradient'

  function handleMove(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * WIDTH
    let nearest = 0
    let best = Infinity
    points.forEach((p, i) => {
      const d = Math.abs(p.x - x)
      if (d < best) {
        best = d
        nearest = i
      }
    })
    setHoverIndex(nearest)
  }

  const hovered = hoverIndex != null ? points[hoverIndex] : null

  return (
    <div>
      {title && (
        <div className="mb-1 flex items-baseline justify-between">
          <p className="font-medium">{title}</p>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      )}
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full touch-none"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={PAD_L}
            x2={WIDTH - PAD_R}
            y1={PAD_T + innerH * f}
            y2={PAD_T + innerH * f}
            stroke="var(--border)"
            strokeWidth="1"
          />
        ))}

        <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={last.x} cy={last.y} r="4" fill={color} />
        <text
          x={last.x}
          y={Math.max(last.y - 10, PAD_T + 10)}
          textAnchor="end"
          fontSize="11"
          fontWeight="600"
          fill="var(--foreground)"
        >
          {last.value}
        </text>

        {points.map((p, i) => {
          if (i % labelEvery !== 0) return null
          // Las etiquetas de los extremos se alinean hacia adentro para no recortarse contra el borde del SVG.
          const anchor = i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'
          return (
            <text key={i} x={p.x} y={HEIGHT - 8} textAnchor={anchor} fontSize="10" fill="var(--muted-foreground)">
              {p.label}
            </text>
          )
        })}

        {hovered && (
          <>
            <line
              x1={hovered.x}
              x2={hovered.x}
              y1={PAD_T}
              y2={PAD_T + innerH}
              stroke="var(--border)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <circle cx={hovered.x} cy={hovered.y} r="4.5" fill={color} stroke="var(--card)" strokeWidth="2" />
          </>
        )}

        <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="transparent" />
      </svg>

      <div className="mt-1 h-4 text-xs text-muted-foreground">
        {hovered && (
          <>
            <span className="font-medium text-foreground">{hovered.label}</span>
            <span className="mx-1.5">·</span>
            <span>
              {hovered.value} tarjeta{hovered.value === 1 ? '' : 's'}
            </span>
          </>
        )}
      </div>
    </div>
  )
}

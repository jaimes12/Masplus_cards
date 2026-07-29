import { useState } from 'react'

const SIZE = 152
const STROKE = 24
const RADIUS = (SIZE - STROKE) / 2
const CENTER = SIZE / 2
const CIRC = 2 * Math.PI * RADIUS
const GAP = 3

/// Donut categórico (ej. tarjetas por diseño). Colores en orden fijo (nunca ciclados),
/// leyenda siempre visible con texto (nunca solo color) y hover por segmento.
export default function DonutChart({ data, title, totalLabel = 'tarjetas' }) {
  const [hoverIndex, setHoverIndex] = useState(null)
  const total = data.reduce((sum, d) => sum + d.value, 0)

  if (total === 0) return null

  let acc = 0
  const segments = data.map((d) => {
    const frac = d.value / total
    const length = Math.max(frac * CIRC - GAP, 0)
    const offset = acc * CIRC
    acc += frac
    return { ...d, length, offset, pct: Math.round(frac * 100) }
  })

  return (
    <div>
      {title && <p className="mb-3 font-medium">{title}</p>}
      <div className="flex flex-col items-center gap-5">
        <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE} className="-rotate-90">
            <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="var(--secondary)" strokeWidth={STROKE} />
            {segments.map((s, i) => (
              <circle
                key={s.label}
                cx={CENTER}
                cy={CENTER}
                r={RADIUS}
                fill="none"
                stroke={s.color}
                strokeWidth={STROKE}
                strokeDasharray={`${s.length} ${CIRC - s.length}`}
                strokeDashoffset={-s.offset}
                opacity={hoverIndex == null || hoverIndex === i ? 1 : 0.35}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
                style={{ cursor: 'pointer', transition: 'opacity 0.15s' }}
              />
            ))}
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-semibold">{hoverIndex != null ? segments[hoverIndex].value : total}</span>
            <span className="text-[10px] text-muted-foreground">
              {hoverIndex != null ? `${segments[hoverIndex].pct}%` : totalLabel}
            </span>
          </div>
        </div>

        <div className="w-full min-w-0 space-y-1.5">
          {segments.map((s, i) => (
            <div
              key={s.label}
              className="flex items-center justify-between gap-3 rounded-md px-1 py-0.5 text-sm transition-colors"
              style={{ backgroundColor: hoverIndex === i ? 'var(--secondary)' : 'transparent' }}
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
                <span className="truncate">{s.label}</span>
              </span>
              <span className="shrink-0 text-muted-foreground">{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

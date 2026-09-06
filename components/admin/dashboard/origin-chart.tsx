import type {
  OriginCount,
  RegistrationOrigin,
} from '@/lib/admin/dashboard/charts'
import { DASHBOARD_CHARTS as COPY } from '@/lib/i18n/pt-br'
import { formatCount } from '@/lib/utils/format-number'

const COLORS: Record<RegistrationOrigin, string> = {
  whatsapp: 'var(--chart-3)',
  web: 'var(--accent)',
  other: 'var(--chart-2)',
  unknown: 'var(--muted-foreground)',
}
const percent = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  maximumFractionDigits: 1,
})

export function OriginChart({ origins }: { origins: OriginCount[] }) {
  const total = origins.reduce((sum, origin) => sum + origin.count, 0)
  const visible = origins.filter((origin) => origin.count > 0)
  let offset = 0
  const arcs = visible.map((origin) => {
    const arc = { ...origin, offset, length: (origin.count / total) * 100 }
    offset += arc.length
    return arc
  })

  return (
    <section
      className="bg-card min-w-0 rounded-2xl border p-5 shadow-sm"
      aria-labelledby="origin-chart-title"
    >
      <h2 id="origin-chart-title" className="text-base font-semibold">
        {COPY.origins}
      </h2>
      <p className="text-muted-foreground mt-1 text-xs">
        {COPY.originsSubtitle.replace('{count}', formatCount(total))}
      </p>
      <div className="relative mx-auto my-5 size-48">
        <svg viewBox="0 0 200 200" className="size-full" aria-hidden="true">
          <circle
            cx="100"
            cy="100"
            r="70"
            fill="none"
            stroke="var(--muted)"
            strokeWidth="28"
          />
          {arcs.map((arc) => (
            <circle
              key={arc.key}
              cx="100"
              cy="100"
              r="70"
              fill="none"
              stroke={COLORS[arc.key]}
              strokeWidth="28"
              pathLength="100"
              strokeDasharray={`${arc.length} ${100 - arc.length}`}
              strokeDashoffset={-arc.offset}
              transform="rotate(-90 100 100)"
            />
          ))}
          {arcs.length > 1 &&
            arcs.map((arc) => {
              const angle = (arc.offset / 100) * 2 * Math.PI - Math.PI / 2
              return (
                <line
                  key={arc.key}
                  x1={100 + 56 * Math.cos(angle)}
                  y1={100 + 56 * Math.sin(angle)}
                  x2={100 + 84 * Math.cos(angle)}
                  y2={100 + 84 * Math.sin(angle)}
                  stroke="var(--card)"
                  strokeWidth="3"
                />
              )
            })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <strong className="text-xl tabular-nums">{formatCount(total)}</strong>
          <span className="text-muted-foreground text-xs">{COPY.total}</span>
        </div>
      </div>
      {total === 0 ? (
        <p className="text-muted-foreground py-3 text-center text-sm">
          {COPY.originsEmpty}
        </p>
      ) : (
        <dl className="space-y-4 text-xs">
          {visible.map((origin) => (
            <div
              key={origin.key}
              className="flex flex-wrap items-center justify-between gap-2"
            >
              <dt className="text-muted-foreground flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[origin.key] }}
                  aria-hidden="true"
                />
                {COPY.originLabels[origin.key]}
              </dt>
              <dd className="flex gap-2 tabular-nums">
                <strong className="font-medium">
                  {percent.format(origin.count / total)}
                </strong>
                <span className="text-muted-foreground">
                  ({formatCount(origin.count)})
                </span>
              </dd>
            </div>
          ))}
        </dl>
      )}
      <p className="text-muted-foreground mt-5 text-xs">{COPY.originsNote}</p>
    </section>
  )
}

'use client'

import { useState } from 'react'
import {
  getChartScale,
  type MonthlyActivity,
} from '@/lib/admin/dashboard/charts'
import { DASHBOARD_CHARTS as COPY } from '@/lib/i18n/pt-br'
import { formatCount } from '@/lib/utils/format-number'

const LEFT = 46
const RIGHT = 774
const TOP = 20
const BOTTOM = 220
const SERIES = [
  { key: 'registrations', color: 'var(--chart-3)', dashed: false },
] as const

export function ActivityChart({ months }: { months: MonthlyActivity[] }) {
  const [active, setActive] = useState<number | null>(null)
  const max = Math.max(0, ...months.map((month) => month.registrations))
  const { ceiling, ticks } = getChartScale(max)
  const x = (index: number) =>
    LEFT + (index * (RIGHT - LEFT)) / Math.max(1, months.length - 1)
  const y = (value: number) => BOTTOM - (value / ceiling) * (BOTTOM - TOP)
  const selected = active === null ? undefined : months[active]
  const points = months
    .map((month, index) => `${x(index)},${y(month.registrations)}`)
    .join(' ')
  const areaPath = months.length
    ? `M ${x(0)} ${BOTTOM} L ${points.replaceAll(',', ' ')} L ${x(months.length - 1)} ${BOTTOM} Z`
    : ''
  const period = COPY.period
    .replace('{start}', months[0]?.label ?? '')
    .replace('{end}', months.at(-1)?.label ?? '')

  return (
    <section
      className="bg-card min-w-0 rounded-xl border p-5 shadow-sm md:p-6"
      aria-labelledby="activity-chart-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="activity-chart-title" className="text-base font-semibold">
            {COPY.evolution}
          </h2>
          <p className="text-muted-foreground mt-1 text-xs">{period}</p>
        </div>
        <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
          {COPY.registrations}
        </span>
      </div>
      <div className="mt-4 overflow-x-auto">
        <svg
          viewBox="0 0 800 260"
          className="w-full min-w-[440px]"
          role="group"
          aria-label={COPY.evolution}
        >
          <defs>
            <linearGradient
              id="dashboard-activity-fill"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor="var(--chart-3)" stopOpacity="0.34" />
              <stop
                offset="100%"
                stopColor="var(--chart-3)"
                stopOpacity="0.02"
              />
            </linearGradient>
          </defs>
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={LEFT}
                x2={RIGHT}
                y1={y(tick)}
                y2={y(tick)}
                stroke="var(--border)"
                strokeDasharray="3 5"
              />
              <text
                x={LEFT - 10}
                y={y(tick) + 4}
                textAnchor="end"
                fontSize="11"
                fill="var(--muted-foreground)"
              >
                {formatCount(tick)}
              </text>
            </g>
          ))}
          {months.map((month, index) => (
            <text
              key={month.key}
              x={x(index)}
              y={BOTTOM + 25}
              textAnchor="middle"
              fontSize="11"
              fill="var(--muted-foreground)"
            >
              {month.label}
            </text>
          ))}
          {active !== null && (
            <line
              x1={x(active)}
              x2={x(active)}
              y1={TOP}
              y2={BOTTOM}
              stroke="var(--input)"
              strokeDasharray="4 4"
            />
          )}
          {areaPath ? (
            <path d={areaPath} fill="url(#dashboard-activity-fill)" />
          ) : null}
          {SERIES.map((series) => (
            <g key={series.key}>
              <polyline
                points={points}
                fill="none"
                stroke={series.color}
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeDasharray={series.dashed ? '5 4' : undefined}
              />
              {months.map((month, index) => (
                <circle
                  key={month.key}
                  cx={x(index)}
                  cy={y(month[series.key])}
                  r={active === index ? 6 : 4}
                  fill={series.color}
                  stroke="var(--card)"
                  strokeWidth="2"
                />
              ))}
            </g>
          ))}
          {months.map((month, index) => (
            <rect
              key={month.key}
              x={x(index) - 20}
              y={TOP - 8}
              width="40"
              height={BOTTOM - TOP + 16}
              fill="transparent"
              tabIndex={0}
              role="img"
              aria-label={`${month.label}: ${COPY.registrations} ${month.registrations}`}
              className="focus:stroke-ring focus:outline-none"
              onMouseEnter={() => setActive(index)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(index)}
              onBlur={() => setActive(null)}
            />
          ))}
        </svg>
      </div>
      <p
        className="text-primary mt-3 min-h-5 text-center text-xs tabular-nums"
        aria-live="polite"
      >
        {selected
          ? `${selected.label} · ${COPY.registrations}: ${formatCount(selected.registrations)}`
          : max === 0
            ? COPY.evolutionEmpty
            : '\u00a0'}
      </p>
      <p className="text-muted-foreground mt-2 text-xs">{COPY.evolutionNote}</p>
      <details className="mt-4 border-t pt-3 text-xs">
        <summary className="text-primary cursor-pointer underline-offset-4 hover:underline">
          {COPY.viewData}
        </summary>
        <table className="mt-2 w-full text-left tabular-nums">
          <caption className="sr-only">{COPY.evolution}</caption>
          <thead>
            <tr>
              <th scope="col" className="py-2">
                {COPY.month}
              </th>
              <th scope="col">{COPY.registrations}</th>
            </tr>
          </thead>
          <tbody>
            {months.map((month) => (
              <tr key={month.key} className="border-t">
                <th scope="row" className="py-2 font-normal">
                  {month.label}
                </th>
                <td>{formatCount(month.registrations)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  )
}
